import React from 'react';
import { X, Layers, Cpu, Server, ShieldCheck, Globe, Code2, Box, CheckCircle2, Thermometer } from 'lucide-react';

interface TechStackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TechStackModal: React.FC<TechStackModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(10px)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      overflowY: 'auto'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '720px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '32px',
        position: 'relative'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--border-card)',
            borderRadius: '8px',
            color: 'var(--text-muted)',
            padding: '6px',
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>

        {/* Title Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', padding: '10px', borderRadius: '12px', display: 'flex' }}>
            <Layers size={24} color="#ffffff" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', color: '#f8fafc', margin: 0 }}>
              HyperTrace — Architecture & Use Cases
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
              Technology Stack & Application Specifications
            </p>
          </div>
        </div>

        {/* 1. Technology Stack Section */}
        <div style={{ marginBottom: '28px' }}>
          <h3 style={{ fontSize: '1.05rem', color: '#38bdf8', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={18} color="#06b6d4" /> Technology Stack
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            {/* Blockchain Layer */}
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-card)', padding: '14px 18px', borderRadius: '12px' }}>
              <div style={{ fontWeight: 700, color: '#a78bfa', fontSize: '0.9rem', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Box size={16} /> Blockchain Engine
              </div>
              <ul style={{ fontSize: '0.8rem', color: 'var(--text-muted)', paddingLeft: '18px', margin: 0, lineHeight: 1.6 }}>
                <li><strong>Hyperledger Fabric v2.5</strong> Framework</li>
                <li>Smart Contracts (Chaincode) written in <strong>TypeScript</strong></li>
                <li><strong>CouchDB</strong> Rich World State Database</li>
                <li><strong>Raft Consensus</strong> Ordering Service</li>
              </ul>
            </div>

            {/* API & Backend */}
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-card)', padding: '14px 18px', borderRadius: '12px' }}>
              <div style={{ fontWeight: 700, color: '#38bdf8', fontSize: '0.9rem', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Server size={16} /> REST API Gateway
              </div>
              <ul style={{ fontSize: '0.8rem', color: 'var(--text-muted)', paddingLeft: '18px', margin: 0, lineHeight: 1.6 }}>
                <li><strong>Node.js</strong> & <strong>Express</strong> REST Client Gateway</li>
                <li><strong>Fabric Gateway Client SDK</strong> Integration</li>
                <li><strong>Server-Sent Events (SSE)</strong> Real-time Push Stream</li>
                <li>Cryptographic Audit Certificate Engine</li>
              </ul>
            </div>

            {/* Frontend Layer */}
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-card)', padding: '14px 18px', borderRadius: '12px' }}>
              <div style={{ fontWeight: 700, color: '#34d399', fontSize: '0.9rem', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Code2 size={16} /> Frontend UI Dashboard
              </div>
              <ul style={{ fontSize: '0.8rem', color: 'var(--text-muted)', paddingLeft: '18px', margin: 0, lineHeight: 1.6 }}>
                <li><strong>React 18</strong> & <strong>Vite</strong> Single Page Application</li>
                <li>Dark Glassmorphism Vanilla CSS Design System</li>
                <li>Interactive SVG <strong>GPS Route Map</strong> & Vector <strong>QR Generator</strong></li>
                <li>Lucide Icons & Dynamic Telemetry Gauges</li>
              </ul>
            </div>

            {/* DevOps & Deployment */}
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-card)', padding: '14px 18px', borderRadius: '12px' }}>
              <div style={{ fontWeight: 700, color: '#fbbf24', fontSize: '0.9rem', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Globe size={16} /> Cloud Infrastructure
              </div>
              <ul style={{ fontSize: '0.8rem', color: 'var(--text-muted)', paddingLeft: '18px', margin: 0, lineHeight: 1.6 }}>
                <li>Multi-stage <strong>Dockerfile</strong> Containerization</li>
                <li><strong>Google Cloud Run</strong> Serverless Free Tier Deploy</li>
                <li><strong>Render.com</strong> Automated Blueprint (`render.yaml`)</li>
                <li>Python Multi-Sensor IoT Telemetry Simulation Suite</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 2. Application Purpose & Use Cases Section */}
        <div>
          <h3 style={{ fontSize: '1.05rem', color: '#38bdf8', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={18} color="#10b981" /> Application Purpose & Industry Use Cases
          </h3>

          <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-card)', padding: '18px', borderRadius: '12px', fontSize: '0.85rem', lineHeight: 1.6 }}>
            <p style={{ marginBottom: '12px', color: '#f8fafc' }}>
              <strong>HyperTrace</strong> provides a tamper-proof, verifiable provenance network designed to solve critical supply chain challenges across pharmaceutical cold-chains, high-value electronics, and food logistics:
            </p>

            <div style={{ display: 'grid', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <CheckCircle2 size={16} color="#10b981" style={{ marginTop: '3px', flexShrink: 0 }} />
                <div>
                  <strong style={{ color: '#e2e8f0' }}>Pharmaceutical Cold-Chain Compliance:</strong> Ensures vaccines and biologics remain within strict temperature bounds (`-20°C` to `8°C`). Smart contracts automatically compromise assets upon heat spikes.
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <CheckCircle2 size={16} color="#10b981" style={{ marginTop: '3px', flexShrink: 0 }} />
                <div>
                  <strong style={{ color: '#e2e8f0' }}>Multi-Party Custody & Governance:</strong> Coordinates handoffs between Shippers, Freight Carriers, Customs Inspectors, and Receivers with cryptographic MSP signatures.
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <CheckCircle2 size={16} color="#10b981" style={{ marginTop: '3px', flexShrink: 0 }} />
                <div>
                  <strong style={{ color: '#e2e8f0' }}>Geospatial Corridor Enforcement:</strong> GPS geofencing alerts when high-security freight deviates from authorized transit routes.
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <CheckCircle2 size={16} color="#10b981" style={{ marginTop: '3px', flexShrink: 0 }} />
                <div>
                  <strong style={{ color: '#e2e8f0' }}>Seal Breach & Impact Auditing:</strong> Logs G-force shock drops and light exposure lux sensors to catch container tampering before final delivery.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{ marginTop: '24px', textAlign: 'right' }}>
          <button className="glow-btn" onClick={onClose}>
            Close Specifications
          </button>
        </div>
      </div>
    </div>
  );
};
