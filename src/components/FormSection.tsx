import React from 'react';
import { LucideIcon } from 'lucide-react';

interface FormSectionProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  sectionEmoji?: string;
  accentColor?: string;
  accentBg?: string;
  children: React.ReactNode;
}

const FormSection: React.FC<FormSectionProps> = ({
  title,
  subtitle,
  icon: Icon,
  sectionEmoji,
  accentColor = '#059669',
  accentBg = 'rgba(5,150,105,0.1)',
  children,
}) => {
  return (
    <div
      className="clinical-card animate-scale-in"
      style={{ padding: '1.5rem' }}
    >
      {/* Section Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
        {/* Icon badge */}
        <div style={{
          width: '28px',
          height: '28px',
          borderRadius: '6px',
          background: accentBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          fontSize: '0.9rem',
        }}>
          {sectionEmoji ? (
            <span>{sectionEmoji}</span>
          ) : Icon ? (
            <Icon style={{ width: '15px', height: '15px', color: accentColor }} />
          ) : null}
        </div>
        <h2 style={{
          fontSize: '1.05rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          lineHeight: 1.2,
        }}>
          {title}
        </h2>
      </div>

      {subtitle && (
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem', marginTop: '-0.75rem' }}>
          {subtitle}
        </p>
      )}

      {children}
    </div>
  );
};

export default FormSection;
