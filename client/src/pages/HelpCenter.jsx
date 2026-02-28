import React, { useState } from 'react';
import { HelpCircle, Search, ChevronDown, ChevronUp, Play, BookOpen, Lightbulb } from 'lucide-react';

const FAQS = [
  { q: 'What is the AI Guidebook?', a: 'The AI Guidebook is a student portal that helps you log, reflect on, and stay compliant with your institution\'s AI usage policies. It supports transparent and responsible use of generative AI tools.' },
  { q: 'How do I log my AI usage?', a: 'Navigate to "Log AI Usage" in the sidebar. Fill in the tool used, task type, AI output, duration, and any reflective notes. Click Submit to record your entry.' },
  { q: 'What happens if I submit a declaration that breaks a policy?', a: 'The system will display a compliance notice and flag the entry for your instructor. You will be notified immediately on the screen.' },
  { q: 'Can I edit a declaration after submitting it?', a: 'Yes, but only within the edit window configured by your instructor. Entries beyond the deadline are locked. All previous versions are preserved.' },
  { q: 'How do I export my data?', a: 'On the Declarations page, click "Export" and choose JSON, CSV, or XML. Your data will be downloaded immediately.' },
  { q: 'Is my data private?', a: 'Yes. All data is encrypted at rest using AES-256 and only accessible to authorised personnel. You were given full details when you consented at registration.' },
  { q: 'What does the Compliance Score mean?', a: 'It tracks how well you are engaging with the platform. Completing the training quiz brings it to 100%. It is a personal indicator, not directly visible to instructors.' },
  { q: 'What is offline mode?', a: 'If you lose internet connection, entries are saved locally and synced automatically when you reconnect.' },
  { q: 'How long is a session active?', a: 'Sessions expire after 15 minutes of inactivity. Your work in progress is saved for 30 minutes in case of unexpected closure.' },
  { q: 'Who can see my declarations?', a: 'Only you and specifically authorised personnel (instructors/compliance officers) can view your data.' },
];

const TUTORIALS = [
  { title: 'Getting Started with AI Guidebook', duration: '3:45', icon: '🚀' },
  { title: 'How to Write a Good AI Declaration', duration: '5:12', icon: '📝' },
  { title: 'Understanding NTNU AI Policies', duration: '6:30', icon: '🛡' },
];

const EXAMPLES = [
  { task: 'Essay Introduction', tool: 'ChatGPT', acceptable: true, example: 'Prompt: "Suggest an opening sentence for an essay on neural networks." Output: [AI text]. I rewrote it in my own voice and added a citation.' },
  { task: 'Code Function', tool: 'GitHub Copilot', acceptable: true, example: 'Copilot suggested a sorting algorithm. I reviewed each line, understood the logic, then adapted it to fit my data structure.' },
  { task: 'Full Essay', tool: 'ChatGPT', acceptable: false, example: 'Prompted ChatGPT to write the whole essay, then submitted it with minimal changes. No declaration of AI role.' },
  { task: 'Data Analysis', tool: 'Claude', acceptable: true, example: 'Used Claude to explain what a p-value means. Applied the explanation to interpret my own experimental results.' },
];

export default function HelpCenter() {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [tab, setTab]   = useState('faq'); // 'faq' | 'tutorials' | 'examples'

  const filtered = FAQS.filter(f => f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div style={{ marginBottom: 'var(--spacing-lg)' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <HelpCircle size={26} color="var(--accent-color)" /> Help Center
        </h1>
        <p style={{ margin: 0 }}>Guides, FAQs, and examples to help you use the AI Guidebook.</p>
      </div>

      {/* Tab switcher */}
      <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: 'var(--radius-md)', padding: 4, gap: 4, marginBottom: 'var(--spacing-lg)', width: 'fit-content' }}>
        {[['faq', <HelpCircle size={15} />, 'FAQ'], ['tutorials', <Play size={15} />, 'Tutorials'], ['examples', <Lightbulb size={15} />, 'Examples']].map(([t, icon, label]) => (
          <button key={t} onClick={() => setTab(t)} style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 1.1rem', borderRadius: 'var(--radius-sm)', border: 'none',
            background: tab === t ? 'var(--accent-color)' : 'transparent',
            color: tab === t ? '#fff' : 'var(--text-secondary)',
            cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.88rem', fontWeight: tab === t ? 600 : 400, transition: 'all 0.18s',
          }}>{icon} {label}</button>
        ))}
      </div>

      {tab === 'faq' && (
        <>
          <div style={{ position: 'relative', marginBottom: 'var(--spacing-lg)' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="input" placeholder="Search FAQs…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '2.5rem' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {filtered.map((f, i) => {
              const open = expanded === i;
              return (
                <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--panel-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', transition: 'border-color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(88,166,255,0.3)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--panel-border)'}
                >
                  <button onClick={() => setExpanded(open ? null : i)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.9rem 1.1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#fff', fontWeight: 500, fontSize: '0.9rem', textAlign: 'left', gap: '0.75rem' }}>
                    {f.q}
                    {open ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
                  </button>
                  {open && <div style={{ padding: '0 1.1rem 1rem', color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.65 }}>{f.a}</div>}
                </div>
              );
            })}
            {filtered.length === 0 && <p style={{ textAlign: 'center', padding: '2rem' }}>No FAQs match your search.</p>}
          </div>
        </>
      )}

      {tab === 'tutorials' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <p>Step-by-step video tutorials for using the AI Guidebook.</p>
          {TUTORIALS.map(t => (
            <div key={t.title} className="panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', transition: 'border-color 0.2s' }}
              onClick={() => alert('Video playback (mockup)')}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(88,166,255,0.3)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--panel-border)'}
            >
              <div style={{ fontSize: '2rem', width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)', flexShrink: 0 }}>{t.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: '#fff', marginBottom: '0.2rem' }}>{t.title}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Play size={12} /> {t.duration}</div>
              </div>
              <div style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent-color)', borderRadius: 'var(--radius-md)', padding: '0.4rem 0.9rem', color: 'var(--accent-color)', fontSize: '0.82rem', fontWeight: 600 }}>Watch</div>
            </div>
          ))}
        </div>
      )}

      {tab === 'examples' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <p>Examples of acceptable and unacceptable AI output declarations for academic tasks.</p>
          {EXAMPLES.map((ex, i) => (
            <div key={i} className="panel" style={{ borderLeft: `4px solid ${ex.acceptable ? 'var(--success-color)' : 'var(--danger-color)'}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>{ex.task}</span>
                <span style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.07)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-secondary)' }}>{ex.tool}</span>
                <span style={{ marginLeft: 'auto', fontSize: '0.75rem', fontWeight: 700, color: ex.acceptable ? 'var(--success-color)' : 'var(--danger-color)' }}>
                  {ex.acceptable ? '✓ Acceptable' : '✗ Not Acceptable'}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', fontStyle: 'italic' }}>{ex.example}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
