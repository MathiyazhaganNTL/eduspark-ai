"""
PDF text extraction service using pdfplumber.
"""

from __future__ import annotations

import logging
from pathlib import Path

import pdfplumber

logger = logging.getLogger(__name__)


def extract_text_from_pdf(pdf_path: str | Path) -> str:
    """Read every page of a PDF and return the concatenated text."""
    logger.info("Extracting text from PDF: %s", pdf_path)
    pages_text: list[str] = []

    with pdfplumber.open(str(pdf_path)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                pages_text.append(page_text)

    text = "\n".join(pages_text).strip()
    logger.info("PDF extraction complete — %d chars from %d pages.",
                len(text), len(pages_text))
    return text
