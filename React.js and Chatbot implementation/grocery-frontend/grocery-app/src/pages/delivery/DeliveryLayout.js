import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function DeliveryLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#f0faf0 0%,#fff8f0 100%)', fontFamily: "'Nunito', sans-serif" }}>
      <nav style={{ background: 'linear-gradient(135deg,#1b5e20,#2e7d32)', padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64, boxShadow: '0 4px 16px rgba(27,94,32,0.25)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 24 }}>🥦</span>
          <div>
            <span style={{ color: 'white', fontWeight: 900, fontSize: 16 }}>GreenBasket</span>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, display: 'block', marginTop: -2 }}>Delivery Portal</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {[
            { to: '/delivery', label: '📦 My Deliveries', end: true },
            { to: '/delivery/profile', label: '👤 Profile' },
          ].map(l => (
            <NavLink key={l.to} to={l.to} end={l.end}
              style={({ isActive }) => ({ padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 700, color: isActive ? '#2e7d32' : 'rgba(255,255,255,0.85)', background: isActive ? 'white' : 'rgba(255,255,255,0.1)', textDecoration: 'none', transition: 'all 0.2s' })}>
              {l.label}
            </NavLink>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: 'white', fontSize: 13, fontWeight: 700 }}>🛵 {user?.name}</div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>{user?.email}</div>
          </div>
          <button onClick={handleLogout} style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.3)', color: 'white', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Logout</button>
        </div>
      </nav>
      <div style={{ padding: '32px 28px', maxWidth: 1000, margin: '0 auto' }}>
        <Outlet />
      </div>
    </div>
  );
}