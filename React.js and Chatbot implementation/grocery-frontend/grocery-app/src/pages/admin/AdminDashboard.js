import React, { useState, useEffect } from 'react';
import { customerAPI, orderAPI, productAPI, deliveryAPI, paymentAPI } from '../../services/api';

function StatCard({ icon, label, value, color }) {
  return (
    <div className="card" style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '40px', marginBottom: '8px' }}>{icon}</div>
      <div style={{ fontSize: '32px', fontWeight: '800', color: color || 'var(--green)', marginBottom: '4px' }}>{value}</div>
      <div style={{ color: 'var(--gray)', fontSize: '14px', fontWeight: '500' }}>{label}</div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({ customers: 0, orders: 0, products: 0, delivery: 0, revenue: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      customerAPI.getAll(), orderAPI.getAll(), productAPI.getAll(),
      deliveryAPI.getAll(), paymentAPI.getAll()
    ]).then(([c, o, p, d, pay]) => {
      const revenue = pay.data.reduce((sum, p) => sum + (p.amount || 0), 0);
      setStats({
        customers: c.data.length,
        orders: o.data.length,
        products: p.data.length,
        delivery: d.data.length,
        revenue,
      });
      setRecentOrders(o.data.slice(-5).reverse());
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading dashboard... 📊</div>;

  return (
    <div className="animate-in">
      <h1 className="page-title">Dashboard</h1>
      <p className="page-subtitle">Overview of your grocery store</p>

      <div className="grid-4" style={{ marginBottom: '32px' }}>
        <StatCard icon="👥" label="Total Customers" value={stats.customers} />
        <StatCard icon="📦" label="Total Orders" value={stats.orders} color="var(--orange)" />
        <StatCard icon="🥦" label="Products" value={stats.products} color="#8B5CF6" />
        <StatCard icon="💰" label="Revenue" value={`₹${stats.revenue.toLocaleString()}`} color="var(--green)" />
      </div>

      <div className="card">
        <h2 style={{ fontSize: '18px', marginBottom: '20px' }}>Recent Orders</h2>
        {recentOrders.length === 0 ? (
          <p style={{ color: 'var(--gray)' }}>No orders yet.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer ID</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(o => (
                  <tr key={o.orderId}>
                    <td><strong>#{o.orderId}</strong></td>
                    <td>{o.customerId}</td>
                    <td style={{ color: 'var(--green)', fontWeight: '700' }}>₹{o.totalAmount}</td>
                    <td>
                      <span className={`badge ${o.status === 'DELIVERED' ? 'badge-green' : o.status === 'CANCELLED' ? 'badge-red' : 'badge-orange'}`}>
                        {o.status?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td style={{ color: 'var(--gray)' }}>
                      {o.orderDate ? new Date(o.orderDate).toLocaleDateString('en-IN') : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
