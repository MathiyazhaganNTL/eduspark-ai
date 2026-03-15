"""
High-level AI orchestration service.

Pipeline per file type:
  audio  → Whisper (STT)       → text → translate → llama3 → InsightResult[]
  image  → LLaVA (vision)      → text → translate → llama3 → InsightResult[]
  pdf    → pdfplumber           → text → translate → llama3 → InsightResult[]

After extraction, every piece of text is embedded with nomic-embed-text
and stored in SQLite alongside the AI result.
"""

from __future__ import annotations

import json
import logging
from pathlib import Path

from models.schemas import InsightResult
from services import ollama_service, whisper_service, translation_service, ocr_service, pdf_service
from utils.file_utils import detect_file_type
from core.config import RAG_CHAR_THRESHOLD

logger = logging.getLogger(__name__)


# ── Text extraction ────────────────────────────────────────────────────────────

def _extract(file_path: Path, language: str = "en") -> tuple[str, str]:
    """Return (file_type, extracted_text) for a given file. Uses language hint for better AI transcription."""
    file_type = detect_file_type(file_path.name)
    logger.info("Extracting from '%s' (type=%s, lang=%s)", file_path.name, file_type, language)

    if file_type == "audio":
        return "audio", whisper_service.transcribe(file_path, language_hint=language)
    elif file_type == "image":
        return "image", ocr_service.extract_text_from_image(file_path)
    elif file_type == "pdf":
        return "pdf", pdf_service.extract_text_from_pdf(file_path)
    elif file_type == "text":
        return "text", file_path.read_text(encoding="utf-8", errors="replace")
    else:
        raise ValueError(
            f"Unsupported file type '{file_path.suffix}'. "
            "Upload audio (.mp3/.wav/.m4a), image (.jpg/.png), PDF, or text file."
        )


# ── Embedding + DB storage ─────────────────────────────────────────────────────

def _embed_and_store(
    language: str,
    file_type: str,
    original_text: str,
    extracted_text: str,
    results: list[InsightResult],
) -> None:
    """Embed the extracted text with nomic-embed-text and persist to SQLite."""
    try:
        from database.db import SessionLocal
        from database.models import Observation

        # Generate embedding from the extracted content
        embed_text = extracted_text[:2000] if extracted_text else original_text[:2000]
        embedding: list[float] = []
        try:
            embedding = ollama_service.generate_embedding(embed_text)
            logger.info("Embedding generated (%d dims).", len(embedding))
        except Exception as emb_exc:
            logger.warning("Embedding failed (nomic may not be running): %s", emb_exc)

        db = SessionLocal()
        try:
            obs = Observation(
                language=language,
                file_type=file_type,
                original_text=original_text or None,
                extracted_text=extracted_text or None,
                embedding_json=json.dumps(embedding) if embedding else None,
                ai_result=json.dumps([r.model_dump() for r in results]),
            )
            db.add(obs)
            db.commit()
            logger.info("Observation saved to DB (id=%s).", obs.id)
        finally:
            db.close()
    except Exception as exc:
        logger.error("DB save failed (non-fatal): %s", exc)


# ── RAG: retrieve relevant chunks for large documents ─────────────────────────

def _maybe_rag(query: str, document_text: str) -> str:
    """If document is large, use nomic embeddings to retrieve relevant chunks."""
    if len(document_text) <= RAG_CHAR_THRESHOLD:
        return document_text
    logger.info("Document %d chars > threshold, running RAG retrieval.", len(document_text))
    chunks = ollama_service.chunk_text(document_text)
    relevant = ollama_service.retrieve_relevant_chunks(query, chunks)
    return "\n\n".join(relevant)


# ── Public API ─────────────────────────────────────────────────────────────────

def analyze_text(text: str, language: str = "en") -> list[InsightResult]:
    """Text-only pipeline: translate → llama3 → store."""
    english = translation_service.translate_to_english(text, language) if language != "en" else text
    results = ollama_service.generate_insights(teacher_text=english)
    _embed_and_store(language, "text", text, english, results)
    return results


def analyze_observation(
    teacher_text: str = "",
    file_paths: list[Path] | None = None,
    language: str = "en",
) -> list[InsightResult]:
    """
    Unified multimodal pipeline.
    1. Extract text from every uploaded file (LLaVA for images, Whisper for audio, pdfplumber for PDF).
    2. Embed each extracted text with nomic-embed-text and store in SQLite.
    3. Combine all content, apply RAG if large, translate if needed.
    4. Send to llama3 for structured insight generation.
    """
    doc_sections: list[tuple[str, str, str]] = []  # (label, file_type, text)

    if file_paths:
        import hashlib
        from database.db import SessionLocal
        from database.models import FileCache

        for path in file_paths:
            try:
                # Calculate file hash
                file_content = path.read_bytes()
                file_hash = hashlib.sha256(file_content).hexdigest() + f"_{language}"
                
                db = SessionLocal()
                cached_file = db.query(FileCache).filter(FileCache.file_hash == file_hash).first()
                
                if cached_file:
                    logger.info("Cache hit for %s (type=%s) — Skipping re-processing!", path.name, cached_file.file_type)
                    ftype = cached_file.file_type
                    extracted = cached_file.extracted_text
                    db.close()
                else:
                    logger.info("No cache found for %s. Processing...", path.name)
                    ftype, extracted = _extract(path, language)
                    if extracted and extracted.strip():
                        # Save to cache
                        new_cache = FileCache(file_hash=file_hash, file_type=ftype, extracted_text=extracted)
                        db.add(new_cache)
                        db.commit()
                    db.close()

                if extracted and extracted.strip():
                    # Intelligently natively translate the transcript or raw text to the Target UI Language
                    if ftype in ("audio", "text"):
                        extracted = ollama_service.translate_text(extracted, language)

                    label = {
                        "audio": "Audio Transcript",
                        "image": "Image Analysis",
                        "pdf":   "PDF Content",
                        "text":  "Text File",
                    }.get(ftype, "File Content")
                    doc_sections.append((label, ftype, extracted.strip()))
                    logger.info("Extracted %d chars from %s (%s)", len(extracted), path.name, ftype)
            except Exception as exc:
                logger.warning("Failed to process '%s': %s", path.name, exc)

    # Translate teacher text
    english_teacher = ""
    if teacher_text.strip():
        english_teacher = (
            translation_service.translate_to_english(teacher_text, language)
            if language != "en" else teacher_text
        )

    if not english_teacher.strip() and not doc_sections:
        raise ValueError("No observation text or extractable file content provided.")

    # Build combined document text
    combined_doc = "\n\n---\n\n".join(
        f"[{label} — {ftype}]\n{text}" for label, ftype, text in doc_sections
    )

    # RAG for large documents
    # If no teacher text is provided, build a query from audio/image context to relate the PDF to the other files!
    rag_query = english_teacher
    if not rag_query:
        for label, ftype, text in doc_sections:
            if ftype in ("audio", "image"):
                rag_query += text + " "
                
    rag_query = rag_query.strip()
    if not rag_query:
        rag_query = "key concepts, main ideas, instruction methods, summary"
        
    document_context = _maybe_rag(rag_query, combined_doc) if combined_doc else ""

    # Generate insights
    results = ollama_service.generate_insights(
        teacher_text=english_teacher,
        document_text=document_context,
        language=language
    )

    # Attach extracted text to first result so frontend can display it
    if results and doc_sections:
        results[0].extracted_text = combined_doc[:3000]
        results[0].extracted_files = [
            {"file_name": label, "content": text}
            for label, ftype, text in doc_sections
        ]

    # Embed and store each file's content separately
    for label, ftype, extracted in doc_sections:
        _embed_and_store(language, ftype, teacher_text, extracted, results)

    # Also store if text-only
    if not doc_sections and english_teacher:
        _embed_and_store(language, "text", teacher_text, english_teacher, results)

    return results


def analyze_file(file_path: Path, language: str = "en") -> list[InsightResult]:
    """Single-file convenience wrapper."""
    return analyze_observation(file_paths=[file_path], language=language)
