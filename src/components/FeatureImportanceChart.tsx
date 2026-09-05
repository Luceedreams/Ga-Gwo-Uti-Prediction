import React from 'react';
import type { FeatureImportance } from '../services/predictionApi';

interface FeatureImportanceChartProps {
  features: FeatureImportance[];
}

const FeatureImportanceChart: React.FC<FeatureImportanceChartProps> = ({ features }) => {
  const chartData = [...features]
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 8)
    .map(f => ({
      name: f.feature,
      weight: Math.round(f.weight * 100),
    }));

  const maxWeight = Math.max(...chartData.map(d => d.weight), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', width: '100%' }}>
      {chartData.map((item, index) => {
        // Gradient from bright crimson → muted for lower importance
        const opacity = 0.45 + (1 - index / chartData.length) * 0.55;
        const barWidth = (item.weight / maxWeight) * 100;

        return (
          <div
            key={item.name}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
          >
            {/* Label */}
            <div style={{
              width: '140px',
              flexShrink: 0,
              fontSize: '0.8rem',
              fontWeight: 500,
              color: 'var(--text-secondary)',
              textAlign: 'right',
              lineHeight: 1.2,
            }}>
              {item.name}
            </div>

            {/* Bar track */}
            <div style={{
              flex: 1,
              height: '20px',
              background: '#f3f0eb',
              borderRadius: '3px',
              overflow: 'hidden',
              position: 'relative',
            }}>
              <div
                className="animate-slide-in-up"
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: `${barWidth}%`,
                  background: `rgba(201,51,75,${opacity})`,
                  borderRadius: '3px',
                  animationDelay: `${index * 0.05}s`,
                  transition: 'width 0.8s cubic-bezier(0.16,1,0.3,1)',
                }}
              />
            </div>

            {/* Percentage */}
            <div style={{
              width: '38px',
              flexShrink: 0,
              fontSize: '0.8rem',
              fontWeight: 700,
              color: 'var(--text-secondary)',
              textAlign: 'right',
            }}>
              {item.weight}%
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FeatureImportanceChart;
