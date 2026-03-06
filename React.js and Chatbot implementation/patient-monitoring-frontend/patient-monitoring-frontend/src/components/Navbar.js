import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navLinks = [
  { path: '/dashboard',     label: 'Dashboard',     icon: '📊' },
  { path: '/patients',      label: 'Patients',      icon: '👥' },
  { path: '/doctors',       label: 'Doctors',       icon: '🩺' },
  { path: '/appointments',  label: 'Appointments',  icon: '📅' },
  { path: '/consultations', label: 'Consultations', icon: '💬' },
  { path: '/readings',      label: 'Daily Readings', icon: '📈' },
  { path: '/health-data',   label: 'Health Data',   icon: '🏥' },
  { path: '/messages',      label: 'Messages',      icon: '✉️' },
  { path: '/reports',       label: 'Reports',       icon: '📋' },
];

// Real medical-context Unsplash avatars
const DOCTOR_IMGS = [
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=80&h=80&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=80&h=80&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=80&h=80&fit=crop&crop=face',
];
const PATIENT_IMGS = [
  'https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=80&h=80&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=80&h=80&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&h=80&fit=crop&crop=face',
];

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');

  .mw-nav {
    position: sticky;
    top: 0;
    z-index: 300;
    font-family: 'DM Sans', sans-serif;
  }

  /* ── TOP STRIP with a real image behind it ── */
  .mw-nav-strip {
    position: relative;
    height: 68px;
    display: flex;
    align-items: center;
    padding: 0 1.75rem;
    gap: 0.5rem;
    overflow: hidden;
  }

  .mw-nav-strip-bg {
    position: absolute;
    inset: 0;
    width: 100%; height: 100%;
    object-fit: cover;
    object-position: center 35%;
    filter: brightness(0.18) saturate(0.4);
    z-index: 0;
  }

  .mw-nav-strip-blur {
    position: absolute;
    inset: 0;
    background: rgba(10, 22, 40, 0.82);
    backdrop-filter: blur(20px);
    z-index: 1;
    border-bottom: 1px solid rgba(42,157,143,0.2);
  }

  /* Everything inside the strip sits above the bg */
  .mw-nav-strip > *:not(.mw-nav-strip-bg):not(.mw-nav-strip-blur) {
    position: relative;
    z-index: 2;
  }

  /* ── BRAND ── */
  .mw-brand {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    margin-right: 1.25rem;
    flex-shrink: 0;
    text-decoration: none;
  }

  .mw-brand-logo-wrap {
    position: relative;
    width: 38px; height: 38px;
    flex-shrink: 0;
  }

  .mw-brand-logo {
    width: 38px; height: 38px;
    border-radius: 11px;
    object-fit: cover;
    border: 1.5px solid rgba(42,157,143,0.5);
    display: block;
  }

  .mw-brand-pulse {
    position: absolute;
    inset: -3px;
    border-radius: 14px;
    border: 1.5px solid rgba(42,157,143,0.35);
    animation: pulse 2.4s ease-in-out infinite;
  }

  .mw-brand-name {
    font-family: 'Fraunces', serif;
    font-size: 1.22rem;
    font-weight: 800;
    letter-spacing: -0.025em;
    background: linear-gradient(135deg, #5CE0D0 0%, #90E0EF 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* ── LINKS ── */
  .mw-links {
    display: flex;
    gap: 0.1rem;
    flex: 1;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .mw-links::-webkit-scrollbar { display: none; }

  .mw-link {
    display: flex;
    align-items: center;
    gap: 0.32rem;
    padding: 0.42rem 0.75rem;
    border-radius: 10px;
    text-decoration: none;
    color: rgba(244,241,236,0.45);
    font-size: 0.78rem;
    font-weight: 400;
    white-space: nowrap;
    transition: all 0.18s;
    border: 1px solid transparent;
  }
  .mw-link:hover  { color: rgba(244,241,236,0.8); background: rgba(255,255,255,0.06); }
  .mw-link.active { color: #5CE0D0; background: rgba(92,224,208,0.1); border-color: rgba(92,224,208,0.22); }

  /* ── USER AREA ── */
  .mw-user {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    margin-left: auto;
    flex-shrink: 0;
  }

  .mw-avatar-wrap {
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }

  .mw-avatar-ring {
    position: relative;
    width: 40px; height: 40px;
    flex-shrink: 0;
  }

  .mw-avatar-img {
    width: 40px; height: 40px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid rgba(92,224,208,0.5);
    display: block;
    transition: border-color 0.2s;
  }
  .mw-avatar-img:hover { border-color: #5CE0D0; }

  .mw-avatar-status {
    position: absolute;
    bottom: 1px; right: 1px;
    width: 10px; height: 10px;
    border-radius: 50%;
    background: #2A9D8F;
    border: 2px solid #0A1628;
  }

  .mw-name  { font-size: 0.84rem; font-weight: 500; color: #F4F1EC; white-space: nowrap; }
  .mw-role  { font-size: 0.67rem; color: #5CE0D0; text-transform: capitalize; letter-spacing: 0.05em; }

  .mw-logout {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.42rem 1rem;
    background: rgba(230,57,70,0.1);
    border: 1px solid rgba(230,57,70,0.22);
    border-radius: 50px;
    color: #E63946;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.78rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.18s;
    white-space: nowrap;
  }
  .mw-logout:hover { background: rgba(230,57,70,0.18); border-color: rgba(230,57,70,0.4); }

  /* ── HAMBURGER ── */
  .mw-burger {
    display: none;
    background: none;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px;
    color: #F4F1EC;
    font-size: 1rem;
    cursor: pointer;
    padding: 0.38rem 0.6rem;
    margin-left: 0.5rem;
    transition: all 0.18s;
  }
  .mw-burger:hover { background: rgba(255,255,255,0.08); }

  /* ── MOBILE DRAWER ── */
  .mw-drawer {
    position: fixed;
    top: 68px; left: 0; right: 0;
    z-index: 299;
    overflow: hidden;
    max-height: 0;
    transition: max-height 0.32s ease;
  }
  .mw-drawer.open { max-height: 600px; }

  .mw-drawer-inner {
    position: relative;
    overflow: hidden;
  }
  .mw-drawer-bg {
    position: absolute;
    inset: 0;
    width: 100%; height: 100%;
    object-fit: cover;
    filter: brightness(0.12) saturate(0.3);
    z-index: 0;
  }
  .mw-drawer-blur {
    position: absolute;
    inset: 0;
    background: rgba(10,22,40,0.92);
    backdrop-filter: blur(20px);
    z-index: 1;
    border-bottom: 1px solid rgba(42,157,143,0.18);
  }
  .mw-drawer-links {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    padding: 1rem 1.5rem 1.5rem;
    gap: 0.25rem;
  }

  /* ── KEYFRAMES ── */
  @keyframes pulse {
    0%, 100% { opacity: 0.35; transform: scale(1);    }
    50%       { opacity: 0.7;  transform: scale(1.06); }
  }

  @media (max-width: 1024px) {
    .mw-links { display: none; }
    .mw-burger { display: block; }
    .mw-name, .mw-role { display: none; }
  }
`;

export default function Navbar() {
  const { user, userType, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => { setOpen(false); }, [location.pathname]);

  if (!user) return null;

  const pool   = userType === 'doctor' ? DOCTOR_IMGS : PATIENT_IMGS;
  const avatar = pool[(user?.doctorId || user?.patientId || 0) % pool.length];

  return (
    <>
      <style>{css}</style>

      <nav className="mw-nav">
        {/* ── MAIN BAR ── */}
        <div className="mw-nav-strip">
          {/* Background medical image */}
          <img
            className="mw-nav-strip-bg"
            src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1600&h=140&fit=crop&crop=center"
            alt=""
            aria-hidden="true"
          />
          <div className="mw-nav-strip-blur" />

          {/* Brand */}
          <Link to="/dashboard" className="mw-brand">
            <div className="mw-brand-logo-wrap">
              <img
                className="mw-brand-logo"
                src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=80&h=80&fit=crop"
                alt="MediWatch logo"
              />
              <div className="mw-brand-pulse" />
            </div>
            <span className="mw-brand-name">MediWatch</span>
          </Link>

          {/* Desktop links */}
          <div className="mw-links">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`mw-link${location.pathname === link.path ? ' active' : ''}`}
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}
          </div>

          {/* User area */}
          <div className="mw-user">
            <div className="mw-avatar-wrap">
              <div className="mw-avatar-ring">
                <img
                  className="mw-avatar-img"
                  src={avatar}
                  alt={user.name}
                  onError={e => { e.target.src = DOCTOR_IMGS[0]; }}
                />
                <div className="mw-avatar-status" title="Online" />
              </div>
              <div>
                <div className="mw-name">{user.name}</div>
                <div className="mw-role">{userType}</div>
              </div>
            </div>
            <button className="mw-logout" onClick={() => { logout(); navigate('/login'); }}>
              🚪 Logout
            </button>
          </div>

          {/* Hamburger */}
          <button className="mw-burger" onClick={() => setOpen(o => !o)} aria-label="Toggle menu">
            {open ? '✕' : '☰'}
          </button>
        </div>

        {/* ── MOBILE DRAWER ── */}
        <div className={`mw-drawer${open ? ' open' : ''}`}>
          <div className="mw-drawer-inner">
            <img
              className="mw-drawer-bg"
              src="https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=800&h=500&fit=crop"
              alt=""
              aria-hidden="true"
            />
            <div className="mw-drawer-blur" />
            <div className="mw-drawer-links">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`mw-link${location.pathname === link.path ? ' active' : ''}`}
                  onClick={() => setOpen(false)}
                >
                  <span>{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}