import React from 'react';
import { Check } from 'lucide-react';

interface CheckboxInputProps {
  label: string;
  sublabel?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  tooltip?: string;
}

const CheckboxInput: React.FC<CheckboxInputProps> = ({
  label,
  sublabel,
  checked,
  onChange,
}) => {
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.625rem',
        cursor: 'pointer',
        padding: '0.75rem 0.875rem',
        borderRadius: '0.5rem',
        border: `1px solid ${checked ? 'rgba(201,51,75,0.3)' : 'var(--card-border)'}`,
        background: checked ? 'rgba(201,51,75,0.05)' : '#ffffff',
        transition: 'all 0.18s',
        width: '100%',
      }}
    >
      {/* Custom checkbox */}
      <div style={{ position: 'relative', paddingTop: '2px', flexShrink: 0 }}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div style={{
          width: '18px',
          height: '18px',
          borderRadius: '4px',
          border: `2px solid ${checked ? 'var(--crimson)' : '#d1d5db'}`,
          background: checked ? 'var(--crimson)' : '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.18s',
        }}>
          {checked && <Check style={{ width: '11px', height: '11px', color: 'white' }} strokeWidth={3} />}
        </div>
      </div>

      {/* Label area */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h4 style={{
          fontSize: '0.84rem',
          fontWeight: 600,
          color: checked ? 'var(--text-primary)' : 'var(--text-secondary)',
          lineHeight: 1.3,
          transition: 'color 0.18s',
        }}>
          {label}
        </h4>
        {sublabel && (
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem', lineHeight: 1.35 }}>
            {sublabel}
          </p>
        )}
      </div>
    </label>
  );
};

export default CheckboxInput;
