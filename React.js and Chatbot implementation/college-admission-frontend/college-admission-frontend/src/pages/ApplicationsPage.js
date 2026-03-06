import React, { useEffect, useState } from 'react';
import { applicationAPI, courseAPI, paymentAPI } from '../services/api';
import { useApp } from '../context/AppContext';

const STATUS_OPTIONS = ['Submitted', 'Under Review', 'Accepted', 'Rejected'];
const PAYMENT_MODES = ['UPI', 'Net Banking', 'Credit Card', 'Debit Card', 'Cash'];

export default function ApplicationsPage() {
  const { showNotification, userRole, currentUser } = useApp();
  const [apps, setApps] = useState([]);
  const [courses, setCourses] = useState([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    courseId: '', status: 'Submitted',
    appliedDate: new Date().toISOString().split('T')[0]
  });

  const [payForm, setPayForm] = useState({
    paymentMode: 'UPI',
    paymentDate: new Date().toISOString().split('T')[0],
    deadline: '', status: 'Paid'
  });

  const load = async () => {
    try {
      const [a, c] = await Promise.all([applicationAPI.getAll(), courseAPI.getAll()]);
      setApps(a.data);
      setCourses(c.data);
    } catch {}
  };

  useEffect(() => { load(); }, []);

  const visibleApps = userRole === 'student'
    ? apps.filter(a => a.student?.studentId === currentUser?.studentId)
    : apps;

  const openAdd = () => {
    setEditing(null);
    setForm({ courseId: '', status: 'Submitted', appliedDate: new Date().toISOString().split('T')[0] });
    setPayForm({ paymentMode: 'UPI', paymentDate: new Date().toISOString().split('T')[0], deadline: '', status: 'Paid' });
    setModal(true);
  };

  const openEdit = (a) => {
    setEditing(a);
    setForm({ courseId: a.course?.courseId || '', status: a.status || 'Submitted', appliedDate: a.appliedDate || '' });
    setModal(true);
  };

  const setF = (field, val) => setForm(f => ({ ...f, [field]: val }));
  const setPF = (field, val) => setPayForm(f => ({ ...f, [field]: val }));

  const save = async (e) => {
    e.preventDefault();
    if (!form.courseId) { showNotification('Please select a course', 'error'); return; }
    setLoading(true);
    try {
      const appPayload = {
        status: 'Submitted',
        appliedDate: form.appliedDate,
        student: { studentId: currentUser.studentId },
        course: { courseId: parseInt(form.courseId) },
      };
      if (editing) {
        await applicationAPI.update(editing.applicationId, { ...appPayload, status: form.status });
        showNotification('Application updated');
        setModal(false); load();
      } else {
        const appRes = await applicationAPI.apply(appPayload);
        const newApp = appRes.data;
        await paymentAPI.pay({
          paymentMode: payForm.paymentMode,
          status: payForm.status,
          paymentDate: payForm.paymentDate,
          deadline: payForm.deadline || null,
          application: { applicationId: newApp.applicationId },
        });
        showNotification('Application submitted & payment recorded!');
        setModal(false); load();
      }
    } catch { showNotification('Error submitting application', 'error'); }
    setLoading(false);
  };

  const quickStatus = async (app, status) => {
    try {
      await applicationAPI.update(app.applicationId, {
        status,
        student: { studentId: app.student?.studentId },
        course: { courseId: app.course?.courseId },
        appliedDate: app.appliedDate,
      });
      showNotification(`Marked as "${status}"`);
      load();
    } catch { showNotification('Error updating status', 'error'); }
  };

  const del = async (id) => {
    if (!window.confirm('Cancel this application?')) return;
    try { await applicationAPI.delete(id); showNotification('Application cancelled'); load(); }
    catch { showNotification('Error cancelling', 'error'); }
  };

  const statusBadge = (status) => {
    const map = {
      'Submitted': 'badge-pending', 'Under Review': 'badge-review',
      'Accepted': 'badge-accepted', 'Rejected': 'badge-rejected', 'Applied': 'badge-default'
    };
    return <span className={`badge ${map[status] || 'badge-default'}`}>{status || 'Submitted'}</span>;
  };

  const counts = {
    all: visibleApps.length,
    accepted: visibleApps.filter(a => a.status === 'Accepted').length,
    review: visibleApps.filter(a => a.status === 'Under Review').length,
    pending: visibleApps.filter(a => a.status === 'Submitted').length,
  };

  return (
    <div>
      {/* Page Hero */}
      <div className="page-hero" style={{
        backgroundImage: `linear-gradient(160deg, rgba(10,14,26,0.82) 0%, rgba(15,32,68,0.70) 50%, rgba(26,107,90,0.55) 100%), url('https://images.unsplash.com/photo-1627556592933-33c10bc23a55?w=1400&q=85'`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}>
        <div className="page-hero-content">
          <div>
            <h1>{userRole === 'officer' ? 'All Applications' : 'My Applications'}</h1>
            <p>{userRole === 'officer' ? 'Review and update application statuses' : 'Track your admission applications'}</p>
          </div>
          {userRole === 'student' && (
            <button className="btn btn-gold" onClick={openAdd}>+ New Application</button>
          )}
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
            src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&q=80"
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
              }}>"Review each story — every application is a dream."</div>
              <div style={{
                marginTop: 6, width: 40, height: 2,
                background: 'linear-gradient(90deg, var(--gold), transparent)'
              }} />
            </div>
          </div>
        </div>
        {/* Stats */}
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 28 }}>
          <div className="stat-card">
            <span className="stat-icon">📋</span>
            <div className="stat-value">{counts.all}</div>
            <div className="stat-label">Total</div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">⏳</span>
            <div className="stat-value">{counts.pending}</div>
            <div className="stat-label">Submitted</div>
          </div>
          <div className="stat-card sage">
            <span className="stat-icon">✅</span>
            <div className="stat-value">{counts.accepted}</div>
            <div className="stat-label">Accepted</div>
          </div>
          <div className="stat-card ink">
            <span className="stat-icon">🔍</span>
            <div className="stat-value">{counts.review}</div>
            <div className="stat-label">Under Review</div>
          </div>
        </div>

        {/* Officer notice */}
        {userRole === 'officer' && (
          <div className="officer-notice">
            <div className="officer-notice-icon">🏛️</div>
            <span>Officer view — use the action buttons to update application statuses in real-time.</span>
          </div>
        )}

        <div className="card">
          {visibleApps.length === 0 ? (
            <div className="empty-state">
              <img
                src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=300&q=80"
                alt="no apps"
                style={{ width: 160, height: 100, objectFit: 'cover', borderRadius: 10, marginBottom: 16, opacity: 0.6 }}
              />
              <span className="empty-icon" style={{ fontSize: 0 }}></span>
              <p>{userRole === 'student' ? 'No applications yet. Click "+ New Application" to get started.' : 'No applications found'}</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>App ID</th>
                    <th>Student</th>
                    <th>Course</th>
                    <th>Applied Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleApps.map(a => (
                    <tr key={a.applicationId}>
                      <td>
                        <strong style={{ color: 'var(--gold-dark)', fontFamily: 'Space Mono, monospace', fontSize: 12 }}>
                          #{a.applicationId}
                        </strong>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{
                            width: 30, height: 30, borderRadius: 8, background: 'var(--navy)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 12, color: 'white', fontWeight: 700, flexShrink: 0,
                            fontFamily: 'Cormorant Garamond, serif'
                          }}>
                            {a.student?.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <span>{a.student?.name || '—'}</span>
                        </div>
                      </td>
                      <td><span style={{ fontWeight: 500 }}>{a.course?.name || '—'}</span></td>
                      <td style={{ color: 'var(--gray-500)', fontSize: 13 }}>{a.appliedDate || '—'}</td>
                      <td>{statusBadge(a.status)}</td>
                      <td>
                        {userRole === 'officer' ? (
                          <div className="action-btns">
                            <button className="btn btn-sm"
                              style={{ background: '#dbeafe', color: '#1e40af', fontSize: 11, fontWeight: 600 }}
                              onClick={() => quickStatus(a, 'Under Review')}>
                              🔍 Review
                            </button>
                            <button className="btn btn-sm"
                              style={{ background: '#d1fae5', color: '#065f46', fontSize: 11, fontWeight: 600 }}
                              onClick={() => quickStatus(a, 'Accepted')}>
                              ✓ Accept
                            </button>
                            <button className="btn btn-sm"
                              style={{ background: '#fee2e2', color: '#991b1b', fontSize: 11, fontWeight: 600 }}
                              onClick={() => quickStatus(a, 'Rejected')}>
                              ✕ Reject
                            </button>
                          </div>
                        ) : (
                          <div className="action-btns">
                            {a.status === 'Submitted' && (
                              <button className="btn btn-outline btn-sm" onClick={() => openEdit(a)}>Edit</button>
                            )}
                            <button className="btn btn-danger btn-sm" onClick={() => del(a.applicationId)}>Cancel</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {modal && userRole === 'student' && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal" style={{ maxWidth: 620 }}>
            <div className="modal-header">
              <div>
                <h3>{editing ? 'Edit Application' : 'New Application'}</h3>
                <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 2 }}>
                  {editing ? `Editing App #${editing.applicationId}` : 'Fill in your details to apply'}
                </div>
              </div>
              <button className="modal-close" onClick={() => setModal(false)}>×</button>
            </div>
            <form onSubmit={save}>
              <div className="modal-body">
                {/* Student info banner */}
                <div style={{
                  background: 'linear-gradient(135deg, var(--navy), #1a3a6e)',
                  borderRadius: 12, padding: '14px 18px', marginBottom: 22,
                  display: 'flex', alignItems: 'center', gap: 14
                }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 10,
                    background: 'linear-gradient(135deg, var(--gold), var(--gold-dark))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 18, color: 'var(--ink)',
                    fontFamily: 'Cormorant Garamond, serif'
                  }}>
                    {currentUser?.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15, color: 'white' }}>{currentUser?.name}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
                      Student ID: #{currentUser?.studentId}
                    </div>
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Select Course *</label>
                    <select value={form.courseId} onChange={e => setF('courseId', e.target.value)} required>
                      <option value="">Choose a course...</option>
                      {courses.map(c => (
                        <option key={c.courseId} value={c.courseId}>
                          {c.name} {c.duration ? `(${c.duration})` : ''} {c.fee ? `— ₹${parseFloat(c.fee).toLocaleString()}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Applied Date</label>
                    <input type="date" value={form.appliedDate} onChange={e => setF('appliedDate', e.target.value)} />
                  </div>
                </div>

                {!editing && (
                  <>
                    <div className="divider" />
                    <div style={{ marginBottom: 16 }}>
                      <h4 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, marginBottom: 4, color: 'var(--navy)' }}>
                        💳 Application Fee Payment
                      </h4>
                      <p style={{ fontSize: 13, color: 'var(--gray-500)' }}>
                        Pay the application fee to complete your submission.
                      </p>
                    </div>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Payment Mode</label>
                        <select value={payForm.paymentMode} onChange={e => setPF('paymentMode', e.target.value)}>
                          {PAYMENT_MODES.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Payment Date</label>
                        <input type="date" value={payForm.paymentDate} onChange={e => setPF('paymentDate', e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label>Deadline</label>
                        <input type="date" value={payForm.deadline} onChange={e => setPF('deadline', e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label>Payment Status</label>
                        <select value={payForm.status} onChange={e => setPF('status', e.target.value)}>
                          <option value="Paid">Paid</option>
                          <option value="Pending">Pending</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-gold" disabled={loading}>
                  {loading ? <span className="spinner" /> : null}
                  {editing ? 'Save Changes' : '🎓 Submit Application & Pay'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}