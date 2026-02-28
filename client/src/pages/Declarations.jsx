import React, { useState } from 'react';
import { FileText, Download, Clock, ChevronDown, ChevronUp, AlertTriangle, CheckCircle2, Hourglass, ExternalLink } from 'lucide-react';

const MOCK_DECLARATIONS = [
  { id: 'D001', date: '2026-02-24', assignment: 'TDT4242-A2-2026', tool: 'ChatGPT', hours: 2.5, task: 'Writing', status: 'Approved', note: 'Used for refining introduction paragraph.' },
  { id: 'D002', date: '2026-02-20', assignment: 'IT3010-A1-2026', tool: 'GitHub Copilot', hours: 4.0, task: 'Code Generation', status: 'Flagged', note: 'Copilot generated entire function. Flagged for review.' },
  { id: 'D003', date: '2026-02-18', assignment: 'TDT4242-A1-2026', tool: 'Claude', hours: 1.5, task: 'Research', status: 'Approved', note: 'Summarized 4 research papers.' },
  { id: 'D004', date: '2026-02-10', assignment: 'IT3010-A0-2026', tool: 'ChatGPT', hours: 3.0, task: 'Analysis', status: 'Pending', note: '' },
];

const MOCK_VERSIONS = [
  { version: 'v1', date: '2026-02-10 09:41', changes: 'Initial submission. Hours: 2.5, Task: Writing.' },
  { version: 'v2', date: '2026-02-10 14:22', changes: 'Hours corrected to 3.0.' },
];

const StatusBadge = ({ status }) => {
  const map = { Approved: ['var(--success-color)', 'var(--success-bg)'], Flagged: ['var(--danger-color)', 'var(--danger-bg)'], Pending: ['var(--warning-color)', 'var(--warning-bg)'] };
  const [color, bg] = map[status] || ['var(--text-muted)', 'rgba(255,255,255,0.05)'];
  const icon = { Approved: <CheckCircle2 size={12} />, Flagged: <AlertTriangle size={12} />, Pending: <Hourglass size={12} /> };
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', fontWeight: 700, color, background: bg, padding: '3px 9px', borderRadius: '99px' }}>{icon[status]} {status}</span>;
};

const EDIT_CUTOFF = new Date('2026-02-22');

export default function Declarations() {
  const [expanded, setExpanded] = useState(null);
  const [showExport, setShowExport] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const handleExport = (fmt) => {
    setShowExport(false);
    showToast(`✓ Declarations exported as ${fmt}.`);
  };

  return (
    <div style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      {toast && <div style={{ position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 9999, padding: '0.9rem 1.25rem', background: 'rgba(63,185,80,0.1)', border: '1px solid var(--success-color)', borderRadius: 'var(--radius-lg)', color: 'var(--success-color)', fontWeight: 500, animation: 'slideUp 0.3s ease' }}>{toast}</div>}

      <div className="flex-between" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <FileText size={26} color="var(--accent-color)" /> My AI Declarations
          </h1>
          <p style={{ margin: 0 }}>History of your submitted AI usage logs. Edit is available until the course deadline.</p>
        </div>
        <div style={{ position: 'relative' }}>
          <button className="btn btn-secondary" onClick={() => setShowExport(o => !o)}>
            <Download size={16} /> Export
          </button>
          {showExport && (
            <div style={{ position: 'absolute', top: '110%', right: 0, background: 'rgba(22,27,34,0.98)', border: '1px solid var(--panel-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', zIndex: 100, minWidth: 150 }}>
              {['JSON', 'CSV', 'XML'].map(fmt => (
                <button key={fmt} onClick={() => handleExport(fmt)}
                  style={{ display: 'block', width: '100%', padding: '0.65rem 1rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left', fontSize: '0.88rem', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >{fmt}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: 'var(--spacing-lg)', flexWrap: 'wrap' }}>
        {[
          { label: 'Total Entries', value: MOCK_DECLARATIONS.length, color: 'var(--accent-color)' },
          { label: 'Approved', value: MOCK_DECLARATIONS.filter(d => d.status === 'Approved').length, color: 'var(--success-color)' },
          { label: 'Flagged', value: MOCK_DECLARATIONS.filter(d => d.status === 'Flagged').length, color: 'var(--danger-color)' },
          { label: 'Pending', value: MOCK_DECLARATIONS.filter(d => d.status === 'Pending').length, color: 'var(--warning-color)' },
        ].map(card => (
          <div key={card.label} className="panel" style={{ flex: 1, minWidth: 120, padding: '0.9rem 1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: card.color }}>{card.value}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* Declaration list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {MOCK_DECLARATIONS.map(decl => {
          const editable = new Date(decl.date) >= EDIT_CUTOFF;
          const isExpanded = expanded === decl.id;
          return (
            <div key={decl.id} className="panel" style={{ padding: '1rem 1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>{decl.assignment}</span>
                    <StatusBadge status={decl.status} />
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {decl.tool} · {decl.task} · {decl.hours}h · {new Date(decl.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  {editable ? (
                    <button className="btn btn-secondary" style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem' }} onClick={() => showToast('Edit mode opened')}>Edit</button>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={12} /> Edit window closed</span>
                  )}
                  <button onClick={() => setExpanded(isExpanded ? null : decl.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.3rem' }}>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div style={{ marginTop: '1rem', borderTop: '1px solid var(--panel-border)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {decl.note && <p style={{ fontSize: '0.85rem', margin: 0 }}><strong style={{ color: '#fff' }}>Note:</strong> {decl.note}</p>}
                  {/* Version history */}
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.4rem' }}>Version History</div>
                    {MOCK_VERSIONS.map(v => (
                      <div key={v.version} style={{ display: 'flex', gap: '0.75rem', padding: '0.45rem 0.7rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', marginBottom: '0.3rem', fontSize: '0.8rem' }}>
                        <span style={{ color: 'var(--accent-color)', fontWeight: 700, flexShrink: 0 }}>{v.version}</span>
                        <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>{v.date}</span>
                        <span style={{ color: 'var(--text-secondary)' }}>{v.changes}</span>
                      </div>
                    ))}
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>Versions are preserved for 2 years per NTNU policy.</div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
