"""
SWACHH TECH AI — Utility Helpers
Reusable helper functions used across the service.
"""

from __future__ import annotations

import math
from datetime import date, datetime, timedelta
from typing import List, Tuple


# ── Indian festivals (approximate dates, recur annually) ────────
INDIAN_FESTIVALS: dict[str, list[Tuple[int, int]]] = {
    "Diwali": [(10, 24), (11, 12), (10, 31)],
    "Holi": [(3, 8), (3, 25), (3, 14)],
    "Ganesh_Chaturthi": [(9, 7), (9, 19), (9, 10)],
    "Eid": [(4, 10), (3, 30), (4, 21)],
    "Christmas": [(12, 25)],
    "New_Year": [(1, 1)],
    "Pongal": [(1, 14), (1, 15)],
    "Onam": [(8, 29), (9, 7)],
    "Durga_Puja": [(10, 10), (10, 20)],
    "Republic_Day": [(1, 26)],
    "Independence_Day": [(8, 15)],
}


def is_festival(d: date, tolerance_days: int = 2) -> bool:
    """Return True if `d` falls within ±tolerance_days of any known festival."""
    for dates in INDIAN_FESTIVALS.values():
        for month, day in dates:
            try:
                festival_date = date(d.year, month, day)
            except ValueError:
                continue
            if abs((d - festival_date).days) <= tolerance_days:
                return True
    return False


def get_season(d: date) -> str:
    """Return the Indian season name for a given date."""
    month = d.month
    if month in (6, 7, 8, 9):
        return "monsoon"
    elif month in (10, 11):
        return "post_monsoon"
    elif month in (12, 1, 2):
        return "winter"
    else:
        return "summer"


def season_factor(season: str) -> float:
    """Multiplier reflecting how season affects waste generation."""
    return {
        "monsoon": 1.15,
        "post_monsoon": 1.05,
        "winter": 0.95,
        "summer": 1.10,
    }.get(season, 1.0)


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Great-circle distance in kilometres between two lat/lon points."""
    R = 6371.0  # Earth radius in km
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = (
        math.sin(d_lat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(d_lon / 2) ** 2
    )
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def build_distance_matrix(
    locations: List[Tuple[float, float]],
) -> List[List[int]]:
    """Build an integer distance matrix (metres) for OR-Tools.

    Parameters
    ----------
    locations : list of (lat, lon) tuples — index 0 is the depot.

    Returns
    -------
    Matrix where entry [i][j] is the distance in *metres* (int).
    """
    n = len(locations)
    matrix: List[List[int]] = []
    for i in range(n):
        row: List[int] = []
        for j in range(n):
            if i == j:
                row.append(0)
            else:
                km = haversine_km(*locations[i], *locations[j])
                row.append(int(km * 1000))  # metres
        matrix.append(row)
    return matrix


def date_range(start: date, days: int) -> List[date]:
    """Return a list of `days` consecutive dates starting from `start`."""
    return [start + timedelta(days=i) for i in range(days)]


def clamp(value: float, lo: float, hi: float) -> float:
    """Clamp a value to [lo, hi]."""
    return max(lo, min(hi, value))


def format_datetime_ist(dt: datetime | None = None) -> str:
    """Return ISO-8601 string for a datetime (defaults to now UTC)."""
    if dt is None:
        dt = datetime.utcnow()
    return dt.strftime("%Y-%m-%dT%H:%M:%SZ")
