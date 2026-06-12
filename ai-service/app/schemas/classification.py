"""
SWACHH TECH AI — Classification Schemas (Pydantic v2)
Request / response models for the complaint classification endpoint.
"""

from __future__ import annotations

from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field


class ComplaintCategory(str, Enum):
    """Categories a complaint image can be classified into."""

    GARBAGE_DUMP = "GARBAGE_DUMP"
    OVERFLOWING_BIN = "OVERFLOWING_BIN"
    ILLEGAL_DUMPING = "ILLEGAL_DUMPING"
    MISSED_COLLECTION = "MISSED_COLLECTION"
    BURNING_WASTE = "BURNING_WASTE"
    PLASTIC_WASTE = "PLASTIC_WASTE"
    GENERAL_WASTE = "GENERAL_WASTE"


class DetectedObject(BaseModel):
    """A single object detected by YOLOv8."""

    label: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    bbox: List[float] = Field(
        ...,
        min_length=4,
        max_length=4,
        description="Bounding box [x1, y1, x2, y2] in pixel coords.",
    )


class ClassificationResponse(BaseModel):
    """Full response for the complaint classification endpoint."""

    classification: ComplaintCategory
    confidence: float = Field(..., ge=0.0, le=1.0)
    severity: int = Field(..., ge=1, le=5, description="Severity score 1 (low) to 5 (critical).")
    detected_objects: List[DetectedObject]
    recommendations: List[str]
    description: str = Field(
        ..., description="Human-readable description of the classification."
    )
    objects_count: int = Field(..., ge=0)
