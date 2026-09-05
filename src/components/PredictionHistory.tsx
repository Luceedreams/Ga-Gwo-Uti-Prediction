import React from 'react';
import type { HistoryEntry } from '../hooks/useHistory';
import {
  Trash2,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Target,
  Activity,
  Archive,
  TrendingUp,
  BarChart3,
  Eye,
  ChevronRight,
  Shield,
  X,
} from 'lucide-react';

interface PredictionHistoryProps {
  entries: HistoryEntry[];
  onRemove: (id: string) => void;
  onClearAll: () => void;
  onSelectEntry: (entry: HistoryEntry) => void;
}

const PredictionHistory: React.FC<PredictionHistoryProps> = ({
  entries,
  onRemove,
  onClearAll,
  onSelectEntry,
}) => {
  if (entries.length === 0) {
    return (
      <div className="animate-fade-in" style={{ textAlign: 'center', padding: '2.5rem 0.5rem' }}>
        <div className="glass-card" style={{ padding: '2rem 1.25rem', maxWidth: '440px', margin: '0 auto' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '16px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem',
          }}>
            <Archive style={{ width: '24px', height: '24px', color: '#334155' }} />
          </div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f1f5f9', marginBottom: '0.5rem' }}>
            No Analysis History
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.55, marginBottom: '1rem' }}>
            Your prediction history will appear here after analyzing patients.
          </p>
          <div style={{
            padding: '0.65rem',
            background: 'rgba(20,184,166,0.07)',
            border: '1px solid rgba(20,184,166,0.2)',
            borderRadius: '0.65rem',
          }}>
            <p style={{ fontSize: '0.7rem', color: '#64748b', lineHeight: 1.45 }}>
              💡 History is <strong style={{ color: '#94a3b8' }}>session-based</strong> and will reset when closing the app for privacy.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const stats = {
    total: entries.length,
    likelyUTI: entries.filter((e) => e.result.prediction === 'likely_uti').length,
    unlikelyUTI: entries.filter((e) => e.result.prediction === 'unlikely_uti').length,
    avgConfidence: Math.round(entries.reduce((sum, e) => sum + e.result.confidence, 0) / entries.length),
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }} className="animate-fade-in">

      {/* ── Header + Stats ── */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 16px rgba(139,92,246,0.3)',
              flexShrink: 0,
            }}>
              <Clock style={{ width: '18px', height: '18px', color: 'white' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f1f5f9' }}>Analysis History</h1>
              <p style={{ fontSize: '0.72rem', color: '#64748b' }}>
                {entries.length} prediction{entries.length !== 1 ? 's' : ''} in session
              </p>
            </div>
          </div>

          <button
            onClick={onClearAll}
            className="btn btn-secondary"
            style={{ padding: '0.35rem 0.75rem', gap: '0.3rem', fontSize: '0.75rem', minHeight: '34px' }}
            type="button"
          >
            <Trash2 style={{ width: '12px', height: '12px' }} />
            Clear All
          </button>
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '0.5rem' }}>
          {[
            { label: 'Total',      value: stats.total,         color: '#22d3ee', icon: Activity },
            { label: 'Positive',   value: stats.likelyUTI,     color: '#f87171', icon: TrendingUp },
            { label: 'Negative',   value: stats.unlikelyUTI,   color: '#4ade80', icon: CheckCircle },
            { label: 'Avg. Conf.', value: `${stats.avgConfidence}%`, color: '#a78bfa', icon: Target },
          ].map(({ label, value, color, icon: Icon }, i) => (
            <div
              key={label}
              className="animate-slide-in-up"
              style={{
                animationDelay: `${i * 0.05}s`,
                padding: '0.65rem 0.5rem',
                background: `${color}0c`,
                border: `1px solid ${color}22`,
                borderRadius: '8px',
                display: 'flex', alignItems: 'center', gap: '0.5rem',
              }}
            >
              <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon style={{ width: '13px', height: '13px', color }} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '1rem', fontWeight: 900, color: '#f1f5f9', lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 500, marginTop: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Entry List ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.15rem' }}>
          <BarChart3 style={{ width: '14px', height: '14px', color: '#6366f1' }} />
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Timeline</span>
        </div>

        {entries.map((entry, index) => {
          const isUTI = entry.result.prediction === 'likely_uti';
          const conf = Math.round(entry.result.confidence);
          const accent = isUTI ? '#f87171' : '#4ade80';
          const accentBg = isUTI ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)';
          const accentBorder = isUTI ? 'rgba(248,113,113,0.2)' : 'rgba(74,222,128,0.2)';

          return (
            <div
              key={entry.id}
              className="animate-slide-in-up"
              style={{
                animationDelay: `${0.08 + index * 0.04}s`,
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '0.875rem',
                padding: '0.875rem 1rem',
                transition: 'all 0.2s',
                position: 'relative',
                width: '100%',
                boxSizing: 'border-box',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', width: '100%' }}>

                {/* Status Icon */}
                <div style={{
                  width: '42px', height: '42px', borderRadius: '12px', flexShrink: 0,
                  background: isUTI ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #22c55e, #16a34a)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 4px 16px ${accentBg}`,
                  position: 'relative',
                  marginTop: '2px',
                }}>
                  {isUTI
                    ? <AlertTriangle style={{ width: '20px', height: '20px', color: 'white' }} />
                    : <CheckCircle style={{ width: '20px', height: '20px', color: 'white' }} />
                  }
                  <div style={{
                    position: 'absolute', top: '-5px', right: '-5px',
                    padding: '0.1rem 0.35rem', borderRadius: '5px',
                    background: conf >= 90 ? '#22c55e' : conf >= 70 ? '#06b6d4' : '#f59e0b',
                    fontSize: '0.6rem', fontWeight: 800, color: 'white',
                    border: '1px solid rgba(10,22,40,0.5)',
                  }}>
                    {conf}%
                  </div>
                </div>

                {/* Info Container */}
                <button
                  onClick={() => onSelectEntry(entry)}
                  type="button"
                  style={{ flex: 1, minWidth: 0, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem', marginBottom: '0.25rem' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: accent }}>
                      {isUTI ? 'UTI Detected' : 'No UTI Detected'}
                    </h3>
                    <span style={{ fontSize: '0.62rem', fontWeight: 700, color: accent, background: `${accent}18`, border: `1px solid ${accentBorder}`, padding: '0.1rem 0.4rem', borderRadius: '4px', flexShrink: 0 }}>
                      #{entries.length - index}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      <User style={{ width: '11px', height: '11px', color: '#475569' }} />
                      {entry.patientData.age}y {entry.patientData.gender === 'female' ? 'Female' : 'Male'}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Calendar style={{ width: '11px', height: '11px', color: '#475569' }} />
                      {entry.timestamp.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Chips */}
                  <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                    {[
                      { label: 'pH', val: entry.patientData.urinePh.toString() },
                      { label: 'LE', val: entry.patientData.leukocyteEsterase.replace('plus', '+') },
                      { label: 'Nitrite', val: entry.patientData.nitrite },
                      { label: 'WBC', val: `${entry.patientData.whiteBloodCell}/μL` },
                    ].map(({ label, val }) => (
                      <div key={label} style={{
                        padding: '0.1rem 0.4rem', borderRadius: '4px',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        fontSize: '0.62rem',
                      }}>
                        <span style={{ color: '#475569' }}>{label}: </span>
                        <span style={{ color: '#94a3b8', fontWeight: 600, textTransform: 'capitalize' }}>{val}</span>
                      </div>
                    ))}
                  </div>
                </button>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0, alignSelf: 'center' }}>
                  <button
                    onClick={() => onSelectEntry(entry)}
                    className="btn btn-ghost"
                    style={{ padding: '0.35rem', borderRadius: '6px', minHeight: 'auto' }}
                    title="View analysis"
                    type="button"
                  >
                    <Eye style={{ width: '14px', height: '14px' }} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onRemove(entry.id); }}
                    className="btn btn-ghost"
                    style={{ padding: '0.35rem', borderRadius: '6px', color: '#475569', minHeight: 'auto' }}
                    title="Delete"
                    type="button"
                  >
                    <X style={{ width: '14px', height: '14px' }} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Privacy Note ── */}
      <div className="glass-card" style={{ padding: '0.75rem 0.875rem', background: 'rgba(255,255,255,0.02)', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
        <Shield style={{ width: '14px', height: '14px', color: '#475569', flexShrink: 0, marginTop: '2px' }} />
        <p style={{ fontSize: '0.68rem', color: '#475569', lineHeight: 1.45 }}>
          Analysis history is stored temporarily in your browser session and will reset when closing the app for privacy.
        </p>
      </div>
    </div>
  );
};

export default PredictionHistory;