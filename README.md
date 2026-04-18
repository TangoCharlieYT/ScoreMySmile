# 🎭 Expression Challenge App - ScoreMySmile

An AI-powered real-time facial expression game built as a **Bring Your Own Project (BYOP)** to explore practical applications of Computer Vision and Machine Learning.

---

## 📌 Problem Statement

In daily life, recognizing and expressing emotions accurately is important for communication, mental health awareness, and human-computer interaction. However, most applications of emotion detection remain passive (analysis only) rather than interactive.

This project addresses the problem of **making emotion recognition engaging and interactive** by transforming it into a game where users actively participate and receive feedback.

---

## 💡 Proposed Solution

The **Expression Challenge App** is a real-time system that:
- Captures user expressions via webcam
- Detects emotions using a Vision Transformer model
- Compares detected emotions with target emotions
- Provides a score based on accuracy
- Allows retry and continuous improvement

This turns emotion detection into a **gamified learning and interaction experience**.

---

## 📸 Demo

### 🏠 Dashboard
![Dashboard](./assets/demo1.png)

---

### 🎮 Gameplay
![Gameplay](./assets/demo2.png)

---

### 🏆 Result
![Result](./assets/demo3.png)

---

## 🧠 System Architecture
![Architecture](./assets/architecture.png)

---

## 🤖 Model Pipeline
![Model](./assets/model.png)

---

## ⚙️ How It Works

1. Webcam captures user image  
2. Image is sent to Flask backend  
3. OpenCV performs face detection and cropping  
4. Image is processed and passed to HuggingFace ViT model  
5. Model outputs emotion probabilities  
6. Scores are calculated based on target emotion  
7. Results displayed to user  

---

## 🚀 Features

- 🎯 Real-time emotion detection using AI  
- 🎮 Game-based scoring system  
- 🔁 Retry / retake functionality  
- 📷 Webcam-based interaction  
- ⚡ Fast backend inference using Transformers  

---

## 🧠 Tech Stack

- **Frontend:** HTML, CSS, JavaScript  
- **Backend:** Flask (Python)  
- **Computer Vision:** OpenCV  
- **AI Model:** HuggingFace Vision Transformer  
- **Others:** NumPy, Torch  

---

## 📋 Prerequisites

Make sure you have the following installed:

- Python 3.9 or higher  
- pip (Python package manager)  
- Git (for cloning the repository)  
- A webcam (for capturing facial expressions)  
- Internet connection (required for first-time model download)  

Optional (recommended):
- Virtual environment (venv)  

---

## ▶️ How to Run

### 1️⃣ Clone Repository
```bash
https://github.com/TangoCharlieYT/ScoreMySmile.git
cd ScoreMySmile

---

### 2️⃣ Setup Backend
```bash
cd backend
pip install -r requirements.txt
python app.py

Backend will start at:
http://127.0.0.1:5000

---

### 3️⃣ Run Application
Open your browser and go to:
http://127.0.0.1:5000

---
