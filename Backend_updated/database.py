"""
SQLAlchemy model and helpers for persisting predictions.
"""

import os
import json
from datetime import datetime, timezone

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH  = os.path.join(BASE_DIR, "database", "records.db")


class PredictionRecord(db.Model):
    __tablename__ = "prediction_records"

    id             = db.Column(db.Integer, primary_key=True)
    input_data     = db.Column(db.Text, nullable=False)
    prediction     = db.Column(db.String(100), nullable=False)
    confidence     = db.Column(db.Float, nullable=False)
    probabilities  = db.Column(db.Text, nullable=False)
    verified_label = db.Column(db.String(100), nullable=True)
    created_at     = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
    )

    def to_dict(self):
        return {
            "id":             self.id,
            "input_data":     json.loads(self.input_data),
            "prediction":     self.prediction,
            "confidence":     self.confidence,
            "probabilities":  json.loads(self.probabilities),
            "verified_label": self.verified_label,
            "created_at":     self.created_at.isoformat(),
        }


def init_db(app):
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    app.config["SQLALCHEMY_DATABASE_URI"]        = f"sqlite:///{DB_PATH}"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    db.init_app(app)
    with app.app_context():
        db.create_all()


def save_prediction(raw_input: dict, result: dict) -> PredictionRecord:
    record = PredictionRecord(
        input_data    = json.dumps(raw_input),
        prediction    = result["prediction"],
        confidence    = result["confidence"],
        probabilities = json.dumps(result.get("probabilities", {})),
    )
    db.session.add(record)
    db.session.commit()
    return record
