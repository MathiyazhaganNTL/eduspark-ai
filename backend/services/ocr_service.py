"""
OCR service using Tesseract via pytesseract.
"""

from __future__ import annotations

import logging
from pathlib import Path

from PIL import Image

from core.config import TESSERACT_CMD

logger = logging.getLogger(__name__)

# Point pytesseract to the Tesseract executable
try:
    import pytesseract
    pytesseract.pytesseract.tesseract_cmd = TESSERACT_CMD
except ImportError:
    pytesseract = None  # type: ignore[assignment]


def is_tesseract_available() -> bool:
    """Check that both pytesseract is installed and the binary is reachable."""
    if pytesseract is None:
        return False
    try:
        pytesseract.get_tesseract_version()
        return True
    except Exception:
        return False


def extract_text_from_image(image_path: str | Path) -> str:
    """Run OCR on an image file and return the extracted text."""
    if pytesseract is None:
        raise RuntimeError("pytesseract is not installed")

    logger.info("Running OCR on %s …", image_path)
    img = Image.open(str(image_path))
    text: str = pytesseract.image_to_string(img).strip()
    logger.info("OCR extracted %d chars.", len(text))
    return text
