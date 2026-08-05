import React from 'react';
import { TemperatureReading } from '../types';
import { Thermometer, AlertCircle, ShieldAlert } from 'lucide-react';

interface TelemetryChartProps {
  readings: TemperatureReading[];
  minThreshold: number;
  maxThreshold: number;
  shipmentId: string;
}

export const TelemetryChart: React.FC<TelemetryChartProps> = ({
  readings,
  minThreshold,
  maxThreshold,
  shipmentId
}) => {
  if (!readings || readings.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <Thermometer size={32} color="#60a5fa" style={{ marginBottom: '10px' }} />
        <p>No IoT telemetry recorded yet for {shipmentId}</p>
        <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>
          Safe Threshold Band: [{minThreshold}°C to {maxThreshold}°C]
        </p>
      </div>
    );
  }

  const values = readings.map((r) => r.temperature);
  const minVal = Math.min(...values, minThreshold - 5);
  const maxVal = Math.max(...values, maxThreshold + 5);
  const range = maxVal - minVal || 1;

  const width = 600;
  const height = 180;
  const padding = 30;

  const getX = (index: number) => {
    if (readings.length === 1) return width / 2;
    return padding + (index / (readings.length - 1)) * (width - 2 * padding);
  };

  const getY = (temp: number) => {
    return height - padding - ((temp - minVal) / range) * (height - 2 * padding);
  };

  const points = readings.map((r, i) => `${getX(i)},${getY(r.temperature)}`).join(' ');

  const maxY = getY(maxThreshold);
  const minY = getY(minThreshold);

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Thermometer size={20} color="#3b82f6" />
          <h3 style={{ fontSize: '1.05rem', color: '#f8fafc' }}>IoT Cold-Chain Telemetry Monitor</h3>
        </div>
        <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '10px', height: '10px', background: 'rgba(244, 63, 94, 0.4)', borderRadius: '2px' }}></span>
            Threshold [{minThreshold}°C - {maxThreshold}°C]
          </span>
        </div>
      </div>

      <div style={{ width: '100%', overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
          {/* Threshold safe region */}
          <rect
            x={padding}
            y={maxY}
            width={width - 2 * padding}
            height={Math.max(0, minY - maxY)}
            fill="rgba(16, 185, 129, 0.08)"
            stroke="rgba(16, 185, 129, 0.2)"
            strokeDasharray="4 4"
          />

          {/* Threshold Lines */}
          <line x1={padding} y1={maxY} x2={width - padding} y2={maxY} stroke="#f43f5e" strokeDasharray="3 3" opacity="0.6" />
          <line x1={padding} y1={minY} x2={width - padding} y2={minY} stroke="#3b82f6" strokeDasharray="3 3" opacity="0.6" />

          {/* Threshold Labels */}
          <text x={width - padding + 5} y={maxY + 4} fill="#f43f5e" fontSize="10" fontFamily="sans-serif">Max {maxThreshold}°C</text>
          <text x={width - padding + 5} y={minY + 4} fill="#3b82f6" fontSize="10" fontFamily="sans-serif">Min {minThreshold}°C</text>

          {/* Data Polyline */}
          {readings.length > 1 && (
            <polyline
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2.5"
              points={points}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data Nodes */}
          {readings.map((r, i) => {
            const x = getX(i);
            const y = getY(r.temperature);
            const isBreach = r.temperature > maxThreshold || r.temperature < minThreshold;

            return (
              <g key={i}>
                <circle
                  cx={x}
                  cy={y}
                  r={isBreach ? 6 : 4}
                  fill={isBreach ? '#f43f5e' : '#10b981'}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
                <text
                  x={x}
                  y={y - 10}
                  fill={isBreach ? '#fb7185' : '#f8fafc'}
                  fontSize="10"
                  fontWeight={isBreach ? 'bold' : 'normal'}
                  textAnchor="middle"
                >
                  {r.temperature}°C
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        <span>Total Samples: {readings.length}</span>
        <span>Latest Reading: <strong style={{ color: '#f8fafc' }}>{readings[readings.length - 1].temperature}°C</strong> ({new Date(readings[readings.length - 1].timestamp).toLocaleTimeString()})</span>
      </div>
    </div>
  );
};
