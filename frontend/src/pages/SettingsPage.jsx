import React, { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { Cpu, Check, AlertCircle, Loader2 } from 'lucide-react';

const SettingsPage = () => {
  const { service, updateService, loading } = useSettings();
  const { user } = useAuth();
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleServiceChange = async (newService) => {
    if (!user) return;
    if (newService === service) return;

    setUpdating(true);
    setError(null);
    setSuccess(false);

    try {
      await updateService(newService);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update service');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="settings-loading">
        <Loader2 className="animate-spin" size={32} />
        <p>Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="settings-container animate-fade">
      <header className="settings-header">
        <h1>Settings</h1>
        <p className="subtitle">Manage your chatbot's global configurations</p>
      </header>

      <section className="settings-section glass">
        <div className="section-title">
          <Cpu className="icon" size={24} />
          <h2>AI Service Provider</h2>
        </div>
        
        <p className="description">
          Choose the global AI model used for all chat responses. 
          {!user && <span className="auth-notice"> (Only authenticated users can change this)</span>}
        </p>

        <div className="service-options">
          <button 
            className={`service-card ${service === 'openai' ? 'active' : ''} ${!user ? 'disabled' : ''}`}
            onClick={() => handleServiceChange('openai')}
            disabled={!user || updating}
          >
            <div className="card-content">
              <h3>OpenAI</h3>
              <p>GPT-4o or GPT-3.5 Turbo</p>
            </div>
            {service === 'openai' && <Check className="check" size={20} />}
          </button>

          <button 
            className={`service-card ${service === 'gemini' ? 'active' : ''} ${!user ? 'disabled' : ''}`}
            onClick={() => handleServiceChange('gemini')}
            disabled={!user || updating}
          >
            <div className="card-content">
              <h3>Google Gemini</h3>
              <p>Gemini 2.5 Flash Lite</p>
            </div>
            {service === 'gemini' && <Check className="check" size={20} />}
          </button>
        </div>

        {error && (
          <div className="settings-alert error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="settings-alert success">
            <Check size={18} />
            <span>Settings saved successfully!</span>
          </div>
        )}

        {!user && (
          <div className="guest-info">
            <AlertCircle size={18} />
            <span>You are currently in guest mode. Log in to change the global AI model.</span>
          </div>
        )}
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        .settings-container { max-width: 800px; margin: 0 auto; padding: 40px 20px; }
        .settings-header { margin-bottom: 32px; }
        .settings-header h1 { font-size: 2.5rem; margin-bottom: 8px; background: linear-gradient(135deg, #fff 0%, var(--primary) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .subtitle { color: var(--text-muted); font-size: 1.1rem; }
        
        .settings-section { padding: 32px; border-radius: var(--radius-lg); border: 1px solid var(--border); }
        .section-title { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; color: var(--primary); }
        .section-title h2 { margin: 0; font-size: 1.5rem; }
        
        .description { color: var(--text-muted); margin-bottom: 24px; line-height: 1.6; }
        .auth-notice { color: #f87171; font-weight: 500; }
        
        .service-options { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
        
        .service-card { 
          padding: 24px; 
          border-radius: var(--radius-md); 
          background: rgba(255, 255, 255, 0.03); 
          border: 1px solid var(--border); 
          color: var(--text-main); 
          cursor: pointer; 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
          transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          text-align: left;
        }
        
        .service-card:hover:not(.disabled) { background: rgba(255, 255, 255, 0.06); border-color: var(--primary); transform: translateY(-2px); }
        .service-card.active { background: rgba(var(--primary-rgb), 0.1); border-color: var(--primary); box-shadow: 0 0 20px rgba(var(--primary-rgb), 0.15); }
        .service-card.disabled { opacity: 0.6; cursor: not-allowed; }
        
        .card-content h3 { margin: 0 0 4px 0; font-size: 1.2rem; }
        .card-content p { margin: 0; font-size: 0.9rem; color: var(--text-muted); }
        
        .check { color: var(--primary); }
        
        .settings-alert { display: flex; align-items: center; gap: 10px; padding: 12px 16px; border-radius: var(--radius-sm); margin-top: 16px; font-size: 0.9rem; }
        .settings-alert.error { background: rgba(239, 68, 68, 0.1); color: #fca5a5; border: 1px solid rgba(239, 68, 68, 0.2); }
        .settings-alert.success { background: rgba(34, 197, 94, 0.1); color: #86efac; border: 1px solid rgba(34, 197, 94, 0.2); }
        
        .guest-info { display: flex; align-items: center; gap: 10px; color: var(--text-muted); margin-top: 24px; font-size: 0.9rem; padding: 12px; background: rgba(255,255,255,0.05); border-radius: 8px; }
        
        .settings-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 300px; gap: 16px; color: var(--text-muted); }
      `}} />
    </div>
  );
};

export default SettingsPage;
