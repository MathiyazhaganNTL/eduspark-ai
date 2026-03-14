"""
Ollama integration service.
Calls the local Ollama REST API to generate structured JSON insights
from classroom observation text.
"""

from __future__ import annotations

import json
import logging
import re
from typing import Any

import requests

from core.config import OLLAMA_BASE_URL, OLLAMA_GENERATE_URL, OLLAMA_LLM_MODEL
from models.schemas import InsightResult

logger = logging.getLogger(__name__)

# ── Prompt template ────────────────────────────────────────────────────────────
ANALYSIS_PROMPT = """\
You are an expert early-childhood education specialist.

Analyze the following classroom observation and return **only** a JSON object.
The JSON object must have exactly one key named "insights", which contains an array of objects.
Each object in the array must have exactly these keys (no markdown, no extra text):

{
  "insights": [
    {
      "identified_issue": "string: what happened or what was observed",
      "curriculum_topic": "string: relevant subject area",
      "age_group": "string: appropriate age group",
      "suggested_activity": "string: actionable suggestion",
      "required_materials": ["string", "string"],
      "activity_duration": "string: estimated time"
    }
  ]
}

Observation:
\"\"\"
{text}
\"\"\"

Return ONLY the JSON object. Do not include markdown formatting or extra prose.
"""


# ── Public helpers ─────────────────────────────────────────────────────────────

def is_ollama_available() -> bool:
    """Ping Ollama to check if it is reachable."""
    try:
        resp = requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=5)
        return resp.status_code == 200
    except Exception:
        return False


def generate_insights(text: str) -> list[InsightResult]:
    """
    Send the observation text to Ollama and parse the response into
    a list of InsightResult objects.
    """
    prompt = ANALYSIS_PROMPT.replace("{text}", text)

    try:
        response = requests.post(
            OLLAMA_GENERATE_URL,
            json={
                "model": OLLAMA_LLM_MODEL,
                "prompt": prompt,
                "stream": False,
                "format": "json"
            },
            timeout=120,
        )
        response.raise_for_status()
        body: dict[str, Any] = response.json()
        raw_text: str = body.get("response", "")
        return _parse_insights(raw_text)

    except requests.RequestException as exc:
        logger.error("Ollama request failed: %s", exc)
        raise RuntimeError(f"Ollama request failed: {exc}") from exc


# ── Internal parsing ───────────────────────────────────────────────────────────

def _parse_insights(raw: str) -> list[InsightResult]:
    """
    Best-effort extraction of the JSON array from the LLM output.
    LLMs sometimes wrap the array in markdown code fences or add prose.
    """
    # Try to find a JSON object via regex first
    logger.info("Raw LLM output: %s", raw)
    match = re.search(r"\{.*\}", raw, re.DOTALL)
    if match:
        raw = str(match.group(0))
        logger.info("Regex found matched object substring: %s", raw)

    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        logger.warning("Could not parse LLM output as JSON, returning raw as issue")
        return [
            InsightResult(
                identified_issue=raw.strip()[:300],
                curriculum_topic="Unknown",
                age_group="Unknown",
                suggested_activity="Please rephrase the observation and try again.",
                required_materials=[],
                activity_duration="N/A",
            )
        ]

    if isinstance(data, dict):
        if "insights" in data and isinstance(data["insights"], list):
            data = data["insights"]
        else:
            data = [data]

    results: list[InsightResult] = []
    if not isinstance(data, list):
        data = []
    for item in data:
        if isinstance(item, str):
            results.append(InsightResult(
                identified_issue=str(item)[:300],
                curriculum_topic="General Observation",
                age_group="All Ages",
                suggested_activity="The model returned a textual response instead of structured analysis.",
                required_materials=[],
                activity_duration="N/A",
            ))
            continue
        if not isinstance(item, dict):
            logger.warning("Skipping non-dict insight item: %s", item)
            continue
        try:
            results.append(InsightResult(
                identified_issue=str(item.get("identified_issue") or "Observation analyzed, but no specific issue was identified."),
                curriculum_topic=str(item.get("curriculum_topic") or "General Observation"),
                age_group=str(item.get("age_group") or "Unknown/Any"),
                suggested_activity=str(item.get("suggested_activity") or "No specific activity was suggested by the model."),
                required_materials=item.get("required_materials") if isinstance(item.get("required_materials"), list) else [],
                activity_duration=str(item.get("activity_duration") or "N/A"),
            ))
        except Exception as e:
            logger.warning("Skipping malformed insight item: %s. Error: %s", item, e)

    if not results:
        results.append(
            InsightResult(
                identified_issue="Analysis completed but could not be structured.",
                curriculum_topic="Unknown",
                age_group="Unknown",
                suggested_activity="Please rephrase the observation and try again.",
                required_materials=[],
                activity_duration="N/A",
            )
        )

    return results
