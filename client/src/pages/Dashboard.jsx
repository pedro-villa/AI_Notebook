import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import {
  ShieldAlert, BookOpenCheck, BrainCircuit, CheckCircle2,
  LogOut, Loader2, Settings, X, Filter, Sparkles,
  ExternalLink, ChevronRight, ChevronLeft, Award, TrendingUp,
  Clock, Zap, RotateCcw, ArrowRight, WifiOff, Shield,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';
import { pivotUsageData, computeStats } from '../utils/dashboard';

// ── helpers ────────────────────────────────────────────────────────────────


// Circular SVG progress ring
const RingProgress = ({ pct, size = 80, stroke = 7, color = 'var(--accent-color)', label, sub }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
        <text x="50%" y="52%" dominantBaseline="middle" textAnchor="middle"
          style={{ fill: '#fff', fontSize: size * 0.22, fontWeight: 700, transform: 'rotate(90deg)', transformOrigin: 'center', fontFamily: 'Inter,sans-serif' }}>
          {pct}%
        </text>
      </svg>
      {label && <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#fff', textAlign: 'center' }}>{label}</span>}
      {sub && <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textAlign: 'center' }}>{sub}</span>}
    </div>
  );
};

// Stat mini-card
const StatCard = ({ icon, label, value, color }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.4rem',
    background: 'rgba(255,255,255,0.03)', border: '1px solid var(--panel-border)',
    borderRadius: 'var(--radius-md)', padding: '0.85rem 1rem', flex: 1, minWidth: 0,
    transition: 'border-color 0.2s', cursor: 'default',
  }}
    onMouseEnter={e => e.currentTarget.style.borderColor = color}
    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--panel-border)'}
  >
    <div style={{ color, display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
      {icon} {label}
    </div>
    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', lineHeight: 1 }}>{value}</div>
  </div>
);

// Slim loading spinner
const Spinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
    <Loader2 size={28} color="var(--accent-color)" style={{ animation: 'spin 1s linear infinite' }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

// Tool palette
const TOOL_COLORS = { ChatGPT: '#10a37f', 'GitHub Copilot': '#58a6ff', Claude: '#d97757' };
const TOOLS = ['ChatGPT', 'GitHub Copilot', 'Claude'];

// External regulatory links (mockup)
const EXTERNAL_LINKS = [
  { label: 'NTNU Guidelines on Generative AI', href: 'https://www.ntnu.edu/ai', tag: 'NTNU', color: '#58a6ff' },
  { label: 'EU AI Act – Official Summary', href: 'https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai', tag: 'EU', color: '#d29922' },
  { label: 'UNESCO AI Ethics Recommendation', href: 'https://unesdoc.unesco.org/ark:/48223/pf0000381137', tag: 'UNESCO', color: '#3fb950' },
  { label: 'Norwegian Data Protection Authority – AI', href: 'https://www.datatilsynet.no', tag: 'NO', color: '#d97757' },
];

// ── PROGRESSIVE QUIZ ────────────────────────────────────────────────────────

const ProgressiveQuiz = ({ resources, onComplete }) => {
  const allQ = useMemo(() =>
    resources.flatMap(r => r.quizQuestions.map(q => ({ ...q, resourceId: r._id, resourceTitle: r.title })))
  , [resources]);

  const [step, setStep] = useState(0);   // current question index
  const [answers, setAnswers] = useState({});   // key → selected answer
  const [flash, setFlash] = useState(null);     // 'correct' | 'wrong' | null
  const [submitting, setSubmitting] = useState(false);

  if (allQ.length === 0) return <p>No questions available.</p>;

  const current = allQ[step];
  const key = `${current.resourceId}::${current.question}`;
  const selected = answers[key];
  const isLast = step === allQ.length - 1;
  const pct = Math.round(((step) / allQ.length) * 100);

  const handleSelect = (opt) => {
    if (flash) return; // already flashing, don't re-select
    setAnswers(prev => ({ ...prev, [key]: opt }));
    const correct = opt.toLowerCase() === current.expectedAnswer.toLowerCase();
    setFlash(correct ? 'correct' : 'wrong');
  };

  const advance = () => {
    setFlash(null);
    if (isLast) {
      // submit
      setSubmitting(true);
      const payload = Object.entries(answers).map(([k, ans]) => {
        const [resourceId, question] = k.split('::');
        return { resourceId, question, answer: ans };
      });
      api.submitQuiz(payload)
        .then(result => onComplete(result))
        .catch(console.error)
        .finally(() => setSubmitting(false));
    } else {
      setStep(s => s + 1);
    }
  };

  const goBack = () => { setFlash(null); setStep(s => Math.max(0, s - 1)); };

  const flashColor = flash === 'correct' ? 'var(--success-color)' : flash === 'wrong' ? 'var(--danger-color)' : 'transparent';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
      {/* Progress bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Question {step + 1} of {allQ.length}</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{pct}% complete</span>
        </div>
        <div style={{ height: '5px', background: 'rgba(255,255,255,0.07)', borderRadius: '99px', overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${pct}%`,
            background: 'linear-gradient(90deg, var(--accent-color), var(--success-color))',
            borderRadius: '99px', transition: 'width 0.4s ease',
          }} />
        </div>
      </div>

      {/* Resource tag */}
      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
        <BookOpenCheck size={12} /> {current.resourceTitle}
      </div>

      {/* Question card */}
      <div style={{
        border: `2px solid ${flash ? flashColor : 'var(--panel-border)'}`,
        borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-md)',
        background: flash ? (flash === 'correct' ? 'rgba(63,185,80,0.07)' : 'rgba(248,81,73,0.07)') : 'rgba(255,255,255,0.02)',
        transition: 'all 0.25s ease',
      }}>
        <p style={{ fontSize: '0.95rem', fontWeight: 500, color: '#fff', marginBottom: 'var(--spacing-md)' }}>
          {current.question}
        </p>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {['Yes', 'No'].map(opt => {
            const sel = selected === opt;
            const isCorrect = flash && opt.toLowerCase() === current.expectedAnswer.toLowerCase();
            const isWrong = flash && sel && !isCorrect;
            return (
              <button
                key={opt}
                onClick={() => handleSelect(opt)}
                disabled={!!flash}
                style={{
                  flex: 1, padding: '0.6rem', borderRadius: 'var(--radius-md)',
                  border: `2px solid ${isCorrect ? 'var(--success-color)' : isWrong ? 'var(--danger-color)' : sel ? 'var(--accent-color)' : 'var(--panel-border)'}`,
                  background: isCorrect ? 'rgba(63,185,80,0.15)' : isWrong ? 'rgba(248,81,73,0.15)' : sel ? 'var(--accent-bg)' : 'transparent',
                  color: isCorrect ? 'var(--success-color)' : isWrong ? 'var(--danger-color)' : sel ? 'var(--accent-color)' : 'var(--text-secondary)',
                  cursor: flash ? 'default' : 'pointer',
                  fontFamily: 'inherit', fontWeight: 600, fontSize: '0.95rem',
                  transition: 'all 0.2s ease',
                }}>
                {isCorrect ? '✓ ' : isWrong ? '✗ ' : ''}{opt}
              </button>
            );
          })}
        </div>

        {flash && (
          <p style={{ marginTop: '0.6rem', fontSize: '0.82rem', color: flashColor, fontWeight: 500, animation: 'fadeIn 0.2s ease' }}>
            {flash === 'correct' ? '✓ Correct! Well done.' : `✗ The correct answer is: ${current.expectedAnswer}.`}
          </p>
        )}
      </div>

      {/* Nav buttons */}
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'space-between' }}>
        <button className="btn btn-secondary" onClick={goBack} disabled={step === 0} style={{ padding: '0.5rem 1rem' }}>
          <ChevronLeft size={16} /> Back
        </button>
        <button
          className="btn"
          onClick={advance}
          disabled={!selected || submitting}
          style={{
            background: isLast ? 'var(--success-color)' : 'var(--accent-color)',
            opacity: selected ? 1 : 0.35, flex: 1,
          }}>
          {submitting ? 'Submitting…' : isLast ? 'Submit Quiz' : (<>Next <ChevronRight size={16} /></>)}
        </button>
      </div>
    </div>
  );
};

// ── MAIN DASHBOARD ──────────────────────────────────────────────────────────

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Filter state
  const [filterTool, setFilterTool] = useState('All');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo]     = useState('');
  const [chartType, setChartType]   = useState('line'); // 'line' | 'bar'

  // Data state
  const [rawEntries, setRawEntries]         = useState([]);
  const [usageData, setUsageData]           = useState([]);
  const [guidelines, setGuidelines]         = useState([]);
  const [resources, setResources]           = useState([]);
  const [feedback, setFeedback]             = useState('');
  const [dashboardConfig, setDashboardConfig] = useState(user?.dashboardConfig || {});

  // UI state
  const [showSettings, setShowSettings]     = useState(false);
  const [expandedGuide, setExpandedGuide]   = useState(null);

  // Loading state
  const [loadingUsage, setLoadingUsage]         = useState(true);
  const [loadingGuidelines, setLoadingGuidelines] = useState(true);
  const [loadingResources, setLoadingResources]   = useState(true);
  const [loadingFeedback, setLoadingFeedback]     = useState(true);

  // Quiz state
  const [quizResult, setQuizResult] = useState(null);
  const [quizStarted, setQuizStarted] = useState(false);

  // Compliance score: 0‑100, driven by whether quiz was passed
  const [complianceScore, setComplianceScore] = useState(60);

  // ── Consent Modal (FR25) ─────────────────────────────
  const [consentGiven, setConsentGiven] = useState(() => !!localStorage.getItem('ai_consent'));
  const giveConsent = () => { localStorage.setItem('ai_consent','1'); setConsentGiven(true); };

  // ── fetching ────────────────────────────────────────────

  const fetchUsage = useCallback(async () => {
    if (!consentGiven) {
      setRawEntries([]);
      setUsageData([]);
      setLoadingUsage(false);
      return;
    }

    setLoadingUsage(true);
    try {
      const params = {};
      if (filterTool !== 'All') params.tool = filterTool;
      if (filterFrom) params.from = filterFrom;
      if (filterTo)   params.to   = filterTo;
      const entries = await api.getUsage(params);
      setRawEntries(entries);
      setUsageData(pivotUsageData(entries));
    } catch (e) {
      console.error('Usage fetch error:', e);
    } finally {
      setLoadingUsage(false);
    }
  }, [filterTool, filterFrom, filterTo, consentGiven]);

  useEffect(() => { fetchUsage(); }, [fetchUsage]);

  useEffect(() => {
    if (!consentGiven) {
      setLoadingGuidelines(false);
      setLoadingResources(false);
      setLoadingFeedback(false);
      setGuidelines([]);
      setResources([]);
      setFeedback('');
      return;
    }

    setLoadingGuidelines(true);
    setLoadingResources(true);
    setLoadingFeedback(true);

    api.getGuidelines()
      .then(setGuidelines)
      .catch(console.error)
      .finally(() => setLoadingGuidelines(false));

    api.getResources()
      .then(setResources)
      .catch(console.error)
      .finally(() => setLoadingResources(false));

    api.getFeedback()
      .then(d => setFeedback(d.feedback))
      .catch(console.error)
      .finally(() => setLoadingFeedback(false));

    api.getDashboardConfig()
      .then(d => setDashboardConfig(d.dashboardConfig))
      .catch(console.error);
  }, [consentGiven]);

  // ── computed ───────────────────────────────────────────

  const stats = useMemo(() => computeStats(rawEntries), [rawEntries]);

  // Active tools for rendering chart lines
  const activeTools = filterTool === 'All' ? TOOLS : [filterTool];

  const handleLogout = () => { logout(); navigate('/login'); };

  const handleQuizComplete = (result) => {
    setQuizResult(result);
    if (result.passed) setComplianceScore(100);
    else setComplianceScore(prev => Math.min(prev, 75));
  };

  // ── Offline detection (FR30, FR34) ───────────────────
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  useEffect(() => {
    const on  = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  // ── render ─────────────────────────────────────────────

  return (
    <div style={{ paddingBottom: '4rem' }}>

      {/* ── CONSENT MODAL (FR25) ── */}
      {!consentGiven && (
        <div className="modal-overlay">
          <div className="modal-content panel animate-slide-up" style={{ maxWidth: 520, padding: '2rem' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <Shield size={28} color="var(--accent-color)" />
              <h2 style={{ margin: 0 }}>Data Collection Consent</h2>
            </div>
            <p>Before accessing your dashboard, please confirm that you consent to the collection and processing of your AI usage data for academic integrity purposes, in accordance with the <a href="https://www.ntnu.edu/privacy" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-color)' }}>NTNU Privacy Policy</a> and GDPR.</p>
            <ul style={{ margin: '1rem 0', paddingLeft: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.7 }}>
              <li>Data is encrypted using AES-256</li>
              <li>Only authorised personnel can access your records</li>
              <li>You can export or delete your data at any time</li>
            </ul>
            <button className="btn" style={{ width: '100%' }} onClick={giveConsent}><CheckCircle2 size={16} /> I Consent & Continue</button>
          </div>
        </div>
      )}

      {/* ── OFFLINE BANNER (FR30, FR34) ── */}
      {!isOnline && (
        <div style={{ background: 'var(--warning-bg)', border: '1px solid var(--warning-color)', borderRadius: 'var(--radius-md)', padding: '0.6rem 1rem', marginTop: 'var(--spacing-lg)', marginBottom: 'var(--spacing-md)', display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--warning-color)', fontSize: '0.88rem' }}>
          <WifiOff size={16} />
          <span><strong>Offline Mode</strong> — Dashboard data may be outdated. New logs are saved locally and will sync on reconnect.</span>
        </div>
      )}

      {/* ── HEADER ── */}
      <header className="flex-between panel animate-slide-up" style={{ marginBottom: 'var(--spacing-lg)', marginTop: 'var(--spacing-lg)' }}>
        <div className="flex-gap">
          <BrainCircuit color="var(--accent-color)" size={34} />
          <div>
            <h1 style={{ margin: 0, fontSize: '1.6rem' }}>AI Guidebook</h1>
            <p style={{ margin: 0, fontSize: '0.85rem' }}>
              Welcome back, <strong style={{ color: '#fff' }}>{user?.username ?? 'Student'}</strong>
            </p>
          </div>
        </div>

        {/* Compliance ring in header */}
        <RingProgress pct={complianceScore} size={72} label="Compliance" sub="Profile Score" />

        <div className="flex-gap">
          <button className="btn btn-secondary" onClick={() => setShowSettings(true)}>
            <Settings size={16} /> Settings
          </button>
          <button className="btn btn-secondary" onClick={handleLogout}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </header>

      {/* ── SETTINGS MODAL (FR8) ── */}
      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal-content panel animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex-between" style={{ marginBottom: 'var(--spacing-md)' }}>
              <h2 style={{ margin: 0 }}><Settings size={18} color="var(--accent-color)" style={{ marginRight: 8 }} />Dashboard Settings</h2>
              <button className="btn-icon" onClick={() => setShowSettings(false)}><X size={20} /></button>
            </div>
            <p style={{ marginBottom: 'var(--spacing-lg)' }}>Personalise your dashboard by toggling widgets on or off.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
              {[
                { key: 'showGraph', label: 'AI Usage Graph & Statistics' },
                { key: 'showGuidelines', label: 'Ethical Guidelines' },
                { key: 'showResources', label: 'Training Module & Quiz' },
                { key: 'showFeedback', label: 'Weekly Insight' },
              ].map(({ key, label }) => (
                <label key={key} className="toggle-label flex-between">
                  <span style={{ fontWeight: 500 }}>{label}</span>
                  <input
                    type="checkbox"
                    className="toggle-input"
                    checked={dashboardConfig[key] !== false}
                    onChange={async (e) => {
                      const val = e.target.checked;
                      setDashboardConfig(prev => ({ ...prev, [key]: val }));
                      try { await api.patchDashboardConfig({ [key]: val }); }
                      catch (err) { setDashboardConfig(prev => ({ ...prev, [key]: !val })); }
                    }}
                  />
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── FEEDBACK / INSIGHT (FR13) ── */}
      {dashboardConfig.showFeedback !== false && (
        <div className="panel animate-slide-up" style={{ borderLeft: '4px solid var(--accent-color)', marginBottom: 'var(--spacing-lg)', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <Sparkles size={22} color="var(--accent-color)" style={{ marginTop: 2, flexShrink: 0 }} />
          <div>
            <h3 style={{ margin: '0 0 0.3rem' }}>Weekly Insight</h3>
            {loadingFeedback ? <Spinner /> : <p style={{ margin: 0 }}>{feedback || 'No feedback yet. Log your AI sessions to receive personalised insights.'}</p>}
          </div>
        </div>
      )}

      {/* ── USAGE SECTION (FR9, FR10) ── */}
      {dashboardConfig.showGraph !== false && (
        <div className="panel animate-fade-in" style={{ marginBottom: 'var(--spacing-lg)' }}>

          {/* Section header */}
          <div className="flex-between" style={{ marginBottom: 'var(--spacing-md)' }}>
            <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={20} color="var(--accent-color)" /> AI Usage History
            </h2>
            {/* Chart type toggle */}
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)', padding: '3px', gap: '3px' }}>
              {[['line', 'Line'], ['bar', 'Bar']].map(([t, l]) => (
                <button key={t} onClick={() => setChartType(t)} style={{
                  padding: '0.25rem 0.9rem', borderRadius: 'var(--radius-sm)', border: 'none',
                  background: chartType === t ? 'var(--accent-color)' : 'transparent',
                  color: chartType === t ? '#fff' : 'var(--text-secondary)',
                  cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.8rem', fontWeight: 500, transition: 'all 0.2s',
                }}>{l}</button>
              ))}
            </div>
          </div>

          {/* Stat cards */}
          {!loadingUsage && (
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: 'var(--spacing-lg)', flexWrap: 'wrap' }}>
              <StatCard icon={<Clock size={12} />} label="Total Hours" value={`${stats.total}h`} color="var(--accent-color)" />
              <StatCard icon={<Zap size={12} />} label="Daily Average" value={`${stats.avg}h`} color="var(--warning-color)" />
              <StatCard icon={<Award size={12} />} label="Top Tool" value={stats.topTool} color="var(--success-color)" />
              <StatCard icon={<TrendingUp size={12} />} label="Active Days" value={stats.days} color="#d97757" />
            </div>
          )}

          {/* Filter bar (FR10) */}
          <div style={{
            display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center',
            background: 'rgba(255,255,255,0.02)', border: '1px solid var(--panel-border)',
            padding: '0.65rem 0.9rem', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-lg)',
          }}>
            <Filter size={14} color="var(--text-secondary)" />
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginRight: '0.25rem' }}>Filter:</span>

            {/* Tool pills */}
            {['All', ...TOOLS].map(t => (
              <button key={t} onClick={() => setFilterTool(t)} style={{
                padding: '0.25rem 0.8rem', borderRadius: '99px',
                border: `1px solid ${filterTool === t ? TOOL_COLORS[t] || 'var(--accent-color)' : 'var(--panel-border)'}`,
                background: filterTool === t ? (TOOL_COLORS[t] ? `${TOOL_COLORS[t]}22` : 'var(--accent-bg)') : 'transparent',
                color: filterTool === t ? (TOOL_COLORS[t] || 'var(--accent-color)') : 'var(--text-secondary)',
                cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.8rem', fontWeight: 500, transition: 'all 0.18s',
              }}>{t}</button>
            ))}

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginLeft: '0.5rem' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>From</span>
              <input type="date" className="input" style={{ width: 'auto', padding: '0.3rem 0.5rem', fontSize: '0.82rem' }} value={filterFrom} onChange={e => setFilterFrom(e.target.value)} />
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>To</span>
              <input type="date" className="input" style={{ width: 'auto', padding: '0.3rem 0.5rem', fontSize: '0.82rem' }} value={filterTo} onChange={e => setFilterTo(e.target.value)} />
            </div>

            {(filterTool !== 'All' || filterFrom || filterTo) && (
              <button className="btn-icon" style={{ marginLeft: 'auto', padding: '4px 8px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '3px' }}
                onClick={() => { setFilterTool('All'); setFilterFrom(''); setFilterTo(''); }}>
                <RotateCcw size={13} /> Clear
              </button>
            )}
          </div>

          {/* Chart */}
          <div style={{ height: 320 }}>
            {loadingUsage ? <Spinner /> : (
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'line' ? (
                  <LineChart data={usageData} margin={{ top: 8, right: 16, left: -18, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="date" stroke="var(--text-muted)" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} dy={8} interval="preserveStartEnd" />
                    <YAxis stroke="var(--text-muted)" unit="h" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ background: 'rgba(13,17,23,0.95)', border: '1px solid var(--panel-border)', borderRadius: 10, backdropFilter: 'blur(8px)' }}
                      labelStyle={{ color: '#fff', fontWeight: 600, marginBottom: 4 }}
                      formatter={(v, name) => [`${Number(v).toFixed(1)}h`, name]}
                    />
                    <Legend wrapperStyle={{ paddingTop: 12, color: 'var(--text-secondary)', fontSize: 13 }} />
                    {activeTools.map(t => (
                      <Line key={t} type="monotone" dataKey={t} stroke={TOOL_COLORS[t]} strokeWidth={2.5}
                        dot={{ r: 2.5, fill: TOOL_COLORS[t], strokeWidth: 0 }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                        connectNulls={true} />
                    ))}
                  </LineChart>
                ) : (
                  <BarChart data={usageData} margin={{ top: 8, right: 16, left: -18, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="date" stroke="var(--text-muted)" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} dy={8} interval="preserveStartEnd" />
                    <YAxis stroke="var(--text-muted)" unit="h" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ background: 'rgba(13,17,23,0.95)', border: '1px solid var(--panel-border)', borderRadius: 10 }}
                      formatter={(v, name) => [`${Number(v).toFixed(1)}h`, name]}
                    />
                    <Legend wrapperStyle={{ paddingTop: 12, fontSize: 13 }} />
                    {activeTools.map(t => (
                      <Bar key={t} dataKey={t} fill={TOOL_COLORS[t]} radius={[4, 4, 0, 0]} maxBarSize={18} />
                    ))}
                  </BarChart>
                )}
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}

      {/* ── BOTTOM ROW ── */}
      <div className="dashboard-grid">

        {/* ── ETHICAL GUIDELINES (FR11) ── */}
        {dashboardConfig.showGuidelines !== false && (
          <div className="grid-col-left">
            <div className="panel animate-fade-in" style={{ height: '100%' }}>
              <div className="flex-gap" style={{ marginBottom: 'var(--spacing-md)' }}>
                <ShieldAlert color="var(--danger-color)" size={22} />
                <h2 style={{ margin: 0 }}>Ethical Guidelines</h2>
              </div>

              {/* Scrollable guidelines list */}
              <div className="scrollable-area" style={{ marginBottom: 'var(--spacing-md)' }}>
                {loadingGuidelines ? <Spinner /> : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {guidelines.map(g => (
                      <div key={g._id}
                        onClick={() => setExpandedGuide(expandedGuide === g._id ? null : g._id)}
                        style={{
                          padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.02)',
                          borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--danger-color)',
                          cursor: 'pointer', transition: 'background 0.2s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                      >
                        <div className="flex-between">
                          <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fff' }}>{g.title}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.68rem', background: 'var(--danger-bg)', color: 'var(--danger-color)', padding: '2px 7px', borderRadius: '99px', fontWeight: 600 }}>{g.category}</span>
                            <ChevronRight size={14} color="var(--text-muted)" style={{ transform: expandedGuide === g._id ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                          </div>
                        </div>
                        {expandedGuide === g._id && (
                          <p style={{ margin: '0.5rem 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{g.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Regulatory links section */}
              <div style={{ borderTop: '1px solid var(--panel-border)', paddingTop: 'var(--spacing-md)' }}>
                <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.6rem' }}>Official Regulations & Policies</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {EXTERNAL_LINKS.map(lnk => (
                    <a key={lnk.href} href={lnk.href} target="_blank" rel="noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.55rem 0.8rem', textDecoration: 'none', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', transition: 'background 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    >
                      <span style={{ fontSize: '0.68rem', background: `${lnk.color}22`, color: lnk.color, padding: '2px 6px', borderRadius: '4px', fontWeight: 700, flexShrink: 0 }}>{lnk.tag}</span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', flex: 1 }}>{lnk.label}</span>
                      <ExternalLink size={13} color="var(--text-muted)" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TRAINING MODULE & QUIZ (FR12) ── */}
        {dashboardConfig.showResources !== false && (
          <div className="grid-col-right">
            <div className="panel animate-fade-in" style={{ height: '100%' }}>
              <div className="flex-gap" style={{ marginBottom: 'var(--spacing-md)' }}>
                <BookOpenCheck color="var(--success-color)" size={22} />
                <h2 style={{ margin: 0 }}>Training Module</h2>
              </div>

              {loadingResources ? <Spinner /> : quizResult ? (

                /* ── RESULT VIEW ── */
                <div style={{ textAlign: 'center', padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                  <RingProgress
                    pct={quizResult.score}
                    size={110}
                    color={quizResult.passed ? 'var(--success-color)' : 'var(--danger-color)'}
                    label={quizResult.passed ? 'Passed! 🎉' : 'Needs Improvement'}
                    sub={`${quizResult.correct}/${quizResult.total} correct`}
                  />
                  <p style={{ fontSize: '0.9rem', maxWidth: 280, textAlign: 'center' }}>
                    {quizResult.passed
                      ? 'Excellent work! Your compliance score has been updated. You can retake the module any time.'
                      : 'Review the resources below and try again. You need 80% or higher to pass.'}
                  </p>
                  {/* Resource review links */}
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {resources.map(r => (
                      <a key={r._id} href={r.url} target="_blank" rel="noreferrer"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', textDecoration: 'none', transition: 'background 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                      >
                        <span style={{ fontSize: '0.68rem', background: 'var(--accent-bg)', color: 'var(--accent-color)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700, flexShrink: 0 }}>{r.type.toUpperCase()}</span>
                        <span style={{ flex: 1, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{r.title}</span>
                        <ExternalLink size={13} color="var(--text-muted)" />
                      </a>
                    ))}
                  </div>
                  <button className="btn btn-secondary" onClick={() => { setQuizResult(null); setQuizStarted(false); }}>
                    <RotateCcw size={15} /> Retake Quiz
                  </button>
                </div>

              ) : !quizStarted ? (

                /* ── INTRO VIEW ── */
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                  <p>Start below to test your knowledge of responsible AI use. You need <strong style={{ color: '#fff' }}>80% or higher</strong> to pass and update your Compliance Score.</p>

                  {/* Resource list to read first */}
                  <div className="scrollable-area">
                    <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem' }}>Recommended Reading</p>
                    {resources.map(r => (
                      <a key={r._id} href={r.url} target="_blank" rel="noreferrer"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', marginBottom: '0.4rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', textDecoration: 'none', transition: 'background 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                      >
                        <span style={{ fontSize: '0.68rem', background: 'var(--accent-bg)', color: 'var(--accent-color)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700, flexShrink: 0 }}>{r.type.toUpperCase()}</span>
                        <span style={{ flex: 1, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{r.title}</span>
                        <ExternalLink size={13} color="var(--text-muted)" />
                      </a>
                    ))}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--panel-border)' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>{resources.flatMap(r => r.quizQuestions).length} Questions</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Passing score: 80%</div>
                    </div>
                    <button className="btn" onClick={() => setQuizStarted(true)} style={{ gap: '0.5rem' }}>
                      Start Quiz <ArrowRight size={16} />
                    </button>
                  </div>
                </div>

              ) : (
                /* ── PROGRESSIVE QUIZ ── */
                <ProgressiveQuiz resources={resources} onComplete={handleQuizComplete} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
