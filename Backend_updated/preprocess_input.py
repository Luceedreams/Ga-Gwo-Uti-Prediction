"""
Input preprocessing — converts raw frontend JSON to a model-ready DataFrame.
"""

import pandas as pd

# Fields that are boolean flags (not sent to the model)
_BOOL_FIELDS = {'dysuria', 'frequency', 'urgency', 'flankPain', 'fever'}

# Default values for optional categorical fields when left blank
_DEFAULTS = {
    'priorUti':   'no',
    'catheterUse': 'no',
    'pregnancy':  'na',
}


def _normalize(raw: dict) -> dict:
    """
    Clean up the raw frontend payload:
    - Drop boolean symptom flags (not in training data)
    - Replace empty-string categoricals with sensible defaults
    - Ensure numeric fields are float
    """
    cleaned = {}
    for key, val in raw.items():
        if key in _BOOL_FIELDS:
            continue

        # Replace blank strings with defaults
        if isinstance(val, str) and val.strip() == '':
            val = _DEFAULTS.get(key, val)

        cleaned[key] = val

    return cleaned


def preprocess_input(user_input: dict, feature_columns: list) -> pd.DataFrame:
    """
    Convert user input into a one-row DataFrame with exactly the columns
    and order used during training.

    Parameters
    ----------
    user_input : dict
        Raw JSON received from the frontend.
    feature_columns : list
        Feature names loaded from feature_columns.pkl.

    Returns
    -------
    pd.DataFrame
        One-row DataFrame ready for prediction.
    """
    cleaned = _normalize(user_input)

    df = pd.DataFrame([cleaned])

    # One-hot encode — same transform applied during training
    df = pd.get_dummies(df)

    # Align to training columns (add 0 for any unseen category, drop extras)
    df = df.reindex(columns=feature_columns, fill_value=0)

    return df
