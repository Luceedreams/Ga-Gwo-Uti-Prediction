import { useState, useCallback } from 'react';
import { predictUTI, type PatientData, type PredictionResult } from '../services/predictionApi';

interface UsePredictionState {
  loading: boolean;
  error: string | null;
  result: PredictionResult | null;
}

export function usePrediction() {
  const [state, setState] = useState<UsePredictionState>({
    loading: false,
    error: null,
    result: null,
  });

  const predict = useCallback(async (patientData: PatientData) => {
    setState({ loading: true, error: null, result: null });

    try {
      const result = await predictUTI(patientData);
      setState({ loading: false, error: null, result });
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unexpected error occurred.';
      setState({
        loading: false,
        error: errorMessage,
        result: null,
      });
      throw err;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ loading: false, error: null, result: null });
  }, []);

  return { ...state, predict, reset };
}
