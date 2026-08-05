import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ShipmentCard } from './components/ShipmentCard';
import { TelemetryChart } from './components/TelemetryChart';
import { WorldMap } from './components/WorldMap';
import { HistoryTimeline } from './components/HistoryTimeline';
import { ActionsModal } from './components/ActionsModal';
import { QRCodeModal } from './components/QRCodeModal';
import { CertificateModal } from './components/CertificateModal';
import { TechStackModal } from './components/TechStackModal';
import { Shipment, HistoryRecord, ShipmentStatus, CertificateData, MSPRole } from './types';
import { MapPin, Thermometer, Truck, ShieldAlert, Layers, QrCode, FileCheck, Box, Zap, Info } from 'lucide-react';

export const App: React.FC = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'location' | 'telemetry' | 'custody' | 'simulator' | null>(null);
  const [showQRModal, setShowQRModal] = useState<boolean>(false);
  const [showTechStackModal, setShowTechStackModal] = useState<boolean>(false);
  const [certData, setCertData] = useState<CertificateData | null>(null);
  const [activeRole, setActiveRole] = useState<MSPRole>('Org1MSP');
  const [sseConnected, setSseConnected] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchShipments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/shipments');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setShipments(json.data);
        if (json.data.length > 0) {
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
      setError(`Cannot connect to REST API Gateway on port 3001 (${err.message}).`);
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

  const handleFetchCertificate = async (id: string) => {
    try {
      const res = await fetch(`/api/shipments/${id}/certificate`);
      const json = await res.json();
      if (json.success) {
        setCertData(json);
      } else {
        alert(`Error fetching certificate: ${json.error}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  useEffect(() => {
    fetchShipments();

    const eventSource = new EventSource('/api/events/stream');
    eventSource.onopen = () => {
      setSseConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type !== 'CONNECTED') {
          showToast(`⚡ Real-Time Ledger Event: ${data.eventType} on Block #${data.blockNumber}`);
          fetchShipments();
        }
      } catch (err) {
        console.error('SSE Event error:', err);
      }
    };

    eventSource.onerror = () => {
      setSseConnected(false);
    };

    const interval = setInterval(() => {
      fetchShipments();
    }, 10000);

    return () => {
      eventSource.close();
      clearInterval(interval);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

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
    await handleLogTelemetry(id, 4.2, 'IOT-SIM-01');
    await handleLogTelemetry(id, 16.8, 'IOT-SIM-SPIKE');
    setModalMode(null);
    fetchShipments();
  };

  const compromisedCount = shipments.filter(s => s.status === ShipmentStatus.COMPROMISED).length;
  const inTransitCount = shipments.filter(s => s.status === ShipmentStatus.IN_TRANSIT).length;
  const totalCount = shipments.length;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '80px',
          right: '32px',
          zIndex: 90,
          background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '12px',
          fontWeight: 600,
          fontSize: '0.85rem',
          boxShadow: '0 10px 25px rgba(6, 182, 212, 0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          animation: 'slideIn 0.3s ease'
        }}>
          <Zap size={16} /> {toastMessage}
        </div>
      )}

      <Navbar
        onRefresh={fetchShipments}
        onOpenCreate={() => setModalMode('create')}
        onOpenSimulator={() => setModalMode('simulator')}
        loading={loading}
        activeCount={totalCount}
        activeRole={activeRole}
        onChangeRole={setActiveRole}
        sseConnected={sseConnected}
      />

      <main style={{ flex: 1, maxWidth: '1400px', width: '100%', margin: '0 auto', padding: '28px 32px' }}>
        {error && (
          <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: '24px', borderColor: 'var(--accent-rose)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ShieldAlert color="#f43f5e" size={24} />
            <div>
              <strong style={{ color: '#fb7185' }}>API Gateway Connection Warning</strong>
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
              MSP Role Access
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, marginTop: '8px', color: '#a78bfa' }}>
              {activeRole} Active
            </div>
          </div>
        </div>

        {/* Main Grid: Shipments List & Inspector */}
        <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '28px', alignItems: 'start' }}>
          {/* Left Column: Shipment List */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h2 style={{ fontSize: '1.1rem', color: '#f8fafc' }}>World State Assets</h2>
              <button className="secondary-btn" style={{ fontSize: '0.75rem', padding: '4px 10px' }} onClick={() => setModalMode('create')}>
                + New
              </button>
            </div>

            <div style={{ display: 'grid', gap: '14px', maxHeight: '820px', overflowY: 'auto', paddingRight: '4px' }}>
              {shipments.map((s) => (
                <ShipmentCard
                  key={s.id}
                  shipment={s}
                  isSelected={selectedShipment?.id === s.id}
                  onSelect={handleSelectShipment}
                />
              ))}
            </div>
          </div>

          {/* Right Column: Active Asset Inspector & Smart Controls */}
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

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button className="secondary-btn" onClick={() => setShowQRModal(true)} title="Scan Cargo QR Tag">
                    <QrCode size={15} color="#06b6d4" /> QR Tag
                  </button>

                  <button className="secondary-btn" onClick={() => handleFetchCertificate(selectedShipment.id)} title="Generate PDF Provenance Audit Certificate">
                    <FileCheck size={15} color="#34d399" /> Audit Cert
                  </button>

                  <button className="secondary-btn" onClick={() => setModalMode('location')}>
                    <MapPin size={15} color="#10b981" /> Checkpoint
                  </button>
                  
                  <button className="secondary-btn" onClick={() => setModalMode('telemetry')}>
                    <Thermometer size={15} color="#06b6d4" /> Log IoT
                  </button>

                  <button className="secondary-btn" onClick={() => setModalMode('custody')}>
                    <Truck size={15} color="#8b5cf6" /> Transfer Custody
                  </button>
                </div>
              </div>

              {/* Interactive World Route Map & Geofence Corridor */}
              <WorldMap shipment={selectedShipment} />

              {/* Multi-Sensor Telemetry Suite */}
              <TelemetryChart
                readings={selectedShipment.telemetryHistory || []}
                minThreshold={selectedShipment.minTempThreshold}
                maxThreshold={selectedShipment.maxTempThreshold}
                maxHumidity={selectedShipment.maxHumidityThreshold || 70}
                maxShock={selectedShipment.maxShockThreshold || 4.5}
                maxLight={selectedShipment.maxLightThreshold || 50}
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

      {/* Modern Footer with Flugelsoft Labs Copyrights & Tech Stack Spec Link */}
      <footer style={{
        borderTop: '1px solid var(--border-card)',
        background: 'rgba(9, 13, 22, 0.95)',
        padding: '24px 32px',
        marginTop: '60px'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          fontSize: '0.85rem',
          color: 'var(--text-muted)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', padding: '6px', borderRadius: '8px', display: 'flex' }}>
              <Box size={16} color="#ffffff" />
            </div>
            <div>
              <strong style={{ color: '#f8fafc' }}>HyperTrace Enterprise Blockchain Platform</strong>
              <div style={{ fontSize: '0.75rem', marginTop: '2px' }}>Powered by Hyperledger Fabric v2.5 Smart Contracts & Raft Consensus</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button
              onClick={() => setShowTechStackModal(true)}
              style={{
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                color: '#60a5fa',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
            >
              <Info size={14} /> Technology Stack & Application Spec
            </button>

            <div>
              © 2026 <strong>Flugelsoft Labs</strong>. All Rights Reserved.
            </div>
          </div>
        </div>
      </footer>

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

      <QRCodeModal
        isOpen={showQRModal}
        shipment={selectedShipment}
        onClose={() => setShowQRModal(false)}
      />

      <CertificateModal
        certData={certData}
        onClose={() => setCertData(null)}
      />

      <TechStackModal
        isOpen={showTechStackModal}
        onClose={() => setShowTechStackModal(false)}
      />
    </div>
  );
};
