import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { deliveryAPI } from '../../services/api';
import Toast from '../../components/Toast';
import useToast from '../../components/useToast';

export default function DeliveryProfile() {
  const { user, login } = useAuth();
  const { toast, showToast, hideToast } = useToast();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...user, ...form };
      if (!form.password) delete payload.password;
      const res = await deliveryAPI.update(user.id, payload);
      login({ ...user, ...res.data });
      showToast('Profile updated!');
    } catch { showToast('Failed to update', 'error'); }
    setLoading(false);
  };

  return (
    <div className="animate-in">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
      <h1 className="page-title">👤 My Profile</h1>
      <p className="page-subtitle">Delivery Person Account</p>

      <div style={{ maxWidth: '520px' }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '28px', padding: '16px', background: 'var(--orange-light)', borderRadius: '12px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', color: 'white', fontWeight: '700' }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '18px' }}>{user?.name}</div>
              <div style={{ color: 'var(--gray)', fontSize: '14px' }}>{user?.email}</div>
              <span className="badge badge-orange" style={{ marginTop: '4px' }}>Delivery Person</span>
            </div>
          </div>

          <form onSubmit={handleSave}>
            <div className="grid-2">
              <div className="form-group">
                <label>Full Name</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Leave blank to keep current" />
            </div>
            <button className="btn-orange" type="submit" disabled={loading} style={{ padding: '12px 32px' }}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
