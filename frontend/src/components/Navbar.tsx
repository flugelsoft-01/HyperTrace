import React from 'react';
import { MSPRole } from '../types';
import { Box, ShieldCheck, Cpu, RefreshCw, PlusCircle, Activity, UserCheck, Zap } from 'lucide-react';

interface NavbarProps {
  onRefresh: () => void;
  onOpenCreate: () => void;
  onOpenSimulator: () => void;
  loading: boolean;
  activeCount: number;
  activeRole: MSPRole;
  onChangeRole: (role: MSPRole) => void;
  sseConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onRefresh,
  onOpenCreate,
  onOpenSimulator,
  loading,
  activeCount,
  activeRole,
  onChangeRole,
  sseConnected
}) => {
  return (
    <header style={{
      borderBottom: '1px solid var(--border-card)',
      background: 'rgba(9, 13, 22, 0.85)',
      backdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '14px 32px'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            padding: '10px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
          }}>
            <Box size={24} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0, color: '#f8fafc', letterSpacing: '-0.02em' }}>
              HyperTrace
            </h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>Hyperledger Fabric v2.5 Enterprise Network</span>
            </p>
          </div>
        </div>

        {/* Network & Role Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* SSE Stream Indicator */}
          <div className="glass-panel" style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={14} color={sseConnected ? '#10b981' : '#f59e0b'} />
            <span style={{ color: 'var(--text-muted)' }}>SSE Stream:</span>
            <span style={{ fontWeight: 600, color: sseConnected ? '#34d399' : '#fbbf24' }}>
              {sseConnected ? 'LIVE PUSH' : 'POLLING'}
            </span>
          </div>

          {/* MSP Role Selector */}
          <div className="glass-panel" style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <UserCheck size={14} color="#8b5cf6" />
            <span style={{ color: 'var(--text-muted)' }}>MSP Identity:</span>
            <select
              value={activeRole}
              onChange={(e) => onChangeRole(e.target.value as MSPRole)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#a78bfa',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                padding: '2px 4px'
              }}
            >
              <option value="Org1MSP" style={{ background: '#0f172a', color: '#f8fafc' }}>Org1MSP (Manufacturer)</option>
              <option value="Org2MSP" style={{ background: '#0f172a', color: '#f8fafc' }}>Org2MSP (Carrier)</option>
              <option value="CustomsMSP" style={{ background: '#0f172a', color: '#f8fafc' }}>CustomsMSP (Inspector)</option>
              <option value="AuditorMSP" style={{ background: '#0f172a', color: '#f8fafc' }}>AuditorMSP (Independent)</option>
            </select>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button className="secondary-btn" onClick={onOpenSimulator}>
            <Activity size={16} color="#06b6d4" />
            IoT Simulator
          </button>
          
          <button className="glow-btn" onClick={onOpenCreate}>
            <PlusCircle size={16} />
            New Asset
          </button>

          <button className="secondary-btn" onClick={onRefresh} disabled={loading} title="Refresh Ledger State">
            <RefreshCw size={16} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          </button>
        </div>
      </div>
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </header>
  );
};
