"""
SWACHH TECH AI — Prediction Schemas (Pydantic v2)
Request / response models for the waste-prediction endpoint.
"""

from __future__ import annotations

from datetime import date
from typing import List, Optional

from pydantic import BaseModel, Field


# ── Request ─────────────────────────────────────────────────────

class WastePredictionRequest(BaseModel):
    """POST body for /api/v1/predict/waste."""

    ward_id: str = Field(
        ...,
        min_length=1,
        description="Identifier of the municipal ward (e.g. 'ward_1').",
        examples=["ward_1"],
    )
    prediction_days: int = Field(
        default=7,
        ge=1,
        le=90,
        description="Number of days to forecast (1-90).",
    )
    include_trends: bool = Field(
        default=True,
        description="Whether to include seasonal trend analysis.",
    )


# ── Response sub-models ─────────────────────────────────────────

class DailyPrediction(BaseModel):
    date: date
    predicted_waste_kg: float = Field(..., description="Predicted waste in kg.")
    confidence: float = Field(
        ..., ge=0.0, le=1.0, description="Model confidence score."
    )


class WeeklySummary(BaseModel):
    total_kg: float
    average_daily_kg: float
    min_day: date
    max_day: date
    min_kg: float
    max_kg: float


class SeasonalTrend(BaseModel):
    season: str
    factor: float = Field(..., description="Multiplicative factor vs baseline.")
    description: str


class WastePredictionResponse(BaseModel):
    """Full response for the prediction endpoint."""

    ward_id: str
    ward_name: str
    predictions: List[DailyPrediction]
    weekly_summary: WeeklySummary
    seasonal_trends: Optional[List[SeasonalTrend]] = None
    model_accuracy: float = Field(
        ..., ge=0.0, le=1.0, description="R² score on held-out data."
    )
    prediction_days: int
    generated_at: str
