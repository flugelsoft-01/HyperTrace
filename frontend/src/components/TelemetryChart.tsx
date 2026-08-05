import React from 'react';
import { SensorTelemetry } from '../types';
import { Thermometer, Droplets, Zap, Eye, ShieldAlert } from 'lucide-react';

interface TelemetryChartProps {
  readings: SensorTelemetry[];
  minThreshold: number;
  maxThreshold: number;
  maxHumidity: number;
  maxShock: number;
  maxLight: number;
  shipmentId: string;
}

export const TelemetryChart: React.FC<TelemetryChartProps> = ({
  readings,
  minThreshold,
  maxThreshold,
  maxHumidity,
  maxShock,
  maxLight,
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

  const latest = readings[readings.length - 1];

  const values = readings.map((r) => r.temperature);
  const minVal = Math.min(...values, minThreshold - 5);
  const maxVal = Math.max(...values, maxThreshold + 5);
  const range = maxVal - minVal || 1;

  const width = 680;
  const height = 170;
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Thermometer size={20} color="#3b82f6" />
          <h3 style={{ fontSize: '1.05rem', color: '#f8fafc' }}>Multi-Sensor IoT Telemetry Suite</h3>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Sensors Active: Temp (°C) • Humidity (%) • Shock (G) • Light (Lux)
        </div>
      </div>

      {/* Multi-Sensor Gauges Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        <div style={{ background: 'rgba(59, 130, 246, 0.08)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Thermometer size={14} color="#3b82f6" /> Temperature
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 700, color: latest.temperature > maxThreshold || latest.temperature < minThreshold ? '#fb7185' : '#34d399', marginTop: '2px' }}>
            {latest.temperature.toFixed(1)} °C
          </div>
        </div>

        <div style={{ background: 'rgba(6, 182, 212, 0.08)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Droplets size={14} color="#06b6d4" /> Relative Humidity
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 700, color: latest.humidity > maxHumidity ? '#fb7185' : '#38bdf8', marginTop: '2px' }}>
            {latest.humidity.toFixed(1)} %
          </div>
        </div>

        <div style={{ background: 'rgba(245, 158, 11, 0.08)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Zap size={14} color="#f59e0b" /> Shock Impact G-Force
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 700, color: latest.shockGForce > maxShock ? '#fb7185' : '#fbbf24', marginTop: '2px' }}>
            {latest.shockGForce.toFixed(1)} G
          </div>
        </div>

        <div style={{ background: 'rgba(139, 92, 246, 0.08)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Eye size={14} color="#8b5cf6" /> Container Light Seal
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 700, color: latest.lightExposureLux > maxLight ? '#fb7185' : '#a78bfa', marginTop: '2px' }}>
            {latest.lightExposureLux > maxLight ? 'SEAL BREACH' : 'SECURE'}
          </div>
        </div>
      </div>

      {/* SVG Temperature Polyline Chart */}
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

          <line x1={padding} y1={maxY} x2={width - padding} y2={maxY} stroke="#f43f5e" strokeDasharray="3 3" opacity="0.6" />
          <line x1={padding} y1={minY} x2={width - padding} y2={minY} stroke="#3b82f6" strokeDasharray="3 3" opacity="0.6" />

          <text x={width - padding + 5} y={maxY + 4} fill="#f43f5e" fontSize="10" fontFamily="sans-serif">Max {maxThreshold}°C</text>
          <text x={width - padding + 5} y={minY + 4} fill="#3b82f6" fontSize="10" fontFamily="sans-serif">Min {minThreshold}°C</text>

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
        <span>Telemetry Records: {readings.length} Samples</span>
        <span>Latest Sample: {new Date(latest.timestamp).toLocaleTimeString()}</span>
      </div>
    </div>
  );
};
