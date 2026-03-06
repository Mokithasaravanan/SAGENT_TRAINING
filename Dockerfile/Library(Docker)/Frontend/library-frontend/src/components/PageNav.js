import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const navLinks = [
  { to: '/', label: 'Dashboard', icon: '🏠' },
  { to: '/books', label: 'Books', icon: '📚' },
  { to: '/borrow', label: 'Borrowing', icon: '🔄' },
  { to: '/members', label: 'Members', icon: '👥' },
];

const PageNav = () => {
  const location = useLocation();

  return (
    <div style={{
      display: 'flex',
      gap: '0.5rem',
      margin: '2rem 0 0 0',
      padding: '1rem',
      background: '#fffdf8',
      border: '1px solid #e0d5c5',
      borderRadius: '12px',
      flexWrap: 'wrap'
    }}>
      {navLinks.map(link => {
        const isActive = location.pathname === link.to;
        return (
          <Link
            key={link.to}
            to={link.to}
            style={{
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 1.1rem',
              borderRadius: '8px',
              fontSize: '0.88rem',
              fontFamily: 'DM Sans, sans-serif',
              fontWeight: isActive ? 600 : 400,
              color: isActive ? '#d4822a' : '#5c3d2e',
              background: isActive ? 'rgba(212,130,42,0.12)' : 'transparent',
              border: isActive ? '1.5px solid rgba(212,130,42,0.3)' : '1.5px solid transparent',
              transition: 'all 0.2s'
            }}
          >
            <span>{link.icon}</span>
            {link.label}
          </Link>
        );
      })}
    </div>
  );
};

export default PageNav;