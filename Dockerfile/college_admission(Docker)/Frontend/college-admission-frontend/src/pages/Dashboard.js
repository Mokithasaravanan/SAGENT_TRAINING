import React, { useEffect, useState } from 'react';
import { applicationAPI, courseAPI, studentAPI, documentAPI, paymentAPI } from '../services/api';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const COLLEGE_IMAGES = [
  { src: 'https://images.unsplash.com/photo-1562774053-701939374585?w=900&q=80', label: 'Historic Campus' },
  { src: 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=900&q=80', label: 'Modern Facilities' },
  { src: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&q=80', label: 'Student Life' },
];

export default function Dashboard() {
  const { currentUser, userRole } = useApp();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    applications: 0, courses: 0, documents: 0, payments: 0, students: 0
  });
  const [recentApps, setRecentApps] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [apps, courses, docs, pays, studs] = await Promise.all([
          applicationAPI.getAll(),
          courseAPI.getAll(),
          documentAPI.getAll(),
          paymentAPI.getAll(),
          studentAPI.getAll(),
        ]);
        const allApps = apps.data || [];
        const myApps = userRole === 'student'
          ? allApps.filter(a => a.student?.studentId === currentUser?.studentId)
          : allApps;

        setStats({
          applications: myApps.length,
          courses: (courses.data || []).length,
          documents: userRole === 'student'
            ? (docs.data || []).filter(d => myApps.map(a=>a.applicationId).includes(d.application?.applicationId)).length
            : (docs.data || []).length,
          payments: userRole === 'student'
            ? (pays.data || []).filter(p => myApps.map(a=>a.applicationId).includes(p.application?.applicationId)).length
            : (pays.data || []).length,
          students: (studs.data || []).length,
        });
        setRecentApps(myApps.slice(0, 5));
      } catch {}
    };
    load();
  }, [currentUser, userRole]);

  const statusBadge = (status) => {
    const map = {
      'Submitted': 'badge-pending', 'Under Review': 'badge-review',
      'Accepted': 'badge-accepted', 'Rejected': 'badge-rejected',
    };
    return <span className={`badge ${map[status] || 'badge-default'}`}>{status || 'Submitted'}</span>;
  };

  return (
    <div>
      {/* Hero Banner */}
      <div className="page-hero" style={{
        backgroundImage: `linear-gradient(160deg, rgba(10,14,26,0.82) 0%, rgba(15,32,68,0.70) 50%, rgba(26,107,90,0.55) 100%), url('https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=1400&q=85'`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}>
        <div className="page-hero-content">
          <div>
            <h1>Dashboard</h1>
            <p>
              {userRole === 'officer'
                ? 'Overview of all applications and student activity'
                : `Welcome back, ${currentUser?.name?.split(' ')[0] || 'Student'} — track your admission progress`}
            </p>
          </div>
        </div>
      </div>

      <div className="page-content">
        {/* Welcome Banner with college image */}
        <div className="welcome-banner">
          <div className="welcome-text">
            <h2>
              {userRole === 'officer'
                ? '🏛️ Officer Dashboard'
                : `Hello, ${currentUser?.name?.split(' ')[0] || 'Student'} 👋`}
            </h2>
            <p>
              {userRole === 'officer'
                ? 'Manage applications, review documents, and update statuses from one place.'
                : 'Your admission portal is ready. Check your application status and upcoming deadlines.'}
            </p>
          </div>
          <img
            className="welcome-img"
            src='https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=600&q=80'
            alt="campus"
          />
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/applications')}>
            <span className="stat-icon">📋</span>
            <div className="stat-value">{stats.applications}</div>
            <div className="stat-label">{userRole === 'officer' ? 'Total Applications' : 'My Applications'}</div>
          </div>
          <div className="stat-card sage" style={{ cursor: 'pointer' }} onClick={() => navigate('/courses')}>
            <span className="stat-icon">🎓</span>
            <div className="stat-value">{stats.courses}</div>
            <div className="stat-label">Available Courses</div>
          </div>
          <div className="stat-card rust" style={{ cursor: 'pointer' }} onClick={() => navigate('/documents')}>
            <span className="stat-icon">📁</span>
            <div className="stat-value">{stats.documents}</div>
            <div className="stat-label">Documents</div>
          </div>
          <div className="stat-card ink" style={{ cursor: 'pointer' }} onClick={() => navigate('/payments')}>
            <span className="stat-icon">💳</span>
            <div className="stat-value">{stats.payments}</div>
            <div className="stat-label">Payments</div>
          </div>
          {userRole === 'officer' && (
            <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/students')}>
              <span className="stat-icon">👤</span>
              <div className="stat-value">{stats.students}</div>
              <div className="stat-label">Registered Students</div>
            </div>
          )}
        </div>

        {/* College Image Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 16,
          marginBottom: 32,
          borderRadius: 16,
          overflow: 'hidden'
        }}>
          {COLLEGE_IMAGES.map((item, i) => (
            <div key={i} style={{ position: 'relative', height: 140, overflow: 'hidden', borderRadius: 12 }}>
              <img
                src={item.src}
                alt={item.label}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to top, rgba(10,14,26,0.5) 0%, transparent 60%)'
              }} />
              <div style={{
                position: 'absolute', bottom: 10, left: 14,
                color: 'white', fontFamily: 'Cormorant Garamond, serif',
                fontSize: 13, fontStyle: 'italic', opacity: 0.9
              }}>
                {item.label}
              </div>
            </div>
          ))}
        </div>

        {/* Recent Applications */}
        {recentApps.length > 0 && (
          <div className="card">
            <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, color: 'var(--navy)' }}>
                  Recent Applications
                </h3>
                <p style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 3 }}>
                  Latest application activity
                </p>
              </div>
              <button className="btn btn-outline btn-sm" onClick={() => navigate('/applications')}>
                View All →
              </button>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>App ID</th>
                    <th>Student</th>
                    <th>Course</th>
                    <th>Applied Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentApps.map(a => (
                    <tr key={a.applicationId}>
                      <td><strong style={{ color: 'var(--gold-dark)' }}>#{a.applicationId}</strong></td>
                      <td>{a.student?.name || '—'}</td>
                      <td>{a.course?.name || '—'}</td>
                      <td>{a.appliedDate || '—'}</td>
                      <td>{statusBadge(a.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Quick actions for student */}
        {userRole === 'student' && recentApps.length === 0 && (
          <div className="card" style={{ padding: 40, textAlign: 'center' }}>
            <img
              src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&q=80"
              alt="graduation"
              style={{ width: 200, height: 130, objectFit: 'cover', borderRadius: 12, margin: '0 auto 20px', display: 'block', opacity: 0.8 }}
            />
            <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 26, color: 'var(--navy)', marginBottom: 10 }}>
              Start Your Journey
            </h3>
            <p style={{ color: 'var(--gray-500)', marginBottom: 24, fontSize: 14 }}>
              You haven't submitted any applications yet. Explore our courses and apply today.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-gold" onClick={() => navigate('/courses')}>
                🎓 Browse Courses
              </button>
              <button className="btn btn-outline" onClick={() => navigate('/applications')}>
                📋 My Applications
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}