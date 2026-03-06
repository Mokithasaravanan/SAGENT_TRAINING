import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { customerAPI, deliveryAPI } from '../../services/api';

const ADMIN_CREDENTIALS = { email: 'admin@grocery.com', password: 'admin123' };

const SLIDES = [
  { img: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=900&q=80', title: 'Fresh Vegetables Daily', sub: 'Farm to your doorstep' },
  { img: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=900&q=80', title: 'Organic Fruits', sub: 'Handpicked every morning' },
  { img: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=900&q=80', title: 'Dairy & More', sub: 'Pure & fresh every day' },
  { img: 'https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?w=900&q=80', title: '30-Min Delivery', sub: 'Lightning fast to your door' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('customer');
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [slide, setSlide] = useState(0);

  const prev = () => setSlide(s => (s - 1 + SLIDES.length) % SLIDES.length);
  const next = () => setSlide(s => (s + 1) % SLIDES.length);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      if (role === 'admin') {
        if (form.email === ADMIN_CREDENTIALS.email && form.password === ADMIN_CREDENTIALS.password) {
          login({ role: 'admin', name: 'Admin', email: form.email, id: 0 }); navigate('/admin');
        } else { setError('Invalid admin credentials.'); }
      } else if (role === 'customer') {
        const res = await customerAPI.getAll();
        const found = res.data.find(c => c.mail === form.email && c.password === form.password);
        if (found) { login({ role: 'customer', name: found.name, email: found.mail, phone: found.phnNo, address: found.address, id: found.customerId, customerId: found.customerId }); navigate('/customer'); }
        else { const ex = res.data.find(c => c.mail === form.email); setError(ex ? 'Incorrect password.' : 'No account found. Please register.'); }
      } else if (role === 'delivery') {
        const res = await deliveryAPI.getAll();
        const found = res.data.find(d => d.mail === form.email && d.password === form.password);
        if (found) { login({ role: 'delivery', name: found.name, email: found.mail, phone: found.phnNo, gender: found.gender, id: found.personId, personId: found.personId }); navigate('/delivery'); }
        else { const ex = res.data.find(d => d.mail === form.email); setError(ex ? 'Incorrect password.' : 'No delivery account found.'); }
      }
    } catch { setError('Connection error. Make sure Spring Boot is running on port 8080.'); }
    finally { setLoading(false); }
  };

  const roles = [
    { value: 'customer', label: '🛒 Customer', desc: 'Order groceries' },
    { value: 'admin', label: '⚙️ Admin', desc: 'Manage the store' },
    { value: 'delivery', label: '🛵 Delivery', desc: 'Deliver orders' },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'Nunito', sans-serif" }}>

      {/* LEFT — Image Slider */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'none' }} className="login-left">
        <style>{`@media(min-width:900px){.login-left{display:block!important}}`}</style>
        <img src={SLIDES[slide].img} alt="slide" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'all 0.5s ease' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(27,94,32,0.75),rgba(46,125,50,0.5))' }} />

        {/* Logo */}
        <div style={{ position: 'absolute', top: 36, left: 36, zIndex: 2 }}>
          <div style={{ fontSize: '40px' }}>🥦</div>
          <h1 style={{ color: 'white', fontSize: '26px', fontWeight: 900, margin: '6px 0 2px' }}>GreenBasket</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px' }}>Fresh & Fast Grocery Delivery</p>
        </div>

        {/* Slide Text */}
        <div style={{ position: 'absolute', bottom: 100, left: 36, right: 36, zIndex: 2 }}>
          <h2 style={{ color: 'white', fontSize: '28px', fontWeight: 900, margin: '0 0 6px', textShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>{SLIDES[slide].title}</h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '15px', margin: 0 }}>{SLIDES[slide].sub}</p>
        </div>

        {/* Dots */}
        <div style={{ position: 'absolute', bottom: 60, left: 36, display: 'flex', gap: 8, zIndex: 2 }}>
          {SLIDES.map((_, i) => (
            <div key={i} onClick={() => setSlide(i)} style={{ width: i === slide ? 24 : 8, height: 8, borderRadius: 4, background: i === slide ? 'white' : 'rgba(255,255,255,0.4)', cursor: 'pointer', transition: 'all 0.3s' }} />
          ))}
        </div>

        {/* Prev / Next */}
        <button onClick={prev} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', zIndex: 2, background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: 40, height: 40, borderRadius: '50%', fontSize: 18, cursor: 'pointer', backdropFilter: 'blur(4px)' }}>‹</button>
        <button onClick={next} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', zIndex: 2, background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: 40, height: 40, borderRadius: '50%', fontSize: 18, cursor: 'pointer', backdropFilter: 'blur(4px)' }}>›</button>
      </div>

      {/* RIGHT — Login Form */}
      <div style={{ width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '40px 36px', background: 'linear-gradient(160deg,#f0faf0,#fff8f0)', overflowY: 'auto' }}>

        {/* Mobile Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }} className="mobile-logo">
          <div style={{ fontSize: 52, marginBottom: 8 }}>🥦</div>
          <h1 style={{ fontSize: 30, fontWeight: 900, color: '#2e7d32', margin: '0 0 4px' }}>GreenBasket</h1>
          <p style={{ color: '#777', fontSize: 14, margin: 0 }}>Fresh groceries, delivered fast</p>
        </div>

        {/* Feature Icons */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 28, justifyContent: 'center' }}>
          {[
            { img: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=80&q=80', label: 'Fruits' },
            { img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=80&q=80', label: 'Veggies' },
            { img: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=80&q=80', label: 'Dairy' },
            { img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=80&q=80', label: 'Bakery' },
          ].map(f => (
            <div key={f.label} style={{ textAlign: 'center' }}>
              <img src={f.img} alt={f.label} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: '2px solid #c8e6c9', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
              <div style={{ fontSize: 10, color: '#666', marginTop: 4, fontWeight: 700 }}>{f.label}</div>
            </div>
          ))}
        </div>

        <div style={{ background: 'white', borderRadius: 20, padding: 32, boxShadow: '0 8px 32px rgba(46,125,50,0.12)', border: '1px solid #e8f5e9' }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24, color: '#1b2d1b' }}>Welcome back 👋</h2>

          {/* Role Selector */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 24 }}>
            {roles.map(r => (
              <button key={r.value} onClick={() => { setRole(r.value); setError(''); }} style={{ padding: '12px 8px', border: `2px solid ${role === r.value ? '#2e7d32' : '#e0e0e0'}`, borderRadius: 12, background: role === r.value ? '#f1f8e9' : 'white', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center' }}>
                <div style={{ fontSize: 22, marginBottom: 4 }}>{r.label.split(' ')[0]}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: role === r.value ? '#2e7d32' : '#333' }}>{r.label.split(' ')[1]}</div>
                <div style={{ fontSize: 10, color: '#999' }}>{r.desc}</div>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: '#444', display: 'block', marginBottom: 6 }}>Email</label>
              <input type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required
                style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #c8e6c9', borderRadius: 10, fontSize: 14, background: '#f9fbe7', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: '#444', display: 'block', marginBottom: 6 }}>Password</label>
              <input type="password" placeholder="••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required
                style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #c8e6c9', borderRadius: 10, fontSize: 14, background: '#f9fbe7', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
            </div>
            {error && <div style={{ background: '#fff0f0', border: '1px solid #ffcccc', borderRadius: 8, padding: '10px 14px', marginBottom: 14 }}><p style={{ color: '#e53e3e', fontSize: 13, margin: 0 }}>⚠️ {error}</p></div>}
            <button type="submit" disabled={loading} style={{ width: '100%', padding: 14, background: 'linear-gradient(135deg,#2e7d32,#66bb6a)', color: 'white', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s' }}>
              {loading ? 'Signing in...' : '🔐 Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#777' }}>
            No account? <Link to="/register" style={{ color: '#2e7d32', fontWeight: 700 }}>Create one →</Link>
          </p>
          {role === 'admin' && (
            <p style={{ textAlign: 'center', marginTop: 12, fontSize: 12, background: '#f1f8e9', padding: 8, borderRadius: 8, color: '#666' }}>
              Demo: admin@grocery.com / admin123
            </p>
          )}
        </div>

        {/* Trust Badges */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 24 }}>
          {['🌿 100% Fresh', '🚚 30-Min Delivery', '🔒 Secure'].map(b => (
            <span key={b} style={{ fontSize: 12, color: '#2e7d32', fontWeight: 700 }}>{b}</span>
          ))}
        </div>
      </div>
    </div>
  );
}