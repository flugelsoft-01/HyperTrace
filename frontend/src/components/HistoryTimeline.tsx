import React from 'react';
import { HistoryRecord } from '../types';
import { Shield, GitCommit, Clock, Hash, CheckCircle, AlertOctagon } from 'lucide-react';

interface HistoryTimelineProps {
  history: HistoryRecord[];
  shipmentId: string;
}

export const HistoryTimeline: React.FC<HistoryTimelineProps> = ({ history, shipmentId }) => {
  if (!history || history.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '24px', color: 'var(--text-muted)' }}>
        No historical block records available for {shipmentId}.
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Shield size={20} color="#8b5cf6" />
          <h3 style={{ fontSize: '1.05rem', color: '#f8fafc' }}>
            Hyperledger Fabric Immutable Provenance Ledger ({history.length} Transactions)
          </h3>
        </div>
      </div>

      <div style={{ position: 'relative', paddingLeft: '24px' }}>
        {/* Timeline bar */}
        <div style={{
          position: 'absolute',
          left: '7px',
          top: '8px',
          bottom: '8px',
          width: '2px',
          background: 'linear-gradient(180deg, #3b82f6, #8b5cf6, #10b981)'
        }} />

        {history.map((record, index) => {
          const isCompromised = record.value.status === 'Compromised';
          return (
            <div key={record.txId || index} style={{ marginBottom: '20px', position: 'relative' }}>
              {/* Node dot */}
              <div style={{
                position: 'absolute',
                left: '-24px',
                top: '4px',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                background: isCompromised ? '#f43f5e' : '#3b82f6',
                border: '3px solid #090d16',
                boxShadow: isCompromised ? '0 0 10px #f43f5e' : '0 0 10px #3b82f6'
              }} />

              <div style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid var(--border-card)',
                borderRadius: '12px',
                padding: '14px 18px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="mono-text" style={{ fontSize: '0.75rem', background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa', padding: '2px 8px', borderRadius: '4px' }}>
                      Block #{record.blockNumber}
                    </span>
                    <span className="mono-text" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      TxID: {record.txId.substring(0, 18)}...
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} /> {new Date(record.timestamp).toLocaleString()}
                  </span>
                </div>

                <div style={{ fontSize: '0.85rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Location: </span>
                    <strong style={{ color: '#e2e8f0' }}>{record.value.currentLocation}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Carrier: </span>
                    <strong style={{ color: '#e2e8f0' }}>{record.value.carrier}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Status: </span>
                    <span style={{
                      color: isCompromised ? '#fb7185' : record.value.status === 'Delivered' ? '#34d399' : '#60a5fa',
                      fontWeight: 600
                    }}>
                      {record.value.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
