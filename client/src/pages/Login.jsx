import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrainCircuit, Lock, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>

      {/* Decorative glow blobs */}
      <div style={{ position: 'fixed', top: '15%', left: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(88,166,255,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '10%', right: '5%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(63,185,80,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div className="panel animate-slide-up" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(88,166,255,0.1)', border: '1px solid rgba(88,166,255,0.25)', borderRadius: '16px', width: 64, height: 64, marginBottom: '1.2rem' }}>
            <BrainCircuit size={34} color="var(--accent-color)" />
          </div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '0.35rem' }}>AI Guidebook</h1>
          <p style={{ fontSize: '0.9rem', margin: 0 }}>Responsible AI use for students at NTNU</p>
        </div>

        {error && (
          <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-color)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', marginBottom: 'var(--spacing-md)', color: 'var(--danger-color)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="username" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <User size={13} /> Username
            </label>
            <input
              type="text" id="username" className="input"
              placeholder="e.g. alice"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Lock size={13} /> Password
            </label>
            <input
              type="password" id="password" className="input"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
            {loading ? 'Authenticating…' : (<>Sign In <ArrowRight size={16} /></>)}
          </button>
        </form>

        <div style={{ marginTop: '1.75rem', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--panel-border)', textAlign: 'center' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
            Demo credentials: <strong style={{ color: 'var(--text-secondary)' }}>alice</strong> / <strong style={{ color: 'var(--text-secondary)' }}>password123</strong>
          </p>
        </div>

        <p style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          New student? <a href="/register" style={{ color: 'var(--accent-color)', textDecoration: 'none', fontWeight: 500 }}>Create an account</a>
        </p>

        <p style={{ marginTop: '0.5rem', textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          AI Guidebook for Students — TDT4242 Advanced Software Engineering
        </p>
      </div>
    </div>
  );
};

export default Login;
