import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function CustomerLayout() {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div>
      <nav className="navbar">
        <div className="navbar-logo">🥦 GreenBasket</div>
        <div className="navbar-nav">
          <NavLink to="/customer" end>🏠 Home</NavLink>
          <NavLink to="/customer/orders">📦 Orders</NavLink>
          <NavLink to="/customer/notifications">🔔 Notifications</NavLink>
          <NavLink to="/customer/profile">👤 Profile</NavLink>
        </div>
        <div className="navbar-right">
          <button className="cart-icon" onClick={() => navigate('/customer/cart')}>
            🛒
            {cartItems.length > 0 && <span className="cart-badge">{cartItems.length}</span>}
          </button>
          <span style={{ fontSize: '14px', color: 'var(--gray)', fontWeight: '500' }}>Hi, {user?.name}</span>
          <button className="btn-outline" onClick={handleLogout} style={{ padding: '8px 18px', fontSize: '13px' }}>Logout</button>
        </div>
      </nav>
      <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
        <Outlet />
      </div>
    </div>
  );
}
