import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';

interface TextInputProps {
  label: string;
  sublabel?: string;
  type?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  tooltip?: string;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  placeholder?: string;
  unit?: string;
}

const TextInput: React.FC<TextInputProps> = ({
  label,
  sublabel,
  type = 'text',
  value,
  onChange,
  error,
  required,
  tooltip,
  min,
  max,
  step,
  placeholder,
  unit,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
      <label style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem',
        fontSize: '0.78rem',
        fontWeight: 500,
        color: 'var(--text-label)',
      }}>
        {label}
        {sublabel && (
          <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '0.7rem' }}>
            {sublabel}
          </span>
        )}
        {required && <span style={{ color: 'var(--crimson)', marginLeft: '1px' }}>*</span>}
        {tooltip && (
          <div style={{ position: 'relative', display: 'inline-flex' }}>
            <button
              type="button"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              onClick={() => setShowTooltip(!showTooltip)}
              style={{ color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
              aria-label={`Help: ${label}`}
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 2.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm-.5 3.5h1v4h-1V7z"/>
              </svg>
            </button>
            {showTooltip && (
              <div className="tooltip-popup animate-fade-in">
                {tooltip}
              </div>
            )}
          </div>
        )}
      </label>

      <div style={{ position: 'relative', width: '100%' }}>
        <input
          type={type}
          value={value}
          onChange={onChange}
          min={min}
          max={max}
          step={step}
          placeholder={placeholder}
          className={`input-field${error ? ' input-error' : ''}`}
          style={unit ? { paddingRight: '3.5rem' } : undefined}
        />
        {unit && (
          <div style={{
            position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
            fontSize: '0.72rem', color: '#9ca3af', fontWeight: 500, pointerEvents: 'none',
          }}>
            {unit}
          </div>
        )}
      </div>

      {error && (
        <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#dc2626' }}>
          <AlertCircle style={{ width: '12px', height: '12px', flexShrink: 0 }} />
          <span style={{ fontSize: '0.72rem', fontWeight: 500 }}>{error}</span>
        </div>
      )}
    </div>
  );
};

export default TextInput;
