import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { customerAPI } from '../../services/api';
import Toast from '../../components/Toast';
import useToast from '../../components/useToast';

const PROFILE_SLIDES = [
  'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80',
  'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800&q=80',
  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
];

export default function CustomerProfile() {
  const { user, login } = useAuth();
  const { toast, showToast, hideToast } = useToast();
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '', address: user?.address || '', password: '' });
  const [loading, setLoading] = useState(false);
  const [slide, setSlide] = useState(0);

  const prev = () => setSlide(s => (s - 1 + PROFILE_SLIDES.length) % PROFILE_SLIDES.length);
  const next = () => setSlide(s => (s + 1) % PROFILE_SLIDES.length);

  const handleSave = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      const res = await customerAPI.update(user.id, { ...user, ...payload });
      login({ ...user, ...res.data });
      showToast('Profile updated successfully! ✅');
    } catch { showToast('Failed to update profile', 'error'); }
    setLoading(false);
  };

  const inputStyle = { width: '100%', padding: '11px 14px', border: '1.5px solid #c8e6c9', borderRadius: 10, fontSize: 14, background: '#f9fbe7', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' };

  return (
    <div className="animate-in" style={{ fontFamily: "'Nunito', sans-serif" }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      {/* Hero Banner with Prev/Next */}
      <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', marginBottom: 28, height: 160 }}>
        <img src={PROFILE_SLIDES[slide]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'all 0.5s' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(27,94,32,0.65)' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', padding: '0 28px', gap: 16 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 900, color: 'white', border: '3px solid rgba(255,255,255,0.4)', backdropFilter: 'blur(4px)', flexShrink: 0 }}>
            {user?.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <h1 style={{ color: 'white', fontSize: 24, fontWeight: 900, margin: '0 0 4px' }}>👤 {user?.name}</h1>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, margin: 0 }}>{user?.email}</p>
          </div>
        </div>
        <button onClick={prev} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: 36, height: 36, borderRadius: '50%', fontSize: 18, cursor: 'pointer' }}>‹</button>
        <button onClick={next} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: 36, height: 36, borderRadius: '50%', fontSize: 18, cursor: 'pointer' }}>›</button>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 14, marginBottom: 28 }}>
        {[
          { img: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=200&q=80', label: 'My Orders', icon: '📦' },
          { img: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200&q=80', label: 'Saved', icon: '❤️' },
          { img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&q=80', label: 'Fast Delivery', icon: '🚚' },
          { img: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200&q=80', label: 'Fresh Picks', icon: '🌿' },
        ].map(s => (
          <div key={s.label} style={{ background: 'white', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', border: '1px solid #e8f5e9', textAlign: 'center' }}>
            <img src={s.img} alt={s.label} style={{ width: '100%', height: 64, objectFit: 'cover' }} />
            <div style={{ padding: '8px 4px' }}>
              <div style={{ fontSize: 16 }}>{s.icon}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#444' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Profile Form */}
      <div style={{ maxWidth: 560 }}>
        <div style={{ background: 'white', borderRadius: 20, padding: 28, boxShadow: '0 4px 20px rgba(46,125,50,0.1)', border: '1px solid #e8f5e9' }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20, color: '#1b2d1b' }}>✏️ Edit Profile</h2>
          <form onSubmit={handleSave}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#444', display: 'block', marginBottom: 6 }}>Full Name</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#444', display: 'block', marginBottom: 6 }}>Phone</label>
                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} style={inputStyle} />
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: '#444', display: 'block', marginBottom: 6 }}>Email</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required style={inputStyle} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: '#444', display: 'block', marginBottom: 6 }}>Delivery Address</label>
              <textarea rows={3} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: '#444', display: 'block', marginBottom: 6 }}>New Password (leave blank to keep current)</label>
              <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" style={inputStyle} />
            </div>
            <button type="submit" disabled={loading} style={{ padding: '13px 36px', background: 'linear-gradient(135deg,#2e7d32,#66bb6a)', color: 'white', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 800, cursor: 'pointer' }}>
              {loading ? 'Saving...' : '💾 Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}