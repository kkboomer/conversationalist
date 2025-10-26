from __future__ import annotations

import atexit
import os
import re
import threading
from typing import Optional

from dotenv import load_dotenv, find_dotenv

# Load environment from .env (project root or CWD)
load_dotenv(find_dotenv(usecwd=True), override=False)

try:
    from google import genai
    from google.genai import types
except Exception as e:
    raise RuntimeError(
        "google-genai is not installed. Install with: pip install -U google-genai"
    ) from e


_CLIENT: Optional[genai.Client] = None
_CLIENT_LOCK = threading.Lock()


def _get_client() -> genai.Client:
    global _CLIENT
    if _CLIENT is not None:
        return _CLIENT

    with _CLIENT_LOCK:
        if _CLIENT is not None:
            return _CLIENT

        api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise RuntimeError(
                "GEMINI_API_KEY is not set. Put it in a .env file or the environment."
            )

        # Use the new quickstart client
        client = genai.Client(api_key=api_key)

        # Guarded close on process exit to avoid destructor issues
        def _close():
            try:
                if hasattr(client, "close"):
                    client.close()
            except Exception:
                pass

        atexit.register(_close)
        _CLIENT = client
        return _CLIENT


_ALLOWED = {"anger", "disgust", "fear", "happiness", "sadness", "surprise", "neutral"}
_SYNONYMS = {
    "angry": "anger",
    "mad": "anger",
    "happy": "happiness",
    "joy": "happiness",
    "joyful": "happiness",
    "sad": "sadness",
    "surprised": "surprise",
    "fearful": "fear",
    "scared": "fear",
    "disgusted": "disgust",
    "calm": "neutral",
    "neutrality": "neutral",
}


def _normalize(text: str) -> str:
    t = (text or "").strip().lower()
    # first alpha token
    m = re.findall(r"[a-z]+", t)
    token = m[0] if m else ""
    if token in _ALLOWED:
        return token
    if token in _SYNONYMS:
        return _SYNONYMS[token]
    # fallback: search allowed anywhere in text
    for w in _ALLOWED:
        if w in t:
            return w
    return "neutral"


def detect_emotion_gemini(image_path: str, model: str = "gemini-2.5-flash") -> str:
    if not image_path or not os.path.exists(image_path):
        raise FileNotFoundError(f"Image path not found: {image_path}")

    client = _get_client()

    with open(image_path, "rb") as f:
        img_bytes = f.read()

    prompt = (
        "Classify the dominant facial emotion in this image. "
        "Respond with exactly one word from this set: "
        "anger, disgust, fear, happiness, sadness, surprise, neutral. "
        "Lowercase only. No punctuation, no explanation."
    )

    try:
        resp = client.models.generate_content(
            model=model,
            contents=[
                prompt,
                types.Part.from_bytes(data=img_bytes, mime_type="image/png"),
            ],
        )
    except Exception as e:
        raise RuntimeError(f"Gemini API call failed: {e}") from e

    word = _normalize(getattr(resp, "text", ""))
    return word


__all__ = ["detect_emotion_gemini"]