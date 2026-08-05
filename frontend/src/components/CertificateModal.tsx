import React from 'react';
import { CertificateData } from '../types';
import { X, ShieldCheck, Printer, FileText, CheckCircle2, Award } from 'lucide-react';

interface CertificateModalProps {
  certData: CertificateData | null;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({ certData, onClose }) => {
  if (!certData) return null;

  const { shipment } = certData;

  const handlePrint = () => {
    window.print();
  };

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
        maxWidth: '680px',
        padding: '36px',
        position: 'relative',
        background: '#ffffff',
        color: '#0f172a',
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Close & Print Action Buttons */}
        <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', gap: '10px' }} className="no-print">
          <button
            onClick={handlePrint}
            style={{
              background: '#3b82f6',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '6px 14px',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Printer size={16} /> Print / Save PDF
          </button>
          <button
            onClick={onClose}
            style={{ background: '#e2e8f0', border: 'none', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', color: '#475569' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Certificate Header */}
        <div style={{ textAlign: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'inline-flex', padding: '12px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '50%', color: '#2563eb', marginBottom: '12px' }}>
            <Award size={36} />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1e293b', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Certificate of Provenance & Compliance
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
            Issued by HyperTrace Enterprise Blockchain Ledger Network
          </p>
        </div>

        {/* Certificate Metadata Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.85rem', marginBottom: '24px', background: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
          <div>
            <span style={{ color: '#64748b' }}>Certificate ID:</span>
            <div style={{ fontWeight: 700, fontFamily: 'monospace', color: '#2563eb' }}>{certData.certificateId}</div>
          </div>
          <div>
            <span style={{ color: '#64748b' }}>Issue Date:</span>
            <div style={{ fontWeight: 600, color: '#334155' }}>{new Date(certData.issuedAt).toLocaleString()}</div>
          </div>
          <div>
            <span style={{ color: '#64748b' }}>Fabric Channel & Consensus:</span>
            <div style={{ fontWeight: 600, color: '#334155' }}>mychannel (Raft Consensus)</div>
          </div>
          <div>
            <span style={{ color: '#64748b' }}>Total Blocks Committed:</span>
            <div style={{ fontWeight: 600, color: '#334155' }}>{certData.historyCount} Blocks</div>
          </div>
        </div>

        {/* Asset State Summary */}
        <h4 style={{ fontSize: '1rem', color: '#1e293b', marginBottom: '12px' }}>Asset Provenance Specifications</h4>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', marginBottom: '24px' }}>
          <tbody>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '8px 0', color: '#64748b' }}>Shipment Asset ID:</td>
              <td style={{ padding: '8px 0', fontWeight: 700, fontFamily: 'monospace', color: '#0f172a' }}>{shipment.id}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '8px 0', color: '#64748b' }}>Origin & Destination:</td>
              <td style={{ padding: '8px 0', fontWeight: 600, color: '#0f172a' }}>{shipment.origin} → {shipment.destination}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '8px 0', color: '#64748b' }}>Owner Organization:</td>
              <td style={{ padding: '8px 0', fontWeight: 600, color: '#0f172a' }}>{shipment.owner}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '8px 0', color: '#64748b' }}>Current Carrier Custodian:</td>
              <td style={{ padding: '8px 0', fontWeight: 600, color: '#0f172a' }}>{shipment.carrier}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '8px 0', color: '#64748b' }}>Cold-Chain Safety Threshold:</td>
              <td style={{ padding: '8px 0', fontWeight: 600, color: '#0f172a' }}>[{shipment.minTempThreshold}°C to {shipment.maxTempThreshold}°C]</td>
            </tr>
            <tr>
              <td style={{ padding: '8px 0', color: '#64748b' }}>Final Provenance Status:</td>
              <td style={{ padding: '8px 0', fontWeight: 700, color: shipment.status === 'Compromised' ? '#dc2626' : '#16a34a' }}>
                {shipment.status}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Cryptographic Digital Signatures */}
        <div style={{ borderTop: '2px dashed #cbd5e1', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Digital Cryptographic Signature:</div>
            <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#475569', wordBreak: 'break-all', maxWidth: '380px' }}>
              {certData.signature}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={14} /> Endorsed by Org1MSP & Org2MSP Peers
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e293b' }}>Flugelsoft Labs</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Verified Blockchain Auditor</div>
          </div>
        </div>
      </div>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
};
