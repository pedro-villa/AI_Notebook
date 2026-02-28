import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, Users, FileText, Settings, BarChart2, GitCompare, Save, ChevronDown, ChevronUp, Eye } from 'lucide-react';

const TABS = [
  { id: 'policy',  label: 'Policy Editor',     icon: FileText },
  { id: 'activity',label: 'Student Activity',  icon: Users },
  { id: 'alerts',  label: 'Violation Alerts',  icon: AlertTriangle },
  { id: 'discrepancy', label: 'Discrepancy Monitor', icon: GitCompare },
  { id: 'assignments', label: 'Assignments',   icon: Settings },
  { id: 'access',  label: 'Data Access Log',   icon: BarChart2 },
];

const MOCK_STUDENTS = [
  { name: 'alice',  date: '2026-02-24', tool: 'ChatGPT',       hours: 2.5, status: 'Compliant' },
  { name: 'bob',    date: '2026-02-23', tool: 'GitHub Copilot', hours: 6.0, status: 'Flagged'   },
  { name: 'carol',  date: '2026-02-22', tool: 'Claude',         hours: 1.5, status: 'Compliant' },
  { name: 'dave',   date: '2026-02-20', tool: 'ChatGPT',        hours: 8.0, status: 'Flagged'   },
];

const MOCK_ALERTS = [
  { id: 'VIO-001', student: 'bob',  date: '2026-02-23', description: 'GitHub Copilot used for 6h — exceeds 5h policy.', severity: 'High',   status: 'Open' },
  { id: 'VIO-002', student: 'dave', date: '2026-02-20', description: 'ChatGPT used 8h in one session — no reflection provided.', severity: 'Critical', status: 'Under Review' },
];

const MOCK_DISCREPANCIES = [
  { student: 'bob',  assignment: 'IT3010-A1', declared: '4.0h', logged: '6.2h', delta: '+2.2h', risk: 'High' },
  { student: 'dave', assignment: 'CS-A3',     declared: '2.0h', logged: '8.0h', delta: '+6.0h', risk: 'Critical' },
  { student: 'alice',assignment: 'TDT4242-A2',declared: '2.5h', logged: '2.4h', delta: '-0.1h', risk: 'Low' },
];

const MOCK_ACCESS = [
  { who: 'Prof. Hansen',  what: 'alice declarations', when: '2026-02-25 10:14', role: 'Instructor' },
  { who: 'Admin System',  what: 'Automated sync log', when: '2026-02-25 00:01', role: 'System' },
  { who: 'Dr. Olsen',     what: 'bob flagged entry VIO-001', when: '2026-02-24 15:33', role: 'Compliance Officer' },
];

const Badge = ({ label, color, bg }) => (
  <span style={{ fontSize: '0.72rem', fontWeight: 700, color, background: bg, padding: '2px 8px', borderRadius: '99px' }}>{label}</span>
);

export default function AdminPanel() {
  const [tab, setTab]           = useState('policy');
  const [toast, setToast]       = useState(null);
  const [policyText, setPolicyText] = useState(`NTNU AI Usage Policy v2.3 — Feb 2026\n\n1. Students must declare all AI tool usage per assignment.\n2. Maximum 5 hours per tool per assignment without written justification.\n3. Full AI-generated submissions without attribution are prohibited.\n4. All declarations must be submitted before the grading deadline.\n5. Selected violations may result in academic sanctions.`);
  const [editWindow, setEditWindow] = useState('2026-03-10');
  const [expandAlert, setExpandAlert] = useState(null);
  const [newAssignId, setNewAssignId] = useState('');
  const [newAssignTitle, setNewAssignTitle] = useState('');

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  return (
    <div style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      {toast && (
        <div style={{ position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 9999, padding: '0.9rem 1.25rem', background: toast.type === 'success' ? 'rgba(63,185,80,0.12)' : 'rgba(248,81,73,0.12)', border: `1px solid ${toast.type === 'success' ? 'var(--success-color)' : 'var(--danger-color)'}`, borderRadius: 'var(--radius-lg)', color: toast.type === 'success' ? 'var(--success-color)' : 'var(--danger-color)', fontWeight: 500, animation: 'slideUp 0.3s ease', backdropFilter: 'blur(8px)' }}>{toast.msg}</div>
      )}

      <div style={{ marginBottom: 'var(--spacing-lg)' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <ShieldCheck size={26} color="var(--danger-color)" /> Admin Panel
        </h1>
        <p style={{ margin: 0 }}>Manage institutional policies, monitor activity, and review compliance alerts.</p>
      </div>

      {/* Violation count banner */}
      {MOCK_ALERTS.filter(a => a.status === 'Open').length > 0 && (
        <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-color)', borderRadius: 'var(--radius-md)', padding: '0.7rem 1rem', marginBottom: 'var(--spacing-lg)', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--danger-color)' }}>
          <AlertTriangle size={18} />
          <span><strong>{MOCK_ALERTS.filter(a => a.status === 'Open').length} open violations</strong> require review.</span>
          <button style={{ marginLeft: 'auto', background: 'var(--danger-color)', border: 'none', borderRadius: 'var(--radius-sm)', color: '#fff', padding: '0.3rem 0.9rem', cursor: 'pointer', fontSize: '0.8rem' }} onClick={() => setTab('alerts')}>Review →</button>
        </div>
      )}

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: '2px', background: 'rgba(255,255,255,0.04)', borderRadius: 'var(--radius-md)', padding: '3px', marginBottom: 'var(--spacing-lg)', flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.9rem', borderRadius: 'var(--radius-sm)', border: 'none', background: tab === t.id ? 'rgba(255,255,255,0.1)' : 'transparent', color: tab === t.id ? '#fff' : 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: tab === t.id ? 600 : 400, transition: 'all 0.18s' }}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {/* Policy Editor (FR1) */}
      {tab === 'policy' && (
        <div className="panel">
          <h2 style={{ marginBottom: 'var(--spacing-md)' }}>Institutional AI Policy Editor</h2>
          <p style={{ fontSize: '0.85rem', marginBottom: 'var(--spacing-md)' }}>Edit the policy text that governs student AI usage declarations. Students will see this in the Ethical Guidelines section.</p>
          <textarea className="input" rows={12} value={policyText} onChange={e => setPolicyText(e.target.value)} style={{ resize: 'vertical', fontFamily: 'monospace', fontSize: '0.85rem', lineHeight: 1.7 }} />
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'var(--spacing-md)' }}>
            <button className="btn" onClick={() => showToast('Policy saved and published to all students.')}><Save size={16} /> Save & Publish</button>
            <div className="input-group" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>Edit window closes:</label>
              <input type="date" className="input" value={editWindow} onChange={e => setEditWindow(e.target.value)} style={{ width: 'auto' }} />
              <button className="btn btn-secondary" onClick={() => showToast(`Edit window updated to ${editWindow}.`)}><Save size={14} /></button>
            </div>
          </div>
        </div>
      )}

      {/* Student Activity (FR2, FR18) */}
      {tab === 'activity' && (
        <div className="panel">
          <h2 style={{ marginBottom: 'var(--spacing-md)' }}>Student Activity Feed</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead><tr style={{ borderBottom: '1px solid var(--panel-border)' }}>
                {['Student', 'Date', 'Tool', 'Hours', 'Status', ''].map(h => (
                  <th key={h} style={{ padding: '0.65rem 0.75rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {MOCK_STUDENTS.map((s, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '0.65rem 0.75rem', fontWeight: 600, color: '#fff' }}>{s.name}</td>
                    <td style={{ padding: '0.65rem 0.75rem', color: 'var(--text-secondary)' }}>{s.date}</td>
                    <td style={{ padding: '0.65rem 0.75rem', color: 'var(--text-secondary)' }}>{s.tool}</td>
                    <td style={{ padding: '0.65rem 0.75rem', color: s.hours > 5 ? 'var(--danger-color)' : 'var(--text-secondary)', fontWeight: s.hours > 5 ? 700 : 400 }}>{s.hours}h</td>
                    <td style={{ padding: '0.65rem 0.75rem' }}>
                      <Badge label={s.status} color={s.status === 'Compliant' ? 'var(--success-color)' : 'var(--danger-color)'} bg={s.status === 'Compliant' ? 'var(--success-bg)' : 'var(--danger-bg)'} />
                    </td>
                    <td style={{ padding: '0.65rem 0.75rem' }}>
                      <button style={{ background: 'none', border: '1px solid var(--panel-border)', borderRadius: 'var(--radius-sm)', padding: '0.25rem 0.6rem', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.78rem' }} onClick={() => showToast(`Student ${s.name} detail view (mockup)`)}><Eye size={12} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Violation Alerts */}
      {tab === 'alerts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div className="panel" style={{ padding: '1rem 1.25rem' }}>
            <h2 style={{ marginBottom: '0.5rem' }}>Violation Alerts</h2>
            <p style={{ fontSize: '0.85rem', margin: 0 }}>Automatically flagged entries that may conflict with institutional policies.</p>
          </div>
          {MOCK_ALERTS.map(alert => (
            <div key={alert.id} className="panel" style={{ borderLeft: `4px solid ${alert.severity === 'Critical' ? 'var(--danger-color)' : 'var(--warning-color)'}`, padding: '1rem 1.25rem' }}>
              <div className="flex-between">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontWeight: 700, color: '#fff' }}>{alert.id}</span>
                  <Badge label={alert.severity} color={alert.severity === 'Critical' ? 'var(--danger-color)' : 'var(--warning-color)'} bg={alert.severity === 'Critical' ? 'var(--danger-bg)' : 'var(--warning-bg)'} />
                  <Badge label={alert.status} color="var(--text-secondary)" bg="rgba(255,255,255,0.06)" />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-secondary" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }} onClick={() => showToast(`Alert ${alert.id} marked resolved.`)}>Resolve</button>
                  <button onClick={() => setExpandAlert(expandAlert === alert.id ? null : alert.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    {expandAlert === alert.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>
              <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem' }}>Student: <strong style={{ color: '#fff' }}>{alert.student}</strong> · {alert.date}</p>
              {expandAlert === alert.id && <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--panel-border)', paddingTop: '0.65rem' }}>{alert.description}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Discrepancy Monitor */}
      {tab === 'discrepancy' && (
        <div className="panel">
          <h2 style={{ marginBottom: '0.5rem' }}>Discrepancy Monitor</h2>
          <p style={{ fontSize: '0.85rem', marginBottom: 'var(--spacing-md)' }}>Compares declared hours to automated activity logs to detect inconsistencies.</p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead><tr style={{ borderBottom: '1px solid var(--panel-border)' }}>
                {['Student', 'Assignment', 'Declared', 'Logged', 'Delta', 'Risk'].map(h => (
                  <th key={h} style={{ padding: '0.65rem 0.75rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {MOCK_DISCREPANCIES.map((d, i) => {
                  const riskColor = d.risk === 'Critical' ? 'var(--danger-color)' : d.risk === 'High' ? 'var(--warning-color)' : 'var(--success-color)';
                  return <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '0.65rem 0.75rem', fontWeight: 600, color: '#fff' }}>{d.student}</td>
                    <td style={{ padding: '0.65rem 0.75rem', color: 'var(--text-secondary)' }}>{d.assignment}</td>
                    <td style={{ padding: '0.65rem 0.75rem' }}>{d.declared}</td>
                    <td style={{ padding: '0.65rem 0.75rem' }}>{d.logged}</td>
                    <td style={{ padding: '0.65rem 0.75rem', fontWeight: 700, color: d.delta.startsWith('+') ? 'var(--danger-color)' : 'var(--success-color)' }}>{d.delta}</td>
                    <td style={{ padding: '0.65rem 0.75rem' }}><Badge label={d.risk} color={riskColor} bg={`${riskColor}22`} /></td>
                  </tr>;
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Assignment Manager */}
      {tab === 'assignments' && (
        <div className="panel">
          <h2 style={{ marginBottom: 'var(--spacing-md)' }}>Assignment Identifier Manager</h2>
          <p style={{ fontSize: '0.85rem', marginBottom: 'var(--spacing-md)' }}>Create unique identifiers for assignments. Students must link their AI declarations to these IDs to prevent fraudulent submissions.</p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: 'var(--spacing-lg)' }}>
            <input className="input" placeholder="Assignment ID, e.g. TDT4242-A3-2026" value={newAssignId} onChange={e => setNewAssignId(e.target.value)} style={{ flex: 1, minWidth: 200 }} />
            <input className="input" placeholder="Title, e.g. Software Testing Report" value={newAssignTitle} onChange={e => setNewAssignTitle(e.target.value)} style={{ flex: 2, minWidth: 200 }} />
            <button className="btn" onClick={() => { if (!newAssignId || !newAssignTitle) return; showToast(`Assignment "${newAssignId}" created.`); setNewAssignId(''); setNewAssignTitle(''); }}>+ Create</button>
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Existing active assignments: TDT4242-A2-2026, IT3010-A1-2026, CS-A3-2026</div>
        </div>
      )}

      {/* Data Access Log */}
      {tab === 'access' && (
        <div className="panel">
          <h2 style={{ marginBottom: '0.5rem' }}>Data Access Log</h2>
          <p style={{ fontSize: '0.85rem', marginBottom: 'var(--spacing-md)' }}>Immutable audit log of all access events to student data. Supports annual security reviews.</p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead><tr style={{ borderBottom: '1px solid var(--panel-border)' }}>
                {['Personnel', 'Record Accessed', 'Timestamp', 'Role'].map(h => (
                  <th key={h} style={{ padding: '0.65rem 0.75rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {MOCK_ACCESS.map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '0.65rem 0.75rem', fontWeight: 600, color: '#fff' }}>{row.who}</td>
                    <td style={{ padding: '0.65rem 0.75rem', color: 'var(--text-secondary)' }}>{row.what}</td>
                    <td style={{ padding: '0.65rem 0.75rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>{row.when}</td>
                    <td style={{ padding: '0.65rem 0.75rem' }}><Badge label={row.role} color="var(--accent-color)" bg="var(--accent-bg)" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
