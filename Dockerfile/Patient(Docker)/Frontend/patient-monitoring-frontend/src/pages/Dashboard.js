import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { patientAPI, doctorAPI, appointmentAPI, consultationAPI, dailyReadingAPI, messageAPI } from '../services/api';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import PageNav from '../components/PageNav';

export default function Dashboard() {
  const { user, userType } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ patients: 0, doctors: 0, appointments: 0, consultations: 0, messages: 0, readings: 0 });
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [p, d, a, c, m, r] = await Promise.all([
          patientAPI.getAll(), doctorAPI.getAll(), appointmentAPI.getAll(),
          consultationAPI.getAll(), messageAPI.getAll(), dailyReadingAPI.getAll()
        ]);
        setStats({
          patients: p.data.length, doctors: d.data.length, appointments: a.data.length,
          consultations: c.data.length, messages: m.data.length, readings: r.data.length
        });
        // Last 7 readings for chart
        const recent = r.data.slice(-7).map((rd, i) => ({
          day: `Day ${i + 1}`,
          heartRate: rd.heartRate,
          oxygenLevel: rd.oxygenLevel,
          temperature: rd.temperature,
        }));
        setReadings(recent);
      } catch { }
      setLoading(false);
    }
    load();
  }, []);

  const statCards = [
    { icon: '👥', label: 'Total Patients', value: stats.patients, path: '/patients', color: '#00b4d8' },
    { icon: '🩺', label: 'Total Doctors', value: stats.doctors, path: '/doctors', color: '#2ecc71' },
    { icon: '📅', label: 'Appointments', value: stats.appointments, path: '/appointments', color: '#f39c12' },
    { icon: '💬', label: 'Consultations', value: stats.consultations, path: '/consultations', color: '#9b59b6' },
    { icon: '✉️', label: 'Messages', value: stats.messages, path: '/messages', color: '#e74c3c' },
    { icon: '📈', label: 'Readings', value: stats.readings, path: '/readings', color: '#1abc9c' },
  ];

  const quickActions = [
    { label: 'Add Patient', icon: '➕', path: '/patients', color: '#00b4d8' },
    { label: 'Schedule Appointment', icon: '📅', path: '/appointments', color: '#f39c12' },
    { label: 'Add Reading', icon: '📈', path: '/readings', color: '#2ecc71' },
    { label: 'Send Message', icon: '✉️', path: '/messages', color: '#9b59b6' },
    { label: 'View Reports', icon: '📋', path: '/reports', color: '#e74c3c' },
    { label: 'Health Data', icon: '🏥', path: '/health-data', color: '#1abc9c' },
  ];

  return (
    <div className="page-wrapper">
      <div className="bg-animated" />
      <div className="main-content" style={{ position: 'relative', zIndex: 1 }}>
        {/* Hero */}
        <div className="page-hero animate-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', marginBottom: '0.5rem' }}>
                Good day, {user?.name} 👋
              </h1>
              <p style={{ color: '#8892b0' }}>
                {userType === 'doctor' ? `Dr. ${user?.name} · ${user?.specialization}` : `Patient Dashboard · ${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={styles.heroStat}>
                <span style={{ fontSize: '0.75rem', color: '#8892b0' }}>SYSTEM STATUS</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#2ecc71', display: 'inline-block', animation: 'pulse 2s infinite' }} />
                  <span style={{ color: '#2ecc71', fontWeight: 600 }}>Online</span>
                </div>
              </div>
              <div style={styles.heroStat}>
                <span style={{ fontSize: '0.75rem', color: '#8892b0' }}>ROLE</span>
                <div style={{ color: '#00b4d8', fontWeight: 600, textTransform: 'capitalize' }}>{userType}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid-3" style={{ marginBottom: '2rem' }}>
          {statCards.map((s, i) => (
            <div
              key={i}
              className="stat-card animate-in"
              style={{ cursor: 'pointer', animationDelay: `${i * 0.1}s` }}
              onClick={() => navigate(s.path)}
            >
              <div style={styles.statTop}>
                <span style={{ fontSize: '2rem' }}>{s.icon}</span>
                <div style={{ ...styles.trend, color: s.color }}>→</div>
              </div>
              <div style={{ ...styles.statValue, color: s.color }}>{loading ? '...' : s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
          {/* Chart */}
          <div className="card animate-in">
            <h3 style={styles.cardTitle}>📈 Vitals Trend (Last 7 Readings)</h3>
            {readings.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={readings}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="day" tick={{ fill: '#8892b0', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#8892b0', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ background: '#112240', border: '1px solid rgba(0,180,216,0.3)', borderRadius: 8, color: '#e8f4f8' }}
                  />
                  <Line type="monotone" dataKey="heartRate" stroke="#e74c3c" strokeWidth={2} dot={{ fill: '#e74c3c', r: 4 }} name="Heart Rate" />
                  <Line type="monotone" dataKey="oxygenLevel" stroke="#2ecc71" strokeWidth={2} dot={{ fill: '#2ecc71', r: 4 }} name="O₂ Level" />
                  <Line type="monotone" dataKey="temperature" stroke="#f39c12" strokeWidth={2} dot={{ fill: '#f39c12', r: 4 }} name="Temp (°C)" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state" style={{ padding: '3rem' }}>
                <div className="empty-state-icon">📊</div>
                <p>No readings data yet. Add daily readings to see the chart.</p>
              </div>
            )}
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              {[['Heart Rate', '#e74c3c'], ['O₂ Level', '#2ecc71'], ['Temperature', '#f39c12']].map(([label, color]) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
                  <span style={{ fontSize: '0.8rem', color: '#8892b0' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card animate-in">
            <h3 style={styles.cardTitle}>⚡ Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {quickActions.map((a, i) => (
                <button
                  key={i}
                  onClick={() => navigate(a.path)}
                  style={{ ...styles.actionBtn, borderColor: `${a.color}30` }}
                >
                  <span style={{ fontSize: '1.2rem' }}>{a.icon}</span>
                  <span style={{ fontSize: '0.9rem', color: '#b0c4d8' }}>{a.label}</span>
                  <span style={{ marginLeft: 'auto', color: a.color }}>→</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Info cards */}
        <div className="grid-3" style={{ marginBottom: '1rem' }}>
          {[
            { icon: '🫀', title: 'Cardiac Health', desc: 'Monitor heart rate trends and alerts', color: '#e74c3c' },
            { icon: '🩸', title: 'Blood Pressure', desc: 'Track BP readings over time', color: '#9b59b6' },
            { icon: '🫁', title: 'Oxygen Levels', desc: 'Keep SpO₂ above 95% at all times', color: '#2ecc71' },
          ].map((info, i) => (
            <div key={i} className="card animate-in" style={{ borderColor: `${info.color}30`, animationDelay: `${i * 0.15}s` }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{info.icon}</div>
              <h4 style={{ color: info.color, marginBottom: '0.4rem', fontFamily: 'Playfair Display, serif' }}>{info.title}</h4>
              <p style={{ color: '#8892b0', fontSize: '0.85rem' }}>{info.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <PageNav currentPath="/dashboard" />
    </div>
  );
}

const styles = {
  heroStat: {
    background: 'rgba(255,255,255,0.05)', padding: '0.75rem 1.25rem',
    borderRadius: '12px', border: '1px solid rgba(0,180,216,0.15)',
  },
  statTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' },
  trend: { fontSize: '1.2rem' },
  statValue: { fontSize: '2.2rem', fontWeight: '700', fontFamily: 'Playfair Display, serif' },
  cardTitle: { fontFamily: 'Playfair Display, serif', fontSize: '1.1rem', color: '#e8f4f8', marginBottom: '1.25rem' },
  actionBtn: {
    display: 'flex', alignItems: 'center', gap: '0.75rem',
    padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.03)',
    border: '1px solid transparent', borderRadius: '10px',
    cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'DM Sans, sans-serif',
    color: '#e8f4f8', width: '100%', textAlign: 'left',
  },
};
