import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMembers } from '../services/api';

const LIBRARIAN_EMAIL = 'librarian@library.com';
const LIBRARIAN_PASSWORD = 'librarian123';

const BOOK_IMAGES = [
  'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop',
  'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=400&fit=crop',
  'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop',
  'https://images.unsplash.com/photo-1495640388908-05fa85288e61?w=300&h=400&fit=crop',
  'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=300&h=400&fit=crop',
  'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=300&h=400&fit=crop',
];

const LoginPage = () => {
  const [role, setRole] = useState('USER');
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (role === 'LIBRARIAN') {
      if (form.email.trim() === LIBRARIAN_EMAIL && form.password.trim() === LIBRARIAN_PASSWORD) {
        login({ name: 'Librarian', email: form.email, role: 'LIBRARIAN' });
        setLoading(false);
        navigate('/librarian');
        return;
      } else {
        setError('Invalid librarian credentials.');
        setLoading(false);
        return;
      }
    }
    try {
      const res = await getMembers();
      const member = res.data.find(m => m.email.trim() === form.email.trim() && m.password === form.password);
      if (member) {
        login({ ...member, role: 'USER' });
        setLoading(false);
        navigate('/user');
      } else {
        setError('Invalid email or password.');
        setLoading(false);
      }
    } catch {
      setError('Could not connect to server. Make sure backend is running on port 8080.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      fontFamily: 'Georgia, serif',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Full background */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1600&fit=crop')`,
        backgroundSize: 'cover', backgroundPosition: 'center',
        filter: 'brightness(0.3)',
        zIndex: 0,
      }} />

      {/* Left panel - decorative book shelf */}
      <div style={{
        flex: 1, position: 'relative', zIndex: 1,
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '3rem', gap: '1.5rem',
      }} className="login-left-panel">
        <h2 style={{ color: '#d4822a', fontFamily: 'Georgia, serif', fontSize: '2.5rem', marginBottom: '0.5rem', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
          📚 LibraryMS
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', lineHeight: 1.7, maxWidth: 380 }}>
          Your gateway to a world of knowledge. Discover, borrow, and explore thousands of books.
        </p>

        {/* Book thumbnails grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', maxWidth: 360 }}>
          {BOOK_IMAGES.map((src, i) => (
            <div key={i} style={{
              borderRadius: '8px', overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              transform: `rotate(${(i % 2 === 0 ? -1 : 1) * (i * 0.5)}deg)`,
              transition: 'transform 0.3s',
              height: 100,
            }}>
              <img src={src} alt="book" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ))}
        </div>

        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>
          © 2025 LibraryMS — All rights reserved
        </p>
      </div>

      {/* Right panel - login form */}
      <div style={{
        width: '100%', maxWidth: 460, position: 'relative', zIndex: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '2rem',
        backdropFilter: 'blur(20px)',
        background: 'rgba(10,8,6,0.75)',
        borderLeft: '1px solid rgba(212,130,42,0.2)',
      }}>
        <div style={{ width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: 70, height: 70, borderRadius: '50%',
              background: 'linear-gradient(135deg, #d4822a, #a05a1a)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem', margin: '0 auto 1rem',
              boxShadow: '0 8px 32px rgba(212,130,42,0.4)',
            }}>📖</div>
            <h1 style={{ color: '#f5f0e8', fontSize: '1.8rem', margin: 0, fontFamily: 'Georgia, serif' }}>Welcome Back</h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginTop: '0.3rem' }}>Sign in to your library account</p>
          </div>

          {/* Role toggle */}
          <div style={{
            display: 'flex', background: 'rgba(255,255,255,0.07)',
            borderRadius: '12px', padding: '4px', marginBottom: '1.75rem', gap: '4px',
            border: '1px solid rgba(212,130,42,0.2)',
          }}>
            {['USER', 'LIBRARIAN'].map(r => (
              <button key={r} type="button" onClick={() => { setRole(r); setError(''); setForm({ email: '', password: '' }); }} style={{
                flex: 1, padding: '0.65rem', border: 'none', borderRadius: '10px',
                cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '0.88rem', fontWeight: 600,
                background: role === r ? 'linear-gradient(135deg, #d4822a, #a05a1a)' : 'transparent',
                color: role === r ? 'white' : 'rgba(255,255,255,0.5)',
                transition: 'all 0.25s', boxShadow: role === r ? '0 4px 12px rgba(212,130,42,0.4)' : 'none',
              }}>
                {r === 'USER' ? '👤 Member' : '🔑 Librarian'}
              </button>
            ))}
          </div>

          {error && (
            <div style={{ background: 'rgba(192,57,43,0.2)', color: '#ff8a7a', border: '1px solid rgba(192,57,43,0.4)', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.88rem' }}>
              ⚠️ {error}
            </div>
          )}

          {role === 'LIBRARIAN' && (
            <div style={{ background: 'rgba(212,130,42,0.1)', border: '1px solid rgba(212,130,42,0.3)', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)' }}>
              📌 <strong style={{ color: '#d4822a' }}>librarian@library.com</strong> / <strong style={{ color: '#d4822a' }}>librarian123</strong>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {[
              { label: 'Email', key: 'email', type: 'email', placeholder: role === 'LIBRARIAN' ? 'librarian@library.com' : 'you@example.com' },
              { label: 'Password', key: 'password', type: 'password', placeholder: '••••••••' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: '1.1rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#d4822a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.45rem' }}>{f.label}</label>
                <input type={f.type} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} required placeholder={f.placeholder}
                  style={{ width: '100%', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(212,130,42,0.25)', borderRadius: '10px', color: '#f5f0e8', fontSize: '0.95rem', fontFamily: 'Georgia, serif', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                  onFocus={e => e.target.style.borderColor = '#d4822a'}
                  onBlur={e => e.target.style.borderColor = 'rgba(212,130,42,0.25)'}
                />
              </div>
            ))}

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '0.85rem', marginTop: '0.5rem',
              background: loading ? 'rgba(212,130,42,0.5)' : 'linear-gradient(135deg, #d4822a, #a05a1a)',
              color: 'white', border: 'none', borderRadius: '12px', fontSize: '1rem',
              fontWeight: 700, fontFamily: 'Georgia, serif', cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 20px rgba(212,130,42,0.35)', transition: 'all 0.2s',
              letterSpacing: '0.03em',
            }}>
              {loading ? 'Signing in...' : `Sign In as ${role === 'USER' ? 'Member' : 'Librarian'}`}
            </button>
          </form>

          {role === 'USER' && (
            <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'rgba(255,255,255,0.45)', fontSize: '0.9rem' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: '#d4822a', fontWeight: 700, textDecoration: 'none' }}>Register here</Link>
            </p>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .login-left-panel { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;