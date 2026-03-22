import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, User, Bot, Loader2, Info } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ChatPage = () => {

  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hello! I am LeoDroid. I can answer questions based on your documents. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const renderMessageContent = (content) => {
    // Regex for URLs and Emails
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/g;
    const parts = content.split(urlRegex);
    
    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        const isEmail = part.includes('@') && !part.startsWith('http');
        const href = isEmail ? `mailto:${part}` : (part.startsWith('www') ? `https://${part}` : part);
        return (
          <a 
            key={index} 
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
  };


  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/search`, {

        query: userMsg,
        match_threshold: 0.4,
        match_count: 3
      });

      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: response.data.answer,
        matches: response.data.matches 
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      console.error('Attempted URL:', `${API_BASE_URL}/search`);
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: `Sorry, I encountered an error connecting to the service. (URL: ${API_BASE_URL}/search)` 
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

      <style dangerouslySetInnerHTML={{ __html: `
        .chat-container { 
          height: calc(100vh - 120px); 
          display: flex; 
          flex-direction: column; 
          border-radius: var(--radius-lg);
          overflow: hidden;
          transition: all 0.3s ease;
        }
        .guest-mode .chat-container {
          height: 100vh;
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
        .chat-input-area { padding: 24px; border-top: 1px solid var(--border); display: flex; gap: 12px; }
        .chat-input-area input { flex-grow: 1; background: var(--bg-main); border: 1px solid var(--border); padding: 12px 20px; border-radius: var(--radius-md); color: var(--text-main); outline: none; }
        .chat-input-area input:focus { border-color: var(--primary); }
        .sources { margin-top: 12px; font-size: 0.8rem; color: var(--text-muted); display: flex; flex-direction: column; gap: 6px; }
        .source-label { display: flex; align-items: center; gap: 6px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
        .source-item { padding: 8px; border-radius: var(--radius-sm); background: rgba(255, 255, 255, 0.03); border-left: 2px solid var(--primary); font-style: italic; }
        .chat-link { 
          color: inherit; 
          text-decoration: underline; 
          text-decoration-thickness: 1px; 
          text-underline-offset: 2px;
          font-weight: 500;
          transition: opacity 0.2s;
        }
        .chat-link:hover { opacity: 0.8; }
        .message-wrapper.ai .chat-link { color: var(--primary); }
        .message-wrapper.user .chat-link { color: white; }

        .typing-dots { display: flex; gap: 4px; padding: 4px; }
        .typing-dots span { width: 6px; height: 6px; background: var(--text-muted); border-radius: 50%; animation: bounce 1s infinite; }
        .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
        .typing-dots span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }

        @media (max-width: 768px) {
          .chat-messages { padding: 30px 8px; gap: 16px;}
          .chat-input-area{ padding: 16px}
          .message-wrapper { gap: 8px}
          .bubble { padding: 8px 16px; }
        }

        
      `}} />
    </div>
  );
};

export default ChatPage;
