import os
from pprint import pprint

from flask import Flask, request

from face_drawing.pillow_face_renderer import render_face_to_image
from detector.emotion_detect import detect_emotion

app = Flask(__name__)


@app.route("/emotion", methods=["POST"])
def emotion():
    data = request.get_json(silent=True) or {}
    # Render and save the face image off-screen using Pillow (no GUI)
    out_path = os.path.join(os.path.dirname(__file__), "face_drawing", "face.png")
    render_face_to_image(data, output_path=out_path, width=500, height=700)

    # Run emotion detection on the saved image and print the emotions table
    try:
        label, score, prediction = detect_emotion(out_path)
        # Optionally log the emotions table
        print(getattr(prediction, "emotions", None))
        # Return the most likely emotion as requested
        return {"emotion": label, "score": score}
    except Exception as e:
        # Return a graceful error without throwing a 500
        print("Emotion detection failed:", repr(e))
        return {"emotion": None, "score": None, "error": str(e)}
