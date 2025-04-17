import sys
import torch
import streamlit as st
from PIL import Image
import numpy as np

# Add yolov5 directory to path
sys.path.append('yolov5')
from models.common import DetectMultiBackend
from utils.general import non_max_suppression, scale_coords
from utils.augmentations import letterbox

# Load model
@st.cache_resource
def load_model():
    return torch.load('best.pt', map_location='cpu')['model'].float().fuse()

model = load_model()
model.eval()

st.title("YOLOv5 Object Detection")
st.write("Upload an image to detect objects")

uploaded_file = st.file_uploader("Choose an image...", type=["jpg", "jpeg", "png"])
if uploaded_file:
    image = Image.open(uploaded_file).convert("RGB")
    st.image(image, caption="Uploaded Image", use_column_width=True)

    # Preprocess
    img = np.array(image)
    img = letterbox(img, new_shape=640)[0]
    img = img.transpose((2, 0, 1))  # HWC to CHW
    img = np.ascontiguousarray(img)
    img = torch.from_numpy(img).to(torch.device('cpu')).float() / 255.0
    if img.ndimension() == 3:
        img = img.unsqueeze(0)

    # Inference
    with torch.no_grad():
        pred = model(img)[0]
        pred = non_max_suppression(pred)[0]

    # Draw results
    if pred is not None and len(pred):
        pred[:, :4] = scale_coords(img.shape[2:], pred[:, :4], image.size).round()
        for *xyxy, conf, cls in pred:
            label = f'{int(cls.item())} {conf:.2f}'
            image_draw = image.copy()
            draw = ImageDraw.Draw(image_draw)
            draw.rectangle(xyxy, outline='red', width=2)
            draw.text((xyxy[0], xyxy[1]), label, fill='red')
        st.image(image_draw, caption="Detection Results", use_column_width=True)
    else:
        st.write("No detections found.")
