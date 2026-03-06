import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const studentNav = [
  { path: '/', icon: '⊞', label: 'Dashboard' },
  { path: '/applications', icon: '📋', label: 'My Applications' },
  { path: '/documents', icon: '📁', label: 'Documents' },
  { path: '/payments', icon: '💳', label: 'Payments' },
  { path: '/courses', icon: '🎓', label: 'Courses' },
];

const officerNav = [
  { path: '/applications', icon: '📋', label: 'Applications' },
  { path: '/documents', icon: '📁', label: 'Documents' },
  { path: '/payments', icon: '💳', label: 'Payments' },
  { path: '/students', icon: '👤', label: 'Students' },
  { path: '/courses', icon: '🎓', label: 'Courses' },
];

export default function Layout() {
  const { currentUser, userRole, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = userRole === 'officer' ? officerNav : studentNav;

  React.useEffect(() => {
    if (userRole === 'officer' && location.pathname === '/') {
      navigate('/applications');
    }
  }, [userRole, location.pathname, navigate]);

  // Prev / Next logic
  const currentIndex = navItems.findIndex(item => item.path === location.pathname);
  const prevItem = currentIndex > 0 ? navItems[currentIndex - 1] : null;
  const nextItem = currentIndex < navItems.length - 1 ? navItems[currentIndex + 1] : null;
  const currentItem = navItems[currentIndex] || null;

  return (
    <div className="layout">
      <aside className="sidebar">
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-inner">
            <div className="sidebar-logo-icon">🎓</div>
            <div>
              <h2>EduPortal</h2>
              <span>Admissions System</span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          <div className="nav-section">Navigation</div>
          {navItems.map(item => (
            <button
              key={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="user-badge">
            <div className="user-avatar">
              {currentUser?.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className="user-info">
              <div className="user-name">{currentUser?.name || 'User'}</div>
              <div className="user-role">{userRole}</div>
            </div>
            <button className="logout-btn" onClick={logout} title="Logout">⏻</button>
          </div>
        </div>
      </aside>

      <main className="main-content">

        <Outlet />

        {/* ── Bottom Navigation Bar ── */}
        <div className="topnav-bar">
          <div className="topnav-inner">

            {/* ← Previous */}
            <button
              className={`topnav-btn topnav-prev ${!prevItem ? 'topnav-disabled' : ''}`}
              onClick={() => { if (prevItem) { navigate(prevItem.path); window.scrollTo({ top: 0, behavior: 'smooth' }); } }}
              disabled={!prevItem}
              title={prevItem ? `Go to ${prevItem.label}` : 'No previous page'}
            >
              <span className="topnav-arrow">&#8592;</span>
              <span className="topnav-btn-content">
                <span className="topnav-hint">Previous</span>
                <span className="topnav-name">{prevItem ? prevItem.label : '—'}</span>
              </span>
            </button>

            {/* Current page breadcrumb + dots */}
            <div className="topnav-current">
              {currentItem && (
                <>
                  <span className="topnav-current-icon">{currentItem.icon}</span>
                  <span className="topnav-current-label">{currentItem.label}</span>
                </>
              )}
              <div className="topnav-dots">
                {navItems.map((item, i) => (
                  <button
                    key={item.path}
                    className={`topnav-dot ${i === currentIndex ? 'topnav-dot-active' : ''}`}
                    onClick={() => { navigate(item.path); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    title={item.label}
                  />
                ))}
              </div>
            </div>

            {/* Next → */}
            <button
              className={`topnav-btn topnav-next ${!nextItem ? 'topnav-disabled' : ''}`}
              onClick={() => { if (nextItem) { navigate(nextItem.path); window.scrollTo({ top: 0, behavior: 'smooth' }); } }}
              disabled={!nextItem}
              title={nextItem ? `Go to ${nextItem.label}` : 'No next page'}
            >
              <span className="topnav-btn-content">
                <span className="topnav-hint">Next</span>
                <span className="topnav-name">{nextItem ? nextItem.label : '—'}</span>
              </span>
              <span className="topnav-arrow">&#8594;</span>
            </button>

          </div>
        </div>

      </main>
    </div>
  );
}