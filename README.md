# UTI Clinical Decision-Support Dashboard

A professional, evidence-based clinical decision-support tool for urinary tract infection (UTI) risk prediction. This frontend-only React application demonstrates a clean architecture for healthcare tools with clear service layer isolation for easy backend integration.

## Features

- **Real-time UTI Risk Prediction**: Enter patient urinalysis and demographic data to receive instant risk assessments
- **Confidence Scoring**: Visual gauge showing model confidence (color-coded: red/amber/green)
- **Feature Importance Analysis**: Interactive bar chart showing which patient factors most influenced the prediction
- **Model Performance Metrics**: ROC curve visualization showing the hybrid GA-GWO Random Forest classifier's discrimination ability
- **Session-Based History**: In-memory prediction history for tracking multiple patient assessments in one session
- **Fully Responsive Design**: Works seamlessly on desktop tablets and mobile devices at bedside
- **Accessible UI**: WCAG compliant with tooltips, help text, and keyboard navigation
- **Clinical Disclaimers**: Prominent safety notices emphasizing this is decision-support only, not a replacement for clinical judgment or urine culture

## Tech Stack

- **React 19** with TypeScript
- **Vite 5** as the build tool
- **Tailwind CSS v4** for styling
- **Recharts** for data visualization (ROC curve, feature importance)
- **Custom hooks** for prediction and history management
- **Isolated service layer** for API calls (ready for FastAPI backend)

## Project Structure

```
src/
├── services/
│   └── predictionApi.ts          # ISOLATED SERVICE LAYER
│                                  # Mocked responses; swap with real fetch() calls
├── hooks/
│   ├── usePrediction.ts          # Manages prediction state and loading
│   └── useHistory.ts             # Manages session-based prediction history
├── components/
│   ├── PatientForm.tsx           # Main form component
│   ├── PredictionResult.tsx       # Result display and charts
│   ├── FormSection.tsx           # Reusable section wrapper
│   ├── ConfidenceGauge.tsx       # Circular confidence visualization
│   ├── FeatureImportanceChart.tsx# Bar chart of feature weights
│   ├── RocCurveChart.tsx         # ROC curve visualization
│   ├── PredictionHistory.tsx     # Session history modal
│   ├── inputs/
│   │   ├── TextInput.tsx         # Text and numeric inputs
│   │   ├── SelectInput.tsx       # Dropdown selects
│   │   └── CheckboxInput.tsx     # Checkbox groups
│   └── ...
├── App.tsx                       # Main app component
├── main.tsx                      # React entry point
└── index.css                     # Global Tailwind styles
```

## Installation & Running

### 1. Install dependencies

```bash
pnpm install
```

### 2. Start the development server

```bash
pnpm dev
```

The app will open at `http://localhost:3000`

### 3. Build for production

```bash
pnpm build
```

## API Service Layer

The key design pattern is the **isolated service layer** in `src/services/predictionApi.ts`:

### Current Implementation (Mocked)

```typescript
export async function predictUTI(patientData: PatientData): Promise<PredictionResult> {
  // Simulates network delay (~800ms)
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Returns clinically plausible mocked data
  return {
    prediction: 'Unlikely UTI' | 'Likely UTI',
    confidence: number,
    featureImportance: [
      { feature: 'Leukocyte Esterase', weight: 32.5 },
      { feature: 'Nitrite', weight: 21.3 },
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

### Swapping in Real Backend

To integrate with a FastAPI backend, **only modify this single file**:

```typescript
export async function predictUTI(patientData: PatientData): Promise<PredictionResult> {
  const response = await fetch('/api/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patientData)
  });
  
  if (!response.ok) throw new Error('Prediction failed');
  return response.json();
}
```

**No component changes needed.** The entire app continues to work because all API calls go through this single service.

## Data Model

### Patient Data Input

```typescript
{
  age: number;                    // 0-120
  gender: 'Male' | 'Female';
  urinePh: number;               // 4.5-8.5
  specificGravity: number;       // 1.005-1.030
  leukocyteEsterase: 'Negative' | 'Trace' | '+' | '++' | '+++';
  nitrite: 'Negative' | 'Positive';
  protein: 'Negative' | 'Trace' | '+' | '++';
  glucose: 'Negative' | 'Trace' | '+' | '++';
  bilirubin: 'Negative' | 'Positive';
  urobilinogen: 'Normal' | 'Increased' | 'Decreased';
  wbcCount: number;              // White blood cells per μL
  rbcCount: number;              // Red blood cells per μL
  dysuriaBool: boolean;           // Painful urination
  frequencyBool: boolean;         // Increased urinary frequency
  urgencyBool: boolean;           // Urinary urgency
  flankPainBool: boolean;         // Flank/lower back pain
  feverBool: boolean;             // Fever
}
```

### Prediction Response

```typescript
{
  prediction: 'Likely UTI' | 'Unlikely UTI';
  confidence: number;            // 0-100 (percentage)
  featureImportance: Array<{
    feature: string;
    weight: number;              // 0-100 (relative importance)
  }>;
  rocCurve: Array<{
    fpr: number;                 // False positive rate
    tpr: number;                 // True positive rate
  }>;
}
```

## Clinical Notes

### Model

- **Classifier**: Genetic Algorithm + Grey Wolf Optimizer hybrid-tuned Random Forest
- **AUC-ROC Score**: ~0.887 (representative; adjust based on real model performance)
- **Intended Use**: Clinical decision support only; not a diagnostic tool
- **Validation**: Train/test on institutional urinalysis + culture datasets

### Disclaimers

The app displays prominent disclaimers:
- "This tool is for clinical support only and does not replace clinical judgment or confirmatory urine culture."
- "Always follow your institution's protocols and consult a clinician for diagnosis."
- "FDA Status: Not Cleared or Approved as Medical Device"

These are non-negotiable for clinical tools and help ensure appropriate use.

## Responsive Design

- **Desktop (≥1024px)**: Two-column layout (form + info sidebar)
- **Tablet (768–1023px)**: Stacked layout with collapsible sections
- **Mobile (<768px)**: Single-column, optimized for touch and portrait orientation

All forms are accessible with:
- Proper `<label>` associations
- ARIA roles and descriptions
- Keyboard navigation (Tab, Arrow keys, Enter)
- Focus indicators and hover states
- Sufficient color contrast (WCAG AA+)

## Usage Workflow

1. **Enter Patient Data**: Clinician fills form with demographics and urinalysis results
2. **Optional Symptoms**: Check relevant clinical symptoms (dysuria, fever, etc.)
3. **Generate Prediction**: Click submit button
4. **Review Result**: See prediction, confidence score, and supporting analytics
5. **Check History**: View all predictions from the session
6. **New Prediction**: Click "New Prediction" to assess another patient

## Development

### Adding New Input Fields

To add a new patient field (e.g., new lab test):

1. Update `PatientData` type in `predictionApi.ts`
2. Add field to the form in `PatientForm.tsx`
3. Update mock prediction logic in `predictUTI()` to consider the new field
4. Update charts if the field should influence feature importance

### Customizing Styling

All colors and spacing use Tailwind v4 tokens defined in `src/index.css`:

```css
@theme {
  --color-primary: #0066cc;
  --color-success: #10b981;
  --color-danger: #ef4444;
  /* ... */
}
```

Modify these tokens to rebrand the clinical aesthetic.

### Testing the History Feature

- Submit a prediction → it appears in session history
- Click a history item to review past results
- Click the delete icon to remove individual entries
- Click "Clear All" to reset history

## Performance Considerations

- **Recharts**: SVG-based charts are performant for clinical data sizes (~10 predictions/session)
- **HMR**: Hot module replacement during development for instant feedback
- **Bundle Size**: ~200KB gzipped (minimal for a clinical tool)
- **Accessibility**: No lazy-loading of visible UI; all content accessible on page load

## Future Enhancements

- **Backend Integration**: Swap `predictionApi.ts` with real FastAPI calls
- **Authentication**: Add clinician login with role-based access
- **Data Export**: PDF export of prediction reports for charts
- **Comparative Analysis**: Side-by-side comparison of multiple patients
- **Model Explainability**: SHAP values or LIME for deeper feature interactions
- **Audit Logs**: Track all predictions and user actions for compliance
- **Multi-language Support**: i18n for international clinical use

## License

Clinical research and educational use. Ensure institutional review board (IRB) approval and HIPAA compliance before deployment with real patient data.

## References

- Model: GA-GWO Hybrid Tuned Random Forest for UTI prediction
- Clinical Guidelines: Consult IDSA, NICE, or local protocols for UTI diagnostic criteria
- Accessibility: WCAG 2.1 Level AA
- React: https://react.dev
- Vite: https://vitejs.dev
- Tailwind: https://tailwindcss.com
- Recharts: https://recharts.org
