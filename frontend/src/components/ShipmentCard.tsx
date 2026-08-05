import React from 'react';
import { Shipment, ShipmentStatus } from '../types';
import { Truck, MapPin, Thermometer, User, Clock, AlertTriangle, ShieldCheck, CheckCircle2, History } from 'lucide-react';

interface ShipmentCardProps {
  shipment: Shipment;
  isSelected: boolean;
  onSelect: (shipment: Shipment) => void;
}

export const ShipmentCard: React.FC<ShipmentCardProps> = ({
  shipment,
  isSelected,
  onSelect
}) => {
  const latestTemp = shipment.telemetryHistory && shipment.telemetryHistory.length > 0
    ? shipment.telemetryHistory[shipment.telemetryHistory.length - 1].temperature
    : null;

  const renderStatusBadge = (status: ShipmentStatus) => {
    switch (status) {
      case ShipmentStatus.CREATED:
        return <span className="badge badge-created"><Clock size={12} /> Created</span>;
      case ShipmentStatus.IN_TRANSIT:
        return <span className="badge badge-intransit"><Truck size={12} /> In Transit</span>;
      case ShipmentStatus.DELIVERED:
        return <span className="badge badge-delivered"><CheckCircle2 size={12} /> Delivered</span>;
      case ShipmentStatus.COMPROMISED:
        return <span className="badge badge-compromised"><AlertTriangle size={12} /> Compromised</span>;
    }
  };

  return (
    <div
      onClick={() => onSelect(shipment)}
      className="glass-panel"
      style={{
        padding: '20px',
        cursor: 'pointer',
        borderColor: isSelected ? 'var(--accent-blue)' : 'var(--border-card)',
        boxShadow: isSelected ? '0 0 20px rgba(59, 130, 246, 0.25)' : 'none',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {isSelected && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)'
        }} />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
        <div>
          <span className="mono-text" style={{ fontSize: '1rem', fontWeight: 700, color: '#38bdf8' }}>
            {shipment.id}
          </span>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Owner: <strong style={{ color: '#e2e8f0' }}>{shipment.owner}</strong>
          </div>
        </div>
        {renderStatusBadge(shipment.status)}
      </div>

      {/* Origin -> Destination Route */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.25)',
        borderRadius: '10px',
        padding: '10px 14px',
        marginBottom: '14px',
        fontSize: '0.85rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <MapPin size={14} color="#10b981" />
          <span style={{ color: 'var(--text-muted)' }}>From:</span>
          <span style={{ fontWeight: 500 }}>{shipment.origin}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MapPin size={14} color="#f43f5e" />
          <span style={{ color: 'var(--text-muted)' }}>To:</span>
          <span style={{ fontWeight: 500 }}>{shipment.destination}</span>
        </div>
      </div>

      {/* Grid Specs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.8rem' }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '8px 12px', borderRadius: '8px' }}>
          <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Truck size={12} color="#60a5fa" /> Carrier
          </div>
          <div style={{ fontWeight: 600, marginTop: '2px', color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {shipment.carrier}
          </div>
        </div>

        <div style={{
          background: shipment.status === ShipmentStatus.COMPROMISED ? 'rgba(244, 63, 94, 0.1)' : 'rgba(255, 255, 255, 0.03)',
          padding: '8px 12px',
          borderRadius: '8px'
        }}>
          <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Thermometer size={12} color={shipment.status === ShipmentStatus.COMPROMISED ? '#f43f5e' : '#10b981'} />
            Latest Temp
          </div>
          <div style={{
            fontWeight: 700,
            marginTop: '2px',
            color: latestTemp !== null
              ? (latestTemp > shipment.maxTempThreshold || latestTemp < shipment.minTempThreshold ? '#fb7185' : '#34d399')
              : 'var(--text-muted)'
          }}>
            {latestTemp !== null ? `${latestTemp.toFixed(1)} °C` : 'No reading'}
          </div>
        </div>
      </div>
    </div>
  );
};
