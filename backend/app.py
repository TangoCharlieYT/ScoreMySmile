from flask import Flask, request, jsonify, send_from_directory
import cv2
import numpy as np
import base64
import re
import traceback
from PIL import Image
import torch
from transformers import AutoImageProcessor, AutoModelForImageClassification

face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)

def crop_face(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.3, 5)

    if len(faces) == 0:
        return img  # fallback

    x, y, w, h = faces[0]
    face = img[y:y+h, x:x+w]
    return face
app = Flask(__name__, static_folder="../frontend", static_url_path="/")

# 🔥 Load HuggingFace model (once)
model_name = "trpakov/vit-face-expression"
processor = AutoImageProcessor.from_pretrained(model_name)
model = AutoModelForImageClassification.from_pretrained(model_name)

def decode_base64_image(data_url):
    try:
        img_str = re.search(r'base64,(.*)', data_url).group(1)
        img_bytes = base64.b64decode(img_str)
        np_arr = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        return img
    except Exception as e:
        print("decode error:", e)
        return None

def preprocess(img):
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    pil_img = Image.fromarray(img)
    return pil_img

@app.route("/")
def index():
    return send_from_directory(app.static_folder, "index.html")

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json

    if not data or "image" not in data:
        return jsonify({"error": "No image provided"}), 400

    img = decode_base64_image(data["image"])
    if img is None:
        return jsonify({"error": "Invalid image"}), 400
    img = crop_face(img)
    try:
        img = preprocess(img)

        inputs = processor(images=img, return_tensors="pt")

        with torch.no_grad():
            outputs = model(**inputs)

        logits = outputs.logits
        probs = torch.nn.functional.softmax(logits, dim=1)[0]

        labels = model.config.id2label

        emotions = {
            labels[i].lower(): float(probs[i])
            for i in range(len(probs))
        }
        # 🔥 smooth the probabilities (reduces hard 0s)
        for k in emotions:
            emotions[k] = emotions[k] ** 0.8

        # normalize again
        total = sum(emotions.values())
        for k in emotions:
            emotions[k] /= total

    except Exception:
        traceback.print_exc()
        return jsonify({"error": "Model failed"}), 500

    return jsonify({"emotions": emotions})

if __name__ == "__main__":
    app.run(debug=True)