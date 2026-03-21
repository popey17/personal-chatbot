import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { Upload, MessageSquare, ShieldCheck } from 'lucide-react';
import ChatPage from './pages/ChatPage';
import UploadPage from './pages/UploadPage';

function App() {
  return (
    <Router>
      <div className="app-container">
        {/* Navigation */}
        <nav className="nav-sidebar glass">
          <div className="logo-section">
            <div className="logo-icon">
              <ShieldCheck size={32} color="var(--primary)" />
            </div>
            <h2>LeoDroid</h2>
          </div>
          
          <div className="nav-links">
            <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <MessageSquare size={20} />
              <span>Chat</span>
            </NavLink>
            <NavLink to="/upload" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <Upload size={20} />
              <span>Documents</span>
            </NavLink>
          </div>
          
          <div className="nav-footer">
            <div className="status-badge">
              <span className="dot"></span> Online
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="main-content">
          <div className="content-inner animate-fade">
            <Routes>
              <Route path="/" element={<ChatPage />} />
              <Route path="/upload" element={<UploadPage />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
