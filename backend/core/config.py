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

DB_PATH = BASE_DIR / "eduspark.db"

# ---------------------------------------------------------------------------
# Ollama
# ---------------------------------------------------------------------------
OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_GENERATE_URL: str = f"{OLLAMA_BASE_URL}/api/generate"
OLLAMA_EMBED_URL: str = f"{OLLAMA_BASE_URL}/api/embeddings"
OLLAMA_LLM_MODEL: str = os.getenv("OLLAMA_LLM_MODEL", "llama3:latest")
OLLAMA_VISION_MODEL: str = os.getenv("OLLAMA_VISION_MODEL", "llava:latest")
OLLAMA_EMBED_MODEL: str = os.getenv("OLLAMA_EMBED_MODEL", "nomic-embed-text:latest")

# ---------------------------------------------------------------------------
# Whisper
# ---------------------------------------------------------------------------
WHISPER_MODEL_SIZE: str = os.getenv("WHISPER_MODEL_SIZE", "small")

# ---------------------------------------------------------------------------
# NLLB Translation
# ---------------------------------------------------------------------------
NLLB_MODEL_NAME: str = os.getenv("NLLB_MODEL_NAME", "facebook/nllb-200-distilled-600M")

NLLB_LANG_MAP: dict[str, str] = {
    "en": "eng_Latn",
    "ta": "tam_Taml",
    "ar": "arb_Arab",
    "fr": "fra_Latn",
    "es": "spa_Latn",
}

# ---------------------------------------------------------------------------
# RAG / Chunking
# ---------------------------------------------------------------------------
CHUNK_SIZE: int = int(os.getenv("CHUNK_SIZE", "1500"))
CHUNK_OVERLAP: int = int(os.getenv("CHUNK_OVERLAP", "300"))
RAG_TOP_K: int = int(os.getenv("RAG_TOP_K", "6"))
RAG_CHAR_THRESHOLD: int = int(os.getenv("RAG_CHAR_THRESHOLD", "16000"))

# ---------------------------------------------------------------------------
# Supported file extensions
# ---------------------------------------------------------------------------
AUDIO_EXTENSIONS: set[str] = {".mp3", ".wav", ".m4a", ".ogg", ".flac", ".mp4"}
IMAGE_EXTENSIONS: set[str] = {".png", ".jpg", ".jpeg", ".bmp", ".tiff", ".webp"}
PDF_EXTENSIONS: set[str] = {".pdf"}
TEXT_EXTENSIONS: set[str] = {".txt", ".text", ".md", ".csv"}
