import os

from flask import Flask, request

from face_drawing.pillow_face_renderer import render_face_to_image
from detector.gemini_emotion_detect import detect_emotion_gemini

app = Flask(__name__)


@app.route("/emotion", methods=["POST"])
def emotion():
    data = request.get_json(silent=True) or {}
    # Render and save the face image off-screen using Pillow (no GUI)
    out_path = os.path.join(os.path.dirname(__file__), "face_drawing", "face.png")
    render_face_to_image(data, output_path=out_path, width=1280, height=720)

    # Run Gemini emotion detection on the saved image and return a single lowercase word
    try:
        emotion = detect_emotion_gemini(out_path)
        return {"emotion": emotion}
        #return {"emotion": "dummy emotion"}
    except Exception as e:
        # Graceful error; return neutral as fallback
        print("Gemini emotion detection failed:", repr(e))
        return {"emotion": "neutral", "error": str(e)}
