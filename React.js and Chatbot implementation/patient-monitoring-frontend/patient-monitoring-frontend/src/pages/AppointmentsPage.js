import React, { useEffect, useState } from 'react';
import { appointmentAPI, patientAPI, doctorAPI } from '../services/api';
import { toast } from 'react-toastify';
import PageNav from '../components/PageNav';

const EMPTY = { appointDate: '', status: 'Scheduled', doctor: { doctorId: '' }, patient: { patientId: '' } };

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');

  const load = async () => {
    try {
      const [a, p, d] = await Promise.all([appointmentAPI.getAll(), patientAPI.getAll(), doctorAPI.getAll()]);
      setAppointments(a.data); setPatients(p.data); setDoctors(d.data);
    } catch { toast.error('Failed to load'); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (a) => {
    setEditing(a.appointId);
    setForm({ appointDate: a.appointDate, status: a.status, doctor: { doctorId: a.doctor?.doctorId || '' }, patient: { patientId: a.patient?.patientId || '' } });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = {
        appointDate: form.appointDate,
        status: form.status,
        doctor: { doctorId: parseInt(form.doctor.doctorId) },
        patient: { patientId: parseInt(form.patient.patientId) }
      };
      editing ? await appointmentAPI.update(editing, payload) : await appointmentAPI.create(payload);
      toast.success(editing ? 'Appointment updated!' : 'Appointment created!');
      setShowModal(false); load();
    } catch { toast.error('Save failed'); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this appointment?')) return;
    try { await appointmentAPI.delete(id); toast.success('Deleted'); load(); } catch { toast.error('Delete failed'); }
  };

  const statusColors = { Scheduled: 'badge-warning', Completed: 'badge-success', Cancelled: 'badge-danger', Pending: 'badge-info' };
  const filtered = filterStatus === 'All' ? appointments : appointments.filter(a => a.status === filterStatus);

  return (
    <div className="page-wrapper">
      <div className="bg-animated" />
      <div className="main-content" style={{ position: 'relative', zIndex: 1 }}>
        <div className="page-hero animate-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem' }}>📅 Appointment Management</h1>
              <p style={{ color: '#8892b0' }}>Schedule and track patient appointments</p>
            </div>
            <button className="btn btn-primary" onClick={openCreate}>+ Schedule Appointment</button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
          {[
            { label: 'Total', value: appointments.length, color: '#00b4d8' },
            { label: 'Scheduled', value: appointments.filter(a => a.status === 'Scheduled').length, color: '#f39c12' },
            { label: 'Completed', value: appointments.filter(a => a.status === 'Completed').length, color: '#2ecc71' },
            { label: 'Cancelled', value: appointments.filter(a => a.status === 'Cancelled').length, color: '#e74c3c' },
          ].map((s, i) => (
            <div key={i} className="stat-card animate-in" onClick={() => setFilterStatus(i === 0 ? 'All' : s.label)} style={{ cursor: 'pointer' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: s.color, fontFamily: 'Playfair Display, serif' }}>{loading ? '...' : s.value}</div>
              <div style={{ fontSize: '0.75rem', color: '#8892b0', textTransform: 'uppercase' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          {['All', 'Scheduled', 'Completed', 'Cancelled', 'Pending'].map(s => (
            <button key={s} className={`btn btn-sm ${filterStatus === s ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilterStatus(s)}>{s}</button>
          ))}
        </div>

        <div className="card animate-in">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>#</th><th>Patient</th><th>Doctor</th><th>Date</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {loading ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#8892b0' }}>Loading...</td></tr>
                  : filtered.length === 0 ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#8892b0' }}>No appointments found</td></tr>
                  : filtered.map((a, i) => (
                    <tr key={a.appointId}>
                      <td style={{ color: '#8892b0' }}>{i + 1}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '1.2rem' }}>🧑</span>
                          <div>
                            <div style={{ fontWeight: 600 }}>{a.patient?.name || 'N/A'}</div>
                            <div style={{ fontSize: '0.75rem', color: '#8892b0' }}>ID: {a.patient?.patientId}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <div style={{ fontWeight: 600 }}>{a.doctor?.name || 'N/A'}</div>
                          <div style={{ fontSize: '0.75rem', color: '#00b4d8' }}>{a.doctor?.specialization}</div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{a.appointDate}</div>
                      </td>
                      <td><span className={`badge ${statusColors[a.status] || 'badge-info'}`}>{a.status}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button className="btn btn-outline btn-sm" onClick={() => openEdit(a)}>✏️</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(a.appointId)}>🗑️</button>
                        </div>
                      </td>
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
              <h3 className="modal-title">{editing ? '✏️ Edit Appointment' : '📅 New Appointment'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
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
                  {doctors.map(d => <option key={d.doctorId} value={d.doctorId}>{d.name} - {d.specialization}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Appointment Date</label>
                <input className="form-control" type="date" required value={form.appointDate} onChange={e => setForm({ ...form, appointDate: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-control" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                  <option>Scheduled</option><option>Pending</option><option>Completed</option><option>Cancelled</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)} style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
                  {saving ? 'Saving...' : editing ? '✅ Update' : '📅 Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <PageNav currentPath="/appointments" />
    </div>
  );
}
