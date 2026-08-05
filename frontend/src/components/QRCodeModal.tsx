import React, { useState } from 'react';
import { Shipment } from '../types';
import { X, QrCode, Copy, Check } from 'lucide-react';

interface QRCodeModalProps {
  isOpen: boolean;
  shipment: Shipment | null;
  onClose: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, shipment, onClose }) => {
  if (!isOpen || !shipment) return null;

  const [copied, setCopied] = useState(false);
  const verificationUrl = `${window.location.origin}/api/shipments/${shipment.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(verificationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(8px)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '440px',
        padding: '30px',
        position: 'relative',
        textAlign: 'center'
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

        <div style={{
          display: 'inline-flex',
          padding: '12px',
          borderRadius: '16px',
          background: 'rgba(59, 130, 246, 0.15)',
          color: '#3b82f6',
          marginBottom: '16px'
        }}>
          <QrCode size={32} />
        </div>

        <h2 style={{ fontSize: '1.25rem', color: '#f8fafc', marginBottom: '4px' }}>
          Physical Cargo QR Tag
        </h2>
        <p className="mono-text" style={{ fontSize: '0.9rem', color: '#38bdf8', marginBottom: '20px' }}>
          {shipment.id}
        </p>

        {/* Vector QR Code Graphics */}
        <div style={{
          background: '#ffffff',
          padding: '20px',
          borderRadius: '16px',
          display: 'inline-block',
          marginBottom: '20px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
        }}>
          <svg viewBox="0 0 100 100" width="160" height="160">
            <rect x="5" y="5" width="26" height="26" fill="#090d16" />
            <rect x="9" y="9" width="18" height="18" fill="#ffffff" />
            <rect x="13" y="13" width="10" height="10" fill="#090d16" />

            <rect x="69" y="5" width="26" height="26" fill="#090d16" />
            <rect x="73" y="9" width="18" height="18" fill="#ffffff" />
            <rect x="77" y="13" width="10" height="10" fill="#090d16" />

            <rect x="5" y="69" width="26" height="26" fill="#090d16" />
            <rect x="9" y="73" width="18" height="18" fill="#ffffff" />
            <rect x="13" y="77" width="10" height="10" fill="#090d16" />

            <rect x="36" y="10" width="6" height="6" fill="#090d16" />
            <rect x="48" y="10" width="6" height="6" fill="#090d16" />
            <rect x="36" y="22" width="18" height="6" fill="#090d16" />
            <rect x="10" y="36" width="6" height="18" fill="#090d16" />
            <rect x="22" y="48" width="12" height="6" fill="#090d16" />

            <rect x="42" y="38" width="18" height="18" fill="#090d16" />
            <rect x="46" y="42" width="10" height="10" fill="#3b82f6" />

            <rect x="68" y="38" width="12" height="6" fill="#090d16" />
            <rect x="78" y="48" width="12" height="12" fill="#090d16" />
            <rect x="38" y="68" width="14" height="6" fill="#090d16" />
            <rect x="58" y="68" width="14" height="14" fill="#090d16" />
            <rect x="78" y="78" width="12" height="12" fill="#090d16" />
          </svg>
        </div>

        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
          Scan with smartphone to verify ledger provenance verification URL:
        </p>

        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            readOnly
            value={verificationUrl}
            className="mono-text"
            style={{ fontSize: '0.75rem', background: 'rgba(0,0,0,0.3)' }}
          />
          <button className="secondary-btn" onClick={handleCopy}>
            {copied ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
};
