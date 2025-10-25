from pprint import pprint

from flask import Flask, request

from face_drawing.input_to_face import draw_face

app = Flask(__name__)


@app.route("/emotion", methods=["POST"])
def emotion():
    data = request.json
    pprint(data)
    draw_face(data)

    # Process the incoming data and generate a response
    response = {"message": "Data has been received good sir"}
    return response
