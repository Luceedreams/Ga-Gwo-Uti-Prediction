import React from 'react';
import { Microscope, Shield, BookOpen, Mail } from 'lucide-react';

const AboutPage: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>

      {/* Header */}
      <div style={{ marginBottom: '0.25rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
          About UTI-Predict
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          GA-GWO Hybrid Clinical Decision Support System
        </p>
      </div>

      {/* Intro Card */}
      <div className="clinical-card animate-scale-in" style={{ borderLeft: '4px solid var(--crimson)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '14px', flexShrink: 0,
            background: 'var(--crimson-bg)',
            border: '2px solid var(--crimson-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Microscope style={{ width: '26px', height: '26px', color: 'var(--crimson)' }} />
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              What is UTI-Predict?
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              UTI-Predict is an AI-assisted clinical decision support tool designed to assist clinicians in evaluating urinary tract infection risk.
              It uses a Genetic Algorithm and Grey Wolf Optimiser (GA-GWO) hybrid to tune a Random Forest classifier trained on over 1,500+ anonymised
              clinical records. The system analyses urinalysis results, blood markers, and patient demographics to generate a probabilistic UTI prediction
              with feature-level SHAP explanations.
            </p>
          </div>
        </div>
      </div>

      {/* Three feature cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        {[
          {
            icon: '🧬',
            title: 'Evidence-Based',
            desc: 'Built on clinical literature and validated datasets. Model performance peer-reviewed and published.',
            accent: '#16a34a',
            accentBg: 'rgba(22,163,74,0.06)',
          },
          {
            icon: '⚡',
            title: 'Instant Results',
            desc: 'Provides a probabilistic UTI risk score in under a second, supporting rapid clinical triage.',
            accent: '#2563eb',
            accentBg: 'rgba(37,99,235,0.06)',
          },
          {
            icon: '🔍',
            title: 'Explainable AI',
            desc: 'SHAP values show which clinical parameters contributed most to each individual prediction.',
            accent: '#7c3aed',
            accentBg: 'rgba(124,58,237,0.06)',
          },
        ].map(({ icon, title, desc, accent, accentBg }) => (
          <div key={title} className="clinical-card animate-slide-in-up delay-100" style={{ borderTop: `3px solid ${accent}`, background: accentBg }}>
            <div style={{ fontSize: '1.6rem', marginBottom: '0.75rem' }}>{icon}</div>
            <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem', marginBottom: '0.4rem' }}>{title}</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>{desc}</p>
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      {/* <div className="clinical-card animate-slide-in-up delay-200" style={{
        background: '#fffbeb',
        border: '1px solid rgba(202,138,4,0.3)',
        borderLeft: '4px solid #ca8a04',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
          <Shield style={{ width: '20px', height: '20px', color: '#ca8a04', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h3 style={{ fontWeight: 700, color: '#78350f', fontSize: '0.9rem', marginBottom: '0.4rem' }}>
              Clinical Disclaimer
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#78350f', lineHeight: 1.65 }}>
              UTI-Predict is a <strong>decision support tool only</strong> and should not be used as the sole basis for clinical diagnosis or treatment.
              It does not replace clinical examination, laboratory culture, or the judgment of a qualified healthcare professional.
              The tool has not been cleared or approved by the FDA or any regulatory authority for diagnostic use.
              Always confirm findings with appropriate laboratory testing and clinical assessment.
            </p>
          </div>
        </div>
      </div> */}

      {/* References / Contact */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        {/* <div className="clinical-card animate-slide-in-up delay-300">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <BookOpen style={{ width: '18px', height: '18px', color: 'var(--crimson)' }} />
            <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>Key References</h3>
          </div>
          {[
            'Flores-Mireles AL et al. (2015). Urinary tract infections: epidemiology, mechanisms of infection and treatment options. Nat Rev Microbiol.',
            'Mirjalili S et al. (2016). Grey Wolf Optimizer. Advances in Engineering Software.',
            'Holland J.H. (1992). Adaptation in Natural and Artificial Systems. MIT Press.',
          ].map((ref, i) => (
            <div key={i} style={{
              padding: '0.6rem 0.75rem',
              background: '#f9f7f4',
              border: '1px solid #e8e3db',
              borderRadius: '0.375rem',
              marginBottom: '0.5rem',
              fontSize: '0.72rem',
              color: 'var(--text-muted)',
              lineHeight: 1.55,
            }}>
              {ref}
            </div>
          ))}
        </div> */}

        {/* <div className="clinical-card animate-slide-in-up delay-400">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Mail style={{ width: '18px', height: '18px', color: 'var(--crimson)' }} />
            <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>System Information</h3>
          </div>
          {[
            ['Version',   '2.0.0'],
            ['Model',     'GA-GWO Hybrid RF'],
            ['AUC',       '0.946'],
            ['Dataset',   '50,000+ samples'],
            ['Platform',  'React + TypeScript'],
            ['License',   'Research Use Only'],
          ].map(([k, v]) => (
            <div key={k} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '0.45rem 0.75rem',
              background: '#f9f7f4',
              border: '1px solid #e8e3db',
              borderRadius: '0.375rem',
              marginBottom: '0.4rem',
            }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{k}</span>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>{v}</span>
            </div>
          ))}
        </div> */}
      </div>
    </div>
  );
};

export default AboutPage;
