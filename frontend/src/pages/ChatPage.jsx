import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, User, Bot, Loader2, Info, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ChatPage = () => {
  useAuth(); // Removed 'user' as it was unused
  const { service } = useSettings(); // Removed 'loading: settingsLoading'
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        { role: 'ai', content: 'Hello! I am LeoDroid. I can answer questions based on your documents. How can I help you today?' }
      ]);
    }
  }, [messages.length]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const renderMessageContent = (content) => {
    const noteMatch = content.match(/\[KNOWLEDGE_NOTE\](.*?)\[\/KNOWLEDGE_NOTE\]/);
    const mainContent = content.replace(/\[KNOWLEDGE_NOTE\].*?\[\/KNOWLEDGE_NOTE\]/, '').trim();
    const noteContent = noteMatch ? noteMatch[1] : null;

    const renderFormattedText = (text) => {
    if (!text) return null;

    // 0. Preliminary cleanup: Replace <br> and <br/> with \n for line splitting
    const normalizedText = text.replace(/<br\s*\/?>/gi, '\n');

    // 1. Split by lines to handle bullet points
    const lines = normalizedText.split('\n');

      return lines.map((line, lineIdx) => {
        const trimmedLine = line.trim();
        const isBullet = trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ');
        const lineContent = isBullet ? trimmedLine.substring(2) : line;

        // 2. Process inline formatting (Bold, Links)
        const combinedRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+|\*\*.*?\*\*)/g;
        const parts = lineContent.split(combinedRegex);
        
        const renderedParts = parts.filter(Boolean).map((part, partIdx) => {
          // Handle Bold
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={partIdx} className="bold-text">{part.slice(2, -2)}</strong>;
          }
          
          // Handle Links
          const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/g;
          if (part.match(urlRegex)) {
            const isEmail = part.includes('@') && !part.startsWith('http');
            const href = isEmail ? `mailto:${part}` : (part.startsWith('www') ? `https://${part}` : part);
            return (
              <a 
                key={partIdx} 
                href={href} 
                target="_blank" 
                rel="noopener noreferrer"
                className="chat-link"
              >
                {part}
              </a>
            );
          }
          return part;
        });

        return (
          <div key={lineIdx} className={isBullet ? 'bullet-line' : 'chat-line'}>
            {isBullet && <span className="bullet-dot">•</span>}
            <span className="line-text">{renderedParts}</span>
          </div>
        );
      });
    };

    return (
      <>
        <div className="main-text">{renderFormattedText(mainContent)}</div>
        {noteContent && (
          <div className="knowledge-note animate-fade-in">
            <span className="info-icon"><Info size={14} /></span>
            <span>{renderFormattedText(noteContent)}</span>
          </div>
        )}
      </>
    );
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const history = messages.slice(-5).map(m => ({
        role: m.role === 'ai' ? 'assistant' : m.role,
        content: m.content
      }));

      const response = await axios.post(`${API_BASE_URL}/search`, {
        query: userMsg,
        history,
        match_threshold: 0.4,
        match_count: 5,
        service: service
      });

      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: response.data.answer,
        matches: response.data.matches 
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: `Sorry, I encountered an error connecting to the service.` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-container glass">
      <div className="chat-messages" ref={scrollRef}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`message-wrapper ${msg.role}`}>
            <div className="avatar">
              {msg.role === 'ai' ? <Bot size={20} /> : <User size={20} />}
            </div>
            <div className="message-content">
              <div className="bubble">
                {renderMessageContent(msg.content)}
              </div>

              {msg.matches && msg.matches.length > 0 && (
                <div className="sources animate-fade">
                  <div className="source-label"><Info size={12} /> References:</div>
                  {msg.matches.map((m, i) => (
                    <div key={i} className="source-item">
                      "{m.content.substring(0, 100)}..."
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message-wrapper ai typing">
            <div className="avatar"><Bot size={20} /></div>
            <div className="bubble">
              <div className="typing-dots">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="chat-footer">
        <form className="chat-input-area" onSubmit={handleSend}>
          <input 
            type="text" 
            placeholder="Ask LeoDroid something..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <button type="submit" className="btn btn-primary" disabled={!input.trim() || isLoading}>
            <Send size={20} />
          </button>
        </form>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .chat-container { 
          height: calc(100dvh - 120px); 
          display: flex; 
          flex-direction: column; 
          border-radius: var(--radius-lg);
          overflow: hidden;
          transition: all 0.3s ease;
        }
        .guest-mode .chat-container {
          height: 100dvh;
          border-radius: 0;
          border: none;
        }

        .chat-messages { flex-grow: 1; overflow-y: auto; padding: 32px; display: flex; flex-direction: column; gap: 24px; }
        .message-wrapper { display: flex; gap: 16px; max-width: 85%; }
        .message-wrapper.user { align-self: flex-end; flex-direction: row-reverse; }
        .avatar { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: var(--border); flex-shrink: 0; }
        .message-wrapper.ai .avatar { background: var(--primary); color: white; }
        .bubble { padding: 14px 20px; border-radius: var(--radius-md); font-size: 0.95rem; }
        .message-wrapper.ai .bubble { background: var(--bg-chat-ai); color: var(--text-main); border-bottom-left-radius: 2px; }
        .message-wrapper.user .bubble { background: var(--primary); color: white; border-bottom-right-radius: 2px; }
        
        .chat-footer { border-top: 1px solid var(--border); background: rgba(255, 255, 255, 0.01); }
        .service-indicator { padding: 8px 24px; display: flex; align-items: center; gap: 8px; font-size: 0.75rem; color: var(--text-muted); opacity: 0.8; }
        .chat-input-area { padding: 16px 24px; display: flex; gap: 12px; }
        .chat-input-area input { flex-grow: 1; background: var(--bg-main); border: 1px solid var(--border); padding: 12px 20px; border-radius: var(--radius-md); color: var(--text-main); outline: none; }
        .chat-input-area input:focus { border-color: var(--primary); }
        
        .sources { margin-top: 12px; font-size: 0.8rem; color: var(--text-muted); display: flex; flex-direction: column; gap: 6px; }
        .source-label { display: flex; align-items: center; gap: 6px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
        .source-item { padding: 8px; border-radius: var(--radius-sm); background: rgba(255, 255, 255, 0.03); border-left: 2px solid var(--primary); font-style: italic; }
        .knowledge-note { 
          margin-top: 12px; 
          padding: 10px 14px; 
          background: rgba(255, 255, 255, 0.05); 
          border-left: 3px solid var(--primary); 
          border-radius: var(--radius-sm); 
          font-size: 0.8rem; 
          color: var(--text-muted);
          display: flex;
          align-items: flex-start;
          gap: 10px;
          line-height: 1.4;
        }
        .info-icon { flex-shrink: 0; margin-top: 2px; color: var(--primary); }
        .typing-dots { display: flex; gap: 4px; padding: 4px; }
        .typing-dots span { width: 6px; height: 6px; background: var(--text-muted); border-radius: 50%; animation: bounce 1s infinite; }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }

        @media (max-width: 768px) {
          .chat-messages { padding: 30px 8px; gap: 16px;}
          .chat-input-area{ padding: 12px 8px}
        }
        .bullet-line { display: flex; gap: 8px; margin-bottom: 6px; padding-left: 4px; align-items: flex-start; }
        .bullet-dot { color: var(--primary); font-weight: bold; flex-shrink: 0; margin-top: 2px; }
        .chat-line { margin-bottom: 6px; line-height: 1.6; }
        .bold-text { color: var(--primary); font-weight: 700; }
        .line-text { flex: 1; }
      `}} />
    </div>
  );
};

export default ChatPage;
