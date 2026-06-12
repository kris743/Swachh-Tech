"""
SWACHH TECH AI — Route Optimization Schemas (Pydantic v2)
Request / response models for the route optimization endpoint.
"""

from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, Field


# ── Request ─────────────────────────────────────────────────────

class Location(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)


class PickupPoint(BaseModel):
    id: str = Field(..., description="Unique ID of the pickup point.")
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    demand: float = Field(..., gt=0, description="Estimated waste demand in kg.")
    time_window_start: Optional[int] = Field(
        None, ge=0, description="Earliest service time in minutes from depot departure."
    )
    time_window_end: Optional[int] = Field(
        None, ge=0, description="Latest service time in minutes from depot departure."
    )


class VehicleFleet(BaseModel):
    count: int = Field(..., ge=1, le=50, description="Number of vehicles.")
    capacity: float = Field(..., gt=0, description="Capacity of each vehicle in kg.")


class RouteOptimizationRequest(BaseModel):
    """POST body for /api/v1/optimize/route."""

    depot: Location
    pickups: List[PickupPoint] = Field(..., min_length=1)
    vehicles: VehicleFleet
    max_distance_km: float = Field(
        default=100.0, gt=0, description="Maximum route distance per vehicle in km."
    )


# ── Response ────────────────────────────────────────────────────

class RouteStop(BaseModel):
    id: str
    order: int
    latitude: float
    longitude: float
    demand_kg: float
    arrival_distance_km: float = Field(
        ..., description="Cumulative distance from depot to this stop."
    )


class VehicleRoute(BaseModel):
    vehicle_id: int
    stops: List[RouteStop]
    total_distance_km: float
    total_load_kg: float
    estimated_time_minutes: float
    capacity_utilization_percent: float


class RouteOptimizationResponse(BaseModel):
    """Full response for the route optimization endpoint."""

    optimized_routes: List[VehicleRoute]
    total_distance_km: float
    total_time_minutes: float
    total_load_kg: float
    vehicles_used: int
    savings_vs_naive_percent: float = Field(
        ..., description="Percentage distance saved vs. naive round-trip approach."
    )
