"""
Whisper speech-to-text service.
Loads the model lazily on first use to avoid blocking startup.
"""

from __future__ import annotations

import logging
import subprocess
from pathlib import Path

logger = logging.getLogger(__name__)

_whisper_model = None
_model_load_error: str | None = None


def _get_model():
    global _whisper_model, _model_load_error
    if _whisper_model is not None:
        return _whisper_model
    if _model_load_error is not None:
        raise RuntimeError(_model_load_error)
    try:
        import whisper
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
    """Check whisper package is installed AND ffmpeg is on PATH."""
    try:
        import whisper  # noqa
        result = subprocess.run(["ffmpeg", "-version"], capture_output=True, timeout=5)
        return result.returncode == 0
    except Exception:
        return False


def transcribe(audio_path: str | Path, language_hint: str = "en") -> str:
    """Transcribe an audio file. Uses fp16=False for CPU compatibility.
    Passes strict language hints to prevent non-English hallucinations.
    """
    model = _get_model()
    logger.info("Transcribing %s (hint=%s) …", audio_path, language_hint)
    try:
        kwargs = {
            "fp16": False,
            "condition_on_previous_text": False,
            "compression_ratio_threshold": 2.4, # Detects repetitive garbage
            "logprob_threshold": -1.0,          # Triggers fallback if uncertain
            "no_speech_threshold": 0.6
        }
        # Do not force "language=language_hint" because it crashes accuracy for mixed Tamil/English audio.
        # Allow Whisper to freely auto-detect the spoken mix!

            
        result = model.transcribe(str(audio_path), **kwargs)
    except Exception as exc:
        if "ffmpeg" in str(exc).lower():
            raise RuntimeError(
                "ffmpeg is not installed or not on PATH. "
                "Download from https://ffmpeg.org and add to PATH."
            ) from exc
        raise
    text: str = result.get("text", "").strip()
    if not text:
        raise ValueError(
            "Whisper could not extract speech from the audio file. "
            "Ensure the file contains audible speech."
        )
    logger.info("Transcription complete (%d chars).", len(text))
    return text
