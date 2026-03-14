"""
Whisper speech-to-text service.
Loads the model lazily on first use to avoid blocking startup.
"""

from __future__ import annotations

import logging
from pathlib import Path

logger = logging.getLogger(__name__)

# Lazy singleton ─ loaded once, reused thereafter
_whisper_model = None
_model_load_error: str | None = None


def _get_model():
    """Load (or return cached) whisper model."""
    global _whisper_model, _model_load_error

    if _whisper_model is not None:
        return _whisper_model

    if _model_load_error is not None:
        raise RuntimeError(_model_load_error)

    try:
        import whisper  # noqa: local import to keep startup fast
        from core.config import WHISPER_MODEL_SIZE

        logger.info("Loading Whisper model '%s' …", WHISPER_MODEL_SIZE)
        _whisper_model = whisper.load_model(WHISPER_MODEL_SIZE)
        logger.info("Whisper model loaded successfully.")
        return _whisper_model
    except Exception as exc:
        _model_load_error = str(exc)
        logger.error("Failed to load Whisper: %s", exc)
        raise


def is_whisper_available() -> bool:
    """Check whether whisper can be imported (not necessarily loaded yet)."""
    try:
        import whisper  # noqa
        return True
    except ImportError:
        return False


def transcribe(audio_path: str | Path) -> str:
    """
    Transcribe an audio file and return the text.
    """
    model = _get_model()
    logger.info("Transcribing %s …", audio_path)
    result = model.transcribe(str(audio_path))
    text: str = result.get("text", "").strip()
    logger.info("Transcription complete (%d chars).", len(text))
    return text
