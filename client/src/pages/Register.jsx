import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BrainCircuit, User, Lock, Mail, ArrowRight, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import * as api from '../services/api';

const Toast = ({ msg, type }) => (
  <div style={{
    position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 9999,
    background: type === 'success' ? 'rgba(63,185,80,0.15)' : 'rgba(248,81,73,0.15)',
    border: `1px solid ${type === 'success' ? 'var(--success-color)' : 'var(--danger-color)'}`,
    borderRadius: 'var(--radius-lg)', padding: '0.9rem 1.25rem',
    color: type === 'success' ? 'var(--success-color)' : 'var(--danger-color)',
    fontWeight: 500, fontSize: '0.9rem', animation: 'slideUp 0.3s ease',
    backdropFilter: 'blur(8px)',
  }}>{msg}</div>
);

const MOCK_CODE = '482931';

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep]         = useState(1); // 1=form, 2=MFA
  const [email, setEmail]       = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [consent, setConsent]   = useState(false);
  const [mfaCode, setMfaCode]   = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [toast, setToast]       = useState(null);
  const [loading, setLoading]   = useState(false);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (!consent) return showToast('You must consent to data collection to continue.', 'error');
    if (password !== confirm) return showToast('Passwords do not match.', 'error');
    if (!email.endsWith('.ntnu.no') && !email.endsWith('@ntnu.no')) {
      return showToast('Please use your NTNU university email address.', 'error');
    }
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep(2); }, 900);
  };

  const handleMFA = async (e) => {
    e.preventDefault();
    if (mfaCode !== MOCK_CODE) return showToast('Invalid code. Try: ' + MOCK_CODE, 'error');

    setLoading(true);

    try {
      await api.register({
        username,
        email,
        password,
      });

      setLoading(false);
      showToast('Account created! Redirecting…');
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      setLoading(false);
      showToast(err.message || 'Registration failed. Please try again.', 'error');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ position: 'fixed', top: '10%', right: '8%', width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(63,185,80,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '15%', left: '5%', width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(88,166,255,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {toast && <Toast msg={toast.msg} type={toast.type} />}

      <div className="panel animate-slide-up" style={{ width: '100%', maxWidth: '460px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(63,185,80,0.1)', border: '1px solid rgba(63,185,80,0.25)', borderRadius: '16px', width: 64, height: 64, marginBottom: '1.2rem' }}>
            <BrainCircuit size={34} color="var(--success-color)" />
          </div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.3rem' }}>Create Account</h1>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>{step === 1 ? 'Join the NTNU AI Guidebook Portal' : 'Multi-Factor Authentication'}</p>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '2rem' }}>
          {[1, 2].map(s => (
            <div key={s} style={{ flex: 1, height: 4, borderRadius: '99px', background: step >= s ? 'var(--success-color)' : 'rgba(255,255,255,0.1)', transition: 'background 0.4s' }} />
          ))}
        </div>

        {step === 1 ? (
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            <div className="input-group" style={{ margin: 0 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Mail size={13} /> University Email</label>
              <input type="email" className="input" placeholder="you@stud.ntnu.no" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="input-group" style={{ margin: 0 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><User size={13} /> Username</label>
              <input type="text" className="input" placeholder="e.g. alice99" value={username} onChange={e => setUsername(e.target.value)} required />
            </div>
            <div className="input-group" style={{ margin: 0 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Lock size={13} /> Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showPw ? 'text' : 'password'} className="input" placeholder="Min. 8 characters" value={password} onChange={e => setPassword(e.target.value)} required style={{ paddingRight: '2.5rem' }} />
                <button type="button" onClick={() => setShowPw(p => !p)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="input-group" style={{ margin: 0 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Lock size={13} /> Confirm Password</label>
              <input type="password" className="input" placeholder="Re-enter password" value={confirm} onChange={e => setConfirm(e.target.value)} required />
            </div>

            {/* Consent checkbox (FR25) */}
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.9rem', background: 'rgba(88,166,255,0.05)', border: '1px solid rgba(88,166,255,0.2)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
              <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} style={{ accentColor: 'var(--accent-color)', transform: 'scale(1.2)', marginTop: '2px', flexShrink: 0 }} />
              <span style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                <strong style={{ color: '#fff' }}>I consent</strong> to the collection and processing of my academic AI usage data in accordance with the <a href="https://www.ntnu.edu/privacy" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-color)' }}>NTNU Privacy Policy</a> and applicable data protection regulations.
              </span>
            </label>

            <button type="submit" className="btn" disabled={loading} style={{ width: '100%', marginTop: '0.25rem' }}>
              {loading ? 'Processing…' : <><ShieldCheck size={16} /> Continue to Verification</>}
            </button>
          </form>
        ) : (
          <form onSubmit={handleMFA} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            <div style={{ padding: '1rem', background: 'rgba(88,166,255,0.06)', border: '1px solid rgba(88,166,255,0.2)', borderRadius: 'var(--radius-md)', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              A 6-digit verification code has been sent to <strong style={{ color: '#fff' }}>{email}</strong>. Enter it below to activate your account.
              <br /><span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Mockup hint: use code <strong style={{ color: 'var(--accent-color)' }}>{MOCK_CODE}</strong></span>
            </div>
            <div className="input-group" style={{ margin: 0 }}>
              <label>Verification Code</label>
              <input type="text" className="input" placeholder="6-digit code" maxLength={6} value={mfaCode} onChange={e => setMfaCode(e.target.value)} required style={{ textAlign: 'center', fontSize: '1.4rem', letterSpacing: '0.3em', fontWeight: 700 }} />
            </div>
            <button type="submit" className="btn" disabled={loading} style={{ width: '100%', background: 'var(--success-color)' }}>
              {loading ? 'Verifying…' : <><ArrowRight size={16} /> Activate Account</>}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setStep(1)} style={{ width: '100%' }}>← Back</button>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent-color)', textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
