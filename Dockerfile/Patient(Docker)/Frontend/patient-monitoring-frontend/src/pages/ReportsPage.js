import React, { useEffect, useState } from 'react';
import { reportAPI, patientAPI, healthDataAPI } from '../services/api';
import { toast } from 'react-toastify';
import PageNav from '../components/PageNav';

const EMPTY = { reportDetails: '', filePath: '', patient: { patientId: '' }, healthData: null };

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [patients, setPatients] = useState([]);
  const [healthRecords, setHealthRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');

  const load = async () => {
    try {
      const [r, p, h] = await Promise.all([reportAPI.getAll(), patientAPI.getAll(), healthDataAPI.getAll()]);
      setReports(r.data); setPatients(p.data); setHealthRecords(h.data);
    } catch { toast.error('Failed to load reports'); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (r) => {
    setEditing(r.reportId);
    setForm({ reportDetails: r.reportDetails, filePath: r.filePath || '', patient: { patientId: r.patient?.patientId || '' }, healthData: r.healthData ? { healthId: r.healthData.healthId } : null });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { ...form, patient: { patientId: parseInt(form.patient.patientId) }, healthData: form.healthData?.healthId ? { healthId: parseInt(form.healthData.healthId) } : null };
      editing ? await reportAPI.update(editing, payload) : await reportAPI.create(payload);
      toast.success(editing ? 'Report updated!' : 'Report created!');
      setShowModal(false); load();
    } catch { toast.error('Save failed'); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this report?')) return;
    try { await reportAPI.delete(id); toast.success('Deleted'); load(); setSelected(null); } catch { toast.error('Delete failed'); }
  };

  const filtered = reports.filter(r =>
    r.patient?.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.reportDetails?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-wrapper">
      <div className="bg-animated" />
      <div className="main-content" style={{ position: 'relative', zIndex: 1 }}>
        <div className="page-hero animate-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem' }}>📋 Medical Reports</h1>
              <p style={{ color: '#8892b0' }}>Secure storage for patient medical reports</p>
            </div>
            <button className="btn btn-primary" onClick={openCreate}>+ New Report</button>
          </div>
        </div>

        <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
          {[
            { icon: '📋', label: 'Total Reports', value: reports.length, color: '#00b4d8' },
            { icon: '👥', label: 'Patients with Reports', value: new Set(reports.map(r => r.patient?.patientId)).size, color: '#2ecc71' },
            { icon: '🔗', label: 'Linked to Health Data', value: reports.filter(r => r.healthData).length, color: '#9b59b6' },
          ].map((s, i) => (
            <div key={i} className="stat-card animate-in">
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{s.icon}</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: s.color, fontFamily: 'Playfair Display, serif' }}>{loading ? '...' : s.value}</div>
              <div style={{ fontSize: '0.75rem', color: '#8892b0', textTransform: 'uppercase' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <input className="form-control" style={{ maxWidth: 400, marginBottom: '1rem' }} placeholder="🔍 Search reports..." value={search} onChange={e => setSearch(e.target.value)} />

        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1fr' : '1fr', gap: '1.5rem' }}>
          {/* Reports grid */}
          <div>
            <div className="grid-2" style={{ marginBottom: '0' }}>
              {loading ? <div style={{ color: '#8892b0' }}>Loading...</div>
                : filtered.length === 0 ? <div style={{ color: '#8892b0' }}>No reports found</div>
                : filtered.map(r => (
                  <div key={r.reportId} className="card animate-in" onClick={() => setSelected(r)}
                    style={{ cursor: 'pointer', borderColor: selected?.reportId === r.reportId ? 'rgba(0,180,216,0.5)' : 'rgba(0,180,216,0.1)', transition: 'all 0.2s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <div style={{ fontSize: '2rem' }}>📋</div>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button className="btn btn-outline btn-sm" onClick={e => { e.stopPropagation(); openEdit(r); }}>✏️</button>
                        <button className="btn btn-danger btn-sm" onClick={e => { e.stopPropagation(); handleDelete(r.reportId); }}>🗑️</button>
                      </div>
                    </div>
                    <div style={{ fontWeight: 600, marginBottom: '0.4rem' }}>{r.patient?.name || 'Unknown Patient'}</div>
                    <div style={{ fontSize: '0.8rem', color: '#8892b0', marginBottom: '0.75rem' }}>Report #{r.reportId}</div>
                    <p style={{ fontSize: '0.85rem', color: '#b0c4d8', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                      {r.reportDetails}
                    </p>
                    {r.filePath && (
                      <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#00b4d8' }}>📎 {r.filePath}</div>
                    )}
                    {r.healthData && (
                      <div style={{ marginTop: '0.4rem' }}><span className="badge badge-info">🔗 Health Record #{r.healthData.healthId}</span></div>
                    )}
                  </div>
                ))}
            </div>
          </div>

          {selected && (
            <div className="card animate-in" style={{ position: 'sticky', top: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ fontFamily: 'Playfair Display, serif', color: '#00b4d8' }}>Report Details</h3>
                <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
              </div>
              <div style={{ padding: '1rem', background: 'rgba(0,180,216,0.05)', borderRadius: 12, marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.75rem', color: '#8892b0', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Patient</div>
                <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{selected.patient?.name}</div>
                <div style={{ color: '#8892b0', fontSize: '0.85rem' }}>Age: {selected.patient?.age} · {selected.patient?.gender}</div>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#8892b0', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Report Details</div>
              <p style={{ color: '#b0c4d8', lineHeight: 1.7, marginBottom: '1rem' }}>{selected.reportDetails}</p>
              {selected.filePath && (
                <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.04)', borderRadius: 8, fontSize: '0.85rem', color: '#00b4d8' }}>
                  📎 File: {selected.filePath}
                </div>
              )}
              {selected.healthData && (
                <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(155,89,182,0.1)', borderRadius: 8, border: '1px solid rgba(155,89,182,0.2)' }}>
                  🔗 Linked Health Record ID: {selected.healthData.healthId}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editing ? '✏️ Edit Report' : '📋 New Report'}</h3>
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
                <label className="form-label">Report Details</label>
                <textarea className="form-control" rows={5} placeholder="Enter detailed medical report, diagnosis, treatment plan, test results..." required value={form.reportDetails} onChange={e => setForm({ ...form, reportDetails: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">File Path (optional)</label>
                <input className="form-control" placeholder="/reports/patient_001.pdf" value={form.filePath} onChange={e => setForm({ ...form, filePath: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Link to Health Record (optional)</label>
                <select className="form-control" value={form.healthData?.healthId || ''} onChange={e => setForm({ ...form, healthData: e.target.value ? { healthId: parseInt(e.target.value) } : null })}>
                  <option value="">None</option>
                  {healthRecords.map(h => <option key={h.healthId} value={h.healthId}>Record #{h.healthId} - {h.patient?.name}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)} style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
                  {saving ? 'Saving...' : editing ? '✅ Update' : '📋 Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <PageNav currentPath="/reports" />
    </div>
  );
}
