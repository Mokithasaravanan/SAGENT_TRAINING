import React, { useState, useEffect } from 'react';
import { customerAPI } from '../../services/api';
import Toast from '../../components/Toast';
import useToast from '../../components/useToast';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast, showToast, hideToast } = useToast();

  const fetchAll = async () => {
    try { const res = await customerAPI.getAll(); setCustomers(res.data); } catch {}
    setLoading(false);
  };
  useEffect(() => { fetchAll(); }, []);

  const handleDelete = async (c) => {
    if (!window.confirm(`Delete customer ${c.name}?`)) return;
    try { await customerAPI.delete(c.customerId); showToast('Deleted.'); fetchAll(); }
    catch { showToast('Error', 'error'); }
  };

  if (loading) return <div className="loading">Loading customers... 👥</div>;

  return (
    <div className="animate-in">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
      <h1 className="page-title">👥 Customers</h1>
      <p className="page-subtitle">{customers.length} registered customers</p>

      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>ID</th><th>Name</th><th>Email (mail)</th><th>Phone (phnNo)</th><th>Address</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {customers.map(c => (
              <tr key={c.customerId}>
                <td><strong>{c.customerId}</strong></td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'var(--green-pale)', border: '2px solid var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px', color: 'var(--green)' }}>
                      {c.name?.[0]?.toUpperCase()}
                    </div>
                    <strong>{c.name}</strong>
                  </div>
                </td>
                <td style={{ color: 'var(--gray)', fontSize: '13px' }}>
                  {c.mail || <span style={{ color: '#ccc' }}>—</span>}
                </td>
                <td style={{ fontSize: '13px' }}>
                  {c.phnNo || <span style={{ color: '#ccc' }}>—</span>}
                </td>
                <td style={{ fontSize: '12px', color: 'var(--gray)', maxWidth: '200px' }}>
                  {c.address || <span style={{ color: '#ccc' }}>—</span>}
                </td>
                <td>
                  <button className="btn-danger" style={{ fontSize: '12px', padding: '6px 12px' }} onClick={() => handleDelete(c)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}