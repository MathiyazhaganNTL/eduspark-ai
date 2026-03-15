"""
Pydantic schemas — API request / response shapes.
"""

from __future__ import annotations

from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str
    models: dict[str, str]


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
    extracted_text: str | None = None
    extracted_files: list[dict[str, str]] | None = None
