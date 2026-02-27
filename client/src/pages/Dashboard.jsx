import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { ShieldAlert, BookOpenCheck, BrainCircuit, CheckCircle2, LogOut, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';

// ── helpers ────────────────────────────────────────────────────────────────

/**
 * The backend returns one entry per tool per day.
 * recharts needs one object per date with each tool as a key:
 *   { date: '2026-10-01', ChatGPT: 2, 'GitHub Copilot': 4, Claude: 1 }
 * This function pivots the flat array into that shape.
 */
function pivotUsageData(entries) {
  const map = {};
  for (const e of entries) {
    const dateStr = new Date(e.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    if (!map[dateStr]) map[dateStr] = { date: dateStr };
    map[dateStr][e.tool] = (map[dateStr][e.tool] || 0) + e.hours;
  }
  return Object.values(map).sort((a, b) => new Date(a.date) - new Date(b.date));
}

// Small reusable loading spinner
const Spinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
    <Loader2 size={28} color="var(--accent-color)" style={{ animation: 'spin 1s linear infinite' }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

// ── component ──────────────────────────────────────────────────────────────

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // ── state ────────────────────────────────────────────
  const [filterTool, setFilterTool] = useState('All');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');

  const [usageData, setUsageData]         = useState([]);
  const [guidelines, setGuidelines]       = useState([]);
  const [resources, setResources]         = useState([]);
  const [feedback, setFeedback]           = useState('');
  const [dashboardConfig, setDashboardConfig] = useState(user?.dashboardConfig || {});

  const [loadingUsage, setLoadingUsage]         = useState(true);
  const [loadingGuidelines, setLoadingGuidelines] = useState(true);
  const [loadingResources, setLoadingResources]   = useState(true);
  const [loadingFeedback, setLoadingFeedback]     = useState(true);

  // ── quiz state ───────────────────────────────────────
  const [quizAnswers, setQuizAnswers] = useState({});   // { "question text": "Yes"|"No" }
  const [quizResult, setQuizResult]   = useState(null); // { score, passed, correct, total }
  const [submittingQuiz, setSubmittingQuiz] = useState(false);

  // ── data fetching ────────────────────────────────────

  const fetchUsage = useCallback(async () => {
    setLoadingUsage(true);
    try {
      const params = {};
      if (filterTool !== 'All') params.tool = filterTool;
      if (filterFrom) params.from = filterFrom;
      if (filterTo)   params.to   = filterTo;
      const entries = await api.getUsage(params);
      setUsageData(pivotUsageData(entries));
    } catch (e) {
      console.error('Usage fetch error:', e);
    } finally {
      setLoadingUsage(false);
    }
  }, [filterTool, filterFrom, filterTo]);

  // Re-fetch whenever filters change (FR10)
  useEffect(() => { fetchUsage(); }, [fetchUsage]);

  // Guidelines, resources, and feedback only need fetching once on mount
  useEffect(() => {
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
  }, []);

  // ── quiz logic ───────────────────────────────────────

  const handleQuizAnswer = (resourceId, question, answer) => {
    setQuizAnswers(prev => ({ ...prev, [`${resourceId}::${question}`]: answer }));
  };

  const handleQuizSubmit = async () => {
    setSubmittingQuiz(true);
    try {
      // Build the answers array in the shape the backend expects
      const answers = Object.entries(quizAnswers).map(([key, answer]) => {
        const [resourceId, question] = key.split('::');
        return { resourceId, question, answer };
      });
      const result = await api.submitQuiz(answers);
      setQuizResult(result);
    } catch (e) {
      console.error('Quiz submit error:', e);
    } finally {
      setSubmittingQuiz(false);
    }
  };

  // ── dashboard config toggle ──────────────────────────

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // ── render ───────────────────────────────────────────

  const allQuizQuestions = resources.flatMap(r =>
    r.quizQuestions.map(q => ({ ...q, resourceId: r._id }))
  );
  const answeredCount = Object.keys(quizAnswers).length;
  const canSubmitQuiz = answeredCount === allQuizQuestions.length && allQuizQuestions.length > 0;

  return (
    <div style={{ paddingBottom: '3rem' }}>

      {/* ── HEADER ── */}
      <header className="flex-between panel" style={{ marginBottom: 'var(--spacing-lg)', marginTop: 'var(--spacing-lg)' }}>
        <div className="flex-gap">
          <BrainCircuit color="var(--accent-color)" size={32} />
          <div>
            <h1 style={{ margin: 0 }}>Student Dashboard</h1>
            <p style={{ margin: 0, fontSize: '0.875rem' }}>
              Welcome back, <strong>{user?.username}</strong>
            </p>
          </div>
        </div>
        <button className="btn btn-secondary flex-gap" onClick={handleLogout} style={{ gap: '0.5rem' }}>
          <LogOut size={16} /> Sign Out
        </button>
      </header>

      {/* ── FEEDBACK WIDGET (FR13) ── */}
      {dashboardConfig.showFeedback !== false && (
        <div className="panel" style={{ borderLeft: '4px solid var(--accent-color)', marginBottom: 'var(--spacing-lg)' }}>
          <h3>Current Insight</h3>
          {loadingFeedback
            ? <Spinner />
            : <p>{feedback || 'No feedback available yet.'}</p>
          }
        </div>
      )}

      <div className="grid-2">

        {/* ── USAGE GRAPH (FR9, FR10) ── */}
        {dashboardConfig.showGraph !== false && (
          <div className="panel">
            <h2 style={{ marginBottom: 'var(--spacing-md)' }}>AI Usage History</h2>

            {/* Filter controls — FR10 */}
            <div className="flex-gap" style={{ marginBottom: 'var(--spacing-md)', flexWrap: 'wrap', gap: '0.5rem' }}>
              <select
                className="input"
                style={{ width: 'auto' }}
                value={filterTool}
                onChange={e => setFilterTool(e.target.value)}
              >
                <option value="All">All Tools</option>
                <option value="ChatGPT">ChatGPT</option>
                <option value="GitHub Copilot">GitHub Copilot</option>
                <option value="Claude">Claude</option>
              </select>
              <input type="date" className="input" style={{ width: 'auto' }}
                value={filterFrom} onChange={e => setFilterFrom(e.target.value)} />
              <input type="date" className="input" style={{ width: 'auto' }}
                value={filterTo} onChange={e => setFilterTo(e.target.value)} />
              <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}
                onClick={() => { setFilterTool('All'); setFilterFrom(''); setFilterTo(''); }}>
                Reset
              </button>
            </div>

            <div style={{ height: '300px' }}>
              {loadingUsage ? <Spinner /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={usageData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--panel-border)" />
                    <XAxis dataKey="date" stroke="var(--text-secondary)" tick={{ fontSize: 11 }} />
                    <YAxis stroke="var(--text-secondary)" unit="h" />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'var(--bg-color)', border: '1px solid var(--panel-border)' }}
                      formatter={(v) => `${v}h`}
                    />
                    <Legend wrapperStyle={{ paddingTop: '10px' }} />
                    {(filterTool === 'All' || filterTool === 'ChatGPT') &&
                      <Line type="monotone" dataKey="ChatGPT" stroke="#10a37f" strokeWidth={2} dot={false} />}
                    {(filterTool === 'All' || filterTool === 'GitHub Copilot') &&
                      <Line type="monotone" dataKey="GitHub Copilot" stroke="#58a6ff" strokeWidth={2} dot={false} />}
                    {(filterTool === 'All' || filterTool === 'Claude') &&
                      <Line type="monotone" dataKey="Claude" stroke="#d97757" strokeWidth={2} dot={false} />}
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>

          {/* ── ETHICAL GUIDELINES (FR11) ── */}
          {dashboardConfig.showGuidelines !== false && (
            <div className="panel" style={{ flex: 1 }}>
              <div className="flex-gap" style={{ marginBottom: 'var(--spacing-md)' }}>
                <ShieldAlert color="var(--danger-color)" />
                <h2 style={{ margin: 0 }}>Ethical Guidelines</h2>
              </div>
              {loadingGuidelines ? <Spinner /> : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {guidelines.map(g => (
                    <li key={g._id} style={{
                      marginBottom: 'var(--spacing-sm)',
                      padding: 'var(--spacing-sm)',
                      background: 'rgba(255,255,255,0.02)',
                      borderRadius: 'var(--radius-md)',
                      borderLeft: '2px solid var(--danger-color)',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong>{g.title}</strong>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>{g.category}</span>
                      </div>
                      <p style={{ fontSize: '0.875rem', marginTop: '4px' }}>{g.description}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* ── TRAINING MODULE & QUIZ (FR12) ── */}
          {dashboardConfig.showResources !== false && (
            <div className="panel" style={{ flex: 1 }}>
              <div className="flex-gap" style={{ marginBottom: 'var(--spacing-md)' }}>
                <BookOpenCheck color="var(--success-color)" />
                <h2 style={{ margin: 0 }}>Training Module</h2>
              </div>

              {loadingResources ? <Spinner /> : quizResult ? (
                /* ── RESULT VIEW ── */
                <div style={{ textAlign: 'center', padding: '1rem' }}>
                  <CheckCircle2 size={40} color={quizResult.passed ? 'var(--success-color)' : 'var(--danger-color)'} />
                  <h3 style={{ margin: '0.5rem 0', color: quizResult.passed ? 'var(--success-color)' : 'var(--danger-color)' }}>
                    {quizResult.passed ? 'Passed!' : 'Not quite — review and retry.'}
                  </h3>
                  <p>Score: <strong>{quizResult.score}%</strong> ({quizResult.correct}/{quizResult.total} correct)</p>
                  {!quizResult.passed && (
                    <button className="btn btn-secondary" style={{ marginTop: '1rem' }}
                      onClick={() => { setQuizResult(null); setQuizAnswers({}); }}>
                      Retry
                    </button>
                  )}
                </div>
              ) : (
                /* ── QUIZ VIEW ── */
                <div>
                  {/* Resource links */}
                  <div style={{ marginBottom: 'var(--spacing-md)' }}>
                    {resources.map(r => (
                      <a key={r._id} href={r.url} target="_blank" rel="noreferrer"
                        style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--accent-color)', fontSize: '0.875rem', textDecoration: 'none' }}>
                        [{r.type.toUpperCase()}] {r.title} ↗
                      </a>
                    ))}
                  </div>

                  <p style={{ fontSize: '0.8rem', marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>
                    Answer all questions, then submit. Passing score: 80% ({answeredCount}/{allQuizQuestions.length} answered)
                  </p>

                  {/* Questions */}
                  {allQuizQuestions.map(({ resourceId, question, expectedAnswer }, i) => (
                    <div key={i} style={{ marginBottom: 'var(--spacing-sm)', padding: 'var(--spacing-sm)', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)' }}>
                      <p style={{ fontSize: '0.875rem', marginBottom: '0.4rem' }}>{i + 1}. {question}</p>
                      <div className="flex-gap" style={{ gap: '0.5rem' }}>
                        {['Yes', 'No'].map(opt => {
                          const key = `${resourceId}::${question}`;
                          const selected = quizAnswers[key] === opt;
                          return (
                            <button
                              key={opt}
                              onClick={() => handleQuizAnswer(resourceId, question, opt)}
                              style={{
                                padding: '0.3rem 1rem',
                                borderRadius: 'var(--radius-md)',
                                border: `1px solid ${selected ? 'var(--accent-color)' : 'var(--panel-border)'}`,
                                background: selected ? 'rgba(88,166,255,0.15)' : 'transparent',
                                color: selected ? 'var(--accent-color)' : 'var(--text-secondary)',
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                                fontSize: '0.875rem',
                                transition: 'all 0.15s ease',
                              }}>
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  <button
                    className="btn"
                    style={{ width: '100%', marginTop: '0.75rem', background: canSubmitQuiz ? 'var(--success-color)' : undefined, opacity: canSubmitQuiz ? 1 : 0.4 }}
                    disabled={!canSubmitQuiz || submittingQuiz}
                    onClick={handleQuizSubmit}
                  >
                    {submittingQuiz ? 'Submitting…' : 'Submit Quiz'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
