import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const MENU = [
  { path: '/admin', label: 'Dashboard', icon: '📊', exact: true },
  { path: '/admin/products', label: 'Products', icon: '🥦' },
  { path: '/admin/categories', label: 'Categories', icon: '📂' },
  { path: '/admin/orders', label: 'Orders', icon: '📦' },
  { path: '/admin/delivery', label: 'Delivery Persons', icon: '🛵' },
  { path: '/admin/customers', label: 'Customers', icon: '👥' },
  { path: '/admin/payments', label: 'Payments', icon: '💳' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div>
      <nav className="navbar">
        <div className="navbar-logo">🥦 GreenBasket Admin</div>
        <div className="navbar-right">
          <span style={{ fontSize: '14px', color: 'var(--gray)' }}>⚙️ {user?.name}</span>
          <button className="btn-outline" onClick={handleLogout} style={{ padding: '8px 18px', fontSize: '13px' }}>Logout</button>
        </div>
      </nav>
      <div className="layout">
        <aside className="sidebar">
          <div style={{ marginBottom: '20px', padding: '12px 16px', background: 'var(--green-pale)', borderRadius: '10px' }}>
            <div style={{ fontSize: '12px', color: 'var(--gray)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Admin Panel</div>
          </div>
          <div className="sidebar-menu">
            {MENU.map(item => {
              const isActive = item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path);
              return (
                <button
                  key={item.path}
                  className={`sidebar-item ${isActive ? 'active' : ''}`}
                  onClick={() => navigate(item.path)}
                >
                  <span className="sidebar-icon">{item.icon}</span>
                  {item.label}
                </button>
              );
            })}
          </div>
        </aside>
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
