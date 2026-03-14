"""
High-level AI orchestration service.

This module ties together every sub-service (Whisper, OCR, PDF, Translation,
Ollama) into the two main flows the frontend needs:

  1. analyze_text  — process a raw text observation
  2. analyze_file  — process an uploaded file (audio / image / PDF)
"""

from __future__ import annotations

import logging
from pathlib import Path

from models.schemas import InsightResult
from services import (
    ollama_service,
    whisper_service,
    translation_service,
    ocr_service,
    pdf_service,
)
from utils.file_utils import detect_file_type

logger = logging.getLogger(__name__)


def analyze_text(text: str, language: str = "en") -> list[InsightResult]:
    """
    Pipeline:  text → (translate if needed) → Ollama → InsightResult[]
    """
    # Step 1: translate to English if necessary
    if language and language != "en":
        logger.info("Translating observation from '%s' to English …", language)
        text = translation_service.translate_to_english(text, language)

    # Step 2: generate insights via Ollama
    return ollama_service.generate_insights(text)


def analyze_file(file_path: Path, language: str = "en") -> list[InsightResult]:
    """
    Pipeline:
      audio  → Whisper  → text → (translate) → Ollama
      image  → OCR      → text → (translate) → Ollama
      pdf    → pdfplumber → text → (translate) → Ollama
    """
    file_type = detect_file_type(file_path.name)
    logger.info("Processing uploaded file '%s' (type=%s)", file_path.name, file_type)

    if file_type == "audio":
        text = whisper_service.transcribe(file_path)
    elif file_type == "image":
        text = ocr_service.extract_text_from_image(file_path)
    elif file_type == "pdf":
        text = pdf_service.extract_text_from_pdf(file_path)
    else:
        raise ValueError(
            f"Unsupported file type: {file_path.suffix}. "
            "Please upload an audio, image, or PDF file."
        )

    if not text:
        raise ValueError(
            "Could not extract any text from the uploaded file. "
            "Please try a different file or enter your observation as text."
        )

    return analyze_text(text, language)
