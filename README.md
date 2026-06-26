# 🔍 VisionAI — Image Recognition System

A web application that lets users upload images and receive **real-time object predictions** using a pre-trained **MobileNetV2** neural network (ImageNet — 1000 classes).

![Python](https://img.shields.io/badge/Python-3.10+-blue?logo=python)
![Flask](https://img.shields.io/badge/Flask-3.0-black?logo=flask)
![TensorFlow](https://img.shields.io/badge/TensorFlow-2.15-orange?logo=tensorflow)
![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Features

- 📤 Drag-and-drop or click-to-upload interface
- ⚡ Real-time predictions with confidence scores
- 📊 Animated progress bars for top-5 results
- 🖼️ Live image preview before analysis
- 🌐 Powered by MobileNetV2 pretrained on ImageNet (1000 classes)
- 📱 Fully responsive dark UI

---

## 🛠 Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Backend   | Python 3.10+, Flask 3.0           |
| ML Model  | TensorFlow 2.15, Keras MobileNetV2|
| Image I/O | OpenCV, Pillow                    |
| Frontend  | Vanilla JS, CSS3                  |
| Server    | Gunicorn (production)             |

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/image-recognition-system.git
cd image-recognition-system
```

### 2. Create a virtual environment

```bash
python -m venv venv

# Activate:
source venv/bin/activate        # macOS / Linux
venv\Scripts\activate           # Windows
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

> ⚠️ TensorFlow is ~500 MB. The first run also downloads MobileNetV2 weights (~14 MB).

### 4. Run the development server

```bash
python app.py
```

Open your browser at **http://localhost:5000**

### 5. Production server (optional)

```bash
gunicorn -w 2 -b 0.0.0.0:5000 app:app
```

---

## 📁 Project Structure

```
image-recognition-system/
├── app.py                  # Flask application & prediction logic
├── requirements.txt        # Python dependencies
├── templates/
│   └── index.html          # Main UI template
├── static/
│   ├── css/
│   │   └── style.css       # Styles
│   ├── js/
│   │   └── main.js         # Frontend logic
│   └── uploads/            # Saved uploaded images (git-ignored)
└── README.md
```

---

## 🔌 API Reference

### `POST /predict`

Upload an image file and get predictions.

**Request:** `multipart/form-data` with field `file`

**Response:**
```json
{
  "success": true,
  "filename": "cat.jpg",
  "image_url": "/static/uploads/cat.jpg",
  "predictions": [
    { "label": "Egyptian Cat",  "confidence": 72.35 },
    { "label": "Tabby",         "confidence": 14.21 },
    { "label": "Tiger Cat",     "confidence":  8.90 },
    { "label": "Lynx",          "confidence":  2.10 },
    { "label": "Persian Cat",   "confidence":  1.05 }
  ]
}
```

### `GET /health`

Returns `{"status": "ok"}` — useful for uptime checks.

---

## 📦 Deploying to Render (free tier)

1. Push this repo to GitHub
2. Go to [render.com](https://render.com) → **New Web Service**
3. Connect your GitHub repo
4. Set:
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn -w 2 -b 0.0.0.0:$PORT app:app`
5. Click **Deploy**

---

## 📜 License

MIT © 2024 — free to use, modify, and distribute.
