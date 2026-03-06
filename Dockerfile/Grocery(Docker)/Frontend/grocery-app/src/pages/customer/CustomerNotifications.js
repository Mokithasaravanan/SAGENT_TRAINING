import React, { useState, useEffect } from 'react';
import { notificationAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const NOTIF_ICONS = {
  ORDER_CONFIRMED: '✅', CONFIRMED: '✅',
  OUT_FOR_DELIVERY: '🛵', PREPARING: '👨‍🍳',
  DELIVERED: '🎉', CANCELLED: '❌', default: '🔔',
};

export default function CustomerNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationAPI.getAll()
      .then(res => {
        const myId = user.customerId || user.id;
        // Filter by customerId field we added to Notification entity
        const mine = res.data.filter(n => n.customerId === myId);
        setNotifications(mine.reverse());
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading notifications... 🔔</div>;

  return (
    <div className="animate-in">
      <h1 className="page-title">🔔 Notifications</h1>
      <p className="page-subtitle">{notifications.length} notification(s)</p>

      {notifications.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🔔</div>
          <h3>No notifications yet</h3>
          <p>Place an order to get updates</p>
        </div>
      ) : (
        notifications.map((n, i) => (
          <div key={n.notifyId || i} className="notif-item">
            <div className="notif-icon">{NOTIF_ICONS[n.type] || NOTIF_ICONS.default}</div>
            <div>
              <div className="notif-text">{n.message}</div>
              <div className="notif-time">
                {n.sentTime ? new Date(n.sentTime).toLocaleString('en-IN') : ''}
                {n.order?.orderId ? ` — Order #${n.order.orderId}` : ''}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}