import React, { useEffect, useState } from 'react';
import { dailyReadingAPI, patientAPI } from '../services/api';
import { toast } from 'react-toastify';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import PageNav from '../components/PageNav';

const EMPTY = { heartRate: '', bloodPressure: '', oxygenLevel: '', temperature: '', recordedDate: '', patient: { patientId: '' } };

export default function DailyReadingsPage() {
  const [readings, setReadings] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState('All');

  const load = async () => {
    try {
      const [r, p] = await Promise.all([dailyReadingAPI.getAll(), patientAPI.getAll()]);
      setReadings(r.data); setPatients(p.data);
    } catch { toast.error('Failed to load readings'); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (r) => {
    setEditing(r.readingId);
    setForm({ heartRate: r.heartRate, bloodPressure: r.bloodPressure, oxygenLevel: r.oxygenLevel, temperature: r.temperature, recordedDate: r.recordedDate, patient: { patientId: r.patient?.patientId || '' } });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { ...form, heartRate: parseInt(form.heartRate), oxygenLevel: parseInt(form.oxygenLevel), temperature: parseFloat(form.temperature), patient: { patientId: parseInt(form.patient.patientId) } };
      editing ? await dailyReadingAPI.update(editing, payload) : await dailyReadingAPI.create(payload);
      toast.success(editing ? 'Reading updated!' : 'Reading added!');
      setShowModal(false); load();
    } catch { toast.error('Save failed'); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this reading?')) return;
    try { await dailyReadingAPI.delete(id); toast.success('Deleted'); load(); } catch { toast.error('Delete failed'); }
  };

  const filtered = selectedPatient === 'All' ? readings : readings.filter(r => r.patient?.patientId === parseInt(selectedPatient));
  const chartData = filtered.slice(-10).map((r, i) => ({ day: i + 1, heartRate: r.heartRate, oxygenLevel: r.oxygenLevel, temperature: r.temperature }));

  const getStatus = (hr, o2) => {
    if (hr < 60 || hr > 100 || o2 < 95) return { label: 'Alert', cls: 'badge-danger' };
    if (hr < 65 || hr > 90) return { label: 'Caution', cls: 'badge-warning' };
    return { label: 'Normal', cls: 'badge-success' };
  };

  return (
    <div className="page-wrapper">
      <div className="bg-animated" />
      <div className="main-content" style={{ position: 'relative', zIndex: 1 }}>
        <div className="page-hero animate-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem' }}>📈 Daily Readings</h1>
              <p style={{ color: '#8892b0' }}>Track heart rate, blood pressure, oxygen & temperature</p>
            </div>
            <button className="btn btn-primary" onClick={openCreate}>+ Add Reading</button>
          </div>
        </div>

        {/* Vitals summary */}
        <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
          {[
            { icon: '❤️', label: 'Avg Heart Rate', value: readings.length ? Math.round(readings.reduce((a, r) => a + (r.heartRate || 0), 0) / readings.length) + ' bpm' : 'N/A', color: '#e74c3c' },
            { icon: '🩸', label: 'Latest BP', value: readings.length ? readings[readings.length - 1]?.bloodPressure : 'N/A', color: '#9b59b6' },
            { icon: '🫁', label: 'Avg O₂ Level', value: readings.length ? Math.round(readings.reduce((a, r) => a + (r.oxygenLevel || 0), 0) / readings.length) + '%' : 'N/A', color: '#2ecc71' },
            { icon: '🌡️', label: 'Avg Temp', value: readings.length ? (readings.reduce((a, r) => a + (r.temperature || 0), 0) / readings.length).toFixed(1) + '°C' : 'N/A', color: '#f39c12' },
          ].map((s, i) => (
            <div key={i} className="stat-card animate-in">
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{s.icon}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: s.color, fontFamily: 'Playfair Display, serif' }}>{loading ? '...' : s.value}</div>
              <div style={{ fontSize: '0.75rem', color: '#8892b0', textTransform: 'uppercase' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Chart */}
        {chartData.length > 0 && (
          <div className="card animate-in" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontFamily: 'Playfair Display, serif', marginBottom: '1rem' }}>📊 Vitals Trend (Last 10)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="hrGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e74c3c" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#e74c3c" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="o2Grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2ecc71" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2ecc71" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" tick={{ fill: '#8892b0', fontSize: 11 }} />
                <YAxis tick={{ fill: '#8892b0', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#112240', border: '1px solid rgba(0,180,216,0.3)', borderRadius: 8, color: '#e8f4f8' }} />
                <Area type="monotone" dataKey="heartRate" stroke="#e74c3c" fill="url(#hrGrad)" strokeWidth={2} name="Heart Rate" />
                <Area type="monotone" dataKey="oxygenLevel" stroke="#2ecc71" fill="url(#o2Grad)" strokeWidth={2} name="O₂ Level" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Filter */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
          <label className="form-label" style={{ marginBottom: 0 }}>Filter by Patient:</label>
          <select className="form-control" style={{ maxWidth: 250 }} value={selectedPatient} onChange={e => setSelectedPatient(e.target.value)}>
            <option value="All">All Patients</option>
            {patients.map(p => <option key={p.patientId} value={p.patientId}>{p.name}</option>)}
          </select>
        </div>

        <div className="card animate-in">
          <div className="table-wrapper">
            <table>
              <thead><tr><th>#</th><th>Patient</th><th>Date</th><th>Heart Rate</th><th>Blood Pressure</th><th>O₂ Level</th><th>Temperature</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {loading ? <tr><td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: '#8892b0' }}>Loading...</td></tr>
                  : filtered.length === 0 ? <tr><td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: '#8892b0' }}>No readings found</td></tr>
                  : filtered.map((r, i) => {
                    const st = getStatus(r.heartRate, r.oxygenLevel);
                    return (
                      <tr key={r.readingId}>
                        <td style={{ color: '#8892b0' }}>{i + 1}</td>
                        <td><strong>{r.patient?.name || 'N/A'}</strong></td>
                        <td>{r.recordedDate}</td>
                        <td><span style={{ color: '#e74c3c', fontWeight: 600 }}>{r.heartRate} bpm</span></td>
                        <td>{r.bloodPressure}</td>
                        <td><span style={{ color: r.oxygenLevel >= 95 ? '#2ecc71' : '#e74c3c', fontWeight: 600 }}>{r.oxygenLevel}%</span></td>
                        <td>{r.temperature}°C</td>
                        <td><span className={`badge ${st.cls}`}>{st.label}</span></td>
                        <td><div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button className="btn btn-outline btn-sm" onClick={() => openEdit(r)}>✏️</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r.readingId)}>🗑️</button>
                        </div></td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editing ? '✏️ Edit Reading' : '📈 Add Reading'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="grid-2">
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Patient</label>
                  <select className="form-control" required value={form.patient.patientId} onChange={e => setForm({ ...form, patient: { patientId: e.target.value } })}>
                    <option value="">Select Patient</option>
                    {patients.map(p => <option key={p.patientId} value={p.patientId}>{p.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Heart Rate (bpm)</label>
                  <input className="form-control" type="number" placeholder="72" required value={form.heartRate} onChange={e => setForm({ ...form, heartRate: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Blood Pressure</label>
                  <input className="form-control" placeholder="120/80" required value={form.bloodPressure} onChange={e => setForm({ ...form, bloodPressure: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Oxygen Level (%)</label>
                  <input className="form-control" type="number" placeholder="98" required value={form.oxygenLevel} onChange={e => setForm({ ...form, oxygenLevel: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Temperature (°C)</label>
                  <input className="form-control" type="number" step="0.1" placeholder="36.6" required value={form.temperature} onChange={e => setForm({ ...form, temperature: e.target.value })} />
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Recorded Date</label>
                  <input className="form-control" type="date" required value={form.recordedDate} onChange={e => setForm({ ...form, recordedDate: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)} style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
                  {saving ? 'Saving...' : editing ? '✅ Update' : '📈 Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <PageNav currentPath="/readings" />
    </div>
  );
}
