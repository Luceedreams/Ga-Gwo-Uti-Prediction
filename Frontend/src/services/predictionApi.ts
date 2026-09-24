/**
 * Prediction API Service
 *
 * Single contact point for all backend calls.
 * All components import from here — nothing else needs to change
 * when the backend URL or structure changes.
 */

const API_URL = import.meta.env.VITE_API_URL;

export interface PatientData {
  // Urinalysis Parameters
  leukocyteEsterase: 'negative' | 'trace' | 'plus1' | 'plus2' | 'plus3';
  nitrite: 'positive' | 'negative';
  wbcUrinalysis: number;
  redBloodCell: number;
  bacteria: 'none' | 'few' | 'moderate' | 'many';
  urinePh: number;
  specificGravity: number;
  protein: string;
  glucose: string;
  whiteBloodCell: number;

  // Blood Results & Vitals
  serumCreatinine: number;
  temperature: number;
  symptomDuration: number;

  // Patient Demographics & History
  age: number;
  gender: 'male' | 'female';
  priorUti: 'yes' | 'no' | '';
  catheterUse: 'yes' | 'no' | '';
  pregnancy: 'yes' | 'no' | 'na' | '';

  // Symptom flags (kept for interface compatibility; not sent to model)
  dysuria: boolean;
  frequency: boolean;
  urgency: boolean;
  flankPain: boolean;
  fever: boolean;
}

export interface FeatureImportance {
  feature: string;
  weight: number;
}

export interface RocPoint {
  fpr: number;
  tpr: number;
}

export interface PredictionResult {
  prediction: 'likely_uti' | 'unlikely_uti';
  confidence: number; // 0–100
  featureImportance: FeatureImportance[];
  rocCurve: RocPoint[];
  modelInfo: {
    name: string;
    description: string;
  };
}

/**
 * Send patient data to the Flask backend and return the prediction result.
 */
export async function predictUTI(
  patientData: PatientData
): Promise<PredictionResult> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patientData),
    });
  } catch (networkErr) {
    throw new Error(
      'Cannot reach the prediction server. ' +
      'Make sure the Flask API is running on port 5000.'
    );
  }

  if (!response.ok) {
    let detail = response.statusText;
    try {
      const body = await response.json();
      detail = body.message ?? detail;
    } catch (_) { /* ignore */ }
    throw new Error(`Prediction failed: ${detail}`);
  }

  const data = await response.json();

  // Normalise confidence: backend returns 0-100 already
  return data as PredictionResult;
}

/**
 * Basic client-side validation before submitting the form.
 */
export function validatePatientData(data: Partial<PatientData>): string[] {
  const errors: string[] = [];

  if (!data.age || data.age < 0 || data.age > 150)
    errors.push('Age must be between 0 and 150.');

  if (!data.gender)
    errors.push('Biological sex is required.');

  if (data.urinePh !== undefined && data.urinePh !== 0 &&
    (data.urinePh < 4.5 || data.urinePh > 8.5))
    errors.push('Urine pH must be between 4.5 and 8.5.');

  if (data.specificGravity !== undefined && data.specificGravity !== 0 &&
    (data.specificGravity < 1.0 || data.specificGravity > 1.030))
    errors.push('Specific gravity must be between 1.000 and 1.030.');

  return errors;
}
