import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ShieldAlert, BookOpenCheck, BrainCircuit, CheckCircle2 } from 'lucide-react';

// Mock Fetching API for when backend is running, but hardcoded fallback here so it runs visually
const MOCK_DATA = [
  { date: '2026-10-01', ChatGPT: 2, Copilot: 4, Claude: 1 },
  { date: '2026-10-02', ChatGPT: 3, Copilot: 2, Claude: 0 },
  { date: '2026-10-03', ChatGPT: 1, Copilot: 5, Claude: 2 },
  { date: '2026-10-04', ChatGPT: 4, Copilot: 3, Claude: 1 },
  { date: '2026-10-05', ChatGPT: 2, Copilot: 4, Claude: 3 },
];

const Guidelines = [
  { id: 1, title: 'Transparency', desc: 'Always declare AI usage in assignments.' },
  { id: 2, title: 'Privacy', desc: 'Do not input sensitive data into public models.' }
];

const Dashboard = () => {
  // Filters for FR10
  const [filterTool, setFilterTool] = useState('All');
  
  // Quiz states for FR12
  const [quizScore, setQuizScore] = useState(null);
  
  const handleQuizSubmit = () => {
    // Mock passing the quiz
    setQuizScore(100);
  };

  return (
    <div style={{ paddingBottom: '3rem' }}>
      <header className="flex-between panel" style={{ marginBottom: 'var(--spacing-lg)', marginTop: 'var(--spacing-lg)' }}>
        <div className="flex-gap">
          <BrainCircuit color="var(--accent-color)" size={32} />
          <div>
            <h1 style={{ margin: 0 }}>Student Dashboard</h1>
            <p style={{ margin: 0, fontSize: '0.875rem' }}>Personalized AI Configuration & Tracking</p>
          </div>
        </div>
        <div>
          <button className="btn btn-secondary">Settings</button>
        </div>
      </header>
      
      {/* Feedback Widget FR13 */}
      <div className="panel" style={{ borderLeft: '4px solid var(--accent-color)', marginBottom: 'var(--spacing-lg)' }}>
        <h3>Current Insight</h3>
        <p>You have been consistently using GitHub Copilot this week. Ensure you verify compiler suggestions and understand the logic to maintain academic integrity.</p>
      </div>

      <div className="grid-2">
        {/* Usage Graph Panel FR9 & FR10 */}
        <div className="panel">
          <div className="flex-between" style={{ marginBottom: 'var(--spacing-md)' }}>
            <h2>AI Usage History</h2>
            <select className="input" style={{ width: 'auto' }} value={filterTool} onChange={e => setFilterTool(e.target.value)}>
              <option value="All">All Tools</option>
              <option value="ChatGPT">ChatGPT Only</option>
              <option value="Copilot">Copilot Only</option>
            </select>
          </div>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MOCK_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--panel-border)" />
                <XAxis dataKey="date" stroke="var(--text-secondary)" />
                <YAxis stroke="var(--text-secondary)" />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-color)', border: '1px solid var(--panel-border)' }} />
                <Legend wrapperStyle={{ paddingTop: '10px' }}/>
                {(filterTool === 'All' || filterTool === 'ChatGPT') && <Line type="monotone" dataKey="ChatGPT" stroke="#10a37f" strokeWidth={2} />}
                {(filterTool === 'All' || filterTool === 'Copilot') && <Line type="monotone" dataKey="Copilot" stroke="#58a6ff" strokeWidth={2} />}
                {(filterTool === 'All' || filterTool === 'Claude') && <Line type="monotone" dataKey="Claude" stroke="#d97757" strokeWidth={2} />}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
          {/* Guidelines FR11 */}
          <div className="panel" style={{ flex: 1 }}>
            <div className="flex-gap" style={{ marginBottom: 'var(--spacing-md)' }}>
              <ShieldAlert color="var(--danger-color)" />
              <h2 style={{ margin: 0 }}>Ethical Guidelines</h2>
            </div>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {Guidelines.map(g => (
                <li key={g.id} style={{ marginBottom: 'var(--spacing-md)', padding: 'var(--spacing-sm)', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)' }}>
                  <strong>{g.title}</strong>
                  <p style={{ fontSize: '0.875rem', marginTop: '4px' }}>{g.desc}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Educational Resources & Quiz FR12 */}
          <div className="panel" style={{ flex: 1 }}>
            <div className="flex-gap" style={{ marginBottom: 'var(--spacing-md)' }}>
              <BookOpenCheck color="var(--success-color)" />
              <h2 style={{ margin: 0 }}>Training Module</h2>
            </div>
            <p style={{ marginBottom: '1rem', fontSize: '0.875rem' }}>Review the resources and pass the required quiz (&gt;80%).</p>
            
            {quizScore === null ? (
              <div>
                <button onClick={handleQuizSubmit} className="btn" style={{ width: '100%', background: 'var(--success-color)' }}>
                  Take Integrity Quiz
                </button>
              </div>
            ) : (
              <div className="flex-gap" style={{ color: 'var(--success-color)' }}>
                <CheckCircle2 size={32} />
                <div>
                  <strong>Quiz Passed!</strong>
                  <p style={{ margin: 0, fontSize: '0.875rem' }}>Score: {quizScore}%</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
