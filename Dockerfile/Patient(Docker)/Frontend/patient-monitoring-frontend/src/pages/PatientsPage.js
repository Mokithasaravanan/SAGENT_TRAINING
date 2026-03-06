import React, { useEffect, useState } from 'react';
import { patientAPI } from '../services/api';
import { toast } from 'react-toastify';
import PageNav from '../components/PageNav';

const EMPTY = { name: '', age: '', phnNo: '', mail: '', password: '', address: '', gender: 'Male' };

export default function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const res = await patientAPI.getAll();
      setPatients(res.data);
    } catch { toast.error('Failed to load patients'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (p) => {
    setEditing(p.patientId);
    setForm({ name: p.name, age: p.age, phnNo: p.phnNo, mail: p.mail, password: p.password, address: p.address || '', gender: p.gender || 'Male' });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = { ...form, age: parseInt(form.age) };
      if (editing) {
        await patientAPI.update(editing, data);
        toast.success('Patient updated!');
      } else {
        await patientAPI.create(data);
        toast.success('Patient created!');
      }
      setShowModal(false);
      load();
    } catch { toast.error('Save failed'); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this patient?')) return;
    try {
      await patientAPI.delete(id);
      toast.success('Patient deleted');
      load();
    } catch { toast.error('Delete failed'); }
  };

  const filtered = patients.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.mail?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-wrapper">
      <div className="bg-animated" />
      <div className="main-content" style={{ position: 'relative', zIndex: 1 }}>
        <div className="page-hero animate-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem' }}>👥 Patient Management</h1>
              <p style={{ color: '#8892b0' }}>Register and manage patient records</p>
            </div>
            <button className="btn btn-primary" onClick={openCreate}>+ Add Patient</button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
          {[
            { label: 'Total Patients', value: patients.length, icon: '👥', color: '#00b4d8' },
            { label: 'Male', value: patients.filter(p => p.gender === 'Male').length, icon: '👨', color: '#2ecc71' },
            { label: 'Female', value: patients.filter(p => p.gender === 'Female').length, icon: '👩', color: '#9b59b6' },
            { label: 'Avg Age', value: patients.length ? Math.round(patients.reduce((a, p) => a + (p.age || 0), 0) / patients.length) : 0, icon: '📊', color: '#f39c12' },
          ].map((s, i) => (
            <div key={i} className="stat-card animate-in">
              <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>{s.icon}</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: s.color, fontFamily: 'Playfair Display, serif' }}>{loading ? '...' : s.value}</div>
              <div style={{ fontSize: '0.75rem', color: '#8892b0', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div style={{ marginBottom: '1rem' }}>
          <input className="form-control" style={{ maxWidth: 400 }} placeholder="🔍 Search patients by name or email..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Table */}
        <div className="card animate-in">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Age</th>
                  <th>Gender</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: '#8892b0' }}>Loading...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: '#8892b0' }}>No patients found</td></tr>
                ) : filtered.map((p, i) => (
                  <tr key={p.patientId}>
                    <td style={{ color: '#8892b0' }}>{i + 1}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,180,216,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>
                          {p.gender === 'Female' ? '👩' : '👨'}
                        </div>
                        <strong>{p.name}</strong>
                      </div>
                    </td>
                    <td>{p.age}</td>
                    <td>
                      <span className={`badge ${p.gender === 'Female' ? 'badge-info' : 'badge-success'}`}>{p.gender}</span>
                    </td>
                    <td>{p.mail}</td>
                    <td>{p.phnNo}</td>
                    <td style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.address}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-outline btn-sm" onClick={() => openEdit(p)}>✏️ Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.patientId)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editing ? '✏️ Edit Patient' : '➕ New Patient'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-control" placeholder="Patient name" required
                    value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Age</label>
                  <input className="form-control" type="number" placeholder="Age" required
                    value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-control" type="email" placeholder="email@example.com" required
                    value={form.mail} onChange={e => setForm({ ...form, mail: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input className="form-control" placeholder="+91 9876543210" required
                    value={form.phnNo} onChange={e => setForm({ ...form, phnNo: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select className="form-control" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input className="form-control" type="password" placeholder="Password" required={!editing}
                    value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Address</label>
                  <textarea className="form-control" placeholder="Full address" rows={2}
                    value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)} style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
                  {saving ? <span className="loading-spinner" /> : null}
                  {saving ? 'Saving...' : editing ? '✅ Update' : '➕ Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <PageNav currentPath="/patients" />
    </div>
  );
}
