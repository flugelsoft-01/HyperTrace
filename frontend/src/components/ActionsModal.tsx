import React, { useState } from 'react';
import { Shipment } from '../types';
import { X, Plus, MapPin, Thermometer, Truck, Send } from 'lucide-react';

interface ActionsModalProps {
  mode: 'create' | 'location' | 'telemetry' | 'custody' | 'simulator' | null;
  selectedShipment: Shipment | null;
  allShipments: Shipment[];
  onClose: () => void;
  onSubmitCreate: (data: any) => void;
  onSubmitLocation: (id: string, newLocation: string, updatedBy: string) => void;
  onSubmitTelemetry: (id: string, temperature: number, sensorId: string) => void;
  onSubmitCustody: (id: string, newCarrier: string, newOwner: string) => void;
  onRunSimulation: (id: string) => void;
}

export const ActionsModal: React.FC<ActionsModalProps> = ({
  mode,
  selectedShipment,
  allShipments,
  onClose,
  onSubmitCreate,
  onSubmitLocation,
  onSubmitTelemetry,
  onSubmitCustody,
  onRunSimulation
}) => {
  if (!mode) return null;

  // Create form state
  const [createForm, setCreateForm] = useState({
    id: `SHIP-${Math.floor(1000 + Math.random() * 9000)}`,
    origin: 'Amsterdam Airport Schiphol, Netherlands',
    destination: 'Singapore Changi Air Cargo',
    owner: 'Global Biologics Ltd',
    carrier: 'DHL Global Forwarding',
    minTempThreshold: -20,
    maxTempThreshold: 8
  });

  // Location form state
  const [locationForm, setLocationForm] = useState({
    targetId: selectedShipment ? selectedShipment.id : (allShipments[0]?.id || ''),
    newLocation: 'Dubai Cargo Mega Terminal',
    updatedBy: 'Emirates SkyCargo'
  });

  // Telemetry form state
  const [telemetryForm, setTelemetryForm] = useState({
    targetId: selectedShipment ? selectedShipment.id : (allShipments[0]?.id || ''),
    temperature: 4.5,
    sensorId: 'IOT-VAL-882'
  });

  // Custody form state
  const [custodyForm, setCustodyForm] = useState({
    targetId: selectedShipment ? selectedShipment.id : (allShipments[0]?.id || ''),
    newCarrier: 'Kuehne + Nagel Logistics',
    newOwner: 'AsiaPharm Enterprises'
  });

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '540px',
        padding: '28px',
        position: 'relative'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>

        {mode === 'create' && (
          <form onSubmit={(e) => { e.preventDefault(); onSubmitCreate(createForm); }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '18px', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={20} color="#3b82f6" /> Register New Supply Chain Asset
            </h2>

            <div style={{ display: 'grid', gap: '14px' }}>
              <div>
                <label>Shipment Asset ID</label>
                <input
                  value={createForm.id}
                  onChange={(e) => setCreateForm({ ...createForm, id: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label>Origin</label>
                  <input
                    value={createForm.origin}
                    onChange={(e) => setCreateForm({ ...createForm, origin: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label>Destination</label>
                  <input
                    value={createForm.destination}
                    onChange={(e) => setCreateForm({ ...createForm, destination: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label>Owner Organization</label>
                  <input
                    value={createForm.owner}
                    onChange={(e) => setCreateForm({ ...createForm, owner: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label>Carrier / Logistics</label>
                  <input
                    value={createForm.carrier}
                    onChange={(e) => setCreateForm({ ...createForm, carrier: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label>Min Safe Temp (°C)</label>
                  <input
                    type="number"
                    value={createForm.minTempThreshold}
                    onChange={(e) => setCreateForm({ ...createForm, minTempThreshold: parseFloat(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <label>Max Safe Temp (°C)</label>
                  <input
                    type="number"
                    value={createForm.maxTempThreshold}
                    onChange={(e) => setCreateForm({ ...createForm, maxTempThreshold: parseFloat(e.target.value) })}
                    required
                  />
                </div>
              </div>
            </div>

            <div style={{ marginTop: '22px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" className="secondary-btn" onClick={onClose}>Cancel</button>
              <button type="submit" className="glow-btn">Create Asset on Ledger</button>
            </div>
          </form>
        )}

        {mode === 'location' && (
          <form onSubmit={(e) => { e.preventDefault(); onSubmitLocation(locationForm.targetId, locationForm.newLocation, locationForm.updatedBy); }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '18px', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={20} color="#10b981" /> Update Transit Location Checkpoint
            </h2>

            <div style={{ display: 'grid', gap: '14px' }}>
              <div>
                <label>Select Asset ID</label>
                <select
                  value={locationForm.targetId}
                  onChange={(e) => setLocationForm({ ...locationForm, targetId: e.target.value })}
                >
                  {allShipments.map((s) => (
                    <option key={s.id} value={s.id}>{s.id} ({s.currentLocation})</option>
                  ))}
                </select>
              </div>

              <div>
                <label>New Location Checkpoint</label>
                <input
                  value={locationForm.newLocation}
                  onChange={(e) => setLocationForm({ ...locationForm, newLocation: e.target.value })}
                  required
                />
              </div>

              <div>
                <label>Reporting Carrier / Authority</label>
                <input
                  value={locationForm.updatedBy}
                  onChange={(e) => setLocationForm({ ...locationForm, updatedBy: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={{ marginTop: '22px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" className="secondary-btn" onClick={onClose}>Cancel</button>
              <button type="submit" className="glow-btn">Commit Location Transaction</button>
            </div>
          </form>
        )}

        {mode === 'telemetry' && (
          <form onSubmit={(e) => { e.preventDefault(); onSubmitTelemetry(telemetryForm.targetId, telemetryForm.temperature, telemetryForm.sensorId); }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '18px', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Thermometer size={20} color="#06b6d4" /> Log IoT Temperature Sensor Telemetry
            </h2>

            <div style={{ display: 'grid', gap: '14px' }}>
              <div>
                <label>Select Asset ID</label>
                <select
                  value={telemetryForm.targetId}
                  onChange={(e) => setTelemetryForm({ ...telemetryForm, targetId: e.target.value })}
                >
                  {allShipments.map((s) => (
                    <option key={s.id} value={s.id}>{s.id} (Threshold: [{s.minTempThreshold}°C to {s.maxTempThreshold}°C])</option>
                  ))}
                </select>
              </div>

              <div>
                <label>IoT Sensor Reading (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={telemetryForm.temperature}
                  onChange={(e) => setTelemetryForm({ ...telemetryForm, temperature: parseFloat(e.target.value) })}
                  required
                />
              </div>

              <div>
                <label>Sensor Hardware ID</label>
                <input
                  value={telemetryForm.sensorId}
                  onChange={(e) => setTelemetryForm({ ...telemetryForm, sensorId: e.target.value })}
                  required
                />
              </div>

              {/* Quick Preset Buttons */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button
                  type="button"
                  className="secondary-btn"
                  style={{ fontSize: '0.75rem', padding: '6px 10px' }}
                  onClick={() => setTelemetryForm({ ...telemetryForm, temperature: 4.0 })}
                >
                  Normal (4.0°C)
                </button>
                <button
                  type="button"
                  className="danger-btn"
                  style={{ fontSize: '0.75rem', padding: '6px 10px' }}
                  onClick={() => setTelemetryForm({ ...telemetryForm, temperature: 16.5 })}
                >
                  Trigger Heat Spike Alert (16.5°C)
                </button>
              </div>
            </div>

            <div style={{ marginTop: '22px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" className="secondary-btn" onClick={onClose}>Cancel</button>
              <button type="submit" className="glow-btn">Record Telemetry on Chain</button>
            </div>
          </form>
        )}

        {mode === 'custody' && (
          <form onSubmit={(e) => { e.preventDefault(); onSubmitCustody(custodyForm.targetId, custodyForm.newCarrier, custodyForm.newOwner); }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '18px', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Truck size={20} color="#8b5cf6" /> Transfer Asset Custody / Ownership
            </h2>

            <div style={{ display: 'grid', gap: '14px' }}>
              <div>
                <label>Select Asset ID</label>
                <select
                  value={custodyForm.targetId}
                  onChange={(e) => setCustodyForm({ ...custodyForm, targetId: e.target.value })}
                >
                  {allShipments.map((s) => (
                    <option key={s.id} value={s.id}>{s.id} (Owner: {s.owner}, Carrier: {s.carrier})</option>
                  ))}
                </select>
              </div>

              <div>
                <label>New Carrier / Freight Handler</label>
                <input
                  value={custodyForm.newCarrier}
                  onChange={(e) => setCustodyForm({ ...custodyForm, newCarrier: e.target.value })}
                />
              </div>

              <div>
                <label>New Owner Organization</label>
                <input
                  value={custodyForm.newOwner}
                  onChange={(e) => setCustodyForm({ ...custodyForm, newOwner: e.target.value })}
                />
              </div>
            </div>

            <div style={{ marginTop: '22px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" className="secondary-btn" onClick={onClose}>Cancel</button>
              <button type="submit" className="glow-btn">Execute Custody Transfer</button>
            </div>
          </form>
        )}

        {mode === 'simulator' && (
          <div>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '14px', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Send size={20} color="#06b6d4" /> IoT Automated Sensor Simulator
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
              Simulates a live IoT sensor stream sending periodic location updates and temperature readings for a shipment.
            </p>

            <div style={{ display: 'grid', gap: '12px' }}>
              {allShipments.map((shipment) => (
                <div key={shipment.id} className="glass-panel" style={{ padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ color: '#38bdf8' }}>{shipment.id}</strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{shipment.currentLocation}</div>
                  </div>
                  <button
                    className="glow-btn"
                    style={{ fontSize: '0.8rem', padding: '6px 14px' }}
                    onClick={() => onRunSimulation(shipment.id)}
                  >
                    Simulate Sensor Spike
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
