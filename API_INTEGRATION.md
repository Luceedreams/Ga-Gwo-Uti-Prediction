# API Integration Guide

This document explains how to integrate a real FastAPI backend with the UTI decision-support frontend.

## Current Architecture

The frontend uses a **service layer abstraction** pattern to isolate all API calls into a single module:

```
Components (PatientForm, PredictionResult, etc.)
       ↓
Hooks (usePrediction, useHistory)
       ↓
Service Layer (predictionApi.ts) ← YOU MODIFY ONLY THIS
       ↓
Mock API responses (currently)
```

This design ensures:
- **Zero changes to components** when swapping backends
- **Easy testing**: Mock responses in development, real backend in production
- **Clear contract**: The service layer defines the exact API interface
- **Single point of modification**: All API logic lives in one file

## Service Layer: `src/services/predictionApi.ts`

### Current Mock Implementation

```typescript
// src/services/predictionApi.ts

import { PatientData } from '../types';

export interface PredictionResult {
  prediction: 'Likely UTI' | 'Unlikely UTI';
  confidence: number;                    // 0-100
  featureImportance: FeatureWeight[];
  rocCurve: ROCPoint[];
}

export interface FeatureWeight {
  feature: string;
  weight: number;                        // 0-100
}

export interface ROCPoint {
  fpr: number;                           // False positive rate
  tpr: number;                           // True positive rate
}

export async function predictUTI(patientData: PatientData): Promise<PredictionResult> {
  // MOCK: Simulates network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  // MOCK: Calculates clinically plausible response
  // (In real backend, this would be model inference on server)
  const prediction = calculateMockPrediction(patientData);
  
  return prediction;
}

function calculateMockPrediction(data: PatientData): PredictionResult {
  // Mock logic: higher leukocyte esterase + positive nitrite = higher UTI risk
  const leukocyteScore = data.leukocyteEsterase === 'Negative' ? 0 : 
                         data.leukocyteEsterase === 'Trace' ? 10 :
                         data.leukocyteEsterase === '+' ? 25 :
                         data.leukocyteEsterase === '++' ? 35 : 50;
  
  const nitriteScore = data.nitrite === 'Positive' ? 40 : 0;
  const symptomScore = (data.dysuriaBool ? 10 : 0) + 
                       (data.feverBool ? 15 : 0);
  
  const rawScore = leukocyteScore + nitriteScore + symptomScore;
  const confidence = Math.min(95, Math.max(5, rawScore));
  
  return {
    prediction: confidence > 50 ? 'Likely UTI' : 'Unlikely UTI',
    confidence: Math.round(confidence),
    featureImportance: [
      { feature: 'Leukocyte Esterase', weight: 32.5 },
      { feature: 'Nitrite', weight: 21.3 },
      { feature: 'WBC Count', weight: 18.7 },
      // ...
    ],
    rocCurve: [
      { fpr: 0, tpr: 0 },
      { fpr: 0.05, tpr: 0.85 },
      // ...
    ]
  };
}
```

## Integrating FastAPI Backend

### Step 1: Replace Mock with Real Fetch

Modify `src/services/predictionApi.ts`:

```typescript
// src/services/predictionApi.ts

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

export async function predictUTI(patientData: PatientData): Promise<PredictionResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(patientData),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const result: PredictionResult = await response.json();
    
    // Optional: Validate response shape
    validatePredictionResult(result);
    
    return result;
  } catch (error) {
    console.error('Prediction API call failed:', error);
    throw new Error('Failed to get prediction. Please try again.');
  }
}

function validatePredictionResult(result: any): void {
  // Ensure response matches expected structure
  if (!result.prediction || !['Likely UTI', 'Unlikely UTI'].includes(result.prediction)) {
    throw new Error('Invalid prediction value');
  }
  if (typeof result.confidence !== 'number' || result.confidence < 0 || result.confidence > 100) {
    throw new Error('Invalid confidence score');
  }
  if (!Array.isArray(result.featureImportance)) {
    throw new Error('Invalid feature importance data');
  }
  if (!Array.isArray(result.rocCurve)) {
    throw new Error('Invalid ROC curve data');
  }
}
```

### Step 2: Environment Configuration

Create `.env.local` (not committed to git):

```env
REACT_APP_API_BASE_URL=http://localhost:8000
```

For production:

```env
REACT_APP_API_BASE_URL=https://api.yourdomain.com
```

### Step 3: Expected FastAPI Endpoint

Your FastAPI backend should expose:

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List

app = FastAPI()

class PatientData(BaseModel):
    age: int
    gender: str
    urinePh: float
    specificGravity: float
    leukocyteEsterase: str
    nitrite: str
    protein: str
    glucose: str
    bilirubin: str
    urobilinogen: str
    wbcCount: float
    rbcCount: float
    dysuriaBool: bool
    frequencyBool: bool
    urgencyBool: bool
    flankPainBool: bool
    feverBool: bool

class FeatureWeight(BaseModel):
    feature: str
    weight: float

class ROCPoint(BaseModel):
    fpr: float
    tpr: float

class PredictionResult(BaseModel):
    prediction: str  # 'Likely UTI' or 'Unlikely UTI'
    confidence: int  # 0-100
    featureImportance: List[FeatureWeight]
    rocCurve: List[ROCPoint]

@app.post("/api/predict")
async def predict(data: PatientData) -> PredictionResult:
    """
    Receives patient urinalysis data and returns UTI risk prediction
    with confidence score, feature importance, and model metrics.
    """
    try:
        # 1. Validate and transform input
        features = prepare_features(data)
        
        # 2. Run model inference (GA-GWO Random Forest)
        prediction_class = model.predict(features)[0]  # 0 or 1
        confidence_proba = model.predict_proba(features)[0]  # [prob_negative, prob_positive]
        
        # 3. Extract feature importance
        feature_importance = get_feature_importance(model, features)
        
        # 4. Generate ROC curve (or use pre-computed)
        roc_curve = get_roc_curve(model, test_features, test_labels)
        
        # 5. Format response
        return PredictionResult(
            prediction='Likely UTI' if prediction_class == 1 else 'Unlikely UTI',
            confidence=int(confidence_proba[1] * 100),  # Convert to percentage
            featureImportance=[
                FeatureWeight(feature=name, weight=weight)
                for name, weight in sorted(feature_importance.items(), 
                                          key=lambda x: x[1], reverse=True)[:8]
            ],
            rocCurve=[
                ROCPoint(fpr=float(f), tpr=float(t))
                for f, t in zip(fpr_values, tpr_values)
            ]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

## Error Handling

The frontend's `usePrediction` hook catches errors from the service layer:

```typescript
// src/hooks/usePrediction.ts

const { mutate, isPending, error } = useMutation(
  (data: PatientData) => predictUTI(data),
  {
    onSuccess: (result) => {
      setResult(result);
      addToHistory(data, result);  // Save to session history
    },
    onError: (error) => {
      console.error('Prediction failed:', error);
      // UI displays error message automatically
    }
  }
);
```

If the backend is unreachable, the user sees:
- Loading spinner during request
- Error message if request fails
- Ability to retry

## CORS Configuration

If frontend and backend are on different domains, enable CORS:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://yourdomain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Performance Tips

1. **Caching**: Cache ROC curve server-side (it's model-level, not patient-specific)
   ```python
   @lru_cache(maxsize=1)
   def get_roc_curve():
       return compute_roc_from_test_set()
   ```

2. **Async Processing**: For long-running model inference, use task queues (Celery, RQ)

3. **Request Validation**: FastAPI's Pydantic validates input automatically

4. **Response Compression**: Gzip compress JSON responses (FastAPI middleware)

## Testing Without Backend

During development, keep the mock service active:

```typescript
// src/services/predictionApi.ts

const USE_MOCK_API = process.env.REACT_APP_USE_MOCK === 'true';

export async function predictUTI(patientData: PatientData): Promise<PredictionResult> {
  if (USE_MOCK_API) {
    return mockPredictUTI(patientData);
  }
  
  // Real backend call
  const response = await fetch(`${API_BASE_URL}/api/predict`, { /* ... */ });
  return response.json();
}
```

Then run:

```bash
# Development with mock
REACT_APP_USE_MOCK=true pnpm dev

# With real backend
REACT_APP_USE_MOCK=false REACT_APP_API_BASE_URL=http://localhost:8000 pnpm dev
```

## Deployment

### Frontend (Vercel, Netlify, etc.)

```bash
pnpm build
# Deploy dist/ folder
```

Set environment variables in your hosting platform:

```
REACT_APP_API_BASE_URL=https://api.yourdomain.com
```

### Backend (Heroku, AWS, DigitalOcean, etc.)

Deploy FastAPI app with:
- Gunicorn or Uvicorn server
- PostgreSQL (if storing results)
- Redis (if using async task queues)

## Monitoring & Logging

Add logging to track predictions:

```typescript
export async function predictUTI(patientData: PatientData): Promise<PredictionResult> {
  const startTime = Date.now();
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/predict`, {
      method: 'POST',
      body: JSON.stringify(patientData),
    });
    
    const elapsed = Date.now() - startTime;
    console.log(`[Prediction] Success in ${elapsed}ms`);
    
    return response.json();
  } catch (error) {
    const elapsed = Date.now() - startTime;
    console.error(`[Prediction] Error after ${elapsed}ms:`, error);
    throw error;
  }
}
```

Server-side (FastAPI):

```python
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

@app.post("/api/predict")
async def predict(data: PatientData):
    logger.info(f"Prediction request: age={data.age}, gender={data.gender}")
    result = model.predict(...)
    logger.info(f"Prediction result: {result.prediction} ({result.confidence}%)")
    return result
```

## Summary

1. **Keep the service layer isolated** – all API calls live in `src/services/predictionApi.ts`
2. **Match the response interface** – frontend expects exactly `PredictionResult` structure
3. **Test with mock first** – develop frontend independently, then plug in backend
4. **Validate input/output** – both frontend and backend should validate data
5. **Handle errors gracefully** – user sees clear feedback, not exceptions
6. **Monitor performance** – log request times and failures for debugging

With this design, integrating a real backend requires **only a single file change** and full confidence that all components will work correctly.
