import React, { useEffect, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { RocPoint } from '../services/predictionApi';

interface RocCurveChartProps {
  rocData: RocPoint[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const rocEntry = payload.find((p: any) => p.dataKey === 'tpr');
    const diagEntry = payload.find((p: any) => p.dataKey === 'diag');
    return (
      <div style={{
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '0.65rem 0.875rem',
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        minWidth: '150px',
      }}>
        <p style={{ fontWeight: 700, color: '#6b7280', fontSize: '0.7rem', marginBottom: '0.4rem' }}>
          FPR: {payload[0]?.payload?.fpr}%
        </p>
        {rocEntry && (
          <p style={{ fontSize: '0.78rem', color: '#c9334b', fontWeight: 600 }}>
            Model TPR: <span style={{ color: '#1a1a2e' }}>{rocEntry.value}%</span>
          </p>
        )}
        {diagEntry && (
          <p style={{ fontSize: '0.78rem', color: '#9ca3af', fontWeight: 600 }}>
            Random: <span style={{ color: '#6b7280' }}>{diagEntry.value}%</span>
          </p>
        )}
      </div>
    );
  }
  return null;
};


const RocCurveChart: React.FC<RocCurveChartProps> = ({ rocData }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 520);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate AUC
  let auc = 0;
  for (let i = 0; i < rocData.length - 1; i++) {
    auc += ((rocData[i + 1].fpr - rocData[i].fpr) * (rocData[i].tpr + rocData[i + 1].tpr)) / 2;
  }

  // Merge ROC data and diagonal into unified dataset to avoid the dual-data bug
  const allFPR = Array.from(new Set([
    ...rocData.map(p => Math.round(p.fpr * 100)),
    0, 20, 40, 60, 80, 100,
  ])).sort((a, b) => a - b);

  // Build a lookup for ROC tpr by fpr
  const rocMap = new Map(rocData.map(p => [Math.round(p.fpr * 100), Math.round(p.tpr * 100)]));

  // Interpolate ROC tpr for each FPR point
  const chartData = allFPR.map(fpr => {
    let tpr: number;
    if (rocMap.has(fpr)) {
      tpr = rocMap.get(fpr)!;
    } else {
      const sorted = rocData.map(p => ({ fpr: Math.round(p.fpr * 100), tpr: Math.round(p.tpr * 100) }));
      const lower = sorted.filter(p => p.fpr <= fpr).pop();
      const upper = sorted.find(p => p.fpr >= fpr);
      if (lower && upper && lower.fpr !== upper.fpr) {
        const ratio = (fpr - lower.fpr) / (upper.fpr - lower.fpr);
        tpr = Math.round(lower.tpr + ratio * (upper.tpr - lower.tpr));
      } else {
        tpr = lower?.tpr ?? upper?.tpr ?? fpr;
      }
    }
    return { fpr, tpr, diag: fpr };
  });

  return (
    <div>
      {/* AUC Badge Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>ROC Curve — Discrimination Performance</div>
        <div style={{
          padding: '0.25rem 0.75rem',
          borderRadius: '999px',
          background: 'rgba(201,51,75,0.08)',
          border: '1px solid rgba(201,51,75,0.25)',
          fontSize: '0.78rem', fontWeight: 800, color: 'var(--crimson)',
        }}>
          AUC = {auc.toFixed(3)}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={isMobile ? 240 : 280}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: isMobile ? -15 : 0, bottom: 15 }}>
          <defs>
            <linearGradient id="rocFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#c9334b" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#c9334b" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="diagFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#9ca3af" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#9ca3af" stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
          <XAxis
            dataKey="fpr"
            type="number"
            domain={[0, 100]}
            ticks={[0, 20, 40, 60, 80, 100]}
            tick={{ fontSize: 9, fill: '#6b7280' }}
            tickLine={false}
            axisLine={{ stroke: 'rgba(0,0,0,0.08)' }}
            label={isMobile ? undefined : { value: 'False Positive Rate (%)', position: 'insideBottom', offset: -10, fill: '#6b7280', fontSize: 10 }}
          />
          <YAxis
            type="number"
            domain={[0, 100]}
            ticks={[0, 20, 40, 60, 80, 100]}
            tick={{ fontSize: 9, fill: '#6b7280' }}
            tickLine={false}
            axisLine={{ stroke: 'rgba(0,0,0,0.08)' }}
            label={isMobile ? undefined : { value: 'True Positive Rate (%)', angle: -90, position: 'insideLeft', offset: 10, fill: '#6b7280', fontSize: 10 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '10px', color: '#64748b', paddingTop: '0.25rem' }}
          />
          {/* Diagonal (random classifier) */}
          <Area
            type="monotone"
            dataKey="diag"
            stroke="#d1d5db"
            strokeWidth={1}
            strokeDasharray="5 4"
            fill="url(#diagFill)"
            dot={false}
            name="Random (AUC = 0.50)"
            isAnimationActive={false}
          />
          {/* Model ROC curve */}
          <Area
            type="monotone"
            dataKey="tpr"
            stroke="#c9334b"
            strokeWidth={2.5}
            fill="url(#rocFill)"
            dot={false}
            name={`Model ROC (AUC = ${auc.toFixed(3)})`}
            animationDuration={1200}
            animationBegin={200}
          />
        </AreaChart>
      </ResponsiveContainer>

      <div style={{
        marginTop: '0.75rem',
        padding: '0.65rem 0.875rem',
        background: 'rgba(201,51,75,0.05)',
        border: '1px solid rgba(201,51,75,0.15)',
        borderRadius: '8px',
        display: 'flex',
        gap: '0.5rem',
        alignItems: 'flex-start',
      }}>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          <span style={{ fontWeight: 700, color: 'var(--crimson)' }}>AUC = {auc.toFixed(3)}</span> — Score closer to 1.0 indicates
          superior discrimination. The dashed diagonal represents random guessing (AUC = 0.50).
        </div>
      </div>
    </div>
  );
};

export default RocCurveChart;
