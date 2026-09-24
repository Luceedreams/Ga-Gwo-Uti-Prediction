import { useState, useCallback } from 'react';
import type { PatientData, PredictionResult } from '../services/predictionApi';

export interface HistoryEntry {
  id: string;
  patientData: PatientData;
  result: PredictionResult;
  timestamp: Date;
}

export function useHistory() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  const addEntry = useCallback(
    (patientData: PatientData, result: PredictionResult) => {
      const entry: HistoryEntry = {
        id: `${Date.now()}-${Math.random()}`,
        patientData,
        result,
        timestamp: new Date(),
      };
      setEntries((prev) => [entry, ...prev]);
      return entry.id;
    },
    []
  );

  const removeEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
  }, []);

  const clearHistory = useCallback(() => {
    setEntries([]);
  }, []);

  return {
    entries,
    addEntry,
    removeEntry,
    clearHistory,
  };
}
