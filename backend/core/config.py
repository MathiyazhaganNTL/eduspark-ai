"""
Core configuration for the EduSpark AI backend.
All settings are centralised here so every service reads from one source of truth.
"""

import os
from pathlib import Path

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent          # backend/
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# ---------------------------------------------------------------------------
# Ollama
# ---------------------------------------------------------------------------
OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_GENERATE_URL: str = f"{OLLAMA_BASE_URL}/api/generate"
OLLAMA_LLM_MODEL: str = os.getenv("OLLAMA_LLM_MODEL", "llama3:latest")
OLLAMA_VISION_MODEL: str = os.getenv("OLLAMA_VISION_MODEL", "llava")

# ---------------------------------------------------------------------------
# Whisper
# ---------------------------------------------------------------------------
WHISPER_MODEL_SIZE: str = os.getenv("WHISPER_MODEL_SIZE", "base")

# ---------------------------------------------------------------------------
# NLLB Translation
# ---------------------------------------------------------------------------
NLLB_MODEL_NAME: str = os.getenv(
    "NLLB_MODEL_NAME", "facebook/nllb-200-distilled-600M"
)

# Map the short language codes used by the frontend to NLLB flores-200 codes
NLLB_LANG_MAP: dict[str, str] = {
    "en": "eng_Latn",
    "ar": "arb_Arab",
    "fr": "fra_Latn",
    "es": "spa_Latn",
}

# ---------------------------------------------------------------------------
# Tesseract OCR
# ---------------------------------------------------------------------------
# On Windows the default installer path; override with env var if different.
TESSERACT_CMD: str = os.getenv(
    "TESSERACT_CMD",
    r"C:\Program Files\Tesseract-OCR\tesseract.exe",
)

# ---------------------------------------------------------------------------
# Supported file extensions
# ---------------------------------------------------------------------------
AUDIO_EXTENSIONS: set[str] = {".mp3", ".wav", ".m4a", ".ogg", ".flac"}
IMAGE_EXTENSIONS: set[str] = {".png", ".jpg", ".jpeg", ".bmp", ".tiff"}
PDF_EXTENSIONS: set[str] = {".pdf"}
