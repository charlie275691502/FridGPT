from flask import Flask, request, jsonify
import torch
from PIL import Image
import io
from yolov5 import YOLOv5
import os
import pathlib

app = Flask(__name__)

pathlib.PosixPath = pathlib.WindowsPath

def load_model():
    # model_path = os.path.join(os.path.dirname(__file__), "best.pt")
    return YOLOv5("best.pt")

model = load_model()

# Load the YOLOv5 model
# model = torch.hub.load('yolov5', 'custom', path='best.pt', source='local')  # uses local clone

@app.route('/detect', methods=['POST'])
def detect():
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400

    file = request.files['image']
    img_bytes = file.read()
    img = Image.open(io.BytesIO(img_bytes))

    # Perform detection
    results = model.predict(img)
    
    # res_plotted = results.render()[0]

    df_results = results.pandas().xyxy[0]
    simplified_results = df_results[["name", "confidence"]].to_dict(orient="records")

    return simplified_results

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5010, debug=True)

