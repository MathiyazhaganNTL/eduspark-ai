"""
Utility helpers for file handling.
"""

from __future__ import annotations

import uuid
from pathlib import Path

from fastapi import UploadFile

from core.config import AUDIO_EXTENSIONS, IMAGE_EXTENSIONS, PDF_EXTENSIONS, TEXT_EXTENSIONS, UPLOAD_DIR


def detect_file_type(filename: str) -> str:
    """Return one of 'audio', 'image', 'pdf', 'text', or 'unknown'."""
    suffix = Path(filename).suffix.lower()
    if suffix in AUDIO_EXTENSIONS:
        return "audio"
    if suffix in IMAGE_EXTENSIONS:
        return "image"
    if suffix in PDF_EXTENSIONS:
        return "pdf"
    if suffix in TEXT_EXTENSIONS:
        return "text"
    return "unknown"


async def save_upload(upload: UploadFile) -> Path:
    """Save a single uploaded file to disk and return its path."""
    safe_name = f"{uuid.uuid4().hex}_{upload.filename}"
    dest = UPLOAD_DIR / safe_name
    dest.write_bytes(await upload.read())
    return dest


async def save_uploads(files: list[UploadFile]) -> list[Path]:
    """Save multiple uploaded files and return their paths."""
    return [await save_upload(f) for f in files if f.filename]


def cleanup_file(path: Path) -> None:
    """Silently remove a file."""
    try:
        path.unlink(missing_ok=True)
    except OSError:
        pass


def cleanup_files(paths: list[Path]) -> None:
    """Silently remove a list of files."""
    for p in paths:
        cleanup_file(p)
