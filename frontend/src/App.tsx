import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ShipmentCard } from './components/ShipmentCard';
import { TelemetryChart } from './components/TelemetryChart';
import { HistoryTimeline } from './components/HistoryTimeline';
import { ActionsModal } from './components/ActionsModal';
import { Shipment, HistoryRecord, ShipmentStatus } from './types';
import { PlusCircle, MapPin, Thermometer, Truck, ShieldAlert, Sparkles, Activity, Layers } from 'lucide-react';

export const App: React.FC = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'location' | 'telemetry' | 'custody' | 'simulator' | null>(null);

  const fetchShipments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/shipments');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setShipments(json.data);
        if (json.data.length > 0) {
          // If no shipment selected yet or previous selection updated, update selected
          const updatedSelected = selectedShipment
            ? json.data.find((s: Shipment) => s.id === selectedShipment.id) || json.data[0]
            : json.data[0];
          setSelectedShipment(updatedSelected);
          fetchHistory(updatedSelected.id);
        }
      } else {
        setError(json.error || 'Failed to fetch shipments from Hyperledger Fabric world state');
      }
    } catch (err: any) {
      setError(`Cannot connect to REST API Gateway on port 3001 (${err.message}). Make sure server is running.`);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (id: string) => {
    try {
      const res = await fetch(`/api/shipments/${id}/history`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setHistory(json.data);
      }
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  };

  useEffect(() => {
    fetchShipments();
    const interval = setInterval(() => {
      fetchShipments();
    }, 8000); // auto-refresh every 8s
    return () => clearInterval(interval);
  }, []);

  const handleSelectShipment = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    fetchHistory(shipment.id);
  };

  const handleCreateShipment = async (data: any) => {
    try {
      const res = await fetch('/api/shipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (json.success) {
        setModalMode(null);
        fetchShipments();
      } else {
        alert(`Failed to create shipment: ${json.error}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleUpdateLocation = async (id: string, newLocation: string, updatedBy: string) => {
    try {
      const res = await fetch(`/api/shipments/${id}/location`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newLocation, updatedBy })
      });
      const json = await res.json();
      if (json.success) {
        setModalMode(null);
        fetchShipments();
      } else {
        alert(`Failed to update location: ${json.error}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleLogTelemetry = async (id: string, temperature: number, sensorId: string) => {
    try {
      const res = await fetch(`/api/shipments/${id}/telemetry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ temperature, sensorId })
      });
      const json = await res.json();
      if (json.success) {
        setModalMode(null);
        fetchShipments();
      } else {
        alert(`Failed to record telemetry: ${json.error}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleTransferCustody = async (id: string, newCarrier: string, newOwner: string) => {
    try {
      const res = await fetch(`/api/shipments/${id}/custody`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newCarrier, newOwner })
      });
      const json = await res.json();
      if (json.success) {
        setModalMode(null);
        fetchShipments();
      } else {
        alert(`Failed to transfer custody: ${json.error}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleRunSimulation = async (id: string) => {
    // Inject IoT readings including spike
    await handleLogTelemetry(id, 4.2, 'IOT-SIM-01');
    await handleLogTelemetry(id, 14.8, 'IOT-SIM-SPIKE');
    setModalMode(null);
    fetchShipments();
  };

  const compromisedCount = shipments.filter(s => s.status === ShipmentStatus.COMPROMISED).length;
  const inTransitCount = shipments.filter(s => s.status === ShipmentStatus.IN_TRANSIT).length;
  const totalCount = shipments.length;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        onRefresh={fetchShipments}
        onOpenCreate={() => setModalMode('create')}
        onOpenSimulator={() => setModalMode('simulator')}
        loading={loading}
        activeCount={totalCount}
      />

      <main style={{ flex: 1, maxWidth: '1400px', width: '100%', margin: '0 auto', padding: '28px 32px' }}>
        {error && (
          <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: '24px', borderColor: 'var(--accent-rose)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ShieldAlert color="#f43f5e" size={24} />
            <div>
              <strong style={{ color: '#fb7185' }}>API Gateway Warning</strong>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{error}</div>
            </div>
          </div>
        )}

        {/* Network Metrics Overview */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
          <div className="glass-panel" style={{ padding: '18px 22px' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              Total Tracked Assets
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, marginTop: '4px', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '10px' }}>
              {totalCount}
              <Layers size={20} color="#3b82f6" />
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '18px 22px' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              Active In Transit
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, marginTop: '4px', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '10px' }}>
              {inTransitCount}
              <Truck size={20} color="#f59e0b" />
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '18px 22px', borderColor: compromisedCount > 0 ? 'rgba(244, 63, 94, 0.4)' : 'var(--border-card)' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              Compromised Assets
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, marginTop: '4px', color: compromisedCount > 0 ? '#fb7185' : '#34d399', display: 'flex', alignItems: 'center', gap: '10px' }}>
              {compromisedCount}
              <ShieldAlert size={20} color={compromisedCount > 0 ? '#f43f5e' : '#10b981'} />
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '18px 22px' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              Smart Contract Rules
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, marginTop: '8px', color: '#a78bfa' }}>
              Auto-Compromise @ Threshold Breach
            </div>
          </div>
        </div>

        {/* Main Grid: Shipments List & Details */}
        <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '28px', alignItems: 'start' }}>
          {/* Left Column: Shipment Selector List */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h2 style={{ fontSize: '1.1rem', color: '#f8fafc' }}>World State Assets</h2>
              <button className="secondary-btn" style={{ fontSize: '0.75rem', padding: '4px 10px' }} onClick={() => setModalMode('create')}>
                + New
              </button>
            </div>

            <div style={{ display: 'grid', gap: '14px', maxHeight: '780px', overflowY: 'auto', paddingRight: '4px' }}>
              {shipments.map((s) => (
                <ShipmentCard
                  key={s.id}
                  shipment={s}
                  isSelected={selectedShipment?.id === s.id}
                  onSelect={handleSelectShipment}
                />
              ))}

              {shipments.length === 0 && !loading && (
                <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No shipments found. Click '+ New' or seed initial data.
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Active Asset Inspector & Smart Actions */}
          {selectedShipment ? (
            <div style={{ display: 'grid', gap: '24px' }}>
              {/* Asset Action Toolbar */}
              <div className="glass-panel" style={{ padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 className="mono-text" style={{ fontSize: '1.3rem', color: '#38bdf8', margin: 0 }}>
                    {selectedShipment.id}
                  </h2>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Current Location: <strong style={{ color: '#f8fafc' }}>{selectedShipment.currentLocation}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button className="secondary-btn" onClick={() => setModalMode('location')}>
                    <MapPin size={15} color="#10b981" /> Update Checkpoint
                  </button>
                  <button className="secondary-btn" onClick={() => setModalMode('telemetry')}>
                    <Thermometer size={15} color="#06b6d4" /> Log IoT Temp
                  </button>
                  <button className="secondary-btn" onClick={() => setModalMode('custody')}>
                    <Truck size={15} color="#8b5cf6" /> Transfer Custody
                  </button>
                </div>
              </div>

              {/* IoT Cold Chain Live Telemetry Chart */}
              <TelemetryChart
                readings={selectedShipment.temperatureData}
                minThreshold={selectedShipment.minTempThreshold}
                maxThreshold={selectedShipment.maxTempThreshold}
                shipmentId={selectedShipment.id}
              />

              {/* Provenance Immutable Timeline */}
              <HistoryTimeline
                history={history}
                shipmentId={selectedShipment.id}
              />
            </div>
          ) : (
            <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Select a shipment asset from the left panel to inspect provenance history and IoT readings.
            </div>
          )}
        </div>
      </main>

      <ActionsModal
        mode={modalMode}
        selectedShipment={selectedShipment}
        allShipments={shipments}
        onClose={() => setModalMode(null)}
        onSubmitCreate={handleCreateShipment}
        onSubmitLocation={handleUpdateLocation}
        onSubmitTelemetry={handleLogTelemetry}
        onSubmitCustody={handleTransferCustody}
        onRunSimulation={handleRunSimulation}
      />
    </div>
  );
};
