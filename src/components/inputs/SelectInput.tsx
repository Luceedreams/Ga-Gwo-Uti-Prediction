import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectInputProps {
  label: string;
  sublabel?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  required?: boolean;
  tooltip?: string;
}

const SelectInput: React.FC<SelectInputProps> = ({
  label,
  sublabel,
  value,
  onChange,
  options,
  placeholder,
  error,
  required,
  tooltip,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

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
        <select
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`input-field${error ? ' input-error' : ''}`}
          style={{ appearance: 'none', cursor: 'pointer', paddingRight: '2.25rem' }}
        >
          {placeholder && (
            <option value="" disabled hidden>{placeholder}</option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <div style={{
          position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
          pointerEvents: 'none',
        }}>
          <ChevronDown style={{
            width: '14px', height: '14px',
            color: isFocused ? 'var(--crimson)' : '#9ca3af',
            transition: 'color 0.18s',
          }} />
        </div>
      </div>

      {error && (
        <div className="animate-fade-in" style={{ color: '#dc2626', fontSize: '0.72rem', fontWeight: 500 }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default SelectInput;
