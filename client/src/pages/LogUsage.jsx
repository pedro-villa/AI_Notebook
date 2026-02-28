import React, { useState } from 'react';
import { FilePlus, Info, AlertTriangle, CheckCircle2, Wifi, WifiOff, ChevronDown, ChevronUp } from 'lucide-react';

const TOOLS = ['ChatGPT', 'GitHub Copilot', 'Claude', 'Gemini', 'Other'];
const TASKS = ['Writing / Drafting', 'Code Generation', 'Research', 'Data Analysis', 'Brainstorming', 'Translation', 'Summarisation', 'Other'];
const SUBJECTS = ['Computer Science', 'Mathematics', 'Engineering', 'Physics', 'Social Sciences', 'Humanities', 'Medicine', 'Other'];

const POLICY_VIOLATIONS = { 'ChatGPT': 5, 'GitHub Copilot': 5, 'Claude': 5, 'Gemini': 4, 'Other': 4 };

const DocGuide = ({ open, setOpen }) => (
  <div style={{ background: 'rgba(88,166,255,0.04)', border: '1px solid rgba(88,166,255,0.2)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
    <button onClick={() => setOpen(o => !o)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', background: 'none', border: 'none', color: 'var(--accent-color)', cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem' }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Info size={16} /> What counts as valid AI output?</span>
      {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
    </button>
    {open && (
      <div style={{ padding: '0 1rem 1rem', fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
        <p style={{ marginBottom: '0.6rem', color: 'var(--text-primary)', fontWeight: 500 }}>Include in AI output:</p>
        <ul style={{ margin: 0, paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <li>The exact prompt you sent to the AI</li>
          <li>The full AI response (or a relevant excerpt)</li>
          <li>How you modified or used the output</li>
          <li>Any student reasoning added on top</li>
        </ul>
        <div style={{ marginTop: '0.85rem', padding: '0.65rem', background: 'rgba(63,185,80,0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(63,185,80,0.2)' }}>
          <strong style={{ color: 'var(--success-color)', fontSize: '0.82rem' }}>Acceptable Example:</strong>
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.8rem', fontStyle: 'italic' }}>"Prompt: 'Explain gradient descent in plain English.' Output: [AI text]. I paraphrased and added my own diagram."</p>
        </div>
        <div style={{ marginTop: '0.5rem', padding: '0.65rem', background: 'rgba(248,81,73,0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(248,81,73,0.2)' }}>
          <strong style={{ color: 'var(--danger-color)', fontSize: '0.82rem' }}>Not Acceptable:</strong>
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.8rem', fontStyle: 'italic' }}>"ChatGPT wrote my whole report. Submitted as-is."</p>
        </div>
      </div>
    )}
  </div>
);

export default function LogUsage() {
  const isOnline = navigator.onLine;

  const [tool, setTool]           = useState('');
  const [task, setTask]           = useState('');
  const [subject, setSubject]     = useState('');
  const [hours, setHours]         = useState(1);
  const [aiOutput, setAiOutput]   = useState('');
  const [notes, setNotes]         = useState('');
  const [assignId, setAssignId]   = useState('');
  const [docOpen, setDocOpen]     = useState(false);
  const [toast, setToast]         = useState(null);
  const [loading, setLoading]     = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const policyLimit = tool ? POLICY_VIOLATIONS[tool] : null;
  const overLimit = policyLimit && hours > policyLimit;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!tool || !task) return showToast('Please select a tool and task type.', 'error');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      if (!isOnline) {
        showToast('⚠ Offline — entry saved locally and will sync when connected.', 'warn');
      } else if (overLimit) {
        showToast(`⚠ Compliance notice: ${hours}h exceeds the ${policyLimit}h guideline for ${tool}. Logged and flagged for review.`, 'warn');
      } else {
        showToast('✓ AI usage log submitted successfully!');
      }
    }, 900);
  };

  const handleNew = () => {
    setTool(''); setTask(''); setSubject(''); setHours(1); setAiOutput(''); setNotes(''); setAssignId(''); setSubmitted(false);
  };

  if (submitted) return (
    <div style={{ paddingTop: '2rem' }}>
      {toast && <div style={{ position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 9999, padding: '0.9rem 1.25rem', background: 'rgba(88,166,255,0.1)', border: '1px solid var(--accent-color)', borderRadius: 'var(--radius-lg)', color: 'var(--accent-color)', fontWeight: 500, animation: 'slideUp 0.3s ease' }}>{toast.msg}</div>}
      <div className="panel" style={{ maxWidth: 520, margin: '4rem auto', textAlign: 'center', padding: '2.5rem' }}>
        <CheckCircle2 size={52} color="var(--success-color)" style={{ marginBottom: '1rem' }} />
        <h2>Log Submitted!</h2>
        <p>Your AI usage entry for <strong style={{ color: '#fff' }}>{tool}</strong> has been recorded {!isOnline ? 'locally (pending sync)' : 'successfully'}.</p>
        {overLimit && (
          <div style={{ background: 'var(--warning-bg)', border: '1px solid var(--warning-color)', borderRadius: 'var(--radius-md)', padding: '0.75rem', marginTop: '1rem', color: 'var(--warning-color)', fontSize: '0.85rem' }}>
            <strong>Compliance Notice:</strong> Your declared {hours}h exceeds NTNU's guideline of {policyLimit}h for {tool}. Your instructor has been notified.
          </div>
        )}
        <button className="btn" onClick={handleNew} style={{ marginTop: '1.5rem', width: '100%' }}><FilePlus size={16} /> Log Another Entry</button>
      </div>
    </div>
  );

  return (
    <div style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      {toast && <div style={{ position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 9999, padding: '0.9rem 1.25rem', background: 'rgba(88,166,255,0.1)', border: '1px solid var(--accent-color)', borderRadius: 'var(--radius-lg)', color: 'var(--accent-color)', fontWeight: 500, animation: 'slideUp 0.3s ease' }}>{toast.msg}</div>}

      {/* Offline banner */}
      {!isOnline && (
        <div style={{ background: 'var(--warning-bg)', border: '1px solid var(--warning-color)', borderRadius: 'var(--radius-md)', padding: '0.65rem 1rem', marginBottom: 'var(--spacing-lg)', display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--warning-color)', fontSize: '0.88rem' }}>
          <WifiOff size={16} /> <strong>Offline Mode</strong> — Entries will be saved locally and synced when reconnected.
        </div>
      )}

      {/* Header */}
      <div className="flex-between" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <div>
          <h1 style={{ marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FilePlus size={26} color="var(--accent-color)" /> Log AI Usage
          </h1>
          <p style={{ margin: 0 }}>Document your AI tool interactions for compliance and reflection.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: isOnline ? 'var(--success-color)' : 'var(--warning-color)' }}>
          {isOnline ? <><Wifi size={14} /> Online</> : <><WifiOff size={14} /> Offline</>}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 'var(--spacing-lg)', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Main form */}
        <form onSubmit={handleSubmit} style={{ flex: '1.5', minWidth: 300, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          <div className="panel">
            <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Session Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
              <div className="input-group" style={{ margin: 0 }}>
                <label>AI Tool Used *</label>
                <select className="input" value={tool} onChange={e => setTool(e.target.value)} required>
                  <option value="">Select tool…</option>
                  {TOOLS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="input-group" style={{ margin: 0 }}>
                <label>Task Type *</label>
                <select className="input" value={task} onChange={e => setTask(e.target.value)} required>
                  <option value="">Select task…</option>
                  {TASKS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="input-group" style={{ margin: 0 }}>
                <label>Subject / Course</label>
                <select className="input" value={subject} onChange={e => setSubject(e.target.value)}>
                  <option value="">Select subject…</option>
                  {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="input-group" style={{ margin: 0 }}>
                <label>Assignment ID</label>
                <input type="text" className="input" placeholder="e.g. TDT4242-A2-2026" value={assignId} onChange={e => setAssignId(e.target.value)} />
              </div>
            </div>

            {/* Duration slider */}
            <div className="input-group" style={{ margin: 'var(--spacing-md) 0 0' }}>
              <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                Time Spent
                <span style={{ color: overLimit ? 'var(--danger-color)' : 'var(--accent-color)', fontWeight: 700 }}>{hours}h {overLimit && '⚠ over guideline'}</span>
              </label>
              <input type="range" min={0.5} max={12} step={0.5} value={hours} onChange={e => setHours(Number(e.target.value))} style={{ width: '100%', accentColor: overLimit ? 'var(--danger-color)' : 'var(--accent-color)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                <span>0.5h</span><span>6h</span><span>12h</span>
              </div>
            </div>
          </div>

          <div className="panel">
            <h3 style={{ marginBottom: 'var(--spacing-md)' }}>AI Output & Reflection</h3>
            <div className="input-group">
              <label>AI Output / Interaction Summary</label>
              <textarea className="input" rows={5} placeholder="Paste or describe the AI output and how you used it…" value={aiOutput} onChange={e => setAiOutput(e.target.value)} style={{ resize: 'vertical', fontFamily: 'inherit' }} />
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem', textAlign: 'right' }}>{aiOutput.length} characters</div>
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>Notes & Reflections</label>
              <textarea className="input" rows={3} placeholder="What did you learn? How did AI assist or limit your thinking?" value={notes} onChange={e => setNotes(e.target.value)} style={{ resize: 'vertical', fontFamily: 'inherit' }} />
            </div>
          </div>

          {/* Policy warning */}
          {overLimit && (
            <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-color)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--danger-color)' }}>
              <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
              <div><strong>Policy Alert:</strong> {hours}h exceeds NTNU's {policyLimit}h guideline for {tool}. Submitting this entry will notify your instructor.</div>
            </div>
          )}

          <button type="submit" className="btn" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Submitting…' : <><CheckCircle2 size={16} /> Submit AI Log Entry</>}
          </button>
        </form>

        {/* Sidebar: Documentation guide */}
        <div style={{ flex: 1, minWidth: 260, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          <DocGuide open={docOpen} setOpen={setDocOpen} />
          <div className="panel" style={{ fontSize: '0.85rem' }}>
            <h3 style={{ marginBottom: '0.75rem' }}>Why Log Your AI Usage?</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', color: 'var(--text-secondary)' }}>
              {[
                ['✓', 'Supports transparent and responsible AI usage'],
                ['✓', 'Protects you from plagiarism allegations'],
                ['✓', 'Builds a habit of transparent AI use'],
                ['✓', 'Your data is encrypted and private'],
              ].map(([icon, text]) => (
                <div key={text} style={{ display: 'flex', gap: '0.5rem' }}>
                  <span style={{ color: 'var(--success-color)', flexShrink: 0 }}>{icon}</span> {text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
