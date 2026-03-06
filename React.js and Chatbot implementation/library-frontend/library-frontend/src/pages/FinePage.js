import React, { useEffect, useState } from 'react';
import { getFines, addFine, updateFine, getBorrows } from '../services/api';
import PageNav from '../components/PageNav';

const FinePage = () => {
  const [fines, setFines] = useState([]);
  const [borrows, setBorrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editFine, setEditFine] = useState(null);
  const [form, setForm] = useState({ borrowId: '', fineAmount: '', fineDate: '', status: 'Unpaid' });
  const [msg, setMsg] = useState({ text: '', type: '' });

  const fetchData = async () => {
    try {
      const [fRes, bRes] = await Promise.all([getFines(), getBorrows()]);
      setFines(fRes.data.reverse());
      setBorrows(bRes.data);
    } catch { setMsg({ text: 'Failed to load fines.', type: 'error' }); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openAdd = () => {
    setEditFine(null);
    setForm({ borrowId: '', fineAmount: '', fineDate: new Date().toISOString().split('T')[0], status: 'Unpaid' });
    setShowModal(true);
  };

  const openEdit = (fine) => {
    setEditFine(fine);
    setForm({
      borrowId: fine.borrow?.borrowId || '',
      fineAmount: fine.fineAmount,
      fineDate: fine.fineDate,
      status: fine.status
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        borrow: { borrowId: parseInt(form.borrowId) },
        fineAmount: parseFloat(form.fineAmount),
        fineDate: form.fineDate,
        status: form.status
      };
      if (editFine) {
        await updateFine(editFine.fineId, payload);
        setMsg({ text: 'Fine updated!', type: 'success' });
      } else {
        await addFine(payload);
        setMsg({ text: 'Fine added!', type: 'success' });
      }
      setShowModal(false);
      fetchData();
    } catch { setMsg({ text: 'Operation failed.', type: 'error' }); }
  };

  const totalUnpaid = fines.filter(f => f.status === 'Unpaid').reduce((sum, f) => sum + f.fineAmount, 0);
  const totalPaid = fines.filter(f => f.status === 'Paid').reduce((sum, f) => sum + f.fineAmount, 0);

  return (
    <div className="page-container">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem' }}>Fine Management</h1>
          <p style={{ color: '#8c7b6e', fontSize: '0.9rem' }}>Track and manage overdue fines</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Fine</button>
      </div>

      {msg.text && (
        <div className={`alert alert-${msg.type === 'error' ? 'error' : 'success'}`}>
          {msg.text}
          <button onClick={() => setMsg({ text: '', type: '' })} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Fines', value: fines.length, color: 'rgba(212,130,42,0.1)', icon: '📋' },
          { label: 'Unpaid Amount', value: `₹${totalUnpaid.toFixed(2)}`, color: 'rgba(192,57,43,0.1)', icon: '⚠️' },
          { label: 'Paid Amount', value: `₹${totalPaid.toFixed(2)}`, color: 'rgba(39,174,96,0.1)', icon: '✅' },
        ].map(card => (
          <div key={card.label} className="card" style={{ background: card.color, display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span style={{ fontSize: '2rem' }}>{card.icon}</span>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'Playfair Display, serif' }}>{card.value}</div>
              <div style={{ fontSize: '0.82rem', color: '#8c7b6e' }}>{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        {loading ? (
          <p style={{ color: '#8c7b6e', padding: '2rem', textAlign: 'center' }}>Loading...</p>
        ) : fines.length === 0 ? (
          <p style={{ color: '#8c7b6e', padding: '2rem', textAlign: 'center' }}>No fines recorded yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Fine ID</th>
                <th>Member</th>
                <th>Book</th>
                <th>Fine Amount</th>
                <th>Fine Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {fines.map(fine => (
                <tr key={fine.fineId}>
                  <td style={{ color: '#8c7b6e', fontSize: '0.85rem' }}>#{fine.fineId}</td>
                  <td>{fine.borrow?.member?.name || 'N/A'}</td>
                  <td>{fine.borrow?.book?.name || 'N/A'}</td>
                  <td style={{ fontWeight: 600, color: fine.status === 'Unpaid' ? '#c0392b' : '#27ae60' }}>
                    ₹{fine.fineAmount?.toFixed(2)}
                  </td>
                  <td>{fine.fineDate || '—'}</td>
                  <td>
                    <span className={`badge ${fine.status === 'Paid' ? 'badge-success' : 'badge-danger'}`}>
                      {fine.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-outline" onClick={() => openEdit(fine)}
                      style={{ padding: '0.3rem 0.75rem', fontSize: '0.82rem' }}>
                      {fine.status === 'Unpaid' ? 'Mark Paid' : 'Edit'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editFine ? 'Edit Fine' : 'Add Fine'}</h2>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>Select Borrow Record</label>
                <select value={form.borrowId} onChange={e => setForm({ ...form, borrowId: e.target.value })} required>
                  <option value="">-- Select borrow --</option>
                  {borrows.map(b => (
                    <option key={b.borrowId} value={b.borrowId}>
                      #{b.borrowId} — {b.book?.name} ({b.member?.name})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Fine Amount (₹)</label>
                <input type="number" step="0.01" min="0" value={form.fineAmount}
                  onChange={e => setForm({ ...form, fineAmount: e.target.value })} required placeholder="e.g. 50.00" />
              </div>
              <div className="form-group">
                <label>Fine Date</label>
                <input type="date" value={form.fineDate}
                  onChange={e => setForm({ ...form, fineDate: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                  <option value="Unpaid">Unpaid</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editFine ? 'Update' : 'Add Fine'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <PageNav currentPath="/fines" />
    </div>
  );
};

export const updateFine = (id, fine) => api.put(`/fines/${id}`, fine);