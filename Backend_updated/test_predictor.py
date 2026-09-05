"""Quick smoke-test for the full prediction pipeline."""
import json
from predictor import predict, get_feature_columns
from preprocess_input import preprocess_input

sample = {
    'leukocyteEsterase': 'plus2',
    'nitrite': 'positive',
    'wbcUrinalysis': 15.0,
    'redBloodCell': 8.0,
    'bacteria': 'many',
    'urinePh': 6.5,
    'specificGravity': 1.020,
    'protein': 'trace',
    'glucose': 'negative',
    'whiteBloodCell': 13.5,
    'serumCreatinine': 1.1,
    'temperature': 38.5,
    'symptomDuration': 3.0,
    'age': 32,
    'gender': 'female',
    'priorUti': 'yes',
    'catheterUse': 'no',
    'pregnancy': 'no',
    # boolean flags should be ignored
    'dysuria': True,
    'frequency': True,
    'urgency': False,
    'flankPain': False,
    'fever': True,
}

cols   = get_feature_columns()
df     = preprocess_input(sample, cols)
result = predict(df)

print("prediction      :", result['prediction'])
print("confidence      :", result['confidence'])
print("top 4 features  :")
for f in result['featureImportance'][:4]:
    print("  ", f['feature'], "->", f['weight'])
print("roc points      :", len(result['rocCurve']))
print("model name      :", result['modelInfo']['name'])
print()
print("Full JSON length:", len(json.dumps(result)), "chars")
print("\nAll OK.")
