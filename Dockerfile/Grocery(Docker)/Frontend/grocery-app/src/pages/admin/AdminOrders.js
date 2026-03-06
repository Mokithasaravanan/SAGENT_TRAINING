import React, { useState, useEffect } from 'react';
import { orderAPI, deliveryAPI, notificationAPI } from '../../services/api';

// Admin can only set these statuses (DELIVERED and CANCELLED are handled by delivery person)
const ADMIN_STATUSES = ['PLACED', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [deliveryPersons, setDeliveryPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAll = async () => {
    try {
      const [o, d] = await Promise.all([orderAPI.getAll(), deliveryAPI.getAll()]);
      setOrders(o.data.slice().reverse());
      setDeliveryPersons(d.data);
    } catch {}
    setLoading(false);
  };
  useEffect(() => { fetchAll(); }, []);

  const getCustName  = (o) => o.customer?.name ?? '(unknown)';
  const getCustEmail = (o) => o.customer?.mail ?? '';
  const getCustPhone = (o) => o.customer?.phnNo ?? '';

  const getBadgeClass = (s) => {
    if (s === 'DELIVERED') return 'badge-green';
    if (s === 'CANCELLED') return 'badge-red';
    if (s === 'PLACED') return 'badge-gray';
    return 'badge-orange';
  };

  const updateStatus = async (order, status) => {
    try {
      await orderAPI.update(order.orderId, { ...order, status });
      const msgs = {
        CONFIRMED: 'Order Confirmed! We are preparing your groceries.',
        PREPARING: 'Your order is being prepared by our team.',
        OUT_FOR_DELIVERY: '🛵 Your order is out for delivery!',
      };
      if (msgs[status] && order.customer?.customerId) {
        await notificationAPI.create({
          message: `Order #${order.orderId}: ${msgs[status]}`,
          type: status,
          customerId: order.customer.customerId,
          order: { orderId: order.orderId },
        });
      }
      showToast(`Status updated to ${status}`);
      fetchAll();
      setSelected(prev => prev ? { ...prev, status } : null);
    } catch { showToast('Error updating status', 'error'); }
  };

  const assignDelivery = async (order, personId) => {
    try {
      const pid = parseInt(personId);
      await orderAPI.update(order.orderId, { ...order, deliveryPersonId: pid, status: 'OUT_FOR_DELIVERY' });
      const person = deliveryPersons.find(d => d.personId === pid);
      if (person) await deliveryAPI.update(pid, { ...person, available: false });
      if (order.customer?.customerId) {
        await notificationAPI.create({
          message: `Order #${order.orderId}: ${person?.name || 'A delivery person'} has been assigned and is heading your way! 🛵`,
          type: 'OUT_FOR_DELIVERY',
          customerId: order.customer.customerId,
          order: { orderId: order.orderId },
        });
      }
      showToast('Delivery person assigned!');
      fetchAll();
      setSelected(null);
    } catch { showToast('Error assigning', 'error'); }
  };

  if (loading) return <div className="loading">Loading orders... 📦</div>;

  const availableDelivery = deliveryPersons.filter(d => d.available);

  return (
    <div className="animate-in">
      {toast && (
        <div style={{ position: 'fixed', bottom: '28px', right: '28px', background: toast.type === 'error' ? '#e53e3e' : 'var(--green)', color: 'white', padding: '14px 24px', borderRadius: '12px', zIndex: 9999, fontSize: '14px', fontWeight: '500' }}>
          {toast.type === 'error' ? '❌' : '✅'} {toast.msg}
        </div>
      )}

      <h1 className="page-title">📦 Orders</h1>
      <p className="page-subtitle">Manage all customer orders — Delivery person handles final delivery status</p>

      <div style={{ background: 'var(--orange-light)', border: '1px solid var(--orange)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', fontSize: '13px', color: 'var(--orange)' }}>
        ℹ️ <strong>Admin manages:</strong> PLACED → CONFIRMED → PREPARING → OUT FOR DELIVERY. <strong>Delivery person manages:</strong> DELIVERED / CANCELLED.
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Order ID</th><th>Customer</th><th>Amount</th><th>Status</th><th>Delivery Person</th><th>Date</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--gray)' }}>No orders yet</td></tr>
            )}
            {orders.map(o => {
              const assignedPerson = o.deliveryPersonId ? deliveryPersons.find(d => d.personId === o.deliveryPersonId) : null;
              return (
                <tr key={o.orderId}>
                  <td><strong>#{o.orderId}</strong></td>
                  <td>
                    <div style={{ fontWeight: '600' }}>{getCustName(o)}</div>
                    <div style={{ fontSize: '12px', color: 'var(--gray)' }}>{getCustEmail(o)}</div>
                  </td>
                  <td style={{ color: 'var(--green)', fontWeight: '700' }}>
                    {o.totalAmount ? `₹${o.totalAmount}` : '—'}
                  </td>
                  <td><span className={`badge ${getBadgeClass(o.status)}`}>{o.status?.replace(/_/g, ' ')}</span></td>
                  <td style={{ fontSize: '13px' }}>
                    {assignedPerson ? (
                      <div>
                        <div style={{ fontWeight: '600' }}>{assignedPerson.name}</div>
                        <div style={{ color: 'var(--gray)', fontSize: '12px' }}>📞 {assignedPerson.phnNo}</div>
                      </div>
                    ) : <span style={{ color: '#ccc' }}>Not assigned</span>}
                  </td>
                  <td style={{ color: 'var(--gray)', fontSize: '13px' }}>
                    {o.orderDate ? new Date(o.orderDate).toLocaleDateString('en-IN') : 'N/A'}
                  </td>
                  <td>
                    {['DELIVERED', 'CANCELLED'].includes(o.status) ? (
                      <span style={{ fontSize: '12px', color: 'var(--gray)' }}>—</span>
                    ) : (
                      <button className="btn-outline" style={{ fontSize: '13px', padding: '6px 14px' }} onClick={() => setSelected(o)}>Manage</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '540px' }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', marginBottom: '20px' }}>
              Manage Order #{selected.orderId}
            </h3>

            {/* Customer Details */}
            <div style={{ background: 'var(--gray-light)', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
              <div style={{ fontWeight: '700', fontSize: '14px', marginBottom: '10px', color: 'var(--green)' }}>👤 Customer Details</div>
              {[
                ['Name', getCustName(selected)],
                ['Email', getCustEmail(selected) || 'N/A'],
                ['Phone', getCustPhone(selected) || 'N/A'],
                ['Amount', selected.totalAmount ? `₹${selected.totalAmount}` : '—'],
                ['Address', selected.deliveryAddress || 'N/A'],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--gray)', fontSize: '13px' }}>{k}</span>
                  <span style={{ fontWeight: '500', maxWidth: '55%', textAlign: 'right', fontSize: '13px' }}>{v}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--gray)', fontSize: '13px' }}>Current Status</span>
                <span className={`badge ${getBadgeClass(selected.status)}`}>{selected.status?.replace(/_/g, ' ')}</span>
              </div>
            </div>

            {/* Status Update — only ADMIN_STATUSES */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--gray)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
                Update Status (Admin)
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '8px' }}>
                {ADMIN_STATUSES.filter(s => s !== selected.status).map(s => (
                  <button key={s} onClick={() => updateStatus(selected, s)}
                    style={{ padding: '10px', border: '1.5px solid var(--border)', borderRadius: '10px', background: 'white', cursor: 'pointer', fontWeight: '600', fontSize: '12px', color: 'var(--dark)', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.target.style.borderColor = 'var(--green)'; e.target.style.color = 'var(--green)'; }}
                    onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--dark)'; }}>
                    {s.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Assign Delivery Person */}
            {!selected.deliveryPersonId && !['CANCELLED'].includes(selected.status) && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--gray)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                  Assign Delivery Person
                </label>
                {availableDelivery.length === 0 ? (
                  <div style={{ background: 'var(--orange-light)', borderRadius: '10px', padding: '12px', color: 'var(--orange)', fontSize: '13px' }}>
                    ⚠️ No available delivery persons. Mark someone as Available in Delivery Persons page.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {availableDelivery.map(d => (
                      <button key={d.personId} onClick={() => assignDelivery(selected, d.personId)}
                        style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', border: '1.5px solid var(--border)', borderRadius: '10px', background: 'white', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--green)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', flexShrink: 0 }}>
                          {d.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '14px' }}>{d.name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--gray)' }}>📞 {d.phnNo} · {d.gender}</div>
                        </div>
                        <div style={{ marginLeft: 'auto', color: 'var(--green)', fontSize: '12px', fontWeight: '700' }}>Assign →</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {selected.deliveryPersonId && (() => {
              const dp = deliveryPersons.find(d => d.personId === selected.deliveryPersonId);
              return dp ? (
                <div style={{ background: 'var(--green-pale)', borderRadius: '10px', padding: '14px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700' }}>
                    {dp.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--green)', fontWeight: '700' }}>🛵 Delivery Assigned</div>
                    <div style={{ fontWeight: '700' }}>{dp.name} — {dp.phnNo}</div>
                  </div>
                </div>
              ) : null;
            })()}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn-outline" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}