"""
Image analysis service using Ollama llava:latest (vision model).
Sends the image directly to LLaVA — no Tesseract required.
"""

from __future__ import annotations

import base64
import logging
from pathlib import Path

import io
from PIL import Image
import requests

from core.config import OLLAMA_BASE_URL, OLLAMA_GENERATE_URL, OLLAMA_VISION_MODEL

logger = logging.getLogger(__name__)


def is_llava_available() -> bool:
    """Check that llava:latest is pulled and available in Ollama."""
    try:
        resp = requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=5)
        if resp.status_code != 200:
            return False
        models = [m.get("name", "") for m in resp.json().get("models", [])]
        return any("llava" in m for m in models)
    except Exception:
        return False


def extract_text_from_image(image_path: str | Path) -> str:
    """
    Send the image to llava:latest and return a full description of what
    is visible — classroom activities, student work, any text in the image.
    """
    image_path = Path(image_path)
    logger.info("Analysing image with LLaVA: %s", image_path)
    try:
        # LLaVA 1.5 in Ollama crashes on WebP/RGBA. Convert to RGB JPEG.
        img = Image.open(image_path)
        if img.mode != "RGB":
            img = img.convert("RGB")
            
        buffered = io.BytesIO()
        img.save(buffered, format="JPEG")
        image_b64 = base64.b64encode(buffered.getvalue()).decode("utf-8")
    except Exception as exc:
        logger.error(f"Failed to process image with PIL: {exc}")
        raise ValueError(f"Could not read image file {image_path.name}")

    payload = {
        "model": OLLAMA_VISION_MODEL,
        "prompt": (
            "You are an expert early-childhood education assistant. "
            "Look at this classroom image carefully and provide a detailed description. "
            "Include: what students are doing, any visible text or written work, "
            "learning materials present, student behaviour, and any observable "
            "learning difficulties or strengths. Be specific and thorough."
        ),
        "images": [image_b64],
        "stream": False,
    }

    try:
        resp = requests.post(OLLAMA_GENERATE_URL, json=payload, timeout=120)
        resp.raise_for_status()
        text: str = resp.json().get("response", "").strip()
        if not text:
            raise ValueError("LLaVA returned an empty response for the image.")
        logger.info("LLaVA image analysis complete (%d chars).", len(text))
        return text
    except requests.RequestException as exc:
        logger.error("LLaVA request failed: %s", exc)
        raise RuntimeError(
            f"Could not analyse image with LLaVA. Make sure llava:latest is pulled in Ollama. Error: {exc}"
        ) from exc
