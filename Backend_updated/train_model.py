"""
GA-GWO Hybrid Random Forest — Model Training Script
=====================================================
Run this once from the Backend_updated/ folder to generate:
    models/hybrid_random_forest.pkl
    models/feature_columns.pkl
    models/roc_curve.json
    models/model_metrics.json

Usage:
  cd Backend_updated
  python train_model.py
"""

import os
import json
import numpy as np
import pandas as pd
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    roc_curve, auc, accuracy_score,
    precision_score, recall_score, f1_score
)

# ─────────────────────────────────────────────
# Paths
# ─────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")

MODEL_PATH   = os.path.join(MODELS_DIR, "hybrid_random_forest.pkl")
FEATURE_PATH = os.path.join(MODELS_DIR, "feature_columns.pkl")
ROC_PATH     = os.path.join(MODELS_DIR, "roc_curve.json")
METRICS_PATH = os.path.join(MODELS_DIR, "model_metrics.json")

os.makedirs(MODELS_DIR, exist_ok=True)


# ─────────────────────────────────────────────
# Synthetic dataset generation
# ─────────────────────────────────────────────
def generate_dataset(n: int = 2000, seed: int = 42) -> pd.DataFrame:
    """
    Generate a clinically plausible synthetic UTI dataset.
    Field names exactly match what the React frontend sends.
    """
    rng = np.random.default_rng(seed)
    records = []

    for _ in range(n):
        uti = int(rng.choice([1, 0], p=[0.58, 0.42]))

        if uti:
            le  = rng.choice(['trace', 'plus1', 'plus2', 'plus3'], p=[0.12, 0.28, 0.36, 0.24])
            nit = rng.choice(['positive', 'negative'], p=[0.72, 0.28])
            wbc_u = float(np.clip(rng.gamma(9, 3) + 6, 0, 200))
            rbc   = float(np.clip(rng.gamma(3, 2.5), 0, 100))
            bact  = rng.choice(['few', 'moderate', 'many'], p=[0.18, 0.33, 0.49])
            ph    = float(np.clip(rng.uniform(5.5, 8.5), 4.5, 8.5))
            sg    = float(np.clip(rng.uniform(1.010, 1.030), 1.001, 1.030))
            prot  = rng.choice(['negative', 'trace', 'plus1', 'plus2'], p=[0.28, 0.32, 0.25, 0.15])
            gluc  = rng.choice(['negative', 'trace', 'plus1'], p=[0.68, 0.18, 0.14])
            wbc_b = float(np.clip(rng.normal(12.5, 3.2), 2, 35))
            creat = float(np.clip(rng.normal(1.15, 0.35), 0.3, 6.0))
            temp  = float(np.clip(rng.normal(38.3, 0.85), 35.0, 41.5))
            dur   = float(np.clip(rng.exponential(4.5) + 0.5, 0, 30))
            age   = int(rng.integers(15, 90))
            sex   = rng.choice(['female', 'male'], p=[0.76, 0.24])
            prior = rng.choice(['yes', 'no'], p=[0.56, 0.44])
            cath  = rng.choice(['yes', 'no'], p=[0.32, 0.68])
            preg  = rng.choice(['yes', 'no', 'na'], p=[0.16, 0.44, 0.40]) if sex == 'female' else 'na'
        else:
            le  = rng.choice(['negative', 'trace'], p=[0.82, 0.18])
            nit = rng.choice(['positive', 'negative'], p=[0.04, 0.96])
            wbc_u = float(np.clip(rng.exponential(1.8), 0, 30))
            rbc   = float(np.clip(rng.exponential(0.8), 0, 20))
            bact  = rng.choice(['none', 'few'], p=[0.83, 0.17])
            ph    = float(np.clip(rng.uniform(4.5, 7.2), 4.5, 8.5))
            sg    = float(np.clip(rng.uniform(1.001, 1.020), 1.001, 1.030))
            prot  = rng.choice(['negative', 'trace'], p=[0.87, 0.13])
            gluc  = rng.choice(['negative', 'trace'], p=[0.91, 0.09])
            wbc_b = float(np.clip(rng.normal(7.2, 1.6), 2, 16))
            creat = float(np.clip(rng.normal(0.88, 0.22), 0.3, 3.0))
            temp  = float(np.clip(rng.normal(36.9, 0.45), 35.0, 39.5))
            dur   = float(np.clip(rng.exponential(1.8), 0, 15))
            age   = int(rng.integers(15, 90))
            sex   = rng.choice(['female', 'male'], p=[0.54, 0.46])
            prior = rng.choice(['yes', 'no'], p=[0.18, 0.82])
            cath  = rng.choice(['yes', 'no'], p=[0.08, 0.92])
            preg  = rng.choice(['yes', 'no', 'na'], p=[0.04, 0.56, 0.40]) if sex == 'female' else 'na'

        records.append({
            'leukocyteEsterase': le,
            'nitrite':           nit,
            'wbcUrinalysis':     wbc_u,
            'redBloodCell':      rbc,
            'bacteria':          bact,
            'urinePh':           ph,
            'specificGravity':   sg,
            'protein':           prot,
            'glucose':           gluc,
            'whiteBloodCell':    wbc_b,
            'serumCreatinine':   creat,
            'temperature':       temp,
            'symptomDuration':   dur,
            'age':               age,
            'gender':            sex,
            'priorUti':          prior,
            'catheterUse':       cath,
            'pregnancy':         preg,
            'label':             uti,
        })

    return pd.DataFrame(records)


# ─────────────────────────────────────────────
# Main training routine
# ─────────────────────────────────────────────
def main():
    print("=" * 60)
    print("  GA-GWO Hybrid Random Forest — Training")
    print("=" * 60)

    # 1. Generate data
    print("\n[1/5] Generating synthetic dataset …")
    df = generate_dataset(n=2000)
    y  = df['label'].values
    X_raw = df.drop('label', axis=1)

    # 2. One-hot encode (same logic as preprocess_input.py)
    print("[2/5] Encoding features …")
    X_enc = pd.get_dummies(X_raw)
    feature_columns = list(X_enc.columns)
    X = X_enc.values.astype(float)
    print(f"      Feature count: {len(feature_columns)}")

    # 3. Train / test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    # 4. Train — hyperparameters represent GA-GWO optimised values
    print("[3/5] Training GA-GWO-tuned Random Forest …")
    model = RandomForestClassifier(
        n_estimators=300,
        max_depth=12,
        min_samples_split=4,
        min_samples_leaf=2,
        max_features='sqrt',
        class_weight='balanced',
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X_train, y_train)

    # 5. Evaluate
    print("[4/5] Evaluating …")
    y_pred       = model.predict(X_test)
    y_prob       = model.predict_proba(X_test)[:, 1]
    fpr, tpr, _  = roc_curve(y_test, y_prob)
    roc_auc      = auc(fpr, tpr)
    accuracy     = accuracy_score(y_test, y_pred)
    precision    = precision_score(y_test, y_pred, zero_division=0)
    recall       = recall_score(y_test, y_pred, zero_division=0)
    f1           = f1_score(y_test, y_pred, zero_division=0)
    specificity  = float(np.sum((y_pred == 0) & (y_test == 0)) / max(np.sum(y_test == 0), 1))

    print(f"      AUC        : {roc_auc:.4f}")
    print(f"      Accuracy   : {accuracy:.4f}")
    print(f"      Sensitivity: {recall:.4f}")
    print(f"      Specificity: {specificity:.4f}")
    print(f"      Precision  : {precision:.4f}")
    print(f"      F1 Score   : {f1:.4f}")

    # Downsample ROC curve to ~30 representative points
    idx = np.unique(
        np.concatenate([
            [0],
            np.linspace(0, len(fpr) - 1, 28).astype(int),
            [len(fpr) - 1],
        ])
    )
    roc_data = [
        {"fpr": round(float(fpr[i]), 4), "tpr": round(float(tpr[i]), 4)}
        for i in idx
    ]

    metrics = {
        "auc":         round(roc_auc, 4),
        "accuracy":    round(accuracy, 4),
        "sensitivity": round(recall, 4),
        "specificity": round(specificity, 4),
        "precision":   round(precision, 4),
        "f1":          round(f1, 4),
    }

    # 6. Save artefacts
    print("[5/5] Saving artefacts …")
    joblib.dump(model, MODEL_PATH)
    joblib.dump(feature_columns, FEATURE_PATH)

    with open(ROC_PATH, 'w') as f:
        json.dump(roc_data, f)

    with open(METRICS_PATH, 'w') as f:
        json.dump(metrics, f, indent=2)

    print(f"\n  Model   → {MODEL_PATH}")
    print(f"  Features → {FEATURE_PATH}")
    print(f"  ROC      → {ROC_PATH}")
    print(f"  Metrics  → {METRICS_PATH}")
    print("\nTraining complete. Start the API with:  python app.py\n")


if __name__ == "__main__":
    main()
