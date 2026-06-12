"""
SWACHH TECH AI — Data Service
Provides synthetic data generation and data access helpers used by
the ML models.  In production this layer would query a real database;
for the hackathon it generates realistic synthetic data.
"""

from __future__ import annotations

import random
from datetime import date, timedelta
from typing import Any, Dict, List

import numpy as np
import pandas as pd

from app.utils.helpers import get_season, is_festival, season_factor

# ── Ward metadata (representative Indian municipal wards) ───────
WARD_METADATA: Dict[str, Dict[str, Any]] = {
    "ward_1": {"name": "Central Zone",        "population_density": 12500, "base_waste_kg": 1100, "recycling_rate": 0.18},
    "ward_2": {"name": "North Zone",          "population_density": 9800,  "base_waste_kg": 950,  "recycling_rate": 0.22},
    "ward_3": {"name": "South Zone",          "population_density": 11200, "base_waste_kg": 1050, "recycling_rate": 0.28},
    "ward_4": {"name": "East Zone",           "population_density": 8500,  "base_waste_kg": 820,  "recycling_rate": 0.15},
    "ward_5": {"name": "West Zone",           "population_density": 10300, "base_waste_kg": 980,  "recycling_rate": 0.20},
    "ward_6": {"name": "Industrial Area",     "population_density": 6200,  "base_waste_kg": 1350, "recycling_rate": 0.12},
    "ward_7": {"name": "Residential Colony",  "population_density": 14000, "base_waste_kg": 1200, "recycling_rate": 0.25},
    "ward_8": {"name": "Market District",     "population_density": 15500, "base_waste_kg": 1450, "recycling_rate": 0.14},
    "ward_9": {"name": "University Area",     "population_density": 7800,  "base_waste_kg": 750,  "recycling_rate": 0.30},
    "ward_10": {"name": "Old City",           "population_density": 13200, "base_waste_kg": 1300, "recycling_rate": 0.11},
}


def get_ward_ids() -> List[str]:
    """Return all known ward IDs."""
    return list(WARD_METADATA.keys())


def get_ward_meta(ward_id: str) -> Dict[str, Any]:
    """Return metadata for a ward; falls back to defaults for unknown wards."""
    return WARD_METADATA.get(
        ward_id,
        {"name": ward_id, "population_density": 10000, "base_waste_kg": 1000, "recycling_rate": 0.20},
    )


def generate_synthetic_waste_data(
    ward_id: str,
    days: int = 90,
    end_date: date | None = None,
) -> pd.DataFrame:
    """Create realistic daily waste-generation records for *one* ward.

    Features generated
    ------------------
    date, ward_id, day_of_week, month, is_weekend, is_festival,
    season, temperature, population_density, waste_kg
    """
    meta = get_ward_meta(ward_id)
    rng = np.random.default_rng(seed=hash(ward_id) % 2**31)

    if end_date is None:
        end_date = date.today()
    start_date = end_date - timedelta(days=days - 1)

    rows: List[Dict[str, Any]] = []
    for i in range(days):
        d = start_date + timedelta(days=i)
        dow = d.weekday()  # 0=Mon … 6=Sun
        weekend = int(dow >= 5)
        fest = int(is_festival(d))
        sea = get_season(d)
        # Simulated temperature (°C) typical of Indian cities
        temp_base = {"winter": 18, "summer": 38, "monsoon": 30, "post_monsoon": 26}
        temp = temp_base[sea] + rng.normal(0, 3)

        # Base waste with realistic variations
        base = meta["base_waste_kg"]
        waste = base * season_factor(sea)
        waste *= (1.12 if weekend else 1.0)       # weekends ≈ 12 % more
        waste *= (1.35 if fest else 1.0)           # festivals ≈ 35 % spike
        waste += rng.normal(0, base * 0.08)        # daily noise ±8 %
        waste = max(waste, base * 0.3)             # floor

        rows.append(
            {
                "date": d,
                "ward_id": ward_id,
                "day_of_week": dow,
                "month": d.month,
                "is_weekend": weekend,
                "is_festival": fest,
                "season": sea,
                "temperature": round(float(temp), 1),
                "population_density": meta["population_density"],
                "waste_kg": round(float(waste), 1),
            }
        )
    return pd.DataFrame(rows)


def generate_all_ward_data(days: int = 90) -> pd.DataFrame:
    """Generate synthetic data for *every* ward and concatenate."""
    frames = [generate_synthetic_waste_data(wid, days=days) for wid in WARD_METADATA]
    return pd.concat(frames, ignore_index=True)


# ── Complaint / insight helpers ─────────────────────────────────

def generate_ward_complaint_stats() -> Dict[str, Dict[str, Any]]:
    """Return simulated complaint stats per ward for insight generation."""
    rng = random.Random(42)
    stats: Dict[str, Dict[str, Any]] = {}
    for wid, meta in WARD_METADATA.items():
        base_complaints = int(meta["population_density"] / 500)
        stats[wid] = {
            "name": meta["name"],
            "total_complaints_last_30d": base_complaints + rng.randint(-5, 15),
            "resolved_percent": round(rng.uniform(55, 95), 1),
            "avg_resolution_hours": round(rng.uniform(4, 48), 1),
            "top_category": rng.choice(
                ["Garbage Dump", "Overflowing Bin", "Missed Collection"]
            ),
            "collection_efficiency": round(rng.uniform(70, 98), 1),
            "recycling_rate": meta["recycling_rate"],
            "trend_complaints": rng.choice(["increasing", "stable", "decreasing"]),
            "trend_change_pct": round(rng.uniform(-15, 35), 1),
        }
    return stats
