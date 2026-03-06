import React, { useState, useEffect } from 'react';
import { orderAPI, deliveryAPI, paymentAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const STATUS_STEPS = [
  { key: 'PLACED', label: 'Order Placed', icon: '📋' },
  { key: 'CONFIRMED', label: 'Confirmed', icon: '✅' },
  { key: 'PREPARING', label: 'Preparing', icon: '👨‍🍳' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: '🛵' },
  { key: 'DELIVERED', label: 'Delivered', icon: '🎉' },
];

const STATUS_IMAGES = {
  PLACED: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=300&q=80',
  CONFIRMED: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300&q=80',
  PREPARING: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&q=80',
  OUT_FOR_DELIVERY: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=80',
  DELIVERED: 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=300&q=80',
  CANCELLED: 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?w=300&q=80',
};

const ORDERS_PER_PAGE = 5;

function OrderTracker({ status }) {
  if (status === 'CANCELLED') return null;
  const currentIdx = STATUS_STEPS.findIndex(s => s.key === status);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', margin: '20px 0', overflowX: 'auto' }}>
      {STATUS_STEPS.map((step, i) => (
        <React.Fragment key={step.key}>
          {i > 0 && <div style={{ height: 3, background: i <= currentIdx ? '#2e7d32' : '#e0e0e0', flex: 1, marginTop: 18 }} />}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 70 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: i < currentIdx ? '#2e7d32' : i === currentIdx ? '#e65100' : '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, boxShadow: i === currentIdx ? '0 0 0 6px rgba(230,81,0,0.2)' : 'none' }}>
              {step.icon}
            </div>
            <span style={{ fontSize: 10, fontWeight: 600, color: i <= currentIdx ? '#2e7d32' : '#999', marginTop: 6, textAlign: 'center', lineHeight: 1.3 }}>{step.label}</span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

export default function CustomerOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [deliveryPersons, setDeliveryPersons] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);

  const fetchAll = async () => {
    try {
      const [oRes, dRes, pRes] = await Promise.all([orderAPI.getAll(), deliveryAPI.getAll(), paymentAPI.getAll()]);
      const myId = user.customerId || user.id;
      const mine = oRes.data.filter(o => o.customer?.customerId === myId).reverse();
      setOrders(mine); setDeliveryPersons(dRes.data); setPayments(pRes.data);
    } catch {} setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const getDeliveryPerson = (order) => { if (!order.deliveryPersonId) return null; return deliveryPersons.find(d => d.personId === order.deliveryPersonId) || null; };
  const getPayment = (order) => payments.find(p => p.order?.orderId === order.orderId) || null;

  const handleCancel = async (order) => {
    if (['DELIVERED', 'OUT_FOR_DELIVERY'].includes(order.status)) { alert('Cannot cancel — order is already out for delivery.'); return; }
    if (!window.confirm('Cancel this order?')) return;
    try { await orderAPI.update(order.orderId, { ...order, status: 'CANCELLED' }); fetchAll(); setSelected(null); }
    catch { alert('Failed to cancel.'); }
  };

  const getBadgeColor = (s) => ({ DELIVERED: { bg: '#e8f5e9', color: '#2e7d32' }, CANCELLED: { bg: '#ffebee', color: '#c62828' }, PLACED: { bg: '#f5f5f5', color: '#555' } }[s] || { bg: '#fff3e0', color: '#e65100' });
  const getPayBadge = (status) => status === 'PAID' ? { bg: '#e8f5e9', color: '#2e7d32' } : { bg: '#fff3e0', color: '#e65100' };

  const totalPages = Math.ceil(orders.length / ORDERS_PER_PAGE);
  const paginated = orders.slice((page - 1) * ORDERS_PER_PAGE, page * ORDERS_PER_PAGE);

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: 16 }}>
      <div style={{ fontSize: 56 }}>📦</div>
      <p style={{ color: '#2e7d32', fontWeight: 700, fontSize: 16 }}>Loading your orders...</p>
    </div>
  );

  return (
    <div className="animate-in" style={{ fontFamily: "'Nunito', sans-serif" }}>

      {/* Header Banner */}
      <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', marginBottom: 28, height: 140 }}>
        <img src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&q=80" alt="orders" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(27,94,32,0.7)' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', padding: '0 32px' }}>
          <div>
            <h1 style={{ color: 'white', fontSize: 28, fontWeight: 900, margin: '0 0 4px' }}>📦 My Orders</h1>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, margin: 0 }}>{orders.length} order{orders.length !== 1 ? 's' : ''} total</p>
          </div>
        </div>
      </div>

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <img src="https://images.unsplash.com/photo-1586769852836-bc069f19e1b6?w=300&q=80" alt="empty" style={{ width: 160, height: 160, borderRadius: 20, objectFit: 'cover', marginBottom: 20, opacity: 0.6 }} />
          <h3 style={{ fontSize: 22, color: '#444', marginBottom: 8 }}>No orders yet</h3>
          <p style={{ color: '#888' }}>Start shopping to place your first order!</p>
        </div>
      ) : (
        <>
          {paginated.map(order => {
            const payment = getPayment(order);
            const delivPerson = getDeliveryPerson(order);
            const badge = getBadgeColor(order.status);
            const statusImg = STATUS_IMAGES[order.status] || STATUS_IMAGES.PLACED;
            return (
              <div key={order.orderId} onClick={() => setSelected(order)}
                style={{ background: 'white', borderRadius: 16, marginBottom: 16, cursor: 'pointer', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', border: '1px solid #e8f5e9', transition: 'transform 0.2s,box-shadow 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(46,125,50,0.15)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; }}>

                <div style={{ display: 'flex' }}>
                  {/* Status Image */}
                  <div style={{ width: 100, flexShrink: 0 }}>
                    <img src={statusImg} alt={order.status} style={{ width: '100%', height: '100%', objectFit: 'cover', minHeight: 120 }} />
                  </div>

                  <div style={{ flex: 1, padding: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 2 }}>Order #{order.orderId}</div>
                        <div style={{ color: '#888', fontSize: 13, marginBottom: 4 }}>
                          {order.orderDate ? new Date(order.orderDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                        </div>
                        <div style={{ color: '#666', fontSize: 12 }}>📍 {order.deliveryAddress}</div>
                        {payment && (
                          <div style={{ marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            <span style={{ background: '#f5f5f5', color: '#555', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>💳 {payment.mode}</span>
                            <span style={{ background: getPayBadge(payment.status).bg, color: getPayBadge(payment.status).color, fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>
                              {payment.status === 'PAID' ? '✅ Paid' : '⏳ Pending'}
                            </span>
                          </div>
                        )}
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <span style={{ background: badge.bg, color: badge.color, fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20 }}>{order.status?.replace(/_/g, ' ')}</span>
                        <div style={{ fontWeight: 900, fontSize: 20, color: '#2e7d32', marginTop: 6 }}>₹{order.totalAmount || '—'}</div>
                      </div>
                    </div>

                    {delivPerson && order.status === 'OUT_FOR_DELIVERY' && (
                      <div style={{ marginTop: 10, background: '#f1f8e9', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#2e7d32', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                          {delivPerson.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color: '#2e7d32', fontWeight: 700 }}>🛵 On the way!</div>
                          <div style={{ fontWeight: 700, fontSize: 13 }}>{delivPerson.name} · {delivPerson.phnNo}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {!['CANCELLED', 'DELIVERED'].includes(order.status) && (
                  <div style={{ padding: '0 16px 8px' }}><OrderTracker status={order.status} /></div>
                )}
              </div>
            );
          })}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 24, marginBottom: 16, flexWrap: 'wrap' }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                style={{ padding: '10px 22px', background: page === 1 ? '#f0f0f0' : 'linear-gradient(135deg,#2e7d32,#66bb6a)', color: page === 1 ? '#aaa' : 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 800, cursor: page === 1 ? 'not-allowed' : 'pointer' }}>
                ‹ Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button key={n} onClick={() => setPage(n)}
                  style={{ width: 38, height: 38, borderRadius: '50%', border: 'none', background: n === page ? 'linear-gradient(135deg,#2e7d32,#66bb6a)' : '#f1f8e9', color: n === page ? 'white' : '#2e7d32', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>
                  {n}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                style={{ padding: '10px 22px', background: page === totalPages ? '#f0f0f0' : 'linear-gradient(135deg,#2e7d32,#66bb6a)', color: page === totalPages ? '#aaa' : 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 800, cursor: page === totalPages ? 'not-allowed' : 'pointer' }}>
                Next ›
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {selected && (() => {
        const payment = getPayment(selected);
        const delivPerson = getDeliveryPerson(selected);
        const badge = getBadgeColor(selected.status);
        return (
          <div onClick={() => setSelected(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
            <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: 20, maxWidth: 560, width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}>
              <img src={STATUS_IMAGES[selected.status] || STATUS_IMAGES.PLACED} alt="" style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: '20px 20px 0 0' }} />
              <div style={{ padding: 24 }}>
                <h3 style={{ fontSize: 22, fontWeight: 900, marginBottom: 16 }}>Order #{selected.orderId}</h3>

                <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                  <span style={{ background: badge.bg, color: badge.color, fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20 }}>{selected.status?.replace(/_/g, ' ')}</span>
                  {payment && (
                    <>
                      <span style={{ background: '#f5f5f5', color: '#555', fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20 }}>💳 {payment.mode}</span>
                      <span style={{ background: getPayBadge(payment.status).bg, color: getPayBadge(payment.status).color, fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20 }}>
                        {payment.status === 'PAID' ? '✅ Paid' : '⏳ COD Pending'}
                      </span>
                    </>
                  )}
                </div>

                <div style={{ background: '#f9fbe7', borderRadius: 12, padding: 16, marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ color: '#888' }}>Order Amount</span>
                    <span style={{ fontWeight: 900, color: '#2e7d32', fontSize: 18 }}>₹{selected.totalAmount || '—'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ color: '#888' }}>Delivery Address</span>
                    <span style={{ maxWidth: '55%', textAlign: 'right', fontSize: 13 }}>{selected.deliveryAddress}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#888' }}>Order Date</span>
                    <span style={{ fontSize: 13 }}>{selected.orderDate ? new Date(selected.orderDate).toLocaleDateString('en-IN') : 'N/A'}</span>
                  </div>
                </div>

                {payment && (
                  <div style={{ background: payment.status === 'PAID' ? '#e8f5e9' : '#fff3e0', borderRadius: 12, padding: 14, marginBottom: 14 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: payment.status === 'PAID' ? '#2e7d32' : '#e65100', marginBottom: 4 }}>
                      {payment.status === 'PAID' ? '✅ Payment Confirmed' : '⏳ Cash on Delivery'}
                    </div>
                    <div style={{ fontSize: 13, color: '#666' }}>
                      {payment.status === 'PAID' ? `₹${payment.amount} paid via ${payment.mode}` : `₹${payment.amount} to be paid on delivery`}
                    </div>
                  </div>
                )}

                {delivPerson && (
                  <div style={{ background: 'linear-gradient(135deg,#2e7d32,#43a047)', borderRadius: 12, padding: 16, marginBottom: 14, color: 'white' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', opacity: 0.85, marginBottom: 10 }}>🛵 Delivery Person</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700 }}>
                        {delivPerson.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15 }}>{delivPerson.name}</div>
                        <div style={{ opacity: 0.9, fontSize: 13 }}>📞 {delivPerson.phnNo}</div>
                        {delivPerson.gender && <div style={{ opacity: 0.8, fontSize: 12 }}>👤 {delivPerson.gender}</div>}
                      </div>
                    </div>
                  </div>
                )}

                {!['CANCELLED', 'DELIVERED'].includes(selected.status) && <OrderTracker status={selected.status} />}

                {selected.status === 'DELIVERED' && (
                  <div style={{ textAlign: 'center', padding: 16, background: '#e8f5e9', borderRadius: 12, marginBottom: 14 }}>
                    <div style={{ fontSize: 36, marginBottom: 6 }}>🎉</div>
                    <div style={{ color: '#2e7d32', fontWeight: 800 }}>Order Delivered Successfully!</div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 16 }}>
                  <button onClick={() => setSelected(null)} style={{ padding: '10px 20px', border: '1.5px solid #e0e0e0', borderRadius: 10, background: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Close</button>
                  {!['DELIVERED', 'CANCELLED', 'OUT_FOR_DELIVERY'].includes(selected.status) && (
                    <button onClick={() => handleCancel(selected)} style={{ background: '#e53e3e', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Cancel Order</button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}