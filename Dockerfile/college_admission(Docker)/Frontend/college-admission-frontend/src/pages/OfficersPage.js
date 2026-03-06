import React, { useEffect, useState } from 'react';
import { officerAPI } from '../services/api';
import { useApp } from '../context/AppContext';

const emptyForm = { name: '', mail: '', phnNo: '', password: '' };

export default function OfficersPage() {
  const { showNotification } = useApp();
  const [officers, setOfficers] = useState([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try { const r = await officerAPI.getAll(); setOfficers(r.data); } catch {}
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setModal(true); };
  const openEdit = (o) => { setEditing(o); setForm({ ...emptyForm, ...o }); setModal(true); };
  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const save = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editing) {
        await officerAPI.update(editing.officerId, form);
        showNotification('Officer updated successfully');
      } else {
        await officerAPI.create(form);
        showNotification('Officer added successfully');
      }
      setModal(false); load();
    } catch { showNotification('Error saving officer', 'error'); }
    setLoading(false);
  };

  const del = async (id) => {
    if (!window.confirm('Delete this officer?')) return;
    try { await officerAPI.delete(id); showNotification('Officer deleted'); load(); }
    catch { showNotification('Error deleting officer', 'error'); }
  };

  const OFFICER_COLORS = [
    ['#0f2044', '#1a3a6e'], ['#1a6b5a', '#22906e'], ['#8a6f28', '#c8a84b'],
    ['#5b21b6', '#7c3aed'], ['#9d174d', '#db2777'], ['#065f46', '#059669'],
  ];

  return (
    <div>
      <div className="page-hero">
        <div className="page-hero-content">
          <div>
            <h1>Officers</h1>
            <p>Manage admission officers and their access</p>
          </div>
          <button className="btn btn-gold" onClick={openAdd}>+ Add Officer</button>
        </div>
      </div>

      <div className="page-content">
        {/* Stats */}
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', marginBottom: 28 }}>
          <div className="stat-card">
            <span className="stat-icon">🏛️</span>
            <div className="stat-value">{officers.length}</div>
            <div className="stat-label">Total Officers</div>
          </div>
          <div className="stat-card sage">
            <span className="stat-icon">✅</span>
            <div className="stat-value">{officers.length}</div>
            <div className="stat-label">Active</div>
          </div>
        </div>

        <div className="card">
          {officers.length === 0 ? (
            <div className="empty-state">
              <img
                src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=300&q=80"
                alt="officers"
                style={{ width: 160, height: 100, objectFit: 'cover', borderRadius: 10, marginBottom: 16, opacity: 0.6 }}
              />
              <p>No officers registered yet</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Officer</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {officers.map((o, i) => {
                    const [bg1, bg2] = OFFICER_COLORS[i % OFFICER_COLORS.length];
                    return (
                      <tr key={o.officerId}>
                        <td>
                          <strong style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, color: 'var(--gold-dark)' }}>
                            #{o.officerId}
                          </strong>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{
                              width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                              background: `linear-gradient(135deg, ${bg1}, ${bg2})`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 16, color: 'white', fontWeight: 700,
                              fontFamily: 'Cormorant Garamond, serif',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.12)'
                            }}>
                              {o.name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 14 }}>{o.name || '—'}</div>
                              <div style={{
                                fontSize: 10, color: 'var(--teal)', fontFamily: 'Space Mono, monospace',
                                textTransform: 'uppercase', letterSpacing: 1
                              }}>
                                Admission Officer
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ color: 'var(--gray-500)', fontSize: 13 }}>{o.mail || '—'}</td>
                        <td style={{ fontSize: 13 }}>{o.phnNo || '—'}</td>
                        <td>
                          <div className="action-btns">
                            <button className="btn btn-outline btn-sm" onClick={() => openEdit(o)}>Edit</button>
                            <button className="btn btn-danger btn-sm" onClick={() => del(o.officerId)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal" style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <div>
                <h3>{editing ? 'Edit Officer' : 'Add Officer'}</h3>
                <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 2 }}>
                  {editing ? `Editing ${editing.name}` : 'Register a new admission officer'}
                </div>
              </div>
              <button className="modal-close" onClick={() => setModal(false)}>×</button>
            </div>
            <form onSubmit={save}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input placeholder="Enter officer name" value={form.name}
                      onChange={e => set('name', e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" placeholder="officer@college.edu" value={form.mail}
                      onChange={e => set('mail', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input placeholder="9876543210" value={form.phnNo}
                      onChange={e => set('phnNo', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Password</label>
                    <input type="password" placeholder="••••••••" value={form.password}
                      onChange={e => set('password', e.target.value)} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-gold" disabled={loading}>
                  {loading ? <span className="spinner" /> : null}
                  {editing ? 'Save Changes' : 'Add Officer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}