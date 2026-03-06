import React, { useEffect, useState } from 'react';
import { paymentAPI, applicationAPI } from '../services/api';
import { useApp } from '../context/AppContext';

export default function PaymentsPage() {
  const { showNotification, userRole, currentUser } = useApp();
  const [payments, setPayments] = useState([]);
  const [apps, setApps] = useState([]);
  const [viewModal, setViewModal] = useState(null);

  const load = async () => {
    try {
      const [p, a] = await Promise.all([paymentAPI.getAll(), applicationAPI.getAll()]);
      setPayments(p.data);
      setApps(a.data);
    } catch {}
  };

  useEffect(() => { load(); }, []);

  const myAppIds = apps
    .filter(a => a.student?.studentId === currentUser?.studentId)
    .map(a => a.applicationId);

  const visiblePayments = userRole === 'student'
    ? payments.filter(p => myAppIds.includes(p.application?.applicationId))
    : payments;

  const successful = visiblePayments.filter(p => p.status === 'Paid' || p.status === 'paid').length;

  const MODE_ICONS = {
    'UPI': '📱', 'Net Banking': '🏦', 'Credit Card': '💳',
    'Debit Card': '💳', 'Cash': '💵'
  };

  return (
    <div>
      <div className="page-hero" style={{
        backgroundImage: `linear-gradient(160deg, rgba(10,14,26,0.82) 0%, rgba(15,32,68,0.70) 50%, rgba(26,107,90,0.55) 100%), url('https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=1400&q=85'`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}>
        <div className="page-hero-content">
          <div>
            <h1>Payments</h1>
            <p>{userRole === 'officer' ? 'View all student payment records' : 'Your application fee payment history'}</p>
          </div>
        </div>
      </div>

      <div className="page-content">

        {/* Campus Image Accent Strip */}
        <div style={{
          width: '100%', height: 110, borderRadius: 16, overflow: 'hidden',
          position: 'relative', marginBottom: 28,
          border: '1px solid var(--gray-200)', boxShadow: 'var(--shadow-sm)'
        }}>
          <img
            src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&q=80"
            alt="campus"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(90deg, rgba(10,14,26,0.72) 0%, rgba(10,14,26,0.3) 55%, transparent 100%)',
            display: 'flex', alignItems: 'center', padding: '0 32px'
          }}>
            <div>
              <div style={{
                fontFamily: 'Cormorant Garamond, serif', fontSize: 18, fontStyle: 'italic',
                color: 'white', fontWeight: 500, lineHeight: 1.4, maxWidth: 520
              }}>"Secure. Simple. Transparent fee management."</div>
              <div style={{
                marginTop: 6, width: 40, height: 2,
                background: 'linear-gradient(90deg, var(--gold), transparent)'
              }} />
            </div>
          </div>
        </div>
        {/* Stats */}
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 28 }}>
          <div className="stat-card">
            <span className="stat-icon">💳</span>
            <div className="stat-value">{visiblePayments.length}</div>
            <div className="stat-label">Total Payments</div>
          </div>
          <div className="stat-card sage">
            <span className="stat-icon">✅</span>
            <div className="stat-value">{successful}</div>
            <div className="stat-label">Successful</div>
          </div>
          <div className="stat-card rust">
            <span className="stat-icon">⏳</span>
            <div className="stat-value">{visiblePayments.length - successful}</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>

        {userRole === 'officer' && (
          <div className="officer-notice">
            <div className="officer-notice-icon">💳</div>
            <span>Officer view — all student payment records displayed here (read-only).</span>
          </div>
        )}

        <div className="card">
          {visiblePayments.length === 0 ? (
            <div className="empty-state">
              <img
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300&q=80"
                alt="no payments"
                style={{ width: 160, height: 100, objectFit: 'cover', borderRadius: 10, marginBottom: 16, opacity: 0.6 }}
              />
              <p>{userRole === 'student' ? 'No payments found. Submit an application to make a payment.' : 'No payment records found'}</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Application</th>
                    <th>Student</th>
                    <th>Course</th>
                    <th>Mode</th>
                    <th>Payment Date</th>
                    <th>Deadline</th>
                    <th>Status</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {visiblePayments.map(p => (
                    <tr key={p.paymentId}>
                      <td>
                        <strong style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, color: 'var(--gold-dark)' }}>
                          #{p.paymentId}
                        </strong>
                      </td>
                      <td style={{ fontSize: 13, color: 'var(--gray-500)' }}>
                        App #{p.application?.applicationId || '—'}
                      </td>
                      <td>
                        {p.application?.student?.name ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{
                              width: 28, height: 28, borderRadius: 8, background: 'var(--navy)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 11, color: 'white', fontWeight: 700, flexShrink: 0,
                              fontFamily: 'Cormorant Garamond, serif'
                            }}>
                              {p.application.student.name.charAt(0).toUpperCase()}
                            </div>
                            <span style={{ fontSize: 13 }}>{p.application.student.name}</span>
                          </div>
                        ) : '—'}
                      </td>
                      <td style={{ fontSize: 13 }}>{p.application?.course?.name || '—'}</td>
                      <td>
                        <span style={{ fontSize: 13 }}>
                          {MODE_ICONS[p.paymentMode] || '💳'} {p.paymentMode || '—'}
                        </span>
                      </td>
                      <td style={{ color: 'var(--gray-500)', fontSize: 12, fontFamily: 'Space Mono, monospace' }}>
                        {p.paymentDate || '—'}
                      </td>
                      <td style={{ color: 'var(--gray-500)', fontSize: 12, fontFamily: 'Space Mono, monospace' }}>
                        {p.deadline || '—'}
                      </td>
                      <td>
                        <span className={`badge ${
                          p.status === 'Paid' || p.status === 'paid' ? 'badge-paid' : 'badge-default'
                        }`}>
                          {p.status === 'Paid' || p.status === 'paid' ? '✓ ' : ''}{p.status || '—'}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-outline btn-sm" onClick={() => setViewModal(p)}>
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* View Details Modal */}
      {viewModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setViewModal(null)}>
          <div className="modal" style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <div>
                <h3>Payment Receipt</h3>
                <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 2, fontFamily: 'Space Mono, monospace', fontSize: 11 }}>
                  PAYMENT #{viewModal.paymentId}
                </div>
              </div>
              <button className="modal-close" onClick={() => setViewModal(null)}>×</button>
            </div>
            <div className="modal-body">
              {/* Payment status hero */}
              <div style={{
                background: viewModal.status === 'Paid' || viewModal.status === 'paid'
                  ? 'linear-gradient(135deg, var(--teal), #0d4a3e)'
                  : 'linear-gradient(135deg, var(--gold-dark), #5a4010)',
                borderRadius: 12, padding: '20px 24px', marginBottom: 22,
                display: 'flex', alignItems: 'center', gap: 16
              }}>
                <div style={{ fontSize: 36 }}>
                  {viewModal.status === 'Paid' || viewModal.status === 'paid' ? '✅' : '⏳'}
                </div>
                <div>
                  <div style={{ color: 'white', fontWeight: 700, fontSize: 18, fontFamily: 'Cormorant Garamond, serif' }}>
                    {viewModal.status || 'Unknown'}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13 }}>
                    via {viewModal.paymentMode || 'Unknown mode'} · {viewModal.paymentDate || '—'}
                  </div>
                </div>
              </div>

              <div className="info-grid">
                {[
                  { label: 'Payment ID', value: `#${viewModal.paymentId}` },
                  { label: 'Payment Mode', value: `${MODE_ICONS[viewModal.paymentMode] || '💳'} ${viewModal.paymentMode || '—'}` },
                  { label: 'Payment Date', value: viewModal.paymentDate || '—' },
                  { label: 'Deadline', value: viewModal.deadline || '—' },
                  { label: 'Application', value: `#${viewModal.application?.applicationId || '—'}` },
                  { label: 'Student', value: viewModal.application?.student?.name || '—' },
                  { label: 'Course', value: viewModal.application?.course?.name || '—' },
                  { label: 'App Status', value: viewModal.application?.status || '—' },
                ].map(item => (
                  <div key={item.label} className="info-item">
                    <label>{item.label}</label>
                    <div className="info-value">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setViewModal(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}