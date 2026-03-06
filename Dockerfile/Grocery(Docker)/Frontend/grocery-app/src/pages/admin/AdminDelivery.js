import React, { useState, useEffect } from 'react';
import { deliveryAPI } from '../../services/api';
import Toast from '../../components/Toast';
import useToast from '../../components/useToast';

const EMPTY = { name: '', mail: '', password: '', phnNo: '', gender: '', available: true };

export default function AdminDelivery() {
  const [persons, setPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const { toast, showToast, hideToast } = useToast();

  const fetchAll = async () => {
    try { const res = await deliveryAPI.getAll(); setPersons(res.data); } catch {}
    setLoading(false);
  };
  useEffect(() => { fetchAll(); }, []);

  const openAdd = () => { setEditing(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (p) => {
    setEditing(p);
    setForm({ name: p.name, mail: p.mail || '', password: '', phnNo: p.phnNo || '', gender: p.gender || '', available: p.available ?? true });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = { ...form };
    if (!payload.password) delete payload.password;
    try {
      if (editing) { await deliveryAPI.update(editing.personId, { ...editing, ...payload }); showToast('Updated!'); }
      else { await deliveryAPI.create(payload); showToast('Delivery person added!'); }
      setShowModal(false); fetchAll();
    } catch { showToast('Error saving', 'error'); }
  };

  const handleDelete = async (p) => {
    if (!window.confirm('Delete?')) return;
    try { await deliveryAPI.delete(p.personId); showToast('Deleted!'); fetchAll(); }
    catch { showToast('Error', 'error'); }
  };

  const toggleAvail = async (p) => {
    try { await deliveryAPI.update(p.personId, { ...p, available: !p.available }); fetchAll(); }
    catch {}
  };

  if (loading) return <div className="loading">Loading delivery persons... 🛵</div>;

  return (
    <div className="animate-in">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">🛵 Delivery Persons</h1>
          <p className="page-subtitle">{persons.filter(p => p.available).length} available out of {persons.length}</p>
        </div>
        <button className="btn-primary" onClick={openAdd}>+ Add Person</button>
      </div>

      <div className="grid-3">
        {persons.map(p => (
          <div key={p.personId} className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: p.available ? 'var(--green)' : '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', color: 'white', fontWeight: '700' }}>
                {p.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: '700', fontSize: '15px' }}>{p.name}</div>
                <span className={`badge ${p.available ? 'badge-green' : 'badge-gray'}`}>
                  {p.available ? '✅ Available' : '🔴 Busy'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              {p.mail && (
                <div style={{ fontSize: '13px', display: 'flex', gap: '8px' }}>
                  <span>📧</span><span>{p.mail}</span>
                </div>
              )}
              {p.phnNo && (
                <div style={{ fontSize: '13px', display: 'flex', gap: '8px' }}>
                  <span>📞</span><span>{p.phnNo}</span>
                </div>
              )}
              {p.gender && (
                <div style={{ fontSize: '13px', display: 'flex', gap: '8px' }}>
                  <span>👤</span><span style={{ textTransform: 'capitalize' }}>{p.gender}</span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button onClick={() => toggleAvail(p)}
                style={{ padding: '7px 12px', borderRadius: '50px', border: `1.5px solid ${p.available ? '#e53e3e' : 'var(--green)'}`, background: 'white', color: p.available ? '#e53e3e' : 'var(--green)', fontWeight: '600', fontSize: '12px', cursor: 'pointer' }}>
                {p.available ? 'Mark Busy' : 'Mark Available'}
              </button>
              <button className="btn-outline" style={{ fontSize: '12px', padding: '6px 12px' }} onClick={() => openEdit(p)}>Edit</button>
              <button className="btn-danger" style={{ fontSize: '12px', padding: '6px 12px' }} onClick={() => handleDelete(p)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3 className="modal-title">{editing ? 'Edit Delivery Person' : 'Add Delivery Person'}</h3>
            <form onSubmit={handleSave}>
              <div className="grid-2">
                <div className="form-group">
                  <label>Full Name</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Phone (phnNo)</label>
                  <input value={form.phnNo} onChange={e => setForm({ ...form, phnNo: e.target.value })} required />
                </div>
              </div>
              <div className="form-group">
                <label>Email (mail)</label>
                <input type="email" value={form.mail} onChange={e => setForm({ ...form, mail: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Password {editing && '(blank = keep current)'}</label>
                <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required={!editing} />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>Gender</label>
                  <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Availability</label>
                  <select value={String(form.available)} onChange={e => setForm({ ...form, available: e.target.value === 'true' })}>
                    <option value="true">Available</option>
                    <option value="false">Busy</option>
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}