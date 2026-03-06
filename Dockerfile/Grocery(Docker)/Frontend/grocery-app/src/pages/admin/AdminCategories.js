import React, { useState, useEffect } from 'react';
import { categoryAPI, productAPI } from '../../services/api';
import Toast from '../../components/Toast';
import useToast from '../../components/useToast';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ categoryType: '' });
  const { toast, showToast, hideToast } = useToast();

  const fetchAll = async () => {
    try {
      const [cRes, pRes] = await Promise.all([categoryAPI.getAll(), productAPI.getAll()]);
      setCategories(cRes.data);
      setProducts(pRes.data);
    } catch {}
    setLoading(false);
  };
  useEffect(() => { fetchAll(); }, []);

  // category uses categoryType field
  const getCatName = (c) => c.categoryType ?? c.name ?? '(unnamed)';

  // product.category is an object
  const getProductsForCat = (catId) =>
    products.filter(p => p.category?.categoryId === catId);

  const openAdd  = () => { setEditing(null); setForm({ categoryType: '' }); setShowModal(true); };
  const openEdit = (c) => { setEditing(c); setForm({ categoryType: getCatName(c) }); setShowModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await categoryAPI.update(editing.categoryId, { ...editing, categoryType: form.categoryType });
        showToast('Category updated!');
      } else {
        await categoryAPI.create({ categoryType: form.categoryType });
        showToast('Category added!');
      }
      setShowModal(false);
      fetchAll();
    } catch { showToast('Error saving', 'error'); }
  };

  const handleDelete = async (c) => {
    if (!window.confirm('Delete this category?')) return;
    try { await categoryAPI.delete(c.categoryId); showToast('Deleted!'); fetchAll(); }
    catch { showToast('Error deleting', 'error'); }
  };

  if (loading) return <div className="loading">Loading categories...</div>;

  return (
    <div className="animate-in">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">📂 Categories</h1>
          <p className="page-subtitle">{categories.length} categories</p>
        </div>
        <button className="btn-primary" onClick={openAdd}>+ Add Category</button>
      </div>

      {categories.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📂</div>
          <h3>No categories yet</h3>
          <p>Add a category to get started</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {categories.map(c => {
            const catProds = getProductsForCat(c.categoryId);
            return (
              <div key={c.categoryId} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ fontSize: '36px' }}>📂</div>
                    <div>
                      <h3 style={{ fontSize: '20px', fontWeight: '700' }}>{getCatName(c)}</h3>
                      <span className="badge badge-green">{catProds.length} product(s)</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn-outline" style={{ fontSize: '13px', padding: '6px 14px' }} onClick={() => openEdit(c)}>Edit</button>
                    <button className="btn-danger" style={{ fontSize: '13px', padding: '6px 14px' }} onClick={() => handleDelete(c)}>Delete</button>
                  </div>
                </div>

                {catProds.length === 0 ? (
                  <div style={{ background: 'var(--gray-light)', borderRadius: '10px', padding: '14px', color: 'var(--gray)', fontSize: '14px' }}>
                    No products in this category yet.
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
                    {catProds.map(p => (
                      <div key={p.productId} style={{ background: 'var(--gray-light)', borderRadius: '12px', padding: '14px' }}>
                        <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>{p.name || '(no name)'}</div>
                        <div style={{ color: 'var(--green)', fontWeight: '700', fontSize: '16px', marginBottom: '4px' }}>₹{p.price}</div>
                        <span className={`badge ${p.quantity > 0 ? 'badge-green' : 'badge-red'}`} style={{ fontSize: '11px' }}>
                          Qty: {p.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3 className="modal-title">{editing ? 'Edit Category' : 'Add Category'}</h3>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>Category Type / Name</label>
                <input value={form.categoryType} onChange={e => setForm({ categoryType: e.target.value })} required placeholder="e.g. Fruits, Vegetables, Dairy..." />
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