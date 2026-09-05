import React, { useState } from 'react';
import type { PatientData } from './services/predictionApi';
import { usePrediction } from './hooks/usePrediction';
import { useHistory } from './hooks/useHistory';
import PatientForm from './components/PatientForm';
import PredictionResult from './components/PredictionResult';
// import ModelAnalytics from './components/ModelAnalytics';
import AboutPage from './components/AboutPage';
import { AlertCircle, Microscope, Menu, X, ChevronRight } from 'lucide-react';
import type { HistoryEntry } from './hooks/useHistory';

type Tab = 'input' | 'result' | 'analytics' | 'about';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('input');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedHistoryEntry, setSelectedHistoryEntry] = useState<HistoryEntry | null>(null);
  const [formCompletionPct, setFormCompletionPct] = useState(0);
  const { loading, error, result, predict, reset } = usePrediction();
  const { entries, addEntry } = useHistory();

  const handleFormSubmit = async (patientData: PatientData) => {
    try {
      const predictionResult = await predict(patientData);
      addEntry(patientData, predictionResult);
      setSelectedHistoryEntry(null);
      setActiveTab('result');
    } catch (err) {
      console.error('Prediction failed:', err);
    }
  };

  const handleNewPrediction = () => {
    reset();
    setSelectedHistoryEntry(null);
    setActiveTab('input');
  };

  const switchTab = (tab: Tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeResult = selectedHistoryEntry?.result ?? result;

  const tabs: { key: Tab; label: string }[] = [
    { key: 'input',     label: 'Patient Input' },
    { key: 'result',    label: 'Prediction Result' },
    // { key: 'analytics', label: 'Model Analytics' },
    { key: 'about',     label: 'About' },
  ];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      background: 'var(--page-bg)',
      width: '100%',
      overflowX: 'hidden',
    }}>

      {/* ════════════ HEADER — dark navy ════════════ */}
      <header className="no-print" style={{
        background: 'var(--navy-800)',
        width: '100%',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
      }}>

        {/* Top bar: logo + status + mobile hamburger button */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.65rem 1.25rem',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '38px', height: '38px', borderRadius: '50%',
              border: '2px solid var(--crimson-light)',
              background: 'rgba(201,51,75,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Microscope style={{ width: '18px', height: '18px', color: 'var(--crimson-light)' }} />
            </div>
            <div>
              <div style={{
                fontWeight: 800,
                fontSize: '1rem',
                color: '#ffffff',
                lineHeight: 1.15,
                letterSpacing: '-0.01em',
              }}>
                UTI-Predict
              </div>
              <div style={{
                fontSize: '0.58rem',
                color: 'rgba(255,255,255,0.4)',
                fontWeight: 500,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}>
                GA-GWO Hybrid Clinical Support
              </div>
            </div>
          </div>

          {/* Right Header items */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Status indicators (desktop) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <div
                className="animate-pulse-gentle"
                style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#4ade80' }}
              />
              <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.65)', fontWeight: 500 }}>
                Model Online
              </span>
            </div>
            <div className="desktop-only-block" style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>
              AUC 0.946
            </div>

            {/* Mobile Hamburger Button */}
            <button
              className="mobile-only"
              onClick={() => setMobileMenuOpen(prev => !prev)}
              type="button"
              aria-label="Toggle navigation menu"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '8px',
                padding: '0.45rem',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {mobileMenuOpen
                ? <X style={{ width: '20px', height: '20px', color: 'var(--crimson-light)' }} />
                : <Menu style={{ width: '20px', height: '20px' }} />
              }
            </button>
          </div>
        </div>

        {/* Desktop Horizontal tab nav (hidden on mobile) */}
        <nav className="desktop-only-block" style={{
          padding: '0 1.25rem',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            {tabs.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => switchTab(key)}
                className={`nav-tab${activeTab === key ? ' active' : ''}`}
              >
                {label}
              </button>
            ))}
          </div>
        </nav>
      </header>

      {/* ════════════ MOBILE NAVIGATION DRAWER & OVERLAY ════════════ */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop overlay */}
          <div
            className="mobile-only no-print"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(14, 18, 32, 0.75)',
              backdropFilter: 'blur(4px)',
              zIndex: 80,
            }}
          />
          {/* Mobile slide-down menu */}
          <div
            className="mobile-only no-print animate-slide-in-down"
            style={{
              position: 'fixed',
              top: '57px',
              left: 0,
              right: 0,
              zIndex: 90,
              background: 'var(--navy-900)',
              borderBottom: '1px solid rgba(255,255,255,0.12)',
              padding: '0.75rem 1rem 1rem 1rem',
              boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
            }}
          >
            <div style={{
              fontSize: '0.65rem',
              fontWeight: 700,
              color: 'rgba(255,255,255,0.4)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: '0.65rem',
              paddingLeft: '0.5rem',
            }}>
              Navigation Menu
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {tabs.map(({ key, label }) => {
                const isActive = activeTab === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => switchTab(key)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      borderRadius: '0.5rem',
                      border: isActive ? '1px solid var(--crimson-border)' : '1px solid transparent',
                      background: isActive ? 'var(--crimson-bg)' : 'rgba(255,255,255,0.03)',
                      color: isActive ? '#ffffff' : 'rgba(255,255,255,0.7)',
                      fontSize: '0.9rem',
                      fontWeight: isActive ? 700 : 500,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s',
                    }}
                  >
                    <span>{label}</span>
                    {isActive && (
                      <ChevronRight style={{ width: '16px', height: '16px', color: 'var(--crimson-light)' }} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* ════════════ MAIN CONTENT ════════════ */}
      <main style={{
        flex: 1,
        padding: '1.75rem 1.25rem 3rem 1.25rem',
        maxWidth: '960px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
      }}>

        {/* ─── PATIENT INPUT ─── */}
        {activeTab === 'input' && (
          <div className="animate-fade-in">
            {/* Page heading + completion bar */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
              marginBottom: '1.5rem',
            }}>
              <div>
                <h1 style={{
                  fontSize: '1.6rem',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  marginBottom: '0.25rem',
                }}>
                  Patient Clinical Data
                </h1>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Complete the urinalysis and clinical parameters below
                </p>
              </div>

              {/* Form completion progress */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                  Form completion
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  <div className="progress-bar-track">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${formCompletionPct}%` }}
                    />
                  </div>
                  <span style={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    minWidth: '32px',
                  }}>
                    {formCompletionPct}%
                  </span>
                </div>
              </div>
            </div>

            <PatientForm
              onSubmit={handleFormSubmit}
              isLoading={loading}
              onCompletionChange={setFormCompletionPct}
            />

            {error && (
              <div className="animate-scale-in" style={{
                marginTop: '1rem',
                padding: '0.75rem 1rem',
                background: 'rgba(220,38,38,0.06)',
                border: '1px solid rgba(220,38,38,0.25)',
                borderRadius: '0.625rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}>
                <AlertCircle style={{ width: '16px', height: '16px', color: '#dc2626', flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 700, color: '#dc2626', fontSize: '0.82rem' }}>Analysis Error</div>
                  <div style={{ color: '#b91c1c', fontSize: '0.78rem', marginTop: '0.1rem' }}>{error}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── PREDICTION RESULT ─── */}
        {activeTab === 'result' && (
          <div className="animate-fade-in">
            <div style={{ marginBottom: '1.5rem' }}>
              <h1 style={{
                fontSize: '1.6rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
                marginBottom: '0.25rem',
              }}>
                Prediction Result
              </h1>
            </div>
            {activeResult ? (
              <PredictionResult result={activeResult} onNewPrediction={handleNewPrediction} />
            ) : (
              <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔬</div>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
                  No prediction yet. Run a patient analysis to see results here.
                </p>
                <button
                  onClick={() => switchTab('input')}
                  className="btn btn-run"
                  type="button"
                >
                  Start Patient Input
                </button>
              </div>
            )}
          </div>
        )}

        {/* ─── MODEL ANALYTICS ─── */}
        {/* {activeTab === 'analytics' && (
          <div className="animate-fade-in">
            <ModelAnalytics />
          </div>
        )} */}

        {/* ─── ABOUT ─── */}
        {activeTab === 'about' && (
          <div className="animate-fade-in">
            <AboutPage />
          </div>
        )}

      </main>
    </div>
  );
}

export default App;