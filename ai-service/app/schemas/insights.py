"""
SWACHH TECH AI — Insights Schemas (Pydantic v2)
Request / response models for the AI insights endpoint.
"""

from __future__ import annotations

from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field


class InsightType(str, Enum):
    RECOMMENDATION = "recommendation"
    ALERT = "alert"
    TREND = "trend"
    RISK = "risk"


class SeverityLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class Insight(BaseModel):
    type: InsightType
    severity: SeverityLevel
    title: str
    description: str
    ward_id: Optional[str] = None
    ward_name: Optional[str] = None
    metric: str
    trend: str
    change_percent: float


class RiskIndicator(BaseModel):
    ward_id: str
    ward_name: str
    risk_level: SeverityLevel
    risk_score: float = Field(..., ge=0.0, le=100.0)
    factors: List[str]
    recommended_action: str


class Alert(BaseModel):
    ward_id: str
    ward_name: str
    alert_type: str
    message: str
    severity: SeverityLevel
    action_required: bool


class InsightsResponse(BaseModel):
    """Full response for the insights endpoint."""

    insights: List[Insight]
    risk_indicators: List[RiskIndicator]
    alerts: List[Alert]
    total_wards_analyzed: int
    generated_at: str
