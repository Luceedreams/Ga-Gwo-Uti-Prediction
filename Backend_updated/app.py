"""
UTI-Predict Flask API
=====================
Endpoints
---------
GET  /          health check
POST /predict   run prediction (returns full PredictionResult)
GET  /records   export saved records (for retraining pipeline)
"""

from flask import Flask, request, jsonify
from flask_cors import CORS

from predictor import predict, get_feature_columns
from preprocess_input import preprocess_input
from database import init_db, save_prediction, PredictionRecord

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

init_db(app)


# ─────────────────────────────────────────────
# Health check
# ─────────────────────────────────────────────
@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "UTI-Predict API", "status": "running"})


# ─────────────────────────────────────────────
# Prediction
# ─────────────────────────────────────────────
@app.route("/predict", methods=["POST"])
def predict_route():
    try:
        patient = request.get_json(force=True)

        if not patient:
            return jsonify({"status": "error", "message": "Empty request body"}), 400

        feature_columns = get_feature_columns()
        processed       = preprocess_input(patient, feature_columns)
        result          = predict(processed)

        # Persist for retraining (non-blocking; failure doesn't abort response)
        try:
            save_prediction(patient, result)
        except Exception as db_err:
            app.logger.warning(f"DB save failed: {db_err}")

        return jsonify(result)

    except FileNotFoundError as e:
        return jsonify({
            "status":  "error",
            "message": str(e),
            "hint":    "Run  python train_model.py  to generate model files first.",
        }), 503

    except Exception as e:
        app.logger.exception("Prediction error")
        return jsonify({"status": "error", "message": str(e)}), 500


# ─────────────────────────────────────────────
# Records export (retraining pipeline)
# ─────────────────────────────────────────────
@app.route("/records", methods=["GET"])
def get_records():
    records = PredictionRecord.query.order_by(
        PredictionRecord.created_at.desc()
    ).all()
    return jsonify([r.to_dict() for r in records])


# ─────────────────────────────────────────────
# Entry point
# ─────────────────────────────────────────────
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
