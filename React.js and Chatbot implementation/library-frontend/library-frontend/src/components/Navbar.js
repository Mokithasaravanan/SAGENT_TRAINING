import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/', label: 'Dashboard' },
    { to: '/books', label: 'Books' },
    { to: '/borrow', label: 'Borrowing' },
    { to: '/members', label: 'Members' },
    { to: '/fines', label: 'Fines' },
    { to: '/inventory', label: 'Inventory' },
    { to: '/notifications', label: 'Notifications' },
  ];

  return (
    <nav style={{
      background: '#1a1612',
      color: 'white',
      padding: '0 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '64px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 2px 20px rgba(0,0,0,0.3)',
      overflowX: 'auto'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', minWidth: 'max-content' }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.3rem', color: '#d4822a', fontWeight: 700 }}>
            📖 LibraryMS
          </span>
        </Link>
        <div style={{ display: 'flex', gap: '0.15rem' }}>
          {navLinks.map(link => (
            <Link key={link.to} to={link.to} style={{
              textDecoration: 'none',
              padding: '0.4rem 0.75rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              color: location.pathname === link.to ? '#d4822a' : '#c4b5a5',
              background: location.pathname === link.to ? 'rgba(212,130,42,0.15)' : 'transparent',
              fontWeight: location.pathname === link.to ? 600 : 400,
              transition: 'all 0.2s',
              whiteSpace: 'nowrap'
            }}>
              {link.label}
            </Link>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 'max-content', paddingLeft: '1rem' }}>
        <span style={{ fontSize: '0.82rem', color: '#8c7b6e' }}>
          👤 {user?.name?.split(' ')[0] || 'Librarian'}
        </span>
        <button onClick={handleLogout} style={{
          background: 'rgba(192,57,43,0.2)',
          color: '#e74c3c',
          border: '1px solid rgba(192,57,43,0.3)',
          padding: '0.35rem 0.9rem',
          borderRadius: '8px',
          fontSize: '0.82rem',
          cursor: 'pointer'
        }}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;