import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    // Mock login delay
    setTimeout(() => {
      navigate('/dashboard');
    }, 1000);
  };

  return (
    <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="panel" style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        <BookOpen size={48} color="var(--accent-color)" style={{ marginBottom: '1rem' }} />
        <h1>AI Guidebook</h1>
        <p style={{ marginBottom: '2rem' }}>Navigate your AI usage effectively and ethically.</p>
        
        <form onSubmit={handleLogin}>
          <div className="input-group" style={{ textAlign: 'left' }}>
            <label htmlFor="student-id">Student ID</label>
            <input type="text" id="student-id" className="input" placeholder="e.g. s123456" required />
          </div>
          <div className="input-group" style={{ textAlign: 'left' }}>
            <label htmlFor="password">Password</label>
            <input type="password" id="password" className="input" placeholder="••••••••" required />
          </div>
          
          <button type="submit" className="btn" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
