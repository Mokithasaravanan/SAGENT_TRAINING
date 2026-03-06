import React, { useEffect, useState } from 'react';
import { studentAPI } from '../services/api';
import { useApp } from '../context/AppContext';

const emptyForm = {
  name: '', email: '', phnNo: '', dob: '', gender: '', address: '', password: ''
};

export default function StudentsPage() {
  const { showNotification } = useApp();
  const [students, setStudents] = useState([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try { const r = await studentAPI.getAll(); setStudents(r.data); } catch {}
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setModal(true); };
  const openEdit = (s) => { setEditing(s); setForm({ ...emptyForm, ...s }); setModal(true); };
  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const save = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editing) {
        await studentAPI.update(editing.studentId, form);
        showNotification('Student updated successfully');
      } else {
        await studentAPI.create(form);
        showNotification('Student registered successfully');
      }
      setModal(false); load();
    } catch { showNotification('Error saving student', 'error'); }
    setLoading(false);
  };

  const del = async (id) => {
    if (!window.confirm('Delete this student?')) return;
    try { await studentAPI.delete(id); showNotification('Student deleted'); load(); }
    catch { showNotification('Error deleting student', 'error'); }
  };

  const GENDER_COLORS = { Male: '#dbeafe', Female: '#fce7f3', Other: '#f3e8ff' };
  const GENDER_TEXT   = { Male: '#1e40af', Female: '#9d174d', Other: '#6b21a8' };

  return (
    <div>
      <div className="page-hero" style={{
        backgroundImage: `linear-gradient(160deg, rgba(10,14,26,0.82) 0%, rgba(15,32,68,0.70) 50%, rgba(26,107,90,0.55) 100%), url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1400&q=85'`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}>
        <div className="page-hero-content">
          <div>
            <h1>Students</h1>
            <p>Manage all registered students in the system</p>
          </div>
          <button className="btn btn-gold" onClick={openAdd}>+ Add Student</button>
        </div>
      </div>

      <div className="page-content">

        {/* Campus Image Accent Strip */}
        <div style={{
          width: '100%', height: 110, borderRadius: 16, overflow: 'hidden',
          position: 'relative', marginBottom: 28,
          border: '1px solid var(--gray-200)', boxShadow: 'var(--shadow-sm)'
        }}>
          <img
            src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&q=80"
            alt="campus"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(90deg, rgba(10,14,26,0.72) 0%, rgba(10,14,26,0.3) 55%, transparent 100%)',
            display: 'flex', alignItems: 'center', padding: '0 32px'
          }}>
            <div>
              <div style={{
                fontFamily: 'Cormorant Garamond, serif', fontSize: 18, fontStyle: 'italic',
                color: 'white', fontWeight: 500, lineHeight: 1.4, maxWidth: 520
              }}>"Behind every student ID is a story worth knowing."</div>
              <div style={{
                marginTop: 6, width: 40, height: 2,
                background: 'linear-gradient(90deg, var(--gold), transparent)'
              }} />
            </div>
          </div>
        </div>
        {/* Summary */}
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 28 }}>
          <div className="stat-card">
            <span className="stat-icon">👤</span>
            <div className="stat-value">{students.length}</div>
            <div className="stat-label">Total Students</div>
          </div>
          <div className="stat-card sage">
            <span className="stat-icon">♂️</span>
            <div className="stat-value">{students.filter(s => s.gender === 'Male').length}</div>
            <div className="stat-label">Male</div>
          </div>
          <div className="stat-card ink">
            <span className="stat-icon">♀️</span>
            <div className="stat-value">{students.filter(s => s.gender === 'Female').length}</div>
            <div className="stat-label">Female</div>
          </div>
        </div>

        <div className="card">
          {students.length === 0 ? (
            <div className="empty-state">
              <img
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=300&q=80"
                alt="students"
                style={{ width: 160, height: 100, objectFit: 'cover', borderRadius: 10, marginBottom: 16, opacity: 0.6 }}
              />
              <p>No students registered yet</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Student</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>DOB</th>
                    <th>Gender</th>
                    <th>Address</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(s => (
                    <tr key={s.studentId}>
                      <td>
                        <strong style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, color: 'var(--gold-dark)' }}>
                          #{s.studentId}
                        </strong>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 34, height: 34, borderRadius: 10,
                            background: 'linear-gradient(135deg, var(--navy), var(--navy-mid))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 14, color: 'white', fontWeight: 700, flexShrink: 0,
                            fontFamily: 'Cormorant Garamond, serif'
                          }}>
                            {s.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <span style={{ fontWeight: 600 }}>{s.name || '—'}</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--gray-500)', fontSize: 13 }}>{s.email || '—'}</td>
                      <td style={{ fontSize: 13 }}>{s.phnNo || '—'}</td>
                      <td style={{ color: 'var(--gray-500)', fontSize: 13 }}>{s.dob || '—'}</td>
                      <td>
                        {s.gender ? (
                          <span style={{
                            padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                            background: GENDER_COLORS[s.gender] || 'var(--gray-200)',
                            color: GENDER_TEXT[s.gender] || 'var(--gray-500)'
                          }}>
                            {s.gender}
                          </span>
                        ) : '—'}
                      </td>
                      <td style={{
                        maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap', fontSize: 13, color: 'var(--gray-500)'
                      }}>
                        {s.address || '—'}
                      </td>
                      <td>
                        <div className="action-btns">
                          <button className="btn btn-outline btn-sm" onClick={() => openEdit(s)}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => del(s.studentId)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div>
                <h3>{editing ? 'Edit Student' : 'Register Student'}</h3>
                <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 2 }}>
                  {editing ? `Editing ${editing.name}` : 'Add a new student to the system'}
                </div>
              </div>
              <button className="modal-close" onClick={() => setModal(false)}>×</button>
            </div>
            <form onSubmit={save}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input value={form.name} onChange={e => set('name', e.target.value)} required placeholder="Enter full name" />
                  </div>
                  <div className="form-group">
                    <label>Email *</label>
                    <input type="email" value={form.email} onChange={e => set('email', e.target.value)} required placeholder="student@email.com" />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input placeholder="9876543210" value={form.phnNo} onChange={e => set('phnNo', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Date of Birth</label>
                    <input type="date" value={form.dob} onChange={e => set('dob', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Gender</label>
                    <select value={form.gender} onChange={e => set('gender', e.target.value)}>
                      <option value="">Select...</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Password</label>
                    <input type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="••••••••" />
                  </div>
                  <div className="form-group full-width">
                    <label>Address</label>
                    <textarea placeholder="Full address..." value={form.address}
                      onChange={e => set('address', e.target.value)} style={{ minHeight: 70 }} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-gold" disabled={loading}>
                  {loading ? <span className="spinner" /> : null}
                  {editing ? 'Save Changes' : 'Register Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}