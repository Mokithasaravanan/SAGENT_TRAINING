import React, { useEffect, useState } from 'react';
import { getNotifications, addNotification, getMembers } from '../services/api';
import PageNav from '../components/PageNav';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ memberId: '', message: '', sentDate: '' });
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    try {
      const [nRes, mRes] = await Promise.all([getNotifications(), getMembers()]);
      setNotifications(nRes.data.reverse());
      setMembers(mRes.data);
    } catch { setMsg({ text: 'Failed to load notifications.', type: 'error' }); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        member: { memId: parseInt(form.memberId) },
        message: form.message,
        sentDate: form.sentDate
      };
      await addNotification(payload);
      setMsg({ text: 'Notification sent!', type: 'success' });
      setShowModal(false);
      setForm({ memberId: '', message: '', sentDate: '' });
      fetchData();
    } catch { setMsg({ text: 'Failed to send notification.', type: 'error' }); }
  };

  const sendDueDateReminder = () => {
    setForm({
      memberId: '',
      message: 'Reminder: You have a book due soon. Please return it on time to avoid fines.',
      sentDate: new Date().toISOString().split('T')[0]
    });
    setShowModal(true);
  };

  const sendOverdueAlert = () => {
    setForm({
      memberId: '',
      message: 'Alert: Your book return is overdue. Please return it immediately. A fine has been applied.',
      sentDate: new Date().toISOString().split('T')[0]
    });
    setShowModal(true);
  };

  const filtered = notifications.filter(n =>
    n.member?.name?.toLowerCase().includes(search.toLowerCase()) ||
    n.message?.toLowerCase().includes(search.toLowerCase())
  );

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  const colors = ['#d4822a', '#27ae60', '#2980b9', '#8e44ad', '#c0392b'];

  return (
    <div className="page-container">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem' }}>Notifications</h1>
          <p style={{ color: '#8c7b6e', fontSize: '0.9rem' }}>Send reminders and alerts to members</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="btn btn-outline" onClick={sendDueDateReminder}>📅 Due Date Reminder</button>
          <button className="btn btn-outline" onClick={sendOverdueAlert} style={{ color: '#c0392b', borderColor: '#c0392b' }}>⚠️ Overdue Alert</button>
          <button className="btn btn-primary" onClick={() => { setForm({ memberId: '', message: '', sentDate: new Date().toISOString().split('T')[0] }); setShowModal(true); }}>+ New Notification</button>
        </div>
      </div>

      {msg.text && (
        <div className={`alert alert-${msg.type === 'error' ? 'error' : 'success'}`}>
          {msg.text}
          <button onClick={() => setMsg({ text: '', type: '' })} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Sent', value: notifications.length, icon: '📨', color: 'rgba(212,130,42,0.1)' },
          { label: 'This Month', value: notifications.filter(n => n.sentDate?.startsWith(new Date().toISOString().slice(0, 7))).length, icon: '📅', color: 'rgba(41,128,185,0.1)' },
          { label: 'Members Notified', value: new Set(notifications.map(n => n.member?.memId)).size, icon: '👥', color: 'rgba(39,174,96,0.1)' },
        ].map(card => (
          <div key={card.label} className="card" style={{ background: card.color, display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <span style={{ fontSize: '1.8rem' }}>{card.icon}</span>
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, fontFamily: 'Playfair Display, serif' }}>{card.value}</div>
              <div style={{ fontSize: '0.8rem', color: '#8c7b6e' }}>{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div style={{ marginBottom: '1rem' }}>
          <div className="search-bar">
            <span>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by member or message..." />
          </div>
        </div>

        {loading ? (
          <p style={{ color: '#8c7b6e', padding: '2rem', textAlign: 'center' }}>Loading...</p>
        ) : filtered.length === 0 ? (
          <p style={{ color: '#8c7b6e', padding: '2rem', textAlign: 'center' }}>No notifications sent yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filtered.map((n, i) => (
              <div key={n.notifyId} style={{
                display: 'flex', gap: '1rem', alignItems: 'flex-start',
                padding: '1rem', borderRadius: '10px',
                border: '1px solid #e0d5c5', background: '#fffdf8'
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: colors[i % colors.length],
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontSize: '0.78rem', fontWeight: 700, flexShrink: 0
                }}>
                  {getInitials(n.member?.name)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <strong style={{ fontSize: '0.95rem' }}>{n.member?.name || 'Unknown'}</strong>
                    <span style={{ fontSize: '0.8rem', color: '#8c7b6e' }}>{n.sentDate}</span>
                  </div>
                  <p style={{ fontSize: '0.9rem', color: '#5c3d2e', margin: 0, lineHeight: 1.5 }}>{n.message}</p>
                  <div style={{ marginTop: '0.4rem' }}>
                    <span style={{ fontSize: '0.78rem', color: '#8c7b6e' }}>
                      {n.member?.email} • {n.member?.category}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Send Notification</h2>
            <form onSubmit={handleSend}>
              <div className="form-group">
                <label>Select Member</label>
                <select value={form.memberId} onChange={e => setForm({ ...form, memberId: e.target.value })} required>
                  <option value="">-- Choose member --</option>
                  {members.map(m => (
                    <option key={m.memId} value={m.memId}>{m.name} ({m.category})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Message</label>
                <textarea
                  value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  required
                  rows={4}
                  placeholder="Type your notification message..."
                  style={{
                    padding: '0.6rem 0.9rem', border: '1.5px solid #e0d5c5',
                    borderRadius: '8px', fontSize: '0.95rem', resize: 'vertical',
                    fontFamily: 'DM Sans, sans-serif', color: '#1a1612'
                  }}
                />
              </div>
              <div className="form-group">
                <label>Date</label>
                <input type="date" value={form.sentDate}
                  onChange={e => setForm({ ...form, sentDate: e.target.value })} required />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Send Notification</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <PageNav currentPath="/notifications" />
    </div>
  );
};

export default NotificationsPage;