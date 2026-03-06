import React, { useEffect, useState } from 'react';
import { consultationAPI, patientAPI, doctorAPI } from '../services/api';
import { toast } from 'react-toastify';
import PageNav from '../components/PageNav';

const EMPTY = { date: '', remark: '', consultFee: '', doctor: { doctorId: '' }, patient: { patientId: '' } };

export default function ConsultationsPage() {
  const [consultations, setConsultations] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const [c, p, d] = await Promise.all([consultationAPI.getAll(), patientAPI.getAll(), doctorAPI.getAll()]);
      setConsultations(c.data); setPatients(p.data); setDoctors(d.data);
    } catch { toast.error('Failed to load'); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (c) => {
    setEditing(c.consultId);
    setForm({ date: c.date, remark: c.remark, consultFee: c.consultFee, doctor: { doctorId: c.doctor?.doctorId || '' }, patient: { patientId: c.patient?.patientId || '' } });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { ...form, consultFee: parseFloat(form.consultFee), doctor: { doctorId: parseInt(form.doctor.doctorId) }, patient: { patientId: parseInt(form.patient.patientId) } };
      editing ? await consultationAPI.update(editing, payload) : await consultationAPI.create(payload);
      toast.success(editing ? 'Consultation updated!' : 'Consultation created!');
      setShowModal(false); load();
    } catch { toast.error('Save failed'); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this consultation?')) return;
    try { await consultationAPI.delete(id); toast.success('Deleted'); load(); } catch { toast.error('Delete failed'); }
  };

  const totalRevenue = consultations.reduce((a, c) => a + (c.consultFee || 0), 0);

  return (
    <div className="page-wrapper">
      <div className="bg-animated" />
      <div className="main-content" style={{ position: 'relative', zIndex: 1 }}>
        <div className="page-hero animate-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem' }}>💬 Consultations</h1>
              <p style={{ color: '#8892b0' }}>Manage doctor consultations and remarks</p>
            </div>
            <button className="btn btn-primary" onClick={openCreate}>+ New Consultation</button>
          </div>
        </div>

        <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
          {[
            { label: 'Total Consultations', value: consultations.length, icon: '💬', color: '#00b4d8' },
            { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: '💰', color: '#2ecc71' },
            { label: 'Avg Fee', value: consultations.length ? `₹${(totalRevenue / consultations.length).toFixed(0)}` : '₹0', icon: '📊', color: '#f39c12' },
          ].map((s, i) => (
            <div key={i} className="stat-card animate-in">
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{s.icon}</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: s.color, fontFamily: 'Playfair Display, serif' }}>{loading ? '...' : s.value}</div>
              <div style={{ fontSize: '0.75rem', color: '#8892b0', textTransform: 'uppercase' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div className="card animate-in">
          <div className="table-wrapper">
            <table>
              <thead><tr><th>#</th><th>Patient</th><th>Doctor</th><th>Date</th><th>Remark</th><th>Fee (₹)</th><th>Actions</th></tr></thead>
              <tbody>
                {loading ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#8892b0' }}>Loading...</td></tr>
                  : consultations.length === 0 ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#8892b0' }}>No consultations yet</td></tr>
                  : consultations.map((c, i) => (
                    <tr key={c.consultId}>
                      <td style={{ color: '#8892b0' }}>{i + 1}</td>
                      <td><strong>{c.patient?.name || 'N/A'}</strong></td>
                      <td>
                        <div><div style={{ fontWeight: 600 }}>{c.doctor?.name || 'N/A'}</div>
                        <div style={{ fontSize: '0.75rem', color: '#00b4d8' }}>{c.doctor?.specialization}</div></div>
                      </td>
                      <td>{c.date}</td>
                      <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.remark}</td>
                      <td><span style={{ color: '#2ecc71', fontWeight: 600 }}>₹{c.consultFee}</span></td>
                      <td><div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-outline btn-sm" onClick={() => openEdit(c)}>✏️</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.consultId)}>🗑️</button>
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
              <h3 className="modal-title">{editing ? '✏️ Edit Consultation' : '💬 New Consultation'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Patient</label>
                  <select className="form-control" required value={form.patient.patientId} onChange={e => setForm({ ...form, patient: { patientId: e.target.value } })}>
                    <option value="">Select Patient</option>
                    {patients.map(p => <option key={p.patientId} value={p.patientId}>{p.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Doctor</label>
                  <select className="form-control" required value={form.doctor.doctorId} onChange={e => setForm({ ...form, doctor: { doctorId: e.target.value } })}>
                    <option value="">Select Doctor</option>
                    {doctors.map(d => <option key={d.doctorId} value={d.doctorId}>{d.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Consultation Date</label>
                  <input className="form-control" type="date" required value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Consultation Fee (₹)</label>
                  <input className="form-control" type="number" step="0.01" placeholder="500" required value={form.consultFee} onChange={e => setForm({ ...form, consultFee: e.target.value })} />
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Doctor's Remark</label>
                  <textarea className="form-control" rows={3} placeholder="Doctor's observations and advice..." required value={form.remark} onChange={e => setForm({ ...form, remark: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)} style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
                  {saving ? 'Saving...' : editing ? '✅ Update' : '💬 Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <PageNav currentPath="/consultations" />
    </div>
  );
}
