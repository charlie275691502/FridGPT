import os
import streamlit as st
from PIL import Image
from ultralytics import YOLO

@st.cache_resource
def load_model():
    model_path = os.path.join(os.path.dirname(__file__), "best.pt")
    return YOLO(model_path)

model = load_model()

st.title("YOLO Object Detection")
st.write("Upload an image to detect objects")

uploaded_file = st.file_uploader("Choose an image", type=["png", "jpg", "jpeg"])
if uploaded_file:
    image = Image.open(uploaded_file)
    st.image(image, caption="Uploaded Image", use_column_width=True)

    results = model(image)
    res_plotted = results[0].plot()  # renders bounding boxes on np array
    st.image(res_plotted, caption="Detection Results", use_column_width=True)
