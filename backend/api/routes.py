"""
FastAPI routes for the EduSpark AI backend.

Endpoints:
    GET  /health          — system health & model availability
    POST /teacher/analyze — analyse a text observation
    POST /teacher/upload  — upload audio / image / PDF for analysis
"""

from __future__ import annotations

import logging
from typing import Annotated

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from models.schemas import AnalyzeRequest, HealthResponse, InsightResult
from services import ai_service
from services.ollama_service import is_ollama_available
from services.whisper_service import is_whisper_available
from services.translation_service import is_nllb_available
from services.ocr_service import is_tesseract_available
from utils.file_utils import cleanup_file, save_upload

logger = logging.getLogger(__name__)

router = APIRouter()


# ── Health ─────────────────────────────────────────────────────────────────────

@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Return the status of every AI sub-system."""
    models = {
        "Ollama (LLM)": "available" if is_ollama_available() else "unavailable",
        "Whisper (Speech-to-Text)": "available" if is_whisper_available() else "unavailable",
        "NLLB (Translation)": "available" if is_nllb_available() else "unavailable",
        "Tesseract (OCR)": "available" if is_tesseract_available() else "unavailable",
    }

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
        logger.exception("Analysis failed")
        raise HTTPException(status_code=500, detail=str(exc)) from exc


# ── Upload file ────────────────────────────────────────────────────────────────

@router.post("/teacher/upload", response_model=list[InsightResult])
async def upload_file(
    file: Annotated[UploadFile, File(...)],
    language: Annotated[str, Form()] = "en",
):
    """Upload an audio, image, or PDF file for analysis."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided.")

    saved_path = await save_upload(file)

    try:
        return ai_service.analyze_file(saved_path, language)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("File analysis failed")
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    finally:
        cleanup_file(saved_path)
