# Quick Start Guide

## 60 Seconds to Running

```bash
cd /vercel/share/v0-project
pnpm install
pnpm dev
```

Open http://localhost:3000 in your browser.

## First 5 Minutes

1. **Fill the form** (pre-populated with demo data)
2. **Click "Generate Prediction"** → See mocked UTI risk result
3. **View the analytics** → Feature importance chart + ROC curve
4. **Click "History"** → See session predictions
5. **Click "New Prediction"** → Enter another patient, repeat

## Key Commands

```bash
# Development server
pnpm dev

# Build for production
pnpm build

# Preview production build locally
pnpm preview
```

## File Structure (What to Know)

```
src/
├── services/predictionApi.ts  ← MODIFY THIS to add real backend
├── components/                ← React components
├── hooks/                      ← Custom React hooks
└── App.tsx                     ← Main component
```

## How to Integrate Your Backend

### Step 1: Open the Service Layer

File: `src/services/predictionApi.ts`

### Step 2: Replace Mock with Real API

Find this function:

```typescript
export async function predictUTI(patientData: PatientData): Promise<PredictionResult> {
  // Mock logic here
}
```

Replace with:

```typescript
export async function predictUTI(patientData: PatientData): Promise<PredictionResult> {
  const response = await fetch('http://localhost:8000/api/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patientData)
  });
  
  if (!response.ok) throw new Error('Prediction failed');
  return response.json();
}
```

### Step 3: That's It!

No other files need to change. All components automatically use the new backend.

## Expected API Response Format

Your backend should return JSON like this:

```json
{
  "prediction": "Likely UTI",
  "confidence": 75,
  "featureImportance": [
    { "feature": "Leukocyte Esterase", "weight": 32.5 },
    { "feature": "Nitrite", "weight": 21.3 }
  ],
  "rocCurve": [
    { "fpr": 0, "tpr": 0 },
    { "fpr": 0.05, "tpr": 0.85 }
  ]
}
```

See `API_INTEGRATION.md` for full details.

## TypeScript Interfaces (Reference)

```typescript
interface PatientData {
  age: number;
  gender: 'Male' | 'Female';
  urinePh: number;
  specificGravity: number;
  leukocyteEsterase: 'Negative' | 'Trace' | '+' | '++' | '+++';
  nitrite: 'Negative' | 'Positive';
  protein: 'Negative' | 'Trace' | '+' | '++';
  glucose: 'Negative' | 'Trace' | '+' | '++';
  bilirubin: 'Negative' | 'Positive';
  urobilinogen: 'Normal' | 'Increased' | 'Decreased';
  wbcCount: number;
  rbcCount: number;
  dysuriaBool: boolean;
  frequencyBool: boolean;
  urgencyBool: boolean;
  flankPainBool: boolean;
  feverBool: boolean;
}

interface PredictionResult {
  prediction: 'Likely UTI' | 'Unlikely UTI';
  confidence: number; // 0-100
  featureImportance: Array<{ feature: string; weight: number }>;
  rocCurve: Array<{ fpr: number; tpr: number }>;
}
```

## Form Fields Explained

### Demographics
- **Age**: Patient age in years (0-120)
- **Gender**: Male or Female

### Urinalysis Results

**Physical Properties:**
- **Urine pH**: Acidity (4.5-8.5)
- **Specific Gravity**: Concentration (1.005-1.030)

**Chemical Tests:**
- **Leukocyte Esterase**: Enzyme indicator (Negative/Trace/+/++/+++)
- **Nitrite**: Bacterial indicator (Negative/Positive)
- **Protein**: Presence in urine (Negative/Trace/+/++)
- **Glucose**: Sugar in urine (Negative/Trace/+/++)
- **Bilirubin**: Liver function marker (Negative/Positive)
- **Urobilinogen**: Bilirubin breakdown (Normal/Increased/Decreased)

**Microscopy:**
- **WBC Count**: White blood cells per microliter (μL)
- **RBC Count**: Red blood cells per microliter (μL)

### Clinical Symptoms (Optional)
- **Dysuria**: Painful urination
- **Urinary Frequency**: Increased urination frequency
- **Urinary Urgency**: Sudden need to urinate
- **Flank Pain**: Side/back pain
- **Fever**: Elevated body temperature

## Customization Quick Tips

**Change Colors:**  
Edit `src/index.css` → `@theme` section → modify color values

**Change Sidebar Text:**  
Edit `src/components/App.tsx` → "About This Tool" section

**Add New Form Field:**  
1. Update `PatientData` type in `src/services/predictionApi.ts`
2. Add input in `src/components/PatientForm.tsx`
3. Update mock prediction logic in `src/services/predictionApi.ts`

**Change Model Description:**  
Edit `src/components/PredictionResult.tsx` → Model info section

## Deployment

### To Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login and deploy
vercel
```

### To Other Platforms

```bash
pnpm build
# Upload dist/ folder to your hosting
```

Set environment variable:
```
REACT_APP_API_BASE_URL=https://your-backend-api.com
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Dependencies not found | Run `pnpm install` |
| Port 3000 already in use | Kill process: `lsof -i :3000` then `kill -9 <PID>` |
| Charts not showing | Check browser console for errors |
| API 404 error | Verify backend URL in `REACT_APP_API_BASE_URL` env var |
| Form not submitting | Check browser console for validation errors |

## Environment Variables

Create `.env.local` (don't commit):

```env
# Development
REACT_APP_API_BASE_URL=http://localhost:8000

# Production (set in your hosting platform)
REACT_APP_API_BASE_URL=https://api.yourdomain.com
```

## Important Notes

⚠️ **This is a Demo/Frontend Only**
- Currently uses mocked predictions
- No data is stored (session-only)
- No authentication yet
- Not HIPAA compliant without backend validation

✅ **Ready to Integrate**
- Clean service layer architecture
- All components work with real backend
- Type-safe TypeScript interfaces
- Error handling built-in

## Next Steps

1. ✅ **Run locally** → Confirm it works
2. 🔄 **Read API_INTEGRATION.md** → Understand backend contract
3. 🚀 **Integrate your FastAPI** → One file change
4. ✓ **Deploy** → Vercel or your platform
5. 📊 **Monitor & Iterate** → Collect feedback, improve model

## Support

- **Full Documentation**: See `README.md`
- **API Integration**: See `API_INTEGRATION.md`
- **Project Overview**: See `PROJECT_SUMMARY.md`

---

**You're ready to go!** Run `pnpm dev` now and explore the app. 🎉
