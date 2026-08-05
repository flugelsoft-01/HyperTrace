import React from 'react';
import { Shipment, ShipmentStatus } from '../types';
import { Compass, Navigation, MapPin, AlertTriangle, ShieldCheck } from 'lucide-react';

interface WorldMapProps {
  shipment: Shipment;
}

export const WorldMap: React.FC<WorldMapProps> = ({ shipment }) => {
  const width = 720;
  const height = 280;

  // Convert Lat/Long to SVG Canvas (Equirectangular Projection)
  const mapCoords = (lat: number, long: number) => {
    // Lat range -90..90 -> height..0
    // Long range -180..180 -> 0..width
    const x = ((long + 180) / 360) * width;
    const y = ((90 - lat) / 180) * height;
    return { x, y };
  };

  const locationPoints = shipment.locationHistory.map((loc) => {
    const lat = loc.latitude ?? 52.52;
    const long = loc.longitude ?? 13.40;
    return { ...loc, ...mapCoords(lat, long), lat, long };
  });

  const currentLat = shipment.currentLat ?? (locationPoints[locationPoints.length - 1]?.lat || 52.52);
  const currentLong = shipment.currentLong ?? (locationPoints[locationPoints.length - 1]?.long || 13.40);
  const currentPos = mapCoords(currentLat, currentLong);

  const pathPoints = locationPoints.map((p) => `${p.x},${p.y}`).join(' ');

  const geofence = shipment.geofence;
  let gfBox = null;
  if (geofence) {
    const pMin = mapCoords(geofence.maxLat, geofence.minLong);
    const pMax = mapCoords(geofence.minLat, geofence.maxLong);
    gfBox = {
      x: pMin.x,
      y: pMin.y,
      w: Math.max(20, pMax.x - pMin.x),
      h: Math.max(20, pMax.y - pMin.y)
    };
  }

  const isCompromised = shipment.status === ShipmentStatus.COMPROMISED;

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Compass size={20} color="#06b6d4" />
          <h3 style={{ fontSize: '1.05rem', color: '#f8fafc' }}>
            Interactive GPS Transit Route & Geofence Corridor
          </h3>
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Navigation size={14} color="#38bdf8" />
          GPS: <strong style={{ color: '#f8fafc' }}>{currentLat.toFixed(4)}° N, {currentLong.toFixed(4)}° E</strong>
        </div>
      </div>

      <div style={{ width: '100%', overflowX: 'auto', borderRadius: '12px', background: 'rgba(5, 10, 20, 0.85)', position: 'relative' }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto' }}>
          {/* Subtle World Map Grid Lines */}
          <line x1={0} y1={height / 2} x2={width} y2={height / 2} stroke="rgba(255, 255, 255, 0.06)" strokeDasharray="4 4" />
          <line x1={width / 2} y1={0} x2={width / 2} y2={height} stroke="rgba(255, 255, 255, 0.06)" strokeDasharray="4 4" />

          {/* Continents Outline Path */}
          <path
            d="M120,80 Q180,60 220,100 T180,180 T100,120 Z M380,70 Q450,50 520,80 T560,140 T460,180 T380,120 Z M560,180 Q620,160 680,200 T620,240 Z M220,190 Q260,210 240,260 T200,240 Z"
            fill="rgba(59, 130, 246, 0.04)"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="1"
          />

          {/* Geofence Boundary Box */}
          {gfBox && (
            <g>
              <rect
                x={gfBox.x}
                y={gfBox.y}
                width={gfBox.w}
                height={gfBox.h}
                fill="rgba(6, 182, 212, 0.08)"
                stroke="#06b6d4"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                rx="6"
              />
              <text x={gfBox.x + 6} y={gfBox.y + 14} fill="#06b6d4" fontSize="9" fontFamily="sans-serif">
                Authorized Geofence Corridor
              </text>
            </g>
          )}

          {/* Polyline Route */}
          {locationPoints.length > 1 && (
            <polyline
              fill="none"
              stroke={isCompromised ? '#f43f5e' : '#3b82f6'}
              strokeWidth="2.5"
              points={pathPoints}
              strokeDasharray="6 4"
            />
          )}

          {/* Location Nodes */}
          {locationPoints.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r={4} fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
              <text x={p.x} y={p.y - 8} fill="#94a3b8" fontSize="9" textAnchor="middle">
                {p.location.split(',')[0]}
              </text>
            </g>
          ))}

          {/* Live Vessel/Vehicle Pulse Marker */}
          <g transform={`translate(${currentPos.x}, ${currentPos.y})`}>
            <circle r="12" fill={isCompromised ? 'rgba(244, 63, 94, 0.25)' : 'rgba(16, 185, 129, 0.25)'}>
              <animate attributeName="r" values="6;16;6" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle r="6" fill={isCompromised ? '#f43f5e' : '#10b981'} stroke="#ffffff" strokeWidth="2" />
          </g>
        </svg>
      </div>

      <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
        <div style={{ color: 'var(--text-muted)' }}>
          Origin: <strong style={{ color: '#f8fafc' }}>{shipment.origin}</strong> → Destination: <strong style={{ color: '#f8fafc' }}>{shipment.destination}</strong>
        </div>
        {isCompromised ? (
          <span style={{ color: '#fb7185', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <AlertTriangle size={14} /> Geofence or Telemetry Alert Triggered
          </span>
        ) : (
          <span style={{ color: '#34d399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={14} /> In Authorized Transit Corridor
          </span>
        )}
      </div>
    </div>
  );
};
