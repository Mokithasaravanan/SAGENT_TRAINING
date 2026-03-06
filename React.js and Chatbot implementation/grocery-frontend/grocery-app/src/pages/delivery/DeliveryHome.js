import React, { useState, useEffect } from 'react';
import { orderAPI, customerAPI, notificationAPI, deliveryAPI, paymentAPI, cartAPI, productAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function DeliveryHome() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAll = async () => {
    try {
      const [oRes, pRes] = await Promise.all([orderAPI.getAll(), paymentAPI.getAll()]);
      const myId = user.personId || user.id;
      // Show orders assigned to this delivery person that are OUT_FOR_DELIVERY
      const myOrders = oRes.data.filter(o =>
        o.deliveryPersonId === myId && o.status === 'OUT_FOR_DELIVERY'
      );
      setOrders(myOrders);
      setPayments(pRes.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const openOrder = (order) => {
    const payment = payments.find(p => p.order?.orderId === order.orderId);
    setSelectedPayment(payment || null);
    setSelected(order);
  };

  const updateDeliveryStatus = async (order, status) => {
    try {
      await orderAPI.update(order.orderId, { ...order, status });

      // If delivered, mark delivery person available again
      if (status === 'DELIVERED') {
        const myId = user.personId || user.id;
        const dRes = await deliveryAPI.getById(myId);
        await deliveryAPI.update(myId, { ...dRes.data, available: true });
      }

      // If cancelled, also mark delivery person available
      if (status === 'CANCELLED') {
        const myId = user.personId || user.id;
        const dRes = await deliveryAPI.getById(myId);
        await deliveryAPI.update(myId, { ...dRes.data, available: true });
      }

      // Notify customer
      const custId = order.customer?.customerId;
      const msgs = {
        DELIVERED: '🎉 Your order has been delivered! Thank you for shopping with GreenBasket.',
        CANCELLED: 'Your order could not be delivered and has been cancelled. We apologize for the inconvenience.',
      };
      if (custId && msgs[status]) {
        await notificationAPI.create({
          message: `Order #${order.orderId}: ${msgs[status]}`,
          type: status,
          customerId: custId,
          order: { orderId: order.orderId },
        });
      }

      showToast(`Order marked as ${status}`);
      fetchAll();
      setSelected(null);
    } catch (err) {
      console.error(err);
      showToast('Error updating status', 'error');
    }
  };

  const markCODPaid = async (payment) => {
    try {
      await paymentAPI.update(payment.paymentId, { ...payment, status: 'PAID' });
      showToast('Payment marked as PAID!');
      // Refresh payments
      const pRes = await paymentAPI.getAll();
      setPayments(pRes.data);
      const updatedPay = pRes.data.find(p => p.paymentId === payment.paymentId);
      setSelectedPayment(updatedPay || null);
    } catch { showToast('Error updating payment', 'error'); }
  };

  if (loading) return <div className="loading">Loading your deliveries... 🛵</div>;

  return (
    <div className="animate-in">
      {toast && (
        <div style={{ position: 'fixed', bottom: '28px', right: '28px', background: toast.type === 'error' ? '#e53e3e' : 'var(--green)', color: 'white', padding: '14px 24px', borderRadius: '12px', zIndex: 9999, fontSize: '14px', fontWeight: '500' }}>
          {toast.type === 'error' ? '❌' : '✅'} {toast.msg}
        </div>
      )}

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, var(--green) 0%, var(--green-light) 100%)', borderRadius: '20px', padding: '32px', marginBottom: '28px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', marginBottom: '6px' }}>My Deliveries</h1>
          <p style={{ opacity: 0.85 }}>Hi {user?.name}! You have <strong>{orders.length}</strong> active delivery(s).</p>
        </div>
        <div style={{ fontSize: '64px', opacity: 0.8 }}>🛵</div>
      </div>

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div>
          <h3 style={{ fontSize: '22px', marginBottom: '8px' }}>No active deliveries</h3>
          <p style={{ color: 'var(--gray)' }}>New orders will appear here when assigned by the admin.</p>
        </div>
      ) : (
        orders.map(order => {
          const customer = order.customer;
          const payment = payments.find(p => p.order?.orderId === order.orderId);
          return (
            <div key={order.orderId} className="card" style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontWeight: '800', fontSize: '18px', marginBottom: '4px' }}>Order #{order.orderId}</div>
                  <span style={{ background: 'var(--orange-light)', color: 'var(--orange)', padding: '4px 12px', borderRadius: '50px', fontSize: '12px', fontWeight: '700' }}>
                    🛵 OUT FOR DELIVERY
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: '800', fontSize: '22px', color: 'var(--green)' }}>₹{order.totalAmount}</div>
                  {payment && (
                    <div style={{ fontSize: '12px', marginTop: '4px' }}>
                      <span className={`badge ${payment.status === 'PAID' ? 'badge-green' : 'badge-orange'}`}>
                        {payment.mode} — {payment.status}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer info preview */}
              {customer && (
                <div style={{ background: 'var(--gray-light)', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px' }}>
                  <div style={{ fontWeight: '700', marginBottom: '4px' }}>👤 {customer.name}</div>
                  <div style={{ color: 'var(--gray)', fontSize: '13px', marginBottom: '2px' }}>📞 {customer.phnNo}</div>
                  <div style={{ color: 'var(--gray)', fontSize: '13px' }}>📍 {order.deliveryAddress || customer.address}</div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn-outline" style={{ flex: 1, padding: '10px' }} onClick={() => openOrder(order)}>
                  View Full Details
                </button>
                <button
                  style={{ flex: 1, padding: '10px', background: 'var(--green)', color: 'white', border: 'none', borderRadius: '50px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}
                  onClick={() => updateDeliveryStatus(order, 'DELIVERED')}>
                  ✅ Mark Delivered
                </button>
              </div>
            </div>
          );
        })
      )}

      {/* Order Detail Modal */}
      {selected && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '580px' }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', marginBottom: '20px' }}>
              Order #{selected.orderId} — Full Details
            </h3>

            {/* Customer Details */}
            <div style={{ background: 'var(--green-pale)', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
              <div style={{ fontWeight: '700', color: 'var(--green)', fontSize: '14px', marginBottom: '12px' }}>👤 Customer Details</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {[
                  ['Name', selected.customer?.name],
                  ['Phone', selected.customer?.phnNo],
                  ['Email', selected.customer?.mail],
                  ['Address', selected.deliveryAddress || selected.customer?.address],
                ].map(([k, v]) => (
                  <div key={k}>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--gray)', textTransform: 'uppercase', marginBottom: '2px' }}>{k}</div>
                    <div style={{ fontSize: '14px', fontWeight: '600' }}>{v || '—'}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Details */}
            <div style={{ background: 'var(--gray-light)', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
              <div style={{ fontWeight: '700', fontSize: '14px', marginBottom: '12px' }}>📦 Order Details</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--gray)' }}>Order Date</span>
                <span>{selected.orderDate ? new Date(selected.orderDate).toLocaleDateString('en-IN') : 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--gray)' }}>Total Amount</span>
                <span style={{ fontWeight: '800', color: 'var(--green)', fontSize: '18px' }}>₹{selected.totalAmount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--gray)' }}>Status</span>
                <span className="badge badge-orange">OUT FOR DELIVERY</span>
              </div>
            </div>

            {/* Payment */}
            {selectedPayment && (
              <div style={{ background: selectedPayment.status === 'PAID' ? 'var(--green-pale)' : 'var(--orange-light)', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                <div style={{ fontWeight: '700', fontSize: '14px', marginBottom: '10px', color: selectedPayment.status === 'PAID' ? 'var(--green)' : 'var(--orange)' }}>
                  💳 Payment Details
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--gray)' }}>Mode</span>
                  <span style={{ fontWeight: '700' }}>{selectedPayment.mode}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--gray)' }}>Amount</span>
                  <span style={{ fontWeight: '700' }}>₹{selectedPayment.amount}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--gray)' }}>Status</span>
                  <span className={`badge ${selectedPayment.status === 'PAID' ? 'badge-green' : 'badge-orange'}`}>
                    {selectedPayment.status === 'PAID' ? '✅ PAID' : '⏳ PENDING'}
                  </span>
                </div>

                {/* COD — allow delivery person to mark as paid */}
                {selectedPayment.mode === 'COD' && selectedPayment.status !== 'PAID' && (
                  <button
                    style={{ width: '100%', marginTop: '12px', padding: '12px', background: 'var(--orange)', color: 'white', border: 'none', borderRadius: '50px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}
                    onClick={() => markCODPaid(selectedPayment)}>
                    💵 Collect Cash & Mark as PAID
                  </button>
                )}
                {selectedPayment.mode === 'COD' && selectedPayment.status === 'PAID' && (
                  <div style={{ marginTop: '10px', textAlign: 'center', color: 'var(--green)', fontWeight: '700', fontSize: '14px' }}>
                    ✅ Cash collected successfully!
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <button
                style={{ padding: '14px', background: 'var(--green)', color: 'white', border: 'none', borderRadius: '50px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}
                onClick={() => updateDeliveryStatus(selected, 'DELIVERED')}>
                ✅ Mark as Delivered
              </button>
              <button
                style={{ padding: '14px', background: '#e53e3e', color: 'white', border: 'none', borderRadius: '50px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}
                onClick={() => {
                  if (window.confirm('Cancel this delivery?')) updateDeliveryStatus(selected, 'CANCELLED');
                }}>
                ❌ Cancel Delivery
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn-outline" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}