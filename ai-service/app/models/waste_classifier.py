"""
SWACHH TECH AI — Waste Classifier Model
Uses YOLOv8 (ultralytics) with pretrained COCO weights to detect objects in
complaint images and maps detections to waste-management categories.
"""

from __future__ import annotations

import io
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
from PIL import Image

logger = logging.getLogger("swachh.classifier")

# ── COCO class → waste category mapping ─────────────────────────
# COCO class names (index → name) that are relevant to waste
WASTE_RELATED_CLASSES: Dict[str, str] = {
    # Plastic / recyclable items
    "bottle": "plastic",
    "cup": "plastic",
    "wine glass": "plastic",
    "fork": "plastic",
    "knife": "plastic",
    "spoon": "plastic",
    # General waste items
    "handbag": "general",
    "backpack": "general",
    "suitcase": "general",
    "umbrella": "general",
    # Paper / cardboard
    "book": "paper",
    "cell phone": "ewaste",
    "laptop": "ewaste",
    "keyboard": "ewaste",
    "remote": "ewaste",
    "mouse": "ewaste",
    "tv": "ewaste",
    # Food waste
    "banana": "organic",
    "apple": "organic",
    "sandwich": "organic",
    "orange": "organic",
    "broccoli": "organic",
    "carrot": "organic",
    "hot dog": "organic",
    "pizza": "organic",
    "donut": "organic",
    "cake": "organic",
    "bowl": "general",
    # Bin / container
    "vase": "bin",
    "potted plant": "organic",
    # Fire / burning
    "oven": "fire",
    "toaster": "fire",
    # Vehicles (context for dumping scenes)
    "truck": "vehicle",
    "car": "vehicle",
}

# Categories mapped from aggregate detection patterns
CATEGORY_RECOMMENDATIONS: Dict[str, List[str]] = {
    "GARBAGE_DUMP": [
        "Deploy cleanup crew within 24 hours",
        "Issue notice to nearby establishments",
        "Install surveillance camera at location",
        "Schedule regular monitoring",
    ],
    "OVERFLOWING_BIN": [
        "Increase collection frequency for this bin",
        "Consider upgrading to a larger bin",
        "Alert nearest collection vehicle for immediate pickup",
    ],
    "ILLEGAL_DUMPING": [
        "Issue fine under Solid Waste Management Rules 2016",
        "Deploy cleanup crew immediately",
        "Install 'No Dumping' signage with penalty details",
        "Report to local municipal authority",
    ],
    "MISSED_COLLECTION": [
        "Notify collection supervisor",
        "Dispatch backup collection vehicle",
        "Review and update collection schedule",
    ],
    "BURNING_WASTE": [
        "Alert fire department immediately",
        "Issue environmental violation notice",
        "Deploy air quality monitoring",
        "Initiate fire suppression if safe",
    ],
    "PLASTIC_WASTE": [
        "Coordinate with recycling centre for pickup",
        "Initiate awareness drive on plastic disposal",
        "Deploy segregation volunteers",
    ],
    "GENERAL_WASTE": [
        "Schedule standard cleanup",
        "Monitor for escalation",
        "Add to regular collection route",
    ],
}


class WasteClassifier:
    """YOLOv8-backed complaint image classifier.

    Lifecycle
    ---------
    1. ``load_model()`` — called at startup; downloads / caches yolov8n.pt.
    2. ``classify(image_bytes)`` — called per API request.
    """

    def __init__(self, model_path: str = "yolov8n.pt") -> None:
        self._model_path = model_path
        self._model: Any = None
        self._is_loaded: bool = False

    # ── Loading ─────────────────────────────────────────────

    def load_model(self) -> None:
        """Load the YOLOv8 model (downloads weights on first run)."""
        try:
            from ultralytics import YOLO

            logger.info("Loading YOLOv8 model: %s", self._model_path)
            self._model = YOLO(self._model_path)
            self._is_loaded = True
            logger.info("YOLOv8 model loaded successfully.")
        except Exception as exc:
            logger.warning(
                "Could not load YOLOv8 model (%s). "
                "Classifier will use fallback heuristic mode.",
                exc,
            )
            self._model = None
            self._is_loaded = True  # still mark as loaded so API doesn't block

    # ── Classification ──────────────────────────────────────

    def classify(self, image_bytes: bytes) -> Dict[str, Any]:
        """Classify a complaint image.

        Returns a dict matching ``ClassificationResponse`` schema.
        """
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

        if self._model is not None:
            return self._classify_with_yolo(image)
        return self._classify_fallback(image)

    # ── YOLO-based path ─────────────────────────────────────

    def _classify_with_yolo(self, image: Image.Image) -> Dict[str, Any]:
        """Run YOLOv8 inference and map detections to waste categories."""
        img_array = np.array(image)
        results = self._model(img_array, verbose=False)

        detected_objects: List[Dict[str, Any]] = []
        waste_counts: Dict[str, int] = {}
        total_area = 0.0
        image_area = float(image.width * image.height)

        for result in results:
            boxes = result.boxes
            if boxes is None:
                continue
            for box in boxes:
                cls_id = int(box.cls[0])
                conf = float(box.conf[0])
                label = result.names.get(cls_id, "unknown")
                x1, y1, x2, y2 = box.xyxy[0].tolist()

                detected_objects.append(
                    {
                        "label": label,
                        "confidence": round(conf, 2),
                        "bbox": [round(x1, 1), round(y1, 1), round(x2, 1), round(y2, 1)],
                    }
                )

                waste_type = WASTE_RELATED_CLASSES.get(label)
                if waste_type:
                    waste_counts[waste_type] = waste_counts.get(waste_type, 0) + 1

                box_area = (x2 - x1) * (y2 - y1)
                total_area += box_area

        # Determine category from detection patterns
        category, severity, confidence = self._determine_category(
            detected_objects, waste_counts, total_area, image_area
        )

        recommendations = CATEGORY_RECOMMENDATIONS.get(category, CATEGORY_RECOMMENDATIONS["GENERAL_WASTE"])
        description = self._build_description(category, detected_objects, waste_counts)

        return {
            "classification": category,
            "confidence": round(confidence, 2),
            "severity": severity,
            "detected_objects": detected_objects,
            "recommendations": recommendations,
            "description": description,
            "objects_count": len(detected_objects),
        }

    def _determine_category(
        self,
        detected_objects: List[Dict[str, Any]],
        waste_counts: Dict[str, int],
        total_detection_area: float,
        image_area: float,
    ) -> Tuple[str, int, float]:
        """Heuristic rules to map detections to a waste category.

        Returns (category, severity 1-5, confidence).
        """
        n_objects = len(detected_objects)
        area_ratio = total_detection_area / max(image_area, 1.0)
        avg_conf = (
            float(np.mean([o["confidence"] for o in detected_objects]))
            if detected_objects
            else 0.0
        )

        # Fire / burning detection
        if waste_counts.get("fire", 0) > 0:
            return "BURNING_WASTE", 5, min(avg_conf + 0.1, 0.99)

        # Plastic-heavy scenes
        plastic_count = waste_counts.get("plastic", 0)
        if plastic_count >= 3:
            return "PLASTIC_WASTE", 3, min(avg_conf + 0.05, 0.99)

        # Large area coverage → illegal dumping
        if area_ratio > 0.5 and n_objects >= 3:
            return "ILLEGAL_DUMPING", 5, min(avg_conf + 0.05, 0.99)

        # Many waste objects → garbage dump
        total_waste = sum(
            v for k, v in waste_counts.items() if k not in ("vehicle",)
        )
        if total_waste >= 5 or n_objects >= 6:
            return "GARBAGE_DUMP", 4, min(avg_conf + 0.05, 0.99)

        # Bin-related detections
        if waste_counts.get("bin", 0) > 0 and total_waste >= 2:
            return "OVERFLOWING_BIN", 3, min(avg_conf + 0.05, 0.99)

        # Moderate waste
        if total_waste >= 2:
            return "GARBAGE_DUMP", 3, avg_conf

        # Few or no detections → missed collection (default)
        if n_objects <= 1:
            return "MISSED_COLLECTION", 2, max(avg_conf, 0.55)

        return "GENERAL_WASTE", 2, max(avg_conf, 0.50)

    def _build_description(
        self,
        category: str,
        detected_objects: List[Dict[str, Any]],
        waste_counts: Dict[str, int],
    ) -> str:
        """Build a human-readable description of the classification."""
        n = len(detected_objects)
        descriptions: Dict[str, str] = {
            "GARBAGE_DUMP": f"Detected a garbage dump scene with {n} object(s). Immediate cleanup recommended.",
            "OVERFLOWING_BIN": f"Waste bin appears to be overflowing with {n} visible item(s) around it.",
            "ILLEGAL_DUMPING": f"Suspected illegal dumping detected — large area covered with {n} objects.",
            "MISSED_COLLECTION": "Area shows signs of missed waste collection. No major waste items detected but cleanliness below standard.",
            "BURNING_WASTE": f"Burning waste detected with {n} related object(s). Immediate fire and environmental response needed.",
            "PLASTIC_WASTE": f"Significant plastic waste detected — {waste_counts.get('plastic', 0)} plastic items identified.",
            "GENERAL_WASTE": f"General waste scene detected with {n} object(s). Routine cleanup suggested.",
        }
        return descriptions.get(category, f"Waste detected with {n} object(s).")

    # ── Fallback (no YOLO) ──────────────────────────────────

    def _classify_fallback(self, image: Image.Image) -> Dict[str, Any]:
        """Heuristic classification when YOLOv8 is not available.
        Uses basic image statistics (color histogram, brightness)."""
        img_array = np.array(image)

        # Colour channel means
        r_mean, g_mean, b_mean = img_array.mean(axis=(0, 1))
        brightness = float(np.mean(img_array))

        # Dark / brownish images often indicate waste dumps
        if brightness < 80:
            category = "GARBAGE_DUMP"
            severity = 4
            confidence = 0.55
        elif r_mean > 150 and g_mean < 100:
            # Reddish → could be burning
            category = "BURNING_WASTE"
            severity = 5
            confidence = 0.50
        elif brightness > 180:
            category = "MISSED_COLLECTION"
            severity = 2
            confidence = 0.45
        else:
            category = "GENERAL_WASTE"
            severity = 2
            confidence = 0.40

        recommendations = CATEGORY_RECOMMENDATIONS.get(category, CATEGORY_RECOMMENDATIONS["GENERAL_WASTE"])
        description = (
            f"Fallback analysis (YOLOv8 unavailable): classified as {category} "
            f"based on image colour/brightness heuristics."
        )

        return {
            "classification": category,
            "confidence": round(confidence, 2),
            "severity": severity,
            "detected_objects": [],
            "recommendations": recommendations,
            "description": description,
            "objects_count": 0,
        }

    @property
    def is_ready(self) -> bool:
        return self._is_loaded
