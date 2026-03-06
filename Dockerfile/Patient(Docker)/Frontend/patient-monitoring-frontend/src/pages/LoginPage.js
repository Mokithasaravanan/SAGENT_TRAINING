import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { patientAPI, doctorAPI } from '../services/api';
import { toast } from 'react-toastify';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '', role: 'patient' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let userData;
      if (form.role === 'patient') {
        userData = await patientAPI.login(form.email, form.password);
        login(userData, 'patient');
      } else {
        userData = await doctorAPI.login(form.email, form.password);
        login(userData, 'doctor');
      }
      toast.success(`Welcome back, ${userData.name}!`);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      toast.error('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.bg} />
      <div style={styles.leftPanel}>
        <div style={styles.leftContent}>
          <div style={styles.logo}>🫀</div>
          <h1 style={styles.logoText}>MediWatch</h1>
          <p style={styles.tagline}>Patient Monitoring System</p>
          <div style={styles.features}>
            {[
              { icon: '📊', text: 'Real-time Health Monitoring' },
              { icon: '🩺', text: 'Doctor-Patient Connection' },
              { icon: '📅', text: 'Smart Appointment Scheduling' },
              { icon: '📈', text: 'Daily Vitals Tracking' },
              { icon: '🔒', text: 'Secure Medical Records' },
            ].map((f, i) => (
              <div key={i} style={styles.feature}>
                <span style={styles.featureIcon}>{f.icon}</span>
                <span style={styles.featureText}>{f.text}</span>
              </div>
            ))}
          </div>
          <div style={styles.ecgLine}>
            <svg viewBox="0 0 300 60" style={{ width: '100%', opacity: 0.4 }}>
              <polyline
                points="0,30 50,30 65,10 80,50 95,30 145,30 160,5 175,55 190,30 300,30"
                fill="none"
                stroke="#00b4d8"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>

      <div style={styles.rightPanel}>
        <div style={styles.formCard}>
          <h2 style={styles.formTitle}>Welcome Back</h2>
          <p style={styles.formSub}>Sign in to your account</p>

          <div style={styles.roleToggle}>
            {['patient', 'doctor'].map(role => (
              <button
                key={role}
                style={{
                  ...styles.roleBtn,
                  ...(form.role === role ? styles.roleActive : {})
                }}
                onClick={() => setForm({ ...form, role })}
                type="button"
              >
                {role === 'patient' ? '🧑' : '👨‍⚕️'} {role.charAt(0).toUpperCase() + role.slice(1)}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-control"
                placeholder="Enter your email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrapper">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="form-control"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                />
                <span className="input-icon" onClick={() => setShowPass(!showPass)}>
                  {showPass ? '🙈' : '👁️'}
                </span>
              </div>
            </div>

            <div style={styles.forgotRow}>
              <Link to="/forgot-password" style={styles.forgotLink}>
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '0.9rem', marginTop: '0.5rem' }}
              disabled={loading}
            >
              {loading ? <span className="loading-spinner" /> : null}
              {loading ? 'Signing in...' : '🔐 Sign In'}
            </button>
          </form>

          <div style={styles.divider}>
            <span style={styles.dividerLine} />
            <span style={styles.dividerText}>New here?</span>
            <span style={styles.dividerLine} />
          </div>

          <Link
            to="/register"
            className="btn btn-outline"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            ✨ Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { display: 'flex', minHeight: '100vh', position: 'relative' },
  bg: {
    position: 'fixed', inset: 0,
    background: 'radial-gradient(ellipse at 20% 50%, rgba(0,119,182,0.2) 0%, transparent 60%), #0a192f',
    zIndex: 0,
  },
  leftPanel: {
    flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center',
    position: 'relative', zIndex: 1, padding: '3rem',
    background: 'linear-gradient(135deg, rgba(0,119,182,0.2), rgba(0,180,216,0.05))',
    borderRight: '1px solid rgba(0,180,216,0.15)',
  },
  leftContent: { maxWidth: '420px' },
  logo: { fontSize: '4rem', marginBottom: '0.5rem' },
  logoText: {
    fontFamily: 'Playfair Display, serif', fontSize: '2.8rem', fontWeight: '700',
    background: 'linear-gradient(135deg, #00b4d8, #90e0ef)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.3rem',
  },
  tagline: { color: '#8892b0', fontSize: '1.1rem', marginBottom: '2.5rem' },
  features: { display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' },
  feature: {
    display: 'flex', alignItems: 'center', gap: '0.75rem',
    padding: '0.75rem 1rem',
    background: 'rgba(0,180,216,0.06)', border: '1px solid rgba(0,180,216,0.12)', borderRadius: '10px',
  },
  featureIcon: { fontSize: '1.3rem' },
  featureText: { color: '#b0c4d8', fontSize: '0.9rem' },
  ecgLine: { marginTop: '1.5rem' },
  rightPanel: {
    flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '2rem', position: 'relative', zIndex: 1,
  },
  formCard: {
    width: '100%', maxWidth: '420px',
    background: 'rgba(17,34,64,0.9)', border: '1px solid rgba(0,180,216,0.2)',
    borderRadius: '24px', padding: '2.5rem',
    backdropFilter: 'blur(20px)', boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
  },
  formTitle: { fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', color: '#e8f4f8', marginBottom: '0.3rem' },
  formSub: { color: '#8892b0', fontSize: '0.9rem', marginBottom: '1.5rem' },
  roleToggle: {
    display: 'flex', gap: '0.5rem', marginBottom: '1.5rem',
    background: 'rgba(255,255,255,0.04)', padding: '0.3rem',
    borderRadius: '12px', border: '1px solid rgba(0,180,216,0.15)',
  },
  roleBtn: {
    flex: 1, padding: '0.55rem', background: 'transparent', border: 'none',
    borderRadius: '8px', color: '#8892b0', cursor: 'pointer',
    fontSize: '0.9rem', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.2s',
  },
  roleActive: { background: 'rgba(0,180,216,0.2)', color: '#00b4d8', border: '1px solid rgba(0,180,216,0.4)' },
  forgotRow: { textAlign: 'right', marginBottom: '1rem' },
  forgotLink: { color: '#00b4d8', fontSize: '0.85rem', textDecoration: 'none' },
  divider: { display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.5rem 0' },
  dividerLine: { flex: 1, height: '1px', background: 'rgba(0,180,216,0.2)' },
  dividerText: { color: '#8892b0', fontSize: '0.8rem', whiteSpace: 'nowrap' },
};