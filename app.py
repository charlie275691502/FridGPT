import os
import json
import streamlit as st
from PIL import Image
from yolov5 import YOLOv5

@st.cache_resource
def load_model():
    model_path = os.path.join(os.path.dirname(__file__), "best.pt")
    return YOLOv5(model_path)

model = load_model()

st.title("FridGPT")
st.write("Upload an image to detect objects")

uploaded_file = st.file_uploader("Choose an image", type=["png", "jpg", "jpeg"])
if uploaded_file:
    image = Image.open(uploaded_file)
    st.image(image, caption="Uploaded Image", use_column_width=True)

    results = model.predict(image)

    res_plotted = results.render()[0]
    st.image(res_plotted, caption="Detection Results", use_column_width=True)

    df_results = results.pandas().xyxy[0]
    simplified_results = df_results[["name", "confidence"]].to_dict(orient="records")

    st.subheader("Simplified JSON Output (name & confidence only)")
    st.json(simplified_results)
