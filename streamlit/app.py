import streamlit as st
import torch
from PIL import Image
import numpy as np

# Load model
@st.cache_resource  # Cache the model so it's not reloaded on every run
def load_model():
    return torch.hub.load('ultralytics/yolov5', 'custom', path='best.pt', force_reload=True)

model = load_model()

st.title("YOLOv5 Object Detection")
st.write("Upload an image to detect objects")

# Upload image
uploaded_file = st.file_uploader("Choose an image...", type=["jpg", "jpeg", "png"])
if uploaded_file is not None:
    image = Image.open(uploaded_file).convert("RGB")
    st.image(image, caption="Uploaded Image", use_column_width=True)

    # Inference
    results = model(image)

    # Show results
    st.subheader("Detection Results")
    results.render()  # updates results.imgs with boxes and labels
    st.image(results.ims[0], use_column_width=True)
