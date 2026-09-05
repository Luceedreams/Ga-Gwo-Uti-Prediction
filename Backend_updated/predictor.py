"""
Model loader and predictor with SHAP feature importance.
"""

import os
import json
import joblib
import numpy as np

# ─────────────────────────────────────────────
# Paths
# ─────────────────────────────────────────────
BASE_DIR     = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH   = os.path.join(BASE_DIR, "models", "hybrid_random_forest.pkl")
FEATURE_PATH = os.path.join(BASE_DIR, "models", "feature_columns.pkl")
ROC_PATH     = os.path.join(BASE_DIR, "models", "roc_curve.json")
METRICS_PATH = os.path.join(BASE_DIR, "models", "model_metrics.json")

# Human-readable display names for aggregated features
FEATURE_DISPLAY = {
    'leukocyteEsterase': 'Leukocyte Esterase',
    'nitrite':           'Nitrite',
    'wbcUrinalysis':     'WBC (Urinalysis)',
    'redBloodCell':      'RBC / Haematuria',
    'bacteria':          'Bacteria',
    'urinePh':           'Urine pH',
    'specificGravity':   'Specific Gravity',
    'protein':           'Protein',
    'glucose':           'Glucose (Urine)',
    'whiteBloodCell':    'Blood WBC',
    'serumCreatinine':   'Serum Creatinine',
    'temperature':       'Temperature',
    'symptomDuration':   'Symptom Duration',
    'age':               'Age',
    'gender':            'Biological Sex',
    'priorUti':          'Prior UTI',
    'catheterUse':       'Catheter Use',
    'pregnancy':         'Pregnancy',
}

# ─────────────────────────────────────────────
# Lazy-loaded globals
# ─────────────────────────────────────────────
_model           = None
_feature_columns = None
_roc_curve       = None
_metrics         = None


def _load():
    global _model, _feature_columns, _roc_curve, _metrics

    if _model is not None:
        return

    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(
            f"Model not found at {MODEL_PATH}. "
            "Run  python train_model.py  first."
        )

    print("Loading GA-GWO Hybrid Random Forest …")
    _model           = joblib.load(MODEL_PATH)
    _feature_columns = joblib.load(FEATURE_PATH)
    print(f"Model loaded — {len(_feature_columns)} features.")

    with open(ROC_PATH) as f:
        _roc_curve = json.load(f)

    with open(METRICS_PATH) as f:
        _metrics = json.load(f)


# ─────────────────────────────────────────────
# Public accessors
# ─────────────────────────────────────────────
def get_model():
    _load()
    return _model


def get_feature_columns():
    _load()
    return _feature_columns


def get_roc_curve():
    _load()
    return _roc_curve


def get_metrics():
    _load()
    return _metrics


# ─────────────────────────────────────────────
# Feature importance helpers
# ─────────────────────────────────────────────
def _base_name(col: str) -> str:
    """Map a one-hot column name back to its original feature key."""
    for base in FEATURE_DISPLAY:
        if col == base or col.startswith(base + '_'):
            return base
    return col


def _compute_shap_importance(model, X, feature_columns: list) -> list:
    """
    Compute per-sample SHAP values and aggregate by base feature.
    Falls back to Gini importances when shap is unavailable.
    """
    try:
        import shap
        # Always pass numpy array to avoid sklearn feature-name warnings
        X_arr = X if isinstance(X, np.ndarray) else np.array(X)
        explainer = shap.TreeExplainer(model)
        shap_vals = explainer.shap_values(X_arr)

        # Binary RF returns list [class0_array, class1_array]
        # Each array shape: (n_samples, n_features)
        if isinstance(shap_vals, list) and len(shap_vals) >= 2:
            arr = np.array(shap_vals[1])   # class-1
        else:
            arr = np.array(shap_vals)

        # Ensure 2D then take first sample row
        if arr.ndim == 1:
            row_vals = np.abs(arr)
        else:
            row_vals = np.abs(arr.reshape(-1, len(feature_columns))[0])

    except Exception:
        # Fallback: use model's Gini importances (same for every call)
        row_vals = model.feature_importances_

    # Aggregate by base feature
    grouped: dict[str, float] = {}
    for col, val in zip(feature_columns, row_vals):
        base = _base_name(col)
        grouped[base] = grouped.get(base, 0.0) + float(val)

    total = sum(grouped.values()) or 1.0
    ranked = sorted(grouped.items(), key=lambda kv: -kv[1])[:8]

    return [
        {
            "feature": FEATURE_DISPLAY.get(k, k),
            "weight": round(v / total, 4),
        }
        for k, v in ranked
    ]


# ─────────────────────────────────────────────
# Prediction
# ─────────────────────────────────────────────
def predict(patient_df) -> dict:
    """
    Run the model on a preprocessed DataFrame row.
    Returns a dict matching the frontend PredictionResult interface.
    """
    _load()

    X_arr = patient_df.values.astype(float)

    raw_pred   = _model.predict(X_arr)[0]
    probs      = _model.predict_proba(X_arr)[0]
    confidence = float(np.max(probs)) * 100          # convert to 0-100
    label      = 'likely_uti' if int(raw_pred) == 1 else 'unlikely_uti'

    feature_importance = _compute_shap_importance(
        _model, X_arr, _feature_columns
    )

    return {
        "prediction":        label,
        "confidence":        round(confidence, 1),
        "probabilities": {
            str(cls): round(float(p), 4)
            for cls, p in zip(_model.classes_, probs)
        },
        "featureImportance": feature_importance,
        "rocCurve":          _roc_curve,
        "modelInfo": {
            "name":        "GA-GWO Hybrid Tuned Random Forest",
            "description": (
                "Genetic Algorithm + Grey Wolf Optimizer hybrid ensemble "
                "classifier tuned on urinalysis and demographic data. "
                f"AUC {_metrics.get('auc', '—')}, "
                f"Sensitivity {_metrics.get('sensitivity', '—')}, "
                f"Specificity {_metrics.get('specificity', '—')}."
            ),
        },
    }
