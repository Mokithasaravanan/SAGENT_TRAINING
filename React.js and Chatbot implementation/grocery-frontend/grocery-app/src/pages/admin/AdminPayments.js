import React, { useState, useEffect } from 'react';
import { paymentAPI } from '../../services/api';

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    paymentAPI.getAll()
      .then(res => setPayments(res.data.slice().reverse()))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Payment: order is an OBJECT, mode (not method)
  const getOrderId = (p) => p.order?.orderId ?? '—';
  const getAmount  = (p) => p.amount ?? '—';
  const getMode    = (p) => p.mode ?? '—';    // ← backend field is "mode"
  const getStatus  = (p) => p.status ?? '—';
  const getDate    = (p) => p.order?.orderDate ?? null;

  const total = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const getModeIcon = (mode) => {
    if (!mode) return '💳';
    const m = mode.toLowerCase();
    if (m.includes('upi'))  return '📱';
    if (m.includes('card')) return '💳';
    if (m.includes('cash') || m.includes('cod')) return '💵';
    if (m.includes('wallet')) return '👛';
    return '💳';
  };

  if (loading) return <div className="loading">Loading payments... 💳</div>;

  return (
    <div className="animate-in">
      <h1 className="page-title">💳 Payments</h1>
      <p className="page-subtitle">{payments.length} transaction(s)</p>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '28px', flexWrap: 'wrap' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px 32px' }}>
          <div style={{ fontSize: '36px' }}>💰</div>
          <div>
            <div style={{ color: 'var(--gray)', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' }}>Total Revenue</div>
            <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--green)' }}>₹{total.toLocaleString('en-IN')}</div>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px 32px' }}>
          <div style={{ fontSize: '36px' }}>🧾</div>
          <div>
            <div style={{ color: 'var(--gray)', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' }}>Transactions</div>
            <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--dark)' }}>{payments.length}</div>
          </div>
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Pay ID</th><th>Order ID</th><th>Amount</th><th>Mode</th><th>Status</th><th>Date</th></tr>
          </thead>
          <tbody>
            {payments.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--gray)', padding: '40px' }}>No payments yet</td></tr>
            )}
            {payments.map(p => (
              <tr key={p.paymentId}>
                <td><strong>#{p.paymentId}</strong></td>
                <td>{getOrderId(p) !== '—' ? `#${getOrderId(p)}` : '—'}</td>
                <td style={{ color: 'var(--green)', fontWeight: '700', fontSize: '16px' }}>₹{getAmount(p)}</td>
                <td>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                    {getModeIcon(getMode(p))}
                    <span className="badge badge-gray" style={{ textTransform: 'uppercase', fontSize: '11px' }}>
                      {getMode(p)}
                    </span>
                  </span>
                </td>
                <td>
                  <span className={`badge ${p.status === 'PAID' ? 'badge-green' : 'badge-red'}`}>{getStatus(p)}</span>
                </td>
                <td style={{ color: 'var(--gray)', fontSize: '13px' }}>
                  {getDate(p) ? new Date(getDate(p)).toLocaleDateString('en-IN') : 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}