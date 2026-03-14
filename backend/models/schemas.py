"""
Pydantic schemas that define the API request / response shapes.
These must match the frontend TypeScript interfaces exactly.
"""

from __future__ import annotations

from pydantic import BaseModel, Field


# ---------- Health ----------
class HealthModels(BaseModel):
    """Status of each AI sub-system."""
    ollama_llm: str = Field(alias="Ollama (LLM)")
    whisper_stt: str = Field(alias="Whisper (Speech-to-Text)")
    nllb_translation: str = Field(alias="NLLB (Translation)")
    tesseract_ocr: str = Field(alias="Tesseract (OCR)")

    class Config:
        populate_by_name = True


class HealthResponse(BaseModel):
    status: str
    models: dict[str, str]


# ---------- Analyze ----------
class AnalyzeRequest(BaseModel):
    text: str
    language: str = "en"


class InsightResult(BaseModel):
    identified_issue: str
    curriculum_topic: str
    age_group: str
    suggested_activity: str
    required_materials: list[str]
    activity_duration: str
