import os
import io
import json
import numpy as np
from flask import Flask, request, jsonify, render_template
from werkzeug.utils import secure_filename
from PIL import Image

# Suppress TF logs
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # 16MB max
app.config["UPLOAD_FOLDER"] = os.path.join("static", "uploads")

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "bmp", "webp"}

# ---------------------------------------------------------------------------
# Lazy-load model so first request pays the cost, not startup
# ---------------------------------------------------------------------------
_model = None
_labels = None


def get_model():
    global _model, _labels
    if _model is None:
        import tensorflow as tf
        from tensorflow.keras.applications import MobileNetV2
        from tensorflow.keras.applications.mobilenet_v2 import decode_predictions, preprocess_input

        print("Loading MobileNetV2 …")
        _model = MobileNetV2(weights="imagenet")
        print("Model ready.")
    return _model


def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def predict_image(image_bytes: bytes):
    """Run MobileNetV2 inference and return top-5 predictions."""
    import tensorflow as tf
    from tensorflow.keras.applications.mobilenet_v2 import decode_predictions, preprocess_input

    model = get_model()

    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = img.resize((224, 224))
    arr = np.array(img, dtype=np.float32)
    arr = np.expand_dims(arr, axis=0)
    arr = preprocess_input(arr)

    preds = model.predict(arr, verbose=0)
    top5 = decode_predictions(preds, top=5)[0]

    results = []
    for _, label, prob in top5:
        results.append({
            "label": label.replace("_", " ").title(),
            "confidence": round(float(prob) * 100, 2),
        })
    return results


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/predict", methods=["POST"])
def predict():
    if "file" not in request.files:
        return jsonify({"error": "No file part in the request"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "File type not allowed. Use PNG, JPG, GIF, BMP or WEBP."}), 400

    try:
        image_bytes = file.read()
        predictions = predict_image(image_bytes)

        # Optionally save to disk for display
        os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)
        filename = secure_filename(file.filename)
        save_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        with open(save_path, "wb") as f:
            f.write(image_bytes)

        return jsonify({
            "success": True,
            "filename": filename,
            "image_url": f"/static/uploads/{filename}",
            "predictions": predictions,
        })

    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@app.route("/health")
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)
    app.run(debug=True, host="0.0.0.0", port=5000)
