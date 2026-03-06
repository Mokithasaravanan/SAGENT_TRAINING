import React, { useEffect, useState } from 'react';
import { doctorAPI } from '../services/api';
import { toast } from 'react-toastify';
import PageNav from '../components/PageNav';

const EMPTY = { name: '', email: '', password: '', specialization: '', contactNo: '' };
const SPECS = ['Cardiologist', 'Neurologist', 'Pediatrician', 'Orthopedic', 'Dermatologist', 'General Physician', 'Psychiatrist', 'Oncologist', 'Gynecologist', 'ENT'];

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try { const r = await doctorAPI.getAll(); setDoctors(r.data); } catch { toast.error('Failed to load doctors'); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (d) => {
    setEditing(d.doctorId);
    setForm({ name: d.name, email: d.email, password: d.password, specialization: d.specialization, contactNo: d.contactNo });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      editing ? await doctorAPI.update(editing, form) : await doctorAPI.create(form);
      toast.success(editing ? 'Doctor updated!' : 'Doctor created!');
      setShowModal(false); load();
    } catch { toast.error('Save failed'); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this doctor?')) return;
    try { await doctorAPI.delete(id); toast.success('Deleted'); load(); } catch { toast.error('Delete failed'); }
  };

  const filtered = doctors.filter(d =>
    d.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.specialization?.toLowerCase().includes(search.toLowerCase())
  );

  const specColors = { Cardiologist: '#e74c3c', Neurologist: '#9b59b6', Pediatrician: '#2ecc71', Orthopedic: '#f39c12', Dermatologist: '#e67e22', 'General Physician': '#00b4d8', Psychiatrist: '#1abc9c', Oncologist: '#c0392b' };

  return (
    <div className="page-wrapper">
      <div className="bg-animated" />
      <div className="main-content" style={{ position: 'relative', zIndex: 1 }}>
        <div className="page-hero animate-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem' }}>🩺 Doctor Management</h1>
              <p style={{ color: '#8892b0' }}>Manage doctors and their specializations</p>
            </div>
            <button className="btn btn-primary" onClick={openCreate}>+ Add Doctor</button>
          </div>
        </div>

        {/* Specialization breakdown */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          {SPECS.map(s => {
            const count = doctors.filter(d => d.specialization === s).length;
            if (!count) return null;
            return (
              <div key={s} style={{ padding: '0.4rem 0.9rem', background: `${specColors[s] || '#00b4d8'}18`, border: `1px solid ${specColors[s] || '#00b4d8'}40`, borderRadius: 20, fontSize: '0.8rem', color: specColors[s] || '#00b4d8' }}>
                {s}: {count}
              </div>
            );
          })}
        </div>

        <input className="form-control" style={{ maxWidth: 400, marginBottom: '1rem' }} placeholder="🔍 Search by name or specialization..."
          value={search} onChange={e => setSearch(e.target.value)} />

        {/* Doctor cards */}
        <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
          {loading ? <div style={{ color: '#8892b0' }}>Loading...</div> :
            filtered.map(d => {
              const color = specColors[d.specialization] || '#00b4d8';
              return (
                <div key={d.doctorId} className="card animate-in" style={{ borderColor: `${color}30`, position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${color}, transparent)` }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ width: 50, height: 50, borderRadius: '50%', background: `${color}20`, border: `2px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                      👨‍⚕️
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '1rem' }}>{d.name}</div>
                      <div style={{ fontSize: '0.8rem', color }}>{d.specialization}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#8892b0', marginBottom: '0.4rem' }}>📧 {d.email}</div>
                  <div style={{ fontSize: '0.85rem', color: '#8892b0', marginBottom: '1rem' }}>📞 {d.contactNo}</div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-outline btn-sm" onClick={() => openEdit(d)}>✏️ Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(d.doctorId)}>🗑️ Delete</button>
                  </div>
                </div>
              );
            })}
          {!loading && filtered.length === 0 && <div style={{ color: '#8892b0' }}>No doctors found</div>}
        </div>

        {/* Also table view */}
        <div className="card animate-in">
          <h3 style={{ fontFamily: 'Playfair Display, serif', marginBottom: '1rem' }}>All Doctors</h3>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>#</th><th>Name</th><th>Specialization</th><th>Email</th><th>Contact</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map((d, i) => (
                  <tr key={d.doctorId}>
                    <td style={{ color: '#8892b0' }}>{i + 1}</td>
                    <td><strong>{d.name}</strong></td>
                    <td><span className="badge badge-info">{d.specialization}</span></td>
                    <td>{d.email}</td>
                    <td>{d.contactNo}</td>
                    <td><div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-outline btn-sm" onClick={() => openEdit(d)}>✏️</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(d.doctorId)}>🗑️</button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editing ? '✏️ Edit Doctor' : '➕ New Doctor'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-control" placeholder="Dr. Name" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-control" type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Specialization</label>
                  <select className="form-control" required value={form.specialization} onChange={e => setForm({ ...form, specialization: e.target.value })}>
                    <option value="">Select...</option>
                    {SPECS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Contact Number</label>
                  <input className="form-control" required value={form.contactNo} onChange={e => setForm({ ...form, contactNo: e.target.value })} />
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Password</label>
                  <input className="form-control" type="password" required={!editing} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)} style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
                  {saving ? 'Saving...' : editing ? '✅ Update' : '➕ Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <PageNav currentPath="/doctors" />
    </div>
  );
}
