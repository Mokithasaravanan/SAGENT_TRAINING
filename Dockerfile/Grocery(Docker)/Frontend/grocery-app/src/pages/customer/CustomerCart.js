import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { orderAPI, paymentAPI, notificationAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';

export default function CustomerCart() {
  const { cartItems, removeFromCart, updateQty, clearCart, subtotal, discount, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showCheckout, setShowCheckout] = useState(false);
  const [payMode, setPayMode] = useState('UPI');
  const [address, setAddress] = useState(user?.address || '');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState(null);

  const handlePlaceOrder = async () => {
    if (!address.trim()) { alert('Please enter a delivery address'); return; }
    setLoading(true);
    try {
      const orderRes = await orderAPI.create({
        deliveryAddress: address,
        totalAmount: total,
        status: 'PLACED',
        customer: { customerId: user.customerId || user.id },
      });
      const order = orderRes.data;
      setPlacedOrderId(order.orderId);

      // Payment — mode field, status depends on payment mode
      const payStatus = payMode === 'COD' ? 'PENDING' : 'PAID';
      await paymentAPI.create({
        amount: total,
        mode: payMode,
        status: payStatus,
        order: { orderId: order.orderId },
      });

      // Notification
      await notificationAPI.create({
        message: `Order #${order.orderId} placed successfully! Total: ₹${total}. Payment Mode: ${payMode}. ${payMode === 'COD' ? 'Pay on delivery.' : 'Payment received ✅'}`,
        type: 'ORDER_CONFIRMED',
        customerId: user.customerId || user.id,
        order: { orderId: order.orderId },
      });

      clearCart();
      setShowCheckout(false);
      setShowSuccess(true);
    } catch (err) {
      console.error(err);
      alert('Order failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0 && !showSuccess) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <div style={{ fontSize: '72px', marginBottom: '16px' }}>🛒</div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', marginBottom: '8px' }}>Your cart is empty</h2>
        <p style={{ color: 'var(--gray)', marginBottom: '24px' }}>Add some fresh groceries to get started!</p>
        <button className="btn-primary" onClick={() => navigate('/customer')}>Browse Products</button>
      </div>
    );
  }

  return (
    <div className="animate-in">
      <h1 className="page-title">🛒 Your Cart</h1>
      <p className="page-subtitle">{cartItems.length} item(s)</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '24px', alignItems: 'start' }}>
        <div>
          {cartItems.map(item => (
            <div key={item.productId} className="card" style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ fontSize: '40px', width: '60px', height: '60px', background: 'var(--green-pale)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>🥦</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', fontSize: '15px' }}>{item.name || '(no name)'}</div>
                <div style={{ color: 'var(--green)', fontWeight: '700', fontSize: '16px' }}>₹{item.price}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button onClick={() => updateQty(item.productId, item.qty - 1)} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1.5px solid var(--border)', background: 'white', fontWeight: '700', fontSize: '16px', cursor: 'pointer' }}>−</button>
                <span style={{ fontWeight: '700', minWidth: '28px', textAlign: 'center' }}>{item.qty}</span>
                <button onClick={() => updateQty(item.productId, item.qty + 1)} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1.5px solid var(--green)', background: 'var(--green)', color: 'white', fontWeight: '700', fontSize: '16px', cursor: 'pointer' }}>+</button>
              </div>
              <div style={{ fontWeight: '700', color: 'var(--dark)', minWidth: '64px', textAlign: 'right' }}>₹{(item.price * item.qty).toFixed(2)}</div>
              <button onClick={() => removeFromCart(item.productId)} style={{ background: '#e53e3e', color: 'white', border: 'none', borderRadius: '50px', padding: '8px 12px', cursor: 'pointer', fontWeight: '700' }}>✕</button>
            </div>
          ))}
        </div>

        <div className="card" style={{ position: 'sticky', top: '90px' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '20px' }}>Order Summary</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ color: 'var(--gray)' }}>Subtotal</span><span>₹{subtotal.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: 'var(--green)' }}>
              <span>🎉 Discount</span><span>−₹{discount}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ color: 'var(--gray)' }}>Delivery</span><span style={{ color: 'var(--green)' }}>FREE</span>
          </div>
          <div style={{ borderTop: '2px solid var(--border)', paddingTop: '14px', marginTop: '14px', display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '20px' }}>
            <span>Total</span><span style={{ color: 'var(--green)' }}>₹{total.toFixed(2)}</span>
          </div>
          {discount === 0 && subtotal > 0 && subtotal < 200 && (
            <div style={{ background: 'var(--orange-light)', borderRadius: '10px', padding: '10px 14px', marginTop: '14px', fontSize: '13px', color: 'var(--orange)' }}>
              💡 Add ₹{(200 - subtotal).toFixed(2)} more to get ₹25 off!
            </div>
          )}
          <button className="btn-primary" style={{ width: '100%', marginTop: '20px', padding: '14px' }} onClick={() => setShowCheckout(true)}>
            Proceed to Checkout →
          </button>
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="modal-overlay">
          <div className="modal">
            <h3 className="modal-title">Complete Your Order</h3>

            <div className="form-group">
              <label>Delivery Address</label>
              <textarea value={address} onChange={e => setAddress(e.target.value)} rows={3} placeholder="Full address with pincode" />
            </div>

            <div className="form-group">
              <label>Payment Mode</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '10px' }}>
                {[
                  { value: 'UPI', label: '📱 UPI', desc: 'Pay instantly' },
                  { value: 'CARD', label: '💳 Card', desc: 'Debit / Credit' },
                  { value: 'WALLET', label: '👛 Wallet', desc: 'Digital wallet' },
                  { value: 'COD', label: '💵 Cash on Delivery', desc: 'Pay when delivered' },
                ].map(m => (
                  <button key={m.value} onClick={() => setPayMode(m.value)}
                    style={{ padding: '12px', border: `2px solid ${payMode === m.value ? 'var(--green)' : 'var(--border)'}`, borderRadius: '10px', background: payMode === m.value ? 'var(--green-pale)' : 'white', cursor: 'pointer', textAlign: 'left' }}>
                    <div style={{ fontWeight: '700', fontSize: '13px', color: payMode === m.value ? 'var(--green)' : 'var(--dark)' }}>{m.label}</div>
                    <div style={{ fontSize: '11px', color: 'var(--gray)', marginTop: '2px' }}>{m.desc}</div>
                  </button>
                ))}
              </div>
              {payMode === 'COD' && (
                <div style={{ background: 'var(--orange-light)', borderRadius: '8px', padding: '10px 14px', marginTop: '10px', fontSize: '13px', color: 'var(--orange)' }}>
                  💵 Cash on Delivery — Payment will be collected by the delivery person.
                </div>
              )}
              {payMode !== 'COD' && (
                <div style={{ background: 'var(--green-pale)', borderRadius: '8px', padding: '10px 14px', marginTop: '10px', fontSize: '13px', color: 'var(--green)' }}>
                  ✅ Online payment — Amount will be marked as PAID immediately.
                </div>
              )}
            </div>

            <div style={{ background: 'var(--gray-light)', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: 'var(--gray)' }}>Items</span><span>{cartItems.length}</span>
              </div>
              {discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: 'var(--green)' }}>
                  <span>Discount</span><span>−₹{discount}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '18px', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
                <span>Total</span><span style={{ color: 'var(--green)' }}>₹{total.toFixed(2)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button className="btn-outline" onClick={() => setShowCheckout(false)}>Cancel</button>
              <button className="btn-primary" onClick={handlePlaceOrder} disabled={loading}>
                {loading ? 'Placing Order...' : payMode === 'COD' ? `Place Order — ₹${total.toFixed(2)}` : `Pay ₹${total.toFixed(2)}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Success Popup */}
      {showSuccess && (
        <div className="modal-overlay">
          <div className="modal" style={{ textAlign: 'center', padding: '48px 36px' }}>
            <div style={{ fontSize: '72px', marginBottom: '16px', animation: 'fadeIn 0.5s ease' }}>🎉</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', color: 'var(--green)', marginBottom: '8px' }}>
              {payMode === 'COD' ? 'Order Placed!' : 'Payment Successful!'}
            </h2>
            <p style={{ color: 'var(--gray)', fontSize: '15px', marginBottom: '8px' }}>
              {payMode === 'COD'
                ? 'Your order has been placed. Pay cash when the delivery arrives.'
                : `₹${total.toFixed(2)} paid via ${payMode}. Your order is confirmed!`}
            </p>
            {placedOrderId && (
              <div style={{ background: 'var(--green-pale)', borderRadius: '10px', padding: '12px', marginBottom: '20px', display: 'inline-block' }}>
                <span style={{ color: 'var(--green)', fontWeight: '700' }}>Order #{placedOrderId}</span>
              </div>
            )}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '8px' }}>
              <button className="btn-primary" onClick={() => { setShowSuccess(false); navigate('/customer/orders'); }}>
                Track My Order →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}