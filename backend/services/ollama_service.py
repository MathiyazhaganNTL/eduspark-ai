"""
Ollama integration service.
- llama3:latest  — generates structured JSON insights
- nomic-embed-text:latest — generates embeddings for storage and RAG
"""

from __future__ import annotations

import json
import logging
import re
from typing import Any

import requests

from core.config import (
    OLLAMA_BASE_URL,
    OLLAMA_GENERATE_URL,
    OLLAMA_EMBED_URL,
    OLLAMA_LLM_MODEL,
    OLLAMA_EMBED_MODEL,
    CHUNK_SIZE,
    CHUNK_OVERLAP,
    RAG_TOP_K,
)
from models.schemas import InsightResult

logger = logging.getLogger(__name__)

ANALYSIS_PROMPT = """\
You are an expert early-childhood education specialist.

You have been provided with multiple inputs from a classroom observation. This may include a teacher's direct notes, audio transcripts, image descriptions, and extracted document text.
Your task is to SYNTHESIZE all of these materials together. Identify connections between the documents, audio, and images to form a complete and accurate understanding of the classroom situation.

Analyze the materials carefully and return **only** a JSON object containing your insights.
The JSON object must have exactly one key named "insights", which contains an array of objects.
Each object must have exactly these keys (no markdown, no extra text):

{{
  "insights": [
    {{
      "identified_issue": "string: what was observed — a difficulty OR a strength (synthesize the materials)",
      "curriculum_topic": "string: relevant subject area",
      "age_group": "string: appropriate age group",
      "suggested_activity": "string: actionable classroom activity based on the synthesized materials",
      "required_materials": ["string", "string"],
      "activity_duration": "string: estimated time"
    }}
  ]
}}

CRITICAL INSTRUCTION: You MUST translate and write ALL of the text values inside the JSON strictly in this language: {language_name}.
If the language is "Tamil", write everything in native Tamil script. Do not output English unless the language is English.

IMPORTANT RULE ABOUT HALLUCINATIONS:
If the provided text is just a general conversation, casual chat, or completely unrelated to a classroom setting (e.g. someone testing the microphone or speaking randomly), DO NOT invent a classroom difficulty! 
Instead, acknowledge what was actually said:
- "identified_issue": "[Summarize what was actually spoken]"
- "curriculum_topic": "General / Unrelated"
- "age_group": "N/A"
- "suggested_activity": "Please provide a specific classroom observation."
- "required_materials": []
- "activity_duration": "N/A"

{context_block}

Return ONLY the valid JSON object. Do not include markdown or extra prose.
"""


# ── Availability checks ────────────────────────────────────────────────────────

def _get_pulled_models() -> list[str]:
    try:
        resp = requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=5)
        if resp.status_code != 200:
            return []
        return [m.get("name", "") for m in resp.json().get("models", [])]
    except Exception:
        return []


def is_ollama_available() -> bool:
    """Check that llama3:latest is pulled and reachable."""
    return any("llama3" in m for m in _get_pulled_models())


def is_nomic_available() -> bool:
    """Check that nomic-embed-text:latest is pulled and reachable."""
    return any("nomic-embed-text" in m for m in _get_pulled_models())


# ── Embeddings ─────────────────────────────────────────────────────────────────

def generate_embedding(text: str) -> list[float]:
    """Generate a text embedding using nomic-embed-text:latest."""
    resp = requests.post(
        OLLAMA_EMBED_URL,
        json={"model": OLLAMA_EMBED_MODEL, "prompt": text},
        timeout=30,
    )
    resp.raise_for_status()
    return resp.json().get("embedding", [])


def chunk_text(text: str) -> list[str]:
    """Split text into overlapping chunks for RAG."""
    chunks: list[str] = []
    start = 0
    while start < len(text):
        chunks.append(text[start: start + CHUNK_SIZE])
        start += CHUNK_SIZE - CHUNK_OVERLAP
    return chunks


def retrieve_relevant_chunks(query: str, chunks: list[str]) -> list[str]:
    """Return top-k most relevant chunks by cosine similarity."""
    try:
        import numpy as np
        query_vec = np.array(generate_embedding(query), dtype=np.float32)
        scored: list[tuple[float, str]] = []
        for chunk in chunks:
            chunk_vec = np.array(generate_embedding(chunk), dtype=np.float32)
            norm = float(np.linalg.norm(query_vec) * np.linalg.norm(chunk_vec))
            sim = float(np.dot(query_vec, chunk_vec)) / norm if norm > 0 else 0.0
            scored.append((sim, chunk))
        scored.sort(key=lambda x: x[0], reverse=True)
        return [c for _, c in scored[:RAG_TOP_K]]
    except Exception as exc:
        logger.warning("Embedding retrieval failed, using first %d chunks: %s", RAG_TOP_K, exc)
        return chunks[:RAG_TOP_K]


# ── Insight generation ─────────────────────────────────────────────────────────

def generate_insights(teacher_text: str = "", document_text: str = "", language: str = "en") -> list[InsightResult]:
    """Build context and send to llama3:latest for structured analysis."""
    parts: list[str] = []
    if teacher_text:
        parts.append(f'Teacher Observation:\n"""\n{teacher_text}\n"""')
    if document_text:
        parts.append(f'Uploaded Content:\n"""\n{document_text}\n"""')
    if not parts:
        parts.append('Observation:\n"""\n(no content provided)\n"""')

    lang_name_map = {
        "en": "English", "ta": "Tamil", "ar": "Arabic",
        "fr": "French", "es": "Spanish"
    }
    lang_name = lang_name_map.get(language, "English")

    context_block = "\n\n".join(parts)
    prompt = ANALYSIS_PROMPT.format(context_block=context_block, language_name=lang_name)

    try:
        response = requests.post(
            OLLAMA_GENERATE_URL,
            json={"model": OLLAMA_LLM_MODEL, "prompt": prompt, "stream": False, "format": "json"},
            timeout=180,
        )
        response.raise_for_status()
        raw_text: str = response.json().get("response", "")
        return _parse_insights(raw_text)
    except requests.RequestException as exc:
        logger.error("Ollama request failed: %s", exc)
        raise RuntimeError(f"Ollama request failed: {exc}") from exc

def translate_text(text: str, target_language: str) -> str:
    """Uses LLM to cleanly translate mixed code-switched audio transcripts into the selected UI language."""
    if not text.strip():
        return text
        
    lang_name_map = {
        "en": "English", "ta": "Tamil", "ar": "Arabic",
        "fr": "French", "es": "Spanish"
    }
    lang_name = lang_name_map.get(target_language, "English")
    
    prompt = f"You are an expert translator. Translate the following text completely into {lang_name}. The text may be a mix of English and other languages. Translate it exactly as it is without summarizing, adding any extra conversational filler, or using markdown. Just return the pure translated text:\n\n{text}"
    
    try:
        response = requests.post(
            OLLAMA_GENERATE_URL,
            json={"model": OLLAMA_LLM_MODEL, "prompt": prompt, "stream": False},
            timeout=60,
        )
        response.raise_for_status()
        return response.json().get("response", "").strip()
    except Exception as exc:
        logger.warning("LLM translation failed, falling back to original: %s", exc)
        return text


# ── JSON parsing ───────────────────────────────────────────────────────────────

def _parse_insights(raw: str) -> list[InsightResult]:
    logger.info("Raw LLM output (first 500): %s", raw[:500])
    match = re.search(r"\{.*\}", raw, re.DOTALL)
    if match:
        raw = match.group(0)

    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        logger.warning("Could not parse LLM output as JSON")
        return [InsightResult(
            identified_issue=raw.strip()[:300],
            curriculum_topic="Unknown", age_group="Unknown",
            suggested_activity="Please rephrase the observation and try again.",
            required_materials=[], activity_duration="N/A",
        )]

    if isinstance(data, dict):
        data = data.get("insights", [data]) if "insights" in data else [data]

    results: list[InsightResult] = []
    for item in (data if isinstance(data, list) else []):
        if not isinstance(item, dict):
            continue
        try:
            results.append(InsightResult(
                identified_issue=str(item.get("identified_issue") or "Observation analysed."),
                curriculum_topic=str(item.get("curriculum_topic") or "General"),
                age_group=str(item.get("age_group") or "Unknown"),
                suggested_activity=str(item.get("suggested_activity") or "No activity suggested."),
                required_materials=item.get("required_materials") if isinstance(item.get("required_materials"), list) else [],
                activity_duration=str(item.get("activity_duration") or "N/A"),
            ))
        except Exception as exc:
            logger.warning("Skipping malformed item: %s", exc)

    if not results:
        results.append(InsightResult(
            identified_issue="Analysis completed but could not be structured.",
            curriculum_topic="Unknown", age_group="Unknown",
            suggested_activity="Please rephrase the observation and try again.",
            required_materials=[], activity_duration="N/A",
        ))
    return results
