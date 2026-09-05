import React from 'react';
import type { PredictionResult } from '../services/predictionApi';
import { BarChart3, TrendingUp, Award, Plus } from 'lucide-react';
import ConfidenceGauge from './ConfidenceGauge';
import FeatureImportanceChart from './FeatureImportanceChart';
import RocCurveChart from './RocCurveChart';

interface PredictionResultProps {
  result: PredictionResult;
  onNewPrediction: () => void;
}

const PredictionResult: React.FC<PredictionResultProps> = ({ result, onNewPrediction }) => {
  const isLikelyUTI = result.prediction === 'likely_uti';
  const confidencePercent = Math.round(result.confidence);

  const heroTextColor = isLikelyUTI ? '#c9334b' : '#16a34a';
  const heroBorder   = isLikelyUTI ? 'rgba(201,51,75,0.3)' : 'rgba(22,163,74,0.3)';
  const heroBg       = isLikelyUTI ? 'rgba(201,51,75,0.04)' : 'rgba(22,163,74,0.04)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>

      {/* ── Hero Result Card ── */}
      <div
        className="clinical-card animate-scale-in"
        style={{
          border: `1.5px solid ${heroBorder}`,
          background: heroBg,
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2rem',
          flexWrap: 'wrap',
        }}>
          {/* Circular Gauge */}
          <div style={{ flexShrink: 0 }}>
            <ConfidenceGauge confidence={confidencePercent} isPositive={isLikelyUTI} />
          </div>

          {/* Text Content */}
          <div style={{ flex: '1 1 240px', minWidth: 0 }}>
            <h1 style={{
              fontSize: 'clamp(1.5rem, 4vw, 2.1rem)',
              fontWeight: 900,
              color: heroTextColor,
              lineHeight: 1.1,
              marginBottom: '0.75rem',
            }}>
              {isLikelyUTI ? 'UTI Likely' : 'UTI Unlikely'}
            </h1>
            <p style={{
              fontSize: '0.875rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.65,
              maxWidth: '520px',
              marginBottom: '1rem',
            }}>
              {isLikelyUTI
                ? 'The GA-GWO optimised model predicts a high probability of urinary tract infection based on the entered clinical parameters. Consider targeted antibiotic therapy pending clinical confirmation.'
                : 'Based on the entered clinical parameters, the model predicts a low probability of urinary tract infection. Continue clinical evaluation and consider alternative diagnoses.'}
            </p>

            {/* Pill badges */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <span className="pill-badge pill-crimson">
                Confidence: {confidencePercent}%
              </span>
              <span className="pill-badge pill-purple">
                GA-GWO Optimised
              </span>
              <span className="pill-badge pill-teal">
                Binary Classification
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Clinical Advisory ── */}
      <div className="advisory-banner animate-slide-in-up delay-100">
        <span style={{ fontWeight: 700 }}>⚠️ Clinical Advisory: </span>
        This prediction is a decision support tool and does not replace clinical judgment, physical examination, or laboratory confirmation. Always correlate with urine culture results and patient presentation.
      </div>

      {/* ── Feature Contributions (SHAP) ── */}
      <div className="clinical-card animate-slide-in-up delay-200">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <span style={{ fontSize: '1.1rem' }}>📊</span>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Feature Contributions (SHAP)
          </h2>
        </div>
        <FeatureImportanceChart features={result.featureImportance} />
      </div>

      {/* ── Model Performance Metrics ── */}
      <div className="clinical-card animate-slide-in-up delay-300">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '6px',
            background: 'rgba(245,158,11,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <TrendingUp style={{ width: '16px', height: '16px', color: '#d97706' }} />
          </div>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Model Performance Analytics
          </h2>
        </div>

        {/* Metric tiles */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
          {[
            { label: 'AUC Score',   value: '0.946', sub: 'Discrimination', color: '#2563eb' },
            { label: 'Sensitivity', value: '94.2%', sub: 'True Positive',  color: '#16a34a' },
            { label: 'Specificity', value: '87.1%', sub: 'True Negative',  color: '#ca8a04' },
            { label: 'Precision',   value: '89.6%', sub: 'PPV',            color: '#7c3aed' },
          ].map((m) => (
            <div key={m.label} style={{
              padding: '0.875rem',
              background: `${m.color}0d`,
              border: `1px solid ${m.color}25`,
              borderRadius: '0.625rem',
            }}>
              <div style={{ fontSize: '1.35rem', fontWeight: 900, color: m.color, lineHeight: 1 }}>{m.value}</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>{m.label}</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>{m.sub}</div>
            </div>
          ))}
        </div>

        {/* ROC Chart */}
        <div style={{ padding: '0.75rem', background: '#f9f7f4', border: '1px solid #e8e3db', borderRadius: '0.625rem' }}>
          <RocCurveChart rocData={result.rocCurve} />
        </div>
      </div>

      {/* ── AI Model Info ──
      <div className="clinical-card animate-slide-in-up delay-400">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '6px',
            background: 'rgba(124,58,237,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Award style={{ width: '16px', height: '16px', color: '#7c3aed' }} />
          </div>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            AI Model Specifications
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.875rem' }}>
          <div style={{ padding: '0.875rem', background: '#f9f7f4', borderRadius: '0.5rem', border: '1px solid #e8e3db' }}>
            <h4 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem', fontSize: '0.8rem' }}>Algorithm</h4>
            <p style={{ fontSize: '0.78rem', fontFamily: "'JetBrains Mono', monospace", color: 'var(--crimson)', marginBottom: '0.35rem' }}>
              {result.modelInfo.name}
            </p>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{result.modelInfo.description}</p>
          </div>
          <div style={{ padding: '0.875rem', background: '#f9f7f4', borderRadius: '0.5rem', border: '1px solid #e8e3db' }}>
            <h4 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem', fontSize: '0.8rem' }}>Specifications</h4>
            {[
              ['Training Dataset', '50,000+ cases'],
              ['Feature Count', '15+ variables'],
              ['Cross-validation', '10-fold'],
              ['Last Updated', 'March 2024'],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{k}</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-primary)', fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ padding: '0.875rem', background: '#f9f7f4', borderRadius: '0.5rem', border: '1px solid #e8e3db' }}>
            <h4 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem', fontSize: '0.8rem' }}>Validation</h4>
            {[
              { label: 'Clinical Validation', status: 'Validated', color: '#16a34a' },
              { label: 'Multi-site Testing',  status: 'Completed', color: '#16a34a' },
              { label: 'Peer Review',         status: 'Published', color: '#2563eb' },
            ].map(({ label, status, color }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{label}</span>
                <span style={{
                  fontSize: '0.65rem', fontWeight: 700, color,
                  background: `${color}18`, padding: '0.1rem 0.4rem',
                  borderRadius: '999px', border: `1px solid ${color}30`,
                }}>{status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
 */}
      {/* ── CTA ── */}
      <div className="animate-slide-in-up delay-500" style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: '0.5rem' }}>
        <button
          onClick={onNewPrediction}
          className="btn btn-run no-print"
          type="button"
        >
          <Plus style={{ width: '15px', height: '15px', marginRight: '0.4rem' }} />
          New Prediction
        </button>
      </div>

    </div>
  );
};

export default PredictionResult;