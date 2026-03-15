"""
FastAPI routes for the EduSpark AI backend.

GET  /health          — system health & model availability
POST /teacher/analyze — analyse a text observation
POST /teacher/upload  — upload one or more files (+ optional text + language)
"""

from __future__ import annotations

import logging
from typing import Annotated

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from models.schemas import AnalyzeRequest, HealthResponse, InsightResult
from services import ai_service
from services.ollama_service import is_ollama_available, is_nomic_available
from services.whisper_service import is_whisper_available
from services.translation_service import is_nllb_available
from services.ocr_service import is_llava_available
from utils.file_utils import cleanup_files, save_uploads

logger = logging.getLogger(__name__)
router = APIRouter()


# ── Health ─────────────────────────────────────────────────────────────────────

@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Return live status of every AI sub-system."""
    checks = {
        "Ollama LLM (llama3:latest)":          is_ollama_available(),
        "LLaVA Vision (llava:latest)":          is_llava_available(),
        "Nomic Embed (nomic-embed-text:latest)": is_nomic_available(),
        "Whisper (Speech-to-Text)":             is_whisper_available(),
        "NLLB-200 (Translation)":               is_nllb_available(),
    }
    models = {name: "available" if ok else "unavailable" for name, ok in checks.items()}
    overall = "healthy" if all(v == "available" for v in models.values()) else "degraded"
    return HealthResponse(status=overall, models=models)


# ── Analyze text ───────────────────────────────────────────────────────────────

@router.post("/teacher/analyze", response_model=list[InsightResult])
async def analyze_text(payload: AnalyzeRequest):
    """Analyse a text-based classroom observation."""
    if not payload.text.strip():
        raise HTTPException(status_code=400, detail="Observation text must not be empty.")
    try:
        return ai_service.analyze_text(payload.text, payload.language)
    except Exception as exc:
        logger.exception("Text analysis failed")
        raise HTTPException(status_code=500, detail=str(exc)) from exc


# ── Upload files ───────────────────────────────────────────────────────────────

@router.post("/teacher/upload", response_model=list[InsightResult])
async def upload_files(
    language: Annotated[str, Form()] = "en",
    text: Annotated[str, Form()] = "",
    file: Annotated[UploadFile | None, File()] = None,
    files: Annotated[list[UploadFile] | None, File()] = None,
):
    """Upload one or more files with optional teacher text for analysis."""
    all_uploads: list[UploadFile] = []
    if file is not None and file.filename:
        all_uploads.append(file)
    if files:
        for f in files:
            if f.filename:
                all_uploads.append(f)

    if not all_uploads and not text.strip():
        raise HTTPException(status_code=400, detail="No files or observation text provided.")

    # Text-only fallback
    if not all_uploads:
        try:
            return ai_service.analyze_text(text.strip(), language)
        except Exception as exc:
            logger.exception("Text analysis failed")
            raise HTTPException(status_code=500, detail=str(exc)) from exc

    saved_paths = await save_uploads(all_uploads)
    try:
        return ai_service.analyze_observation(
            teacher_text=text.strip(),
            file_paths=saved_paths,
            language=language,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("File analysis failed")
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    finally:
        cleanup_files(saved_paths)
