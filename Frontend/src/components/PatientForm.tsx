import React, { useState, useMemo } from 'react';
import type { PatientData } from '../services/predictionApi';
import { AlertCircle } from 'lucide-react';
import FormSection from './FormSection';
import TextInput from './inputs/TextInput';
import SelectInput from './inputs/SelectInput';


interface PatientFormProps {
  onSubmit: (data: PatientData) => void;
  isLoading: boolean;
  onCompletionChange?: (pct: number) => void;
}

const defaultData: PatientData = {
  // Urinalysis
  leukocyteEsterase: 'negative',
  nitrite: 'negative',
  wbcUrinalysis: 0,
  redBloodCell: 0,
  bacteria: 'none',
  urinePh: 0,
  specificGravity: 0,
  protein: 'negative',
  glucose: 'negative',
  whiteBloodCell: 0,
  // Blood & Vitals
  serumCreatinine: 0,
  temperature: 0,
  symptomDuration: 0,
  // Demographics
  age: 0,
  gender: 'female',
  priorUti: '',
  catheterUse: '',
  pregnancy: '',
  // Legacy symptoms
  dysuria: false,
  frequency: false,
  urgency: false,
  flankPain: false,
  fever: false,
};

const PatientForm: React.FC<PatientFormProps> = ({ onSubmit, isLoading, onCompletionChange }) => {
  const [formData, setFormData] = useState<PatientData>(defaultData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof PatientData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  // Calculate form completion percentage
  const completionPct = useMemo(() => {
    const fields: Array<keyof PatientData> = [
      'leukocyteEsterase', 'nitrite', 'wbcUrinalysis', 'redBloodCell',
      'bacteria', 'urinePh', 'specificGravity', 'protein', 'glucose', 'whiteBloodCell',
      'serumCreatinine', 'temperature', 'symptomDuration',
      'age', 'gender', 'priorUti', 'catheterUse', 'pregnancy',
    ];
    let filled = 0;
    for (const f of fields) {
      const v = formData[f];
      if (v !== '' && v !== 0 && v !== null && v !== undefined) filled++;
    }
    return Math.round((filled / fields.length) * 100);
  }, [formData]);

  // Notify parent of completion changes
  React.useEffect(() => {
    onCompletionChange?.(completionPct);
  }, [completionPct, onCompletionChange]);


  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.age || formData.age < 0 || formData.age > 150)
      newErrors.age = 'Age must be between 0 and 150 years';
    if (formData.urinePh !== 0 && (formData.urinePh < 4.5 || formData.urinePh > 8.5))
      newErrors.urinePh = 'pH must be 4.5 – 8.5';
    if (formData.specificGravity !== 0 && (formData.specificGravity < 1.0 || formData.specificGravity > 1.030))
      newErrors.specificGravity = 'Must be 1.000 – 1.030';
    if (formData.wbcUrinalysis < 0) newErrors.wbcUrinalysis = 'Cannot be negative';
    if (formData.redBloodCell < 0) newErrors.redBloodCell = 'Cannot be negative';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>

      {/* ── Section 1: Urinalysis Parameters ── */}
      <FormSection
        title="Urinalysis Parameters"
        sectionEmoji="🧪"
        accentColor="#059669"
        accentBg="rgba(5,150,105,0.1)"
      >
        <div className="form-grid-3">

          <SelectInput
            label="Leukocyte Esterase"
            value={formData.leukocyteEsterase}
            onChange={e => handleChange('leukocyteEsterase', e.target.value)}
            options={[
              { value: 'negative', label: 'Negative' },
              { value: 'trace',    label: 'Trace' },
              { value: 'plus1',   label: '1+' },
              { value: 'plus2',   label: '2+' },
              { value: 'plus3',   label: '3+' },
            ]}
            required
            tooltip="Indicates presence of WBCs; a strong UTI marker."
          />
          <SelectInput
            label="Nitrite"
            value={formData.nitrite}
            onChange={e => handleChange('nitrite', e.target.value)}
            options={[
              { value: 'negative', label: 'Negative' },
              { value: 'positive', label: 'Positive' },
            ]}
            required
            tooltip="Positive nitrite is highly specific for gram-negative bacteria."
          />
          <TextInput
            label="WBC (urinalysis)"
            sublabel="(/hpf)"
            type="number"
            min="0"
            value={formData.wbcUrinalysis || ''}
            onChange={e => handleChange('wbcUrinalysis', parseFloat(e.target.value) || 0)}
            placeholder="e.g. 9"
            error={errors.wbcUrinalysis}
            tooltip="White blood cells per high-power field in urine."
          />
          <TextInput
            label="RBC"
            sublabel="(/hpf)"
            type="number"
            min="0"
            value={formData.redBloodCell || ''}
            onChange={e => handleChange('redBloodCell', parseFloat(e.target.value) || 0)}
            placeholder="e.g. 14"
            error={errors.redBloodCell}
            tooltip="Red blood cells per high-power field. Elevated suggests haematuria."
          />
          <SelectInput
            label="Bacteria"
            value={formData.bacteria}
            onChange={e => handleChange('bacteria', e.target.value as PatientData['bacteria'])}
            options={[
              { value: 'none',     label: 'None' },
              { value: 'few',      label: 'Few' },
              { value: 'moderate', label: 'Moderate' },
              { value: 'many',     label: 'Many' },
            ]}
            tooltip="Bacterial load observed in urine sediment."
          />
          <TextInput
            label="Urinary pH"
            type="number"
            min="4.5"
            max="8.5"
            step="0.1"
            value={formData.urinePh || ''}
            onChange={e => handleChange('urinePh', parseFloat(e.target.value) || 0)}
            placeholder="e.g. 4.5"
            error={errors.urinePh}
            tooltip="Normal range: 4.5–8.5. pH >7.0 may indicate infection."
          />
          <TextInput
            label="Specific Gravity"
            type="number"
            min="1.000"
            max="1.030"
            step="0.001"
            value={formData.specificGravity || ''}
            onChange={e => handleChange('specificGravity', parseFloat(e.target.value) || 0)}
            placeholder="e.g. 1.001"
            error={errors.specificGravity}
            tooltip="Normal: 1.005–1.030. Indicates urine concentration."
          />
          <SelectInput
            label="Protein"
            value={formData.protein}
            onChange={e => handleChange('protein', e.target.value)}
            options={[
              { value: 'negative', label: 'Negative' },
              { value: 'trace',    label: 'Trace' },
              { value: 'plus1',   label: '1+' },
              { value: 'plus2',   label: '2+' },
            ]}
            tooltip="Proteinuria can indicate kidney involvement."
          />
          <SelectInput
            label="Glucose (urine)"
            value={formData.glucose}
            onChange={e => handleChange('glucose', e.target.value)}
            options={[
              { value: 'negative', label: 'Negative' },
              { value: 'trace',    label: 'Trace' },
              { value: 'plus1',   label: '1+' },
              { value: 'plus2',   label: '2+' },
            ]}
            tooltip="Glucosuria may indicate diabetes mellitus."
          />
        </div>
        {/* Blood WBC — spans own row as a narrower field */}
        <div style={{ marginTop: '1rem', maxWidth: '200px' }}>
          <TextInput
            label="Blood WBC"
            sublabel="(×10³/μL)"
            type="number"
            min="0"
            step="0.1"
            value={formData.whiteBloodCell || ''}
            onChange={e => handleChange('whiteBloodCell', parseFloat(e.target.value) || 0)}
            placeholder="e.g. 1.5"
            tooltip="Peripheral blood white blood cell count."
          />
        </div>
      </FormSection>

      {/* ── Section 2: Blood Results & Vitals ── */}
      <FormSection
        title="Blood Results &amp; Vitals"
        sectionEmoji="🩸"
        accentColor="#dc2626"
        accentBg="rgba(220,38,38,0.08)"
      >
        <div className="form-grid-3">

          <TextInput
            label="Serum Creatinine"
            sublabel="(mg/dL)"
            type="number"
            min="0"
            step="0.01"
            value={formData.serumCreatinine || ''}
            onChange={e => handleChange('serumCreatinine', parseFloat(e.target.value) || 0)}
            placeholder="e.g. 0.9"
            tooltip="Serum creatinine level. Elevated suggests renal involvement."
          />
          <TextInput
            label="Temperature"
            sublabel="(°C)"
            type="number"
            min="35"
            max="42"
            step="0.1"
            value={formData.temperature || ''}
            onChange={e => handleChange('temperature', parseFloat(e.target.value) || 0)}
            placeholder="e.g. 37.2"
            tooltip="Body temperature. >38°C indicates fever/systemic infection."
          />
          <TextInput
            label="Symptom Duration"
            sublabel="(days)"
            type="number"
            min="0"
            value={formData.symptomDuration || ''}
            onChange={e => handleChange('symptomDuration', parseInt(e.target.value) || 0)}
            placeholder="e.g. 3"
            tooltip="Number of days patient has experienced symptoms."
          />
        </div>
      </FormSection>

      {/* ── Section 3: Patient Demographics & History ── */}
      <FormSection
        title="Patient Demographics &amp; History"
        sectionEmoji="👤"
        accentColor="#2563eb"
        accentBg="rgba(37,99,235,0.08)"
      >
        <div className="form-grid-3">

          <TextInput
            label="Age"
            sublabel="(yrs)"
            type="number"
            min="0"
            max="150"
            value={formData.age || ''}
            onChange={e => handleChange('age', parseInt(e.target.value) || 0)}
            placeholder="e.g. 35"
            error={errors.age}
            required
            tooltip="Patient's age in years (0–150)."
          />
          <SelectInput
            label="Biological Sex"
            value={formData.gender}
            onChange={e => handleChange('gender', e.target.value as 'male' | 'female')}
            options={[
              { value: 'female', label: 'Female' },
              { value: 'male',   label: 'Male' },
            ]}
            required
            tooltip="Biological sex affects UTI susceptibility."
          />
          <SelectInput
            label="Prior UTI (12 mo)"
            value={formData.priorUti}
            onChange={e => handleChange('priorUti', e.target.value)}
            placeholder="Select..."
            options={[
              { value: 'yes', label: 'Yes' },
              { value: 'no',  label: 'No' },
            ]}
            tooltip="History of UTI in the past 12 months."
          />
          <SelectInput
            label="Catheter Use"
            value={formData.catheterUse}
            onChange={e => handleChange('catheterUse', e.target.value)}
            placeholder="Select..."
            options={[
              { value: 'yes', label: 'Yes' },
              { value: 'no',  label: 'No' },
            ]}
            tooltip="Current or recent urinary catheter use."
          />
          <SelectInput
            label="Pregnancy"
            value={formData.pregnancy}
            onChange={e => handleChange('pregnancy', e.target.value)}
            placeholder="Select..."
            options={[
              { value: 'yes', label: 'Yes' },
              { value: 'no',  label: 'No' },
              { value: 'na',  label: 'N/A' },
            ]}
            tooltip="Current pregnancy status. Pregnancy increases UTI risk."
          />
        </div>
      </FormSection>

      {/* ── Submit Button ── */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: '0.5rem' }}>
        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-run no-print"
        >
          {isLoading ? (
            <>
              <div style={{
                width: '16px', height: '16px',
                border: '2px solid rgba(255,255,255,0.35)',
                borderTopColor: 'white',
                borderRadius: '50%',
                animation: 'rotateSpin 0.8s linear infinite',
                marginRight: '0.5rem',
              }} />
              Analyzing...
            </>
          ) : (
            'Run Prediction →'
          )}
        </button>
      </div>

    </form>
  );
};

export default PatientForm;