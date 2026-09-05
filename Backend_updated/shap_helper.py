import os
import joblib
from typing import Tuple
import pandas as pd

try:
    import shap
except Exception as e:
    raise ImportError("shap is required for shap_helper. Install with pip install shap") from e


def load_model(path: str = "results/best_rf.joblib"):
    """Load a saved model using joblib."""
    if not os.path.exists(path):
        raise FileNotFoundError(f"No saved model found at {path}")
    return joblib.load(path)


def compute_shap_values(model, X: pd.DataFrame):
    """Return SHAP values for `X` using an appropriate explainer.

    Returns the explainer output (may be a shap.Explanation object).
    """
    if X is None or X.empty:
        raise ValueError("X must be a non-empty pandas DataFrame")

    # Use TreeExplainer for tree models for speed/accuracy, fallback to generic explainer
    try:
        explainer = shap.TreeExplainer(model)
    except Exception:
        explainer = shap.Explainer(model, X)

    shap_values = explainer(X)
    return shap_values


def save_summary_plot(shap_values, X: pd.DataFrame, out_path: str = "explainability/shap_summary.png") -> str:
    """Save a SHAP summary plot to `out_path` and return the path."""
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    # summary_plot writes to current matplotlib figure
    shap.summary_plot(shap_values, X, show=False)
    import matplotlib.pyplot as plt
    plt.savefig(out_path)
    plt.close()
    return out_path


def feature_importance_df(shap_values, feature_names=None) -> pd.DataFrame:
    """Return a DataFrame of mean |SHAP| per feature, sorted descending."""
    arr = shap_values.values if hasattr(shap_values, "values") else shap_values
    # shap_values may be array-like of shape (n_samples, n_features) or (n_classes, n_samples, n_features)
    if arr.ndim == 3:
        # multiclass: take absolute mean over samples and classes
        mean_abs = np.mean(np.abs(arr), axis=(0, 1))
    else:
        mean_abs = np.mean(np.abs(arr), axis=0)

    names = feature_names if feature_names is not None else getattr(shap_values, "feature_names", None)
    if names is None:
        names = [f"f{i}" for i in range(len(mean_abs))]

    df = pd.DataFrame({"feature": names, "mean_abs_shap": mean_abs})
    return df.sort_values("mean_abs_shap", ascending=False).reset_index(drop=True)
