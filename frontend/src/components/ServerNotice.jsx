import React, { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';

const ServerNotice = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimating(true), 300);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className={`server-notice-wrapper ${isAnimating ? 'active' : ''}`}>
      <div className="server-notice glass">
        <div className="notice-content">
          <div className="notice-badge">
            <Sparkles size={10} />
            <span>Server</span>
          </div>
          <div className="notice-text">
            <span className="main-text">Server is waking up.</span>
            <span className="sub-text">First request might take some time.</span>
          </div>
        </div>
        <button className="close-btn" onClick={() => setIsVisible(false)} aria-label="Close notice">
          <X size={12} />
        </button>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .server-notice-wrapper {
          opacity: 0;
          transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1);
          position: absolute;
          left: 10px;
          right: 10px;
          bottom: 10px;
        }

        .server-notice-wrapper.active {
          opacity: 1;
          transform: translateY(0);
        }

        .server-notice {
          width: 100%;
          padding: 8px 14px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          border: 1px solid rgba(99, 102, 241, 0.15);
          background: linear-gradient(90deg, rgba(99, 102, 241, 0.03) 0%, rgba(16, 185, 129, 0.03) 100%);
          backdrop-filter: blur(4px);
          position: relative;
          overflow: hidden;
        }

        .notice-content {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .notice-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          background: var(--primary);
          color: white;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 0.6rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .notice-text {
          display: flex;
          flex-direction: column;
        }

        .main-text {
          color: var(--text-main);
          font-size: 0.8rem;
          font-weight: 600;
          line-height: 1.2;
        }

        .sub-text {
          color: var(--text-muted);
          font-size: 0.7rem;
          opacity: 0.8;
        }

        .close-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          padding: 4px;
          border-radius: 50%;
          transition: all 0.2s ease;
          opacity: 0.6;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-main);
          opacity: 1;
        }
      `}} />
    </div>
  );
};

export default ServerNotice;
