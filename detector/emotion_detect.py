from __future__ import annotations

import os
import threading
from typing import Optional, Tuple

try:
    import torch
except Exception:  # torch may not be available at type-check time
    torch = None  # type: ignore

from feat import Detector

# Initialize a single Detector instance at import time to avoid per-request overhead
_detector: Optional[Detector] = None
_detector_lock = threading.Lock()


def _get_detector() -> Detector:
    global _detector
    if _detector is None:
        # You can customize model backends here if needed
        _detector = Detector()
    return _detector


def detect_emotion(image_path: str) -> Tuple[Optional[str], Optional[float], object]:
    """Run emotion detection on an image path using py-feat.

    Returns (best_label, best_score, prediction_fex)
    - best_label: name of the most likely emotion (or None if not found)
    - best_score: probability score (float) for the best emotion (or None)
    - prediction_fex: the Fex object returned by py-feat
    """
    if not image_path or not os.path.exists(image_path):
        raise FileNotFoundError(f"Image path not found: {image_path}")

    detector = _get_detector()
    try:
        # Ensure consistent behavior across requests: single-image batch and fixed output size
        # Also run under no_grad to avoid autograd-related numpy() issues reported by torch
        if torch is not None:
            with torch.no_grad():
                prediction = detector.detect_image(
                    image_path,
                    output_size=(224, 224),
                    batch_size=1,
                    frame_counter=0,
                )
        else:
            prediction = detector.detect_image(
                image_path,
                output_size=(224, 224),
                batch_size=1,
                frame_counter=0,
            )
    except Exception as e:
        # Bubble up to the caller to handle logging/behavior
        raise RuntimeError(f"py-feat detect_image failed: {e}") from e

    # prediction.emotions is typically a pandas DataFrame (rows: faces, cols: emotion probabilities)
    emotions_df = getattr(prediction, "emotions", None)
    if emotions_df is None or getattr(emotions_df, "empty", True):
        return None, None, prediction

    # Use the first detected face for now
    row = emotions_df.iloc[0]
    best_label: str = row.idxmax()
    best_score: float = float(row.max())
    return best_label, best_score, prediction


__all__ = ["detect_emotion"]
