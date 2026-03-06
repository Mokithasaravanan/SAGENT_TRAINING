import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { addMember } from '../services/api';

const RegisterPage = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', address: '', phNo: '', category: 'Student' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await addMember(form);
      setSuccess(`Account created! Your Library ID is: LIB-${String(res.data.memId).padStart(5, '0')}. Redirecting...`);
      setTimeout(() => navigate('/login'), 2500);
    } catch {
      setError('Registration failed. Please try again.');
    }
    setLoading(false);
  };

  const inputStyle = {
    width: '100%', padding: '0.75rem 1rem',
    background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(212,130,42,0.25)',
    borderRadius: '10px', color: '#f5f0e8', fontSize: '0.93rem',
    fontFamily: 'Georgia, serif', outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'Georgia, serif', overflow: 'hidden', position: 'relative' }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `url('https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1600&fit=crop')`,
        backgroundSize: 'cover', backgroundPosition: 'center',
        filter: 'brightness(0.25)', zIndex: 0,
      }} />

      <div style={{
        position: 'relative', zIndex: 1, width: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '2rem',
        background: 'linear-gradient(135deg, rgba(26,22,18,0.85) 0%, rgba(45,36,25,0.8) 100%)',
      }}>
        <div style={{
          width: '100%', maxWidth: 520,
          background: 'rgba(10,8,6,0.75)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px', padding: '2.5rem',
          border: '1px solid rgba(212,130,42,0.2)',
          boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: 65, height: 65, borderRadius: '50%',
              background: 'linear-gradient(135deg, #d4822a, #a05a1a)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.8rem', margin: '0 auto 1rem',
              boxShadow: '0 8px 24px rgba(212,130,42,0.4)',
            }}>📚</div>
            <h1 style={{ color: '#f5f0e8', fontSize: '1.75rem', margin: 0 }}>Create Account</h1>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.88rem', marginTop: '0.3rem' }}>Register as a library member</p>
          </div>

          {error && <div style={{ background: 'rgba(192,57,43,0.2)', color: '#ff8a7a', border: '1px solid rgba(192,57,43,0.4)', borderRadius: '10px', padding: '0.75rem', marginBottom: '1rem', fontSize: '0.88rem' }}>⚠️ {error}</div>}
          {success && <div style={{ background: 'rgba(39,174,96,0.15)', color: '#5deb9a', border: '1px solid rgba(39,174,96,0.3)', borderRadius: '10px', padding: '0.75rem', marginBottom: '1rem', fontSize: '0.88rem' }}>✅ {success}</div>}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
              {[
                { label: 'Full Name', key: 'name', type: 'text', placeholder: 'John Doe', full: true },
                { label: 'Email', key: 'email', type: 'email', placeholder: 'john@example.com', full: true },
                { label: 'Password', key: 'password', type: 'password', placeholder: '••••••••', full: true },
                { label: 'Phone', key: 'phNo', type: 'text', placeholder: '+91 9876543210' },
                { label: 'Address', key: 'address', type: 'text', placeholder: '123 Main St' },
              ].map(f => (
                <div key={f.key} style={{ gridColumn: f.full ? 'span 2' : 'span 1', marginBottom: '0.9rem' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#d4822a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>{f.label}</label>
                  <input type={f.type} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    required={['name', 'email', 'password'].includes(f.key)} placeholder={f.placeholder}
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#d4822a'}
                    onBlur={e => e.target.style.borderColor = 'rgba(212,130,42,0.25)'}
                  />
                </div>
              ))}
              <div style={{ gridColumn: 'span 2', marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#d4822a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>Category</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="Student" style={{ background: '#1a1612' }}>Student</option>
                  <option value="Staff" style={{ background: '#1a1612' }}>Staff</option>
                </select>
              </div>
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '0.85rem',
              background: loading ? 'rgba(212,130,42,0.5)' : 'linear-gradient(135deg, #d4822a, #a05a1a)',
              color: 'white', border: 'none', borderRadius: '12px', fontSize: '1rem',
              fontWeight: 700, fontFamily: 'Georgia, serif', cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 20px rgba(212,130,42,0.35)',
            }}>
              {loading ? 'Creating account...' : '🎓 Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#d4822a', fontWeight: 700, textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;