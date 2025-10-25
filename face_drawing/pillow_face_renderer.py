from __future__ import annotations

from typing import Dict, Any, List, Optional, Tuple

from PIL import Image, ImageDraw

# Off-screen face renderer using Pillow (no Tk/Turtle required)
#
# Contract:
# - Input: data dict with data["landmarks"][id]["x"|"y"] in [0, 1]
# - Output: image saved to output_path
# - Errors: missing landmarks are skipped gracefully
# - Success: returns the PIL Image instance
#
# Coordinate mapping notes:
# The original turtle version used a centered coordinate system with a flip on Y.
# When mapped to image pixels (top-left origin), it simplifies to:
#   px = x_norm * width
#   py = y_norm * height


def _get_lm(data: Dict[str, Any], idx: int) -> Optional[Dict[str, float]]:
    """Retrieve landmark by index supporting list or dict with int/str keys."""
    lms = data.get("landmarks")
    if lms is None:
        return None

    if isinstance(lms, list):
        if 0 <= idx < len(lms):
            return lms[idx]
        return None

    # dict-like
    if idx in lms:
        return lms[idx]
    key = str(idx)
    return lms.get(key)


def _pt(
    data: Dict[str, Any], idx: int, width: int, height: int
) -> Optional[Tuple[float, float]]:
    lm = _get_lm(data, idx)
    if not lm:
        return None
    try:
        x = float(lm["x"]) * width
        y = float(lm["y"]) * height
    except Exception:
        return None
    return (x, y)


def _polyline(
    draw: ImageDraw.ImageDraw, pts: List[Tuple[float, float]], color: str, stroke: int
) -> None:
    if len(pts) < 2:
        return
    draw.line(pts, fill=color, width=stroke, joint="curve")


def _line(
    draw: ImageDraw.ImageDraw,
    a: Tuple[float, float],
    b: Tuple[float, float],
    color: str,
    stroke: int,
) -> None:
    draw.line([a, b], fill=color, width=stroke)


def _sequence_points(
    data: Dict[str, Any], start: int, end: int, width: int, height: int
) -> List[Tuple[float, float]]:
    pts: List[Tuple[float, float]] = []
    step = 1 if end >= start else -1
    for i in range(start, end + step, step):
        p = _pt(data, i, width, height)
        if p is not None:
            pts.append(p)
    return pts


def _draw_segment(
    draw: ImageDraw.ImageDraw,
    data: Dict[str, Any],
    start: int,
    end: int,
    width: int,
    height: int,
    color: str,
    stroke: int,
) -> None:
    pts = _sequence_points(data, start, end, width, height)
    _polyline(draw, pts, color, stroke)


def _draw_loop(
    draw: ImageDraw.ImageDraw,
    data: Dict[str, Any],
    start: int,
    end: int,
    width: int,
    height: int,
    color: str,
    stroke: int,
) -> None:
    pts = _sequence_points(data, start, end, width, height)
    if len(pts) < 2:
        return
    # close the loop
    pts.append(pts[0])
    _polyline(draw, pts, color, stroke)


def _dot(
    draw: ImageDraw.ImageDraw, center: Tuple[float, float], r: int, color: str
) -> None:
    x, y = center
    draw.ellipse((x - r, y - r, x + r, y + r), fill=color, outline=color)


def render_face_to_image(
    data: Dict[str, Any],
    output_path: str = "face.png",
    width: int = 500,
    height: int = 700,
    stroke: int = 2,
    color: str = "black",
    background: str = "white",
) -> Image.Image:
    """Renders the face lines from landmarks to an off-screen image and saves it.

    Returns the PIL Image instance. The image is also saved to output_path if provided.
    """
    img = Image.new("RGB", (width, height), color=background)
    draw = ImageDraw.Draw(img)

    # Face outline
    _draw_segment(draw, data, 0, 16, width, height, color, stroke)
    a = _pt(data, 0, width, height)
    b = _pt(data, 68, width, height)
    if a and b:
        _line(draw, a, b, color, stroke)
    _draw_segment(draw, data, 68, 74, width, height, color, stroke)
    a = _pt(data, 16, width, height)
    b = _pt(data, 74, width, height)
    if a and b:
        _line(draw, a, b, color, stroke)

    # Eyebrows
    _draw_segment(draw, data, 17, 21, width, height, color, stroke)
    _draw_segment(draw, data, 22, 26, width, height, color, stroke)

    # Eyes (with outer/inner loops and pupils at 75 and 84)
    _draw_loop(draw, data, 36, 41, width, height, color, stroke)
    _draw_loop(draw, data, 76, 83, width, height, color, stroke)
    _draw_loop(draw, data, 42, 47, width, height, color, stroke)
    _draw_loop(draw, data, 85, 92, width, height, color, stroke)

    p75 = _pt(data, 75, width, height)
    p84 = _pt(data, 84, width, height)
    if p75:
        _dot(draw, p75, r=3, color=color)
    if p84:
        _dot(draw, p84, r=3, color=color)

    # Nose
    _draw_segment(draw, data, 27, 30, width, height, color, stroke)
    _draw_segment(draw, data, 31, 35, width, height, color, stroke)
    a = _pt(data, 33, width, height)
    b = _pt(data, 30, width, height)
    if a and b:
        _line(draw, a, b, color, stroke)

    # Mouth
    _draw_loop(draw, data, 48, 59, width, height, color, stroke)
    _draw_loop(draw, data, 60, 67, width, height, color, stroke)

    if output_path:
        img.save(output_path)
    return img


__all__ = ["render_face_to_image"]
