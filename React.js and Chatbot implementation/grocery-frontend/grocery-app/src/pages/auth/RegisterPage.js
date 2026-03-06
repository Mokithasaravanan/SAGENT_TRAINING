import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { customerAPI, deliveryAPI } from '../../services/api';

const SLIDES = [
  { img: 'https://images.unsplash.com/photo-1579113800032-c38bd7635818?w=900&q=80', title: 'Join GreenBasket!', sub: 'Fresh groceries at your fingertips' },
  { img: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=900&q=80', title: 'Best Quality', sub: 'Sourced from local farms daily' },
  { img: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=900&q=80', title: 'Deliver with Us!', sub: 'Earn money on your schedule' },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState('customer');
  const [form, setForm] = useState({ name: '', mail: '', password: '', phnNo: '', address: '', gender: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [slide, setSlide] = useState(0);

  const prev = () => setSlide(s => (s - 1 + SLIDES.length) % SLIDES.length);
  const next = () => setSlide(s => (s + 1) % SLIDES.length);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      if (role === 'customer') {
        await customerAPI.create({ name: form.name, mail: form.mail, password: form.password, phnNo: form.phnNo, address: form.address });
      } else {
        await deliveryAPI.create({ name: form.name, mail: form.mail, password: form.password, phnNo: form.phnNo, gender: form.gender, available: true });
      }
      alert('Account created! Please login.');
      navigate('/login');
    } catch { setError('Registration failed. Please try again.'); }
    finally { setLoading(false); }
  };

  const inputStyle = { width: '100%', padding: '11px 14px', border: '1.5px solid #c8e6c9', borderRadius: 10, fontSize: 14, background: '#f9fbe7', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' };
  const labelStyle = { fontSize: 13, fontWeight: 700, color: '#444', display: 'block', marginBottom: 6 };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'Nunito', sans-serif" }}>

      {/* LEFT — Image Slider */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'none' }} className="reg-left">
        <style>{`@media(min-width:900px){.reg-left{display:block!important}}`}</style>
        <img src={SLIDES[slide].img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'all 0.5s' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(230,80,0,0.65),rgba(255,150,50,0.45))' }} />

        <div style={{ position: 'absolute', top: 36, left: 36, zIndex: 2 }}>
          <div style={{ fontSize: 40 }}>🥦</div>
          <h1 style={{ color: 'white', fontSize: 26, fontWeight: 900, margin: '6px 0 2px' }}>GreenBasket</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, margin: 0 }}>Sign up & start saving!</p>
        </div>

        <div style={{ position: 'absolute', bottom: 100, left: 36, right: 36, zIndex: 2 }}>
          <h2 style={{ color: 'white', fontSize: 26, fontWeight: 900, margin: '0 0 6px', textShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>{SLIDES[slide].title}</h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, margin: 0 }}>{SLIDES[slide].sub}</p>
        </div>

        <div style={{ position: 'absolute', bottom: 60, left: 36, display: 'flex', gap: 8, zIndex: 2 }}>
          {SLIDES.map((_, i) => (
            <div key={i} onClick={() => setSlide(i)} style={{ width: i === slide ? 24 : 8, height: 8, borderRadius: 4, background: i === slide ? 'white' : 'rgba(255,255,255,0.4)', cursor: 'pointer', transition: 'all 0.3s' }} />
          ))}
        </div>

        <button onClick={prev} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', zIndex: 2, background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: 40, height: 40, borderRadius: '50%', fontSize: 18, cursor: 'pointer' }}>‹</button>
        <button onClick={next} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', zIndex: 2, background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: 40, height: 40, borderRadius: '50%', fontSize: 18, cursor: 'pointer' }}>›</button>
      </div>

      {/* RIGHT — Register Form */}
      <div style={{ width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '40px 36px', background: 'linear-gradient(160deg,#fff8f0,#f0faf0)', overflowY: 'auto' }}>

        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 48, marginBottom: 6 }}>🥦</div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#2e7d32', margin: '0 0 4px' }}>GreenBasket</h1>
          <p style={{ color: '#777', fontSize: 14, margin: 0 }}>Create your account</p>
        </div>

        {/* Perks Strip */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 24, overflowX: 'auto', paddingBottom: 4 }}>
          {[
            { img: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=80&q=80', label: '🚀 Fast' },
            { img: 'https://images.unsplash.com/photo-1630080947966-5b5a3e8a32c4?w=80&q=80', label: '🌿 Fresh' },
            { img: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=80&q=80', label: '💰 Cheap' },
            { img: 'https://images.unsplash.com/photo-1601925228638-2bba1e1f5a05?w=80&q=80', label: '🎁 Offers' },
          ].map(p => (
            <div key={p.label} style={{ textAlign: 'center', flexShrink: 0 }}>
              <img src={p.img} alt={p.label} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2px solid #ffe0b2' }} />
              <div style={{ fontSize: 10, color: '#555', marginTop: 3, fontWeight: 700 }}>{p.label}</div>
            </div>
          ))}
        </div>

        <div style={{ background: 'white', borderRadius: 20, padding: 28, boxShadow: '0 8px 32px rgba(46,125,50,0.12)', border: '1px solid #e8f5e9' }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 20, color: '#1b2d1b' }}>Register 📝</h2>

          {/* Role Toggle */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 22 }}>
            {['customer', 'delivery'].map(r => (
              <button key={r} onClick={() => setRole(r)} style={{ flex: 1, padding: 12, border: `2px solid ${role === r ? '#2e7d32' : '#e0e0e0'}`, borderRadius: 12, background: role === r ? '#f1f8e9' : 'white', cursor: 'pointer', fontWeight: 700, fontSize: 14, color: role === r ? '#2e7d32' : '#999' }}>
                {r === 'customer' ? '🛒 Customer' : '🛵 Delivery Person'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}><label style={labelStyle}>Full Name</label><input placeholder="John Doe" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required style={inputStyle} /></div>
            <div style={{ marginBottom: 14 }}><label style={labelStyle}>Email</label><input type="email" placeholder="you@example.com" value={form.mail} onChange={e => setForm({ ...form, mail: e.target.value })} required style={inputStyle} /></div>
            <div style={{ marginBottom: 14 }}><label style={labelStyle}>Password</label><input type="password" placeholder="Min 6 characters" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} style={inputStyle} /></div>
            <div style={{ marginBottom: 14 }}><label style={labelStyle}>Phone Number</label><input placeholder="+91 9876543210" value={form.phnNo} onChange={e => setForm({ ...form, phnNo: e.target.value })} required style={inputStyle} /></div>
            {role === 'customer' && (
              <div style={{ marginBottom: 14 }}><label style={labelStyle}>Delivery Address</label><textarea placeholder="Full address with pincode" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} rows={3} required style={{ ...inputStyle, resize: 'vertical' }} /></div>
            )}
            {role === 'delivery' && (
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Gender</label>
                <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })} required style={inputStyle}>
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            )}
            {error && <p style={{ color: '#e53e3e', fontSize: 13, marginBottom: 14 }}>⚠️ {error}</p>}
            <button type="submit" disabled={loading} style={{ width: '100%', padding: 14, background: 'linear-gradient(135deg,#e65100,#ff9800)', color: 'white', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 800, cursor: 'pointer' }}>
              {loading ? 'Creating account...' : '✅ Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 18, fontSize: 14, color: '#777' }}>
            Already have an account? <Link to="/login" style={{ color: '#2e7d32', fontWeight: 700 }}>Sign In →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}