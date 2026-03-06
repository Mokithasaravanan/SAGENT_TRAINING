import React, { useState, useEffect } from 'react';
import { productAPI, categoryAPI } from '../../services/api';
import Toast from '../../components/Toast';
import useToast from '../../components/useToast';

const EMPTY = { name: '', price: '', quantity: '', categoryId: '' };

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const { toast, showToast, hideToast } = useToast();

  const fetchAll = async () => {
    try {
      const [p, c] = await Promise.all([productAPI.getAll(), categoryAPI.getAll()]);
      setProducts(p.data);
      setCategories(c.data);
    } catch {}
    setLoading(false);
  };
  useEffect(() => { fetchAll(); }, []);

  // category field is categoryType (not name)
  const getCatId   = (c) => c.categoryId;
  const getCatName = (c) => c.categoryType ?? c.name ?? '(unnamed)';

  // product.category is an object
  const getPCatName = (p) => {
    if (p.category) return getCatName(p.category);
    return '-';
  };

  const openAdd = () => { setEditing(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name || '',
      price: p.price || '',
      quantity: p.quantity || '',
      categoryId: p.category?.categoryId || '',
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.categoryId) { showToast('Please select a category', 'error'); return; }

    // Backend expects category as an object with categoryId
    const payload = {
      name: form.name,
      price: parseFloat(form.price),
      quantity: parseInt(form.quantity),
      category: { categoryId: parseInt(form.categoryId) },
    };

    try {
      if (editing) {
        await productAPI.update(editing.productId, { ...editing, ...payload });
        showToast('Product updated!');
      } else {
        await productAPI.create(payload);
        showToast('Product added!');
      }
      setShowModal(false);
      fetchAll();
    } catch (err) {
      showToast('Error saving product', 'error');
    }
  };

  const handleDelete = async (p) => {
    if (!window.confirm('Delete this product?')) return;
    try { await productAPI.delete(p.productId); showToast('Deleted!'); fetchAll(); }
    catch { showToast('Error deleting', 'error'); }
  };

  if (loading) return <div className="loading">Loading products... 🥦</div>;

  return (
    <div className="animate-in">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">🥦 Products</h1>
          <p className="page-subtitle">{products.length} products in store</p>
        </div>
        <button className="btn-primary" onClick={openAdd}>+ Add Product</button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>ID</th><th>Name</th><th>Category</th><th>Price</th><th>Stock (Qty)</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.productId}>
                <td>{p.productId}</td>
                <td><strong>{p.name || '(no name)'}</strong></td>
                <td>{getPCatName(p)}</td>
                <td style={{ color: 'var(--green)', fontWeight: '700' }}>₹{p.price}</td>
                <td>
                  <span className={`badge ${p.quantity > 0 ? 'badge-green' : 'badge-red'}`}>{p.quantity}</span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn-outline" style={{ padding: '6px 14px', fontSize: '13px' }} onClick={() => openEdit(p)}>Edit</button>
                    <button className="btn-danger" style={{ padding: '6px 14px', fontSize: '13px' }} onClick={() => handleDelete(p)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3 className="modal-title">{editing ? 'Edit Product' : 'Add Product'}</h3>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>Product Name</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Fresh Apples" />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>Price (₹)</label>
                  <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required min="0" step="0.01" />
                </div>
                <div className="form-group">
                  <label>Quantity (Stock)</label>
                  <input type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} required min="0" />
                </div>
              </div>
              <div className="form-group">
                <label>Category</label>
                {categories.length === 0 ? (
                  <p style={{ color: 'var(--orange)', fontSize: '13px', padding: '10px', background: 'var(--orange-light)', borderRadius: '8px' }}>
                    ⚠️ No categories found. Please add a category first.
                  </p>
                ) : (
                  <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })} required>
                    <option value="">Select category</option>
                    {categories.map(c => (
                      <option key={getCatId(c)} value={getCatId(c)}>{getCatName(c)}</option>
                    ))}
                  </select>
                )}
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={categories.length === 0}>Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}