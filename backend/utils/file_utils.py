"""
Utility helpers for file handling (saving uploads, detecting types, cleanup).
"""

from __future__ import annotations

import uuid
from pathlib import Path

from fastapi import UploadFile

from core.config import (
    AUDIO_EXTENSIONS,
    IMAGE_EXTENSIONS,
    PDF_EXTENSIONS,
    UPLOAD_DIR,
)


def detect_file_type(filename: str) -> str:
    """Return one of 'audio', 'image', 'pdf', or 'unknown'."""
    suffix = Path(filename).suffix.lower()
    if suffix in AUDIO_EXTENSIONS:
        return "audio"
    if suffix in IMAGE_EXTENSIONS:
        return "image"
    if suffix in PDF_EXTENSIONS:
        return "pdf"
    return "unknown"


async def save_upload(upload: UploadFile) -> Path:
    """
    Persist an uploaded file to disk and return its path.
    A UUID prefix avoids filename collisions.
    """
    safe_name = f"{uuid.uuid4().hex}_{upload.filename}"
    dest = UPLOAD_DIR / safe_name
    contents = await upload.read()
    dest.write_bytes(contents)
    return dest


def cleanup_file(path: Path) -> None:
    """Silently remove a file if it exists."""
    try:
        path.unlink(missing_ok=True)
    except OSError:
        pass
