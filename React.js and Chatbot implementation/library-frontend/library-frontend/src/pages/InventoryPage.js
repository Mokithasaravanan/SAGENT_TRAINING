import React, { useEffect, useState } from 'react';
import { getInventory, addInventory, updateInventory, getBooks } from '../services/api';
import PageNav from '../components/PageNav';

const InventoryPage = () => {
  const [inventory, setInventory] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ bookId: '', totalCopies: '', availableCopies: '', lostCopies: 0, damagedCopies: 0, lastUpdated: '' });
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    try {
      const [invRes, bkRes] = await Promise.all([getInventory(), getBooks()]);
      setInventory(invRes.data);
      setBooks(bkRes.data);
    } catch { setMsg({ text: 'Failed to load inventory.', type: 'error' }); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openAdd = () => {
    setEditItem(null);
    setForm({ bookId: '', totalCopies: '', availableCopies: '', lostCopies: 0, damagedCopies: 0, lastUpdated: new Date().toISOString().split('T')[0] });
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      bookId: item.book?.bookId || '',
      totalCopies: item.totalCopies,
      availableCopies: item.availableCopies,
      lostCopies: item.lostCopies,
      damagedCopies: item.damagedCopies,
      lastUpdated: item.lastUpdated || new Date().toISOString().split('T')[0]
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        book: { bookId: parseInt(form.bookId) },
        totalCopies: parseInt(form.totalCopies),
        availableCopies: parseInt(form.availableCopies),
        lostCopies: parseInt(form.lostCopies),
        damagedCopies: parseInt(form.damagedCopies),
        lastUpdated: form.lastUpdated
      };
      if (editItem) {
        await updateInventory(editItem.inventoryId, payload);
        setMsg({ text: 'Inventory updated!', type: 'success' });
      } else {
        await addInventory(payload);
        setMsg({ text: 'Inventory record added!', type: 'success' });
      }
      setShowModal(false);
      fetchData();
    } catch { setMsg({ text: 'Operation failed.', type: 'error' }); }
  };

  const getAvailabilityBadge = (item) => {
    if (item.availableCopies === 0) return <span className="badge badge-danger">Not Available</span>;
    if (item.damagedCopies > 0 || item.lostCopies > 0) return <span className="badge badge-warning">Partial</span>;
    return <span className="badge badge-success">Available</span>;
  };

  const filtered = inventory.filter(item =>
    item.book?.name?.toLowerCase().includes(search.toLowerCase()) ||
    item.book?.author?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-container">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem' }}>Inventory Management</h1>
          <p style={{ color: '#8c7b6e', fontSize: '0.9rem' }}>Track copies, damage, and availability</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Record</button>
      </div>

      {msg.text && (
        <div className={`alert alert-${msg.type === 'error' ? 'error' : 'success'}`}>
          {msg.text}
          <button onClick={() => setMsg({ text: '', type: '' })} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Books', value: inventory.reduce((s, i) => s + i.totalCopies, 0), icon: '📚', color: 'rgba(212,130,42,0.1)' },
          { label: 'Available', value: inventory.reduce((s, i) => s + i.availableCopies, 0), icon: '✅', color: 'rgba(39,174,96,0.1)' },
          { label: 'Damaged', value: inventory.reduce((s, i) => s + i.damagedCopies, 0), icon: '🔧', color: 'rgba(243,156,18,0.1)' },
          { label: 'Lost', value: inventory.reduce((s, i) => s + i.lostCopies, 0), icon: '❌', color: 'rgba(192,57,43,0.1)' },
        ].map(card => (
          <div key={card.label} className="card" style={{ background: card.color, display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <span style={{ fontSize: '1.8rem' }}>{card.icon}</span>
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, fontFamily: 'Playfair Display, serif' }}>{card.value}</div>
              <div style={{ fontSize: '0.8rem', color: '#8c7b6e' }}>{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div style={{ marginBottom: '1rem' }}>
          <div className="search-bar">
            <span>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by book title or author..." />
          </div>
        </div>

        {loading ? (
          <p style={{ color: '#8c7b6e', padding: '2rem', textAlign: 'center' }}>Loading...</p>
        ) : filtered.length === 0 ? (
          <p style={{ color: '#8c7b6e', padding: '2rem', textAlign: 'center' }}>No inventory records found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Book</th>
                <th>Author</th>
                <th>Total</th>
                <th>Available</th>
                <th>Damaged</th>
                <th>Lost</th>
                <th>Last Updated</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.inventoryId}>
                  <td><strong>{item.book?.name || 'N/A'}</strong></td>
                  <td style={{ color: '#8c7b6e' }}>{item.book?.author || '—'}</td>
                  <td style={{ fontWeight: 600 }}>{item.totalCopies}</td>
                  <td style={{ color: '#27ae60', fontWeight: 600 }}>{item.availableCopies}</td>
                  <td style={{ color: item.damagedCopies > 0 ? '#f39c12' : '#8c7b6e' }}>{item.damagedCopies}</td>
                  <td style={{ color: item.lostCopies > 0 ? '#c0392b' : '#8c7b6e' }}>{item.lostCopies}</td>
                  <td style={{ fontSize: '0.85rem', color: '#8c7b6e' }}>{item.lastUpdated || '—'}</td>
                  <td>{getAvailabilityBadge(item)}</td>
                  <td>
                    <button className="btn btn-outline" onClick={() => openEdit(item)}
                      style={{ padding: '0.3rem 0.75rem', fontSize: '0.82rem' }}>Edit</button>
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
            <h2>{editItem ? 'Update Inventory' : 'Add Inventory Record'}</h2>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>Select Book</label>
                <select value={form.bookId} onChange={e => setForm({ ...form, bookId: e.target.value })} required disabled={!!editItem}>
                  <option value="">-- Choose a book --</option>
                  {books.map(b => (
                    <option key={b.bookId} value={b.bookId}>{b.name} — {b.author}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
                <div className="form-group">
                  <label>Total Copies</label>
                  <input type="number" min="0" value={form.totalCopies} onChange={e => setForm({ ...form, totalCopies: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Available Copies</label>
                  <input type="number" min="0" value={form.availableCopies} onChange={e => setForm({ ...form, availableCopies: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Damaged Copies</label>
                  <input type="number" min="0" value={form.damagedCopies} onChange={e => setForm({ ...form, damagedCopies: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Lost Copies</label>
                  <input type="number" min="0" value={form.lostCopies} onChange={e => setForm({ ...form, lostCopies: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Last Updated</label>
                <input type="date" value={form.lastUpdated} onChange={e => setForm({ ...form, lastUpdated: e.target.value })} required />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editItem ? 'Update' : 'Add Record'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <PageNav currentPath="/inventory" />
    </div>
  );
};

export default InventoryPage;