import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { Upload, MessageSquare, ShieldCheck, LogOut, LogIn } from 'lucide-react';
import ChatPage from './pages/ChatPage';
import UploadPage from './pages/UploadPage';
import LoginPage from './pages/LoginPage';
import SettingsPage from './pages/SettingsPage';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthProvider';
import { useAuth } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';


function AppContent() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className={`app-container ${user ? 'with-sidebar' : 'guest-mode'}`}>
      {/* Sidebar Navigation */}

      {user && (
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
            <NavLink to="/settings" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <ShieldCheck size={20} />
              <span>Settings</span>
            </NavLink>
          </div>
          
          <div className="nav-footer">
            <div className="user-profile">
              <div className="user-info">
                <span className="user-email">{user.email}</span>
              </div>
              <button onClick={handleLogout} className="action-btn logout">
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
            <div className="status-badge">
              <span className="dot"></span> Online
            </div>
          </div>
        </nav>
      )}


      {/* Main Content Area */}
      <main className="main-content">
        <div className="content-inner animate-fade">
          <Routes>
            <Route path="/" element={<ChatPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/upload" element={
              <ProtectedRoute>
                <UploadPage />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .nav-footer { margin-top: auto; padding-top: 24px; border-top: 1px solid var(--border); display: flex; flex-direction: column; gap: 16px; }
        .user-profile { margin-bottom: 8px; }
        .user-info { margin-bottom: 12px; }
        .user-email { font-size: 0.75rem; color: var(--text-muted); display: block; overflow: hidden; text-overflow: ellipsis; }
        .action-btn { 
          display: flex; 
          align-items: center; 
          gap: 10px; 
          padding: 10px 16px; 
          border-radius: var(--radius-md); 
          width: 100%; 
          font-size: 0.9rem; 
          font-weight: 500; 
          cursor: pointer; 
          transition: 0.2s;
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text-main);
          text-decoration: none;
        }
        .action-btn:hover { background: rgba(255, 255, 255, 0.05); }
        .action-btn.logout:hover { color: #f87171; border-color: #f87171; }
        .action-btn.login { border-color: var(--primary); color: var(--primary); }
        .action-btn.login:hover { background: var(--bg-chat-ai); }
      `}} />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <SettingsProvider>
          <AppContent />
        </SettingsProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
