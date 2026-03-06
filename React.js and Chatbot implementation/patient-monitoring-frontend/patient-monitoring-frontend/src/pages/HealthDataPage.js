import React, { useEffect, useState } from 'react';
import { healthDataAPI, patientAPI } from '../services/api';
import { toast } from 'react-toastify';
import PageNav from '../components/PageNav';

const EMPTY = { pastRecords: '', recordedDate: '', recordedTime: '', patient: { patientId: '' } };

export default function HealthDataPage() {
  const [healthData, setHealthData] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const load = async () => {
    try {
      const [h, p] = await Promise.all([healthDataAPI.getAll(), patientAPI.getAll()]);
      setHealthData(h.data); setPatients(p.data);
    } catch { toast.error('Failed to load health data'); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (h) => {
    setEditing(h.healthId);
    setForm({ pastRecords: h.pastRecords, recordedDate: h.recordedDate, recordedTime: h.recordedTime || '', patient: { patientId: h.patient?.patientId || '' } });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { ...form, patient: { patientId: parseInt(form.patient.patientId) } };
      editing ? await healthDataAPI.update(editing, payload) : await healthDataAPI.create(payload);
      toast.success(editing ? 'Health data updated!' : 'Health data added!');
      setShowModal(false); load();
    } catch { toast.error('Save failed'); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this health record?')) return;
    try { await healthDataAPI.delete(id); toast.success('Deleted'); load(); } catch { toast.error('Delete failed'); }
  };

  const filtered = healthData.filter(h =>
    h.patient?.name?.toLowerCase().includes(search.toLowerCase()) ||
    h.pastRecords?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-wrapper">
      <div className="bg-animated" />
      <div className="main-content" style={{ position: 'relative', zIndex: 1 }}>
        <div className="page-hero animate-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem' }}>🏥 Health Data</h1>
              <p style={{ color: '#8892b0' }}>Patient medical history and past records</p>
            </div>
            <button className="btn btn-primary" onClick={openCreate}>+ Add Health Record</button>
          </div>
        </div>

        {/* Info cards */}
        <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
          {[
            { icon: '📋', title: 'Medical History', desc: 'Store comprehensive patient past records and previous diagnoses', color: '#00b4d8' },
            { icon: '🔬', title: 'Lab Results', desc: 'Track test results and medical examinations over time', color: '#2ecc71' },
            { icon: '💊', title: 'Medications', desc: 'Record ongoing medications and treatment plans', color: '#9b59b6' },
          ].map((info, i) => (
            <div key={i} className="card animate-in" style={{ borderColor: `${info.color}30` }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{info.icon}</div>
              <h4 style={{ color: info.color, fontFamily: 'Playfair Display, serif', marginBottom: '0.4rem' }}>{info.title}</h4>
              <p style={{ color: '#8892b0', fontSize: '0.85rem' }}>{info.desc}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
          <input className="form-control" style={{ maxWidth: 400 }} placeholder="🔍 Search by patient name or record..." value={search} onChange={e => setSearch(e.target.value)} />
          <span style={{ color: '#8892b0', fontSize: '0.85rem' }}>{filtered.length} records</span>
        </div>

        <div className="card animate-in">
          <div className="table-wrapper">
            <table>
              <thead><tr><th>#</th><th>Patient</th><th>Past Records</th><th>Date</th><th>Time</th><th>Actions</th></tr></thead>
              <tbody>
                {loading ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#8892b0' }}>Loading...</td></tr>
                  : filtered.length === 0 ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#8892b0' }}>No health records found</td></tr>
                  : filtered.map((h, i) => (
                    <tr key={h.healthId}>
                      <td style={{ color: '#8892b0' }}>{i + 1}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '1.2rem' }}>🧑</span>
                          <div>
                            <div style={{ fontWeight: 600 }}>{h.patient?.name || 'N/A'}</div>
                            <div style={{ fontSize: '0.75rem', color: '#8892b0' }}>Age: {h.patient?.age}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ maxWidth: 250 }}>
                        <div style={{ background: 'rgba(0,180,216,0.06)', padding: '0.5rem 0.75rem', borderRadius: 8, fontSize: '0.85rem', border: '1px solid rgba(0,180,216,0.1)' }}>
                          {h.pastRecords?.length > 80 ? h.pastRecords.substring(0, 80) + '...' : h.pastRecords}
                        </div>
                      </td>
                      <td>{h.recordedDate}</td>
                      <td>{h.recordedTime}</td>
                      <td><div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-outline btn-sm" onClick={() => openEdit(h)}>✏️</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(h.healthId)}>🗑️</button>
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
              <h3 className="modal-title">{editing ? '✏️ Edit Health Record' : '🏥 Add Health Record'}</h3>
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
                <label className="form-label">Past Medical Records</label>
                <textarea className="form-control" rows={4} placeholder="Enter past medical records, diagnoses, medications, allergies, previous surgeries..." required value={form.pastRecords} onChange={e => setForm({ ...form, pastRecords: e.target.value })} />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Recorded Date</label>
                  <input className="form-control" type="date" required value={form.recordedDate} onChange={e => setForm({ ...form, recordedDate: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Recorded Time</label>
                  <input className="form-control" type="time" value={form.recordedTime} onChange={e => setForm({ ...form, recordedTime: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)} style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
                  {saving ? 'Saving...' : editing ? '✅ Update' : '🏥 Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <PageNav currentPath="/health-data" />
    </div>
  );
}
