import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    toast.info('Password reset instructions sent! (Demo mode)');
  };

  return (
    <div style={styles.page}>
      <div style={styles.bg} />
      <div style={styles.card}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3rem' }}>🔑</div>
          <h2 style={styles.title}>Forgot Password</h2>
          <p style={styles.sub}>Enter your email to reset your password</p>
        </div>

        {sent ? (
          <div style={styles.successBox}>
            <div style={{ fontSize: '3rem', textAlign: 'center' }}>📧</div>
            <p style={{ textAlign: 'center', color: '#2ecc71', marginTop: '1rem' }}>
              Reset instructions sent to <strong>{email}</strong>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-control"
                placeholder="Enter your registered email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.9rem' }}>
              📤 Send Reset Link
            </button>
          </form>
        )}

        <Link to="/login" style={styles.backLink}>← Back to Login</Link>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  bg: { position: 'fixed', inset: 0, background: '#0a192f', zIndex: 0 },
  card: {
    position: 'relative', zIndex: 1, width: '100%', maxWidth: '420px', margin: '2rem',
    background: 'rgba(17,34,64,0.92)', border: '1px solid rgba(0,180,216,0.2)',
    borderRadius: '24px', padding: '2.5rem', backdropFilter: 'blur(20px)',
  },
  title: { fontFamily: 'Playfair Display, serif', fontSize: '1.7rem', color: '#e8f4f8', marginTop: '0.5rem' },
  sub: { color: '#8892b0', fontSize: '0.9rem' },
  successBox: { padding: '1.5rem', background: 'rgba(46,204,113,0.1)', border: '1px solid rgba(46,204,113,0.3)', borderRadius: '12px', marginBottom: '1.5rem' },
  backLink: { display: 'block', textAlign: 'center', marginTop: '1.5rem', color: '#00b4d8', textDecoration: 'none', fontSize: '0.9rem' },
};
