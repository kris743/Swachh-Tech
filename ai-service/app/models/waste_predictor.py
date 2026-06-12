"""
SWACHH TECH AI — Waste Predictor Model
Trains a GradientBoostingRegressor on synthetic historical waste data
and predicts future waste generation per ward.
"""

from __future__ import annotations

import logging
from datetime import date, timedelta
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder

from app.services.data_service import (
    generate_all_ward_data,
    get_ward_ids,
    get_ward_meta,
)
from app.utils.helpers import (
    clamp,
    date_range,
    format_datetime_ist,
    get_season,
    is_festival,
    season_factor,
)

logger = logging.getLogger("swachh.predictor")


class WastePredictor:
    """End-to-end waste prediction pipeline.

    Lifecycle
    ---------
    1. ``train()`` — called once at startup (lifespan).
    2. ``predict(ward_id, days)`` — called per API request.
    """

    FEATURE_COLS = [
        "day_of_week",
        "month",
        "is_weekend",
        "is_festival",
        "temperature",
        "population_density",
        "ward_encoded",
    ]

    def __init__(self) -> None:
        self.model: Optional[GradientBoostingRegressor] = None
        self.ward_encoder: LabelEncoder = LabelEncoder()
        self.r2_score: float = 0.0
        self.mae: float = 0.0
        self._is_trained: bool = False

    # ── Training ────────────────────────────────────────────

    def train(self, days: int = 90) -> Dict[str, Any]:
        """Generate synthetic data for all wards, engineer features, and fit
        a GradientBoostingRegressor.  Returns training metrics."""

        logger.info("Generating synthetic training data (%d days × %d wards)…",
                     days, len(get_ward_ids()))
        df = generate_all_ward_data(days=days)

        # Encode ward IDs
        df["ward_encoded"] = self.ward_encoder.fit_transform(df["ward_id"])

        X = df[self.FEATURE_COLS].values
        y = df["waste_kg"].values

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )

        self.model = GradientBoostingRegressor(
            n_estimators=200,
            max_depth=5,
            learning_rate=0.1,
            subsample=0.8,
            random_state=42,
        )
        self.model.fit(X_train, y_train)

        y_pred = self.model.predict(X_test)
        self.r2_score = float(r2_score(y_test, y_pred))
        self.mae = float(mean_absolute_error(y_test, y_pred))
        self._is_trained = True

        metrics = {
            "r2_score": round(self.r2_score, 4),
            "mae": round(self.mae, 2),
            "train_samples": len(X_train),
            "test_samples": len(X_test),
            "wards": len(get_ward_ids()),
        }
        logger.info("Training complete — R²=%.4f  MAE=%.2f kg", self.r2_score, self.mae)
        return metrics

    # ── Prediction ──────────────────────────────────────────

    def predict(
        self,
        ward_id: str,
        prediction_days: int = 7,
        include_trends: bool = True,
    ) -> Dict[str, Any]:
        """Return predictions for `ward_id` over the next `prediction_days`."""

        if not self._is_trained or self.model is None:
            raise RuntimeError("Model has not been trained yet.")

        meta = get_ward_meta(ward_id)
        today = date.today()
        future_dates = date_range(today + timedelta(days=1), prediction_days)

        # Encode ward — handle unseen wards gracefully
        try:
            ward_enc = int(self.ward_encoder.transform([ward_id])[0])
        except ValueError:
            ward_enc = 0  # default encoding for unknown ward

        rows: List[Dict[str, Any]] = []
        for d in future_dates:
            sea = get_season(d)
            temp_base = {"winter": 18, "summer": 38, "monsoon": 30, "post_monsoon": 26}
            temp = temp_base[sea] + np.random.default_rng(d.toordinal()).normal(0, 2)
            rows.append(
                {
                    "date": d,
                    "day_of_week": d.weekday(),
                    "month": d.month,
                    "is_weekend": int(d.weekday() >= 5),
                    "is_festival": int(is_festival(d)),
                    "temperature": round(float(temp), 1),
                    "population_density": meta["population_density"],
                    "ward_encoded": ward_enc,
                }
            )

        df_future = pd.DataFrame(rows)
        X_future = df_future[self.FEATURE_COLS].values
        predictions_raw = self.model.predict(X_future)

        # Build daily predictions with confidence
        daily: List[Dict[str, Any]] = []
        for i, d in enumerate(future_dates):
            pred_kg = max(float(predictions_raw[i]), 0.0)
            # Confidence based on model R² and day distance
            conf = clamp(self.r2_score - 0.01 * (i / prediction_days), 0.5, 0.99)
            daily.append(
                {
                    "date": d.isoformat(),
                    "predicted_waste_kg": round(pred_kg, 1),
                    "confidence": round(conf, 2),
                }
            )

        # Weekly summary
        pred_values = [p["predicted_waste_kg"] for p in daily]
        weekly = {
            "total_kg": round(sum(pred_values), 1),
            "average_daily_kg": round(float(np.mean(pred_values)), 1),
            "min_day": daily[int(np.argmin(pred_values))]["date"],
            "max_day": daily[int(np.argmax(pred_values))]["date"],
            "min_kg": round(float(np.min(pred_values)), 1),
            "max_kg": round(float(np.max(pred_values)), 1),
        }

        result: Dict[str, Any] = {
            "ward_id": ward_id,
            "ward_name": meta["name"],
            "predictions": daily,
            "weekly_summary": weekly,
            "model_accuracy": round(clamp(self.r2_score, 0.0, 1.0), 4),
            "prediction_days": prediction_days,
            "generated_at": format_datetime_ist(),
        }

        if include_trends:
            result["seasonal_trends"] = [
                {
                    "season": "monsoon",
                    "factor": 1.15,
                    "description": "Monsoon season increases waste by ~15% due to waterlogged refuse and debris.",
                },
                {
                    "season": "summer",
                    "factor": 1.10,
                    "description": "Higher consumption of packaged beverages leads to ~10% increase.",
                },
                {
                    "season": "winter",
                    "factor": 0.95,
                    "description": "Cooler weather slightly reduces organic decomposition rate.",
                },
                {
                    "season": "post_monsoon",
                    "factor": 1.05,
                    "description": "Post-monsoon cleanup drives lead to marginally higher collections.",
                },
            ]

        return result

    @property
    def is_ready(self) -> bool:
        return self._is_trained
