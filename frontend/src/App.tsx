import { useState, useEffect } from 'react';
import './App.css';
import AuthScreen from './components/AuthScreen';

import ScheduleView from './components/ScheduleView';

function App() {
  const [healthStatus, setHealthStatus] = useState('Checking...');
  const [token, setToken] = useState<string | null>(localStorage.getItem('memo_token'));
  const [user, setUser] = useState<any>(null);
  const [currentView, setCurrentView] = useState<'home' | 'schedules'>('home');

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => setHealthStatus(data.status))
      .catch(() => setHealthStatus('Offline'));

    if (token) {
      // Validate token and get user info
      fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => {
          if (!res.ok) throw new Error('Invalid token');
          return res.json();
        })
        .then(data => setUser(data.user))
        .catch(() => handleLogout());
    }
  }, [token]);

  const handleLogin = (newToken: string, userData: any) => {
    localStorage.setItem('memo_token', newToken);
    setToken(newToken);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('memo_token');
    setToken(null);
    setUser(null);
  };

  if (!token) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        {/* User Profile Dropdown Button */}
        <div className="sidebar-header" onClick={handleLogout} title="Click to Logout">
          <div className="profile-info">
            <div className="logo-icon blur-effect"></div>
            <h2>{user?.name || user?.email || 'Symphony'}</h2>
          </div>
          <span className="icon" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>▼</span>
        </div>

        <div className="sidebar-menu">
          <button
            className={`menu-btn ${currentView === 'home' ? 'active' : ''}`}
            onClick={() => setCurrentView('home')}
          >
            <span className="icon">🏠</span> Home
          </button>
          <button
            className={`menu-btn ${currentView === 'schedules' ? 'active' : ''}`}
            onClick={() => setCurrentView('schedules')}
          >
            <span className="icon">📝</span> Goals & Schedules
          </button>
          <button className="menu-btn">
            <span className="icon">⚙️</span> Settings
          </button>
        </div>

        <div className="sidebar-footer">
          <div className="status-indicator">
            <span className={`status-dot ${healthStatus === 'ok' ? 'online' : 'offline'}`}></span>
            API: {healthStatus === 'ok' ? 'Online' : 'Offline'}
          </div>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <main className="main-workspace">
        {currentView === 'schedules' ? (
          <ScheduleView token={token} />
        ) : (
          <>
            <header className="workspace-header glass">
              <div className="breadcrumb">Home / Welcome</div>
              <button className="primary-btn">Share</button>
            </header>

            <section className="editor-area">
              <div className="editor-container">
                <h1 className="document-title" contentEditable suppressContentEditableWarning>
                  Welcome to your new custom workspace
                </h1>
                <p className="document-content" contentEditable suppressContentEditableWarning>
                  Start typing your thoughts here. This is the structural foundation for your Next-Gen Notion clone. The backend is powered by Node & Express, PostgreSQL is used for your structured storage, and this frontend is built using React & Vite.
                  <br /><br />
                  Everything is styled with pure Vanilla CSS emphasizing modern glassmorphism, fluid typography, and dynamic micro-interactions.
                </p>

                <div className="blocks-demo">
                  <div className="block">Type '/' for commands</div>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
