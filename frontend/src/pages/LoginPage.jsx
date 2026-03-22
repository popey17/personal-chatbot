import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import { ShieldCheck, Mail, Lock, Loader2 } from 'lucide-react';

const LoginPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp({ email, password });
        if (error) throw error;
        alert('Check your email for the confirmation link!');
      } else {
        const { error } = await signIn({ email, password });
        if (error) throw error;
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card glass animate-fade">
        <div className="auth-header">
          <ShieldCheck size={48} color="var(--primary)" />
          <h1>{isSignUp ? 'Create Account' : 'Welcome Back'}</h1>
          <p>{isSignUp ? 'Join the LeoDroid workspace' : 'Enter your credentials to manage LeoDroid'}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <Mail size={18} className="input-icon" />
            <input 
              type="email" 
              placeholder="Email Address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <Lock size={18} className="input-icon" />
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="auth-error animate-fade">{error}</div>}

          <button className="btn btn-primary btn-block" disabled={loading}>
            {loading ? <Loader2 className="spinner" /> : (isSignUp ? 'Sign Up' : 'Login')}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            <button onClick={() => setIsSignUp(!isSignUp)} className="toggle-btn">
              {isSignUp ? 'Login' : 'Create one'}
            </button>
          </p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .auth-page { height: 100dvh; display: flex; align-items: center; justify-content: center; background: var(--bg-main); padding: 20px; }
        .auth-card { width: 100%; max-width: 440px; padding: 48px; border-radius: var(--radius-lg); text-align: center; }
        .auth-header h1 { margin: 16px 0 8px; font-size: 1.75rem; }
        .auth-header p { color: var(--text-muted); font-size: 0.95rem; margin-bottom: 32px; }
        
        .auth-form { display: flex; flex-direction: column; gap: 16px; text-align: left; }
        .input-group { position: relative; }
        .input-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: var(--text-muted); }
        .input-group input { 
          width: 100%; 
          background: rgba(255, 255, 255, 0.05); 
          border: 1px solid var(--border); 
          padding: 14px 14px 14px 48px; 
          border-radius: var(--radius-sm); 
          color: white; 
          outline: none;
          transition: border-color 0.2s;
        }
        .input-group input:focus { border-color: var(--primary); }
        
        .btn-block { width: 100%; margin-top: 8px; height: 48px; }
        .auth-error { background: rgba(239, 68, 68, 0.1); color: #ef4444; padding: 12px; border-radius: var(--radius-sm); font-size: 0.85rem; border: 1px solid rgba(239, 68, 68, 0.2); }
        
        .auth-footer { margin-top: 24px; color: var(--text-muted); font-size: 0.9rem; }
        .toggle-btn { background: none; border: none; color: var(--primary); font-weight: 600; margin-left: 8px; cursor: pointer; }
        .toggle-btn:hover { text-decoration: underline; }
        .spinner { animation: rotate 1s linear infinite; }
        @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}} />
    </div>
  );
};

export default LoginPage;
