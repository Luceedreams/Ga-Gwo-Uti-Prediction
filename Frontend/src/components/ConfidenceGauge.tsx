import React, { useEffect, useState } from 'react';

interface ConfidenceGaugeProps {
  confidence: number;
  isPositive: boolean;
}

const ConfidenceGauge: React.FC<ConfidenceGaugeProps> = ({ confidence, isPositive }) => {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setAnimatedValue(confidence), 150);
    return () => clearTimeout(t);
  }, [confidence]);

  // Crimson for positive, green for negative
  const ringColor    = isPositive ? '#c9334b' : '#16a34a';
  const ringGlow     = isPositive ? 'rgba(201,51,75,0.35)' : 'rgba(22,163,74,0.35)';
  const trackColor   = isPositive ? 'rgba(201,51,75,0.12)' : 'rgba(22,163,74,0.12)';
  const textColor    = isPositive ? '#c9334b' : '#16a34a';

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const filled = (animatedValue / 100) * circumference;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.75rem',
    }}>
      {/* SVG Circular Gauge */}
      <div style={{ position: 'relative', width: '170px', height: '170px' }}>
        <svg
          width="170"
          height="170"
          style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}
        >
          <defs>
            <filter id="gaugeGlow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* Track */}
          <circle
            cx="85" cy="85" r={radius}
            fill="none"
            stroke={trackColor}
            strokeWidth="12"
          />
          {/* Progress ring */}
          <circle
            cx="85" cy="85" r={radius}
            fill="none"
            stroke={ringColor}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${filled} ${circumference}`}
            className="gauge-progress"
            style={{ filter: `drop-shadow(0 0 8px ${ringGlow})` }}
          />
        </svg>

        {/* Center Content */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: '1px',
        }}>
          <div style={{
            fontSize: '2.2rem',
            fontWeight: 900,
            color: textColor,
            lineHeight: 1,
            fontVariantNumeric: 'tabular-nums',
          }}>
            {animatedValue}%
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            confidence
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfidenceGauge;
