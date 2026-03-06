import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { studentAPI, officerAPI } from '../services/api';

export default function LoginPage() {
  const { login, showNotification } = useApp();
  const [mode, setMode] = useState('login');
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', phnNo: '' });

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const handleForgot = (e) => {
    e.preventDefault();
    if (!forgotEmail) { showNotification('Please enter your email address', 'error'); return; }
    setForgotSent(true);
    showNotification('Password reset instructions sent to your email!', 'success');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || (mode === 'register' && !form.name)) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'register') {
        if (role === 'student') {
          const res = await studentAPI.create({ name: form.name, email: form.email, phnNo: form.phnNo, password: form.password });
          login({ ...res.data, name: form.name, email: form.email }, 'student');
          showNotification('Student account created successfully!');
        } else {
          const res = await officerAPI.create({ name: form.name, mail: form.email, phnNo: form.phnNo, password: form.password });
          login({ ...res.data, name: form.name, mail: form.email }, 'officer');
          showNotification('Officer account created successfully!');
        }
      } else {
        let found = null;
        if (role === 'student') {
          const res = await studentAPI.getAll();
          found = res.data.find(s => s.email === form.email);
          if (found) login(found, 'student');
        } else {
          const res = await officerAPI.getAll();
          found = res.data.find(o => o.mail === form.email);
          if (found) login(found, 'officer');
        }
        if (!found) showNotification('Account not found. Please register first.', 'error');
        else showNotification(`Welcome back, ${found.name}!`);
      }
    } catch {
      showNotification('Connection error. Is the backend running on port 8081?', 'error');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">

      {/* LEFT PANEL */}
      <div className="auth-left">
        <div style={{
          position: 'absolute', inset: 0,
          background: `
            linear-gradient(160deg, rgba(10,14,26,0.83) 0%, rgba(15,32,68,0.68) 45%, rgba(26,107,90,0.55) 100%),
            url('https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=1400&q=85') center/cover no-repeat`
        }} />
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(10,14,26,0.55) 0%, transparent 55%)' }} />

        <div className="auth-brand">
          <div className="auth-logo-box">
            <div className="auth-logo-icon">🎓</div>
            <div>
              <h1>EduPortal</h1>
              <div className="tagline">College Admissions System</div>
            </div>
          </div>
          <div className="auth-divider" />
          <div className="auth-features">
            {[
              { icon:'🏛️', title:'Apply to Courses', desc:'Browse programs and submit applications online' },
              { icon:'📁', title:'Upload Documents', desc:'Securely submit marksheets and ID proofs' },
              { icon:'📊', title:'Track Application', desc:'Real-time status updates on your journey' },
              { icon:'💳', title:'Pay Fees Online', desc:'Secure payment gateway for all fees' },
            ].map(f => (
              <div key={f.title} className="auth-feature">
                <div className="auth-feature-icon">{f.icon}</div>
                <div className="auth-feature-text"><h4>{f.title}</h4><p>{f.desc}</p></div>
              </div>
            ))}
          </div>


        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="auth-right" style={{ position:'relative' }}>
        <div style={{ position:'absolute', top:28, right:32, fontSize:10, color:'var(--gray-300)', fontFamily:'Space Mono, monospace', letterSpacing:2, textTransform:'uppercase' }}>
          Est. 2024
        </div>

        {/* FORGOT PASSWORD */}
        {forgotMode ? (
          <div>
            <div style={{ width:52, height:52, borderRadius:14, background:'linear-gradient(135deg, var(--gold), var(--gold-dark))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, marginBottom:20, boxShadow:'0 6px 24px rgba(200,168,75,0.35)' }}>🔑</div>
            <h2 style={{ marginBottom:6 }}>Forgot Password?</h2>
            <p className="sub">{forgotSent ? 'Check your inbox for reset instructions.' : "No worries! Enter your email and we'll send a reset link."}</p>

            {!forgotSent ? (
              <form className="auth-form" onSubmit={handleForgot} style={{ marginTop:28 }}>
                <div className="form-group">
                  <label>Registered Email Address *</label>
                  <input type="email" placeholder="you@example.com" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} required autoFocus />
                </div>
                <button className="btn btn-gold" type="submit" style={{ marginTop:4, justifyContent:'center', padding:'13px 22px' }}>
                  → Send Reset Link
                </button>
              </form>
            ) : (
              <div style={{ marginTop:28, padding:'20px 22px', background:'linear-gradient(135deg, rgba(26,107,90,0.08), rgba(26,107,90,0.04))', border:'1px solid rgba(26,107,90,0.2)', borderRadius:12, display:'flex', alignItems:'flex-start', gap:14 }}>
                <span style={{ fontSize:28 }}>✅</span>
                <div>
                  <div style={{ fontWeight:700, fontSize:14, color:'var(--teal)', marginBottom:4 }}>Reset link sent!</div>
                  <div style={{ fontSize:13, color:'var(--gray-500)', lineHeight:1.6 }}>
                    Instructions sent to <strong>{forgotEmail}</strong>. Check your inbox and spam folder.
                  </div>
                </div>
              </div>
            )}

            <div className="auth-link" style={{ marginTop:28 }}>
              <button onClick={() => { setForgotMode(false); setForgotSent(false); setForgotEmail(''); }}>← Back to Sign In</button>
            </div>

            <div style={{ marginTop:40, borderRadius:12, overflow:'hidden', height:80, position:'relative', border:'1px solid var(--gray-200)' }}>
              <img src="https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=70" alt="campus" style={{ width:'100%', height:'100%', objectFit:'cover', opacity:0.72 }} />
              <div style={{ position:'absolute', inset:0, background:'linear-gradient(90deg, rgba(10,14,26,0.55) 0%, transparent 65%)', display:'flex', alignItems:'center', padding:'0 18px' }}>
                <span style={{ color:'white', fontFamily:'Cormorant Garamond, serif', fontSize:13, fontStyle:'italic', opacity:0.9 }}>"Your future begins with one step"</span>
              </div>
            </div>
          </div>

        ) : (
          /* LOGIN / REGISTER */
          <>
            <h2>{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
            <p className="sub">{mode === 'login' ? 'Sign in to continue your journey' : 'Begin your admission journey today'}</p>

            <div className="role-selector">
              {[
                { val:'student', icon:'👤', label:'Student', desc:'Apply for admission' },
                { val:'officer', icon:'🏛️', label:'Officer', desc:'Review applications' },
              ].map(r => (
                <button key={r.val} className={`role-btn ${role === r.val ? 'active' : ''}`} onClick={() => setRole(r.val)} type="button">
                  <span className="role-icon">{r.icon}</span>
                  <div className="role-label">{r.label}</div>
                  <div className="role-desc">{r.desc}</div>
                </button>
              ))}
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              {mode === 'register' && (
                <div className="form-group">
                  <label>Full Name *</label>
                  <input placeholder="Enter your full name" value={form.name} onChange={e => set('name', e.target.value)} required />
                </div>
              )}
              <div className="form-group">
                <label>Email Address *</label>
                <input type="email" placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} required />
              </div>
              {mode === 'register' && (
                <div className="form-group">
                  <label>Phone Number</label>
                  <input placeholder="9876543210" value={form.phnNo} onChange={e => set('phnNo', e.target.value)} />
                </div>
              )}
              <div className="form-group">
                <label>Password *</label>
                <input type="password" placeholder="••••••••" value={form.password} onChange={e => set('password', e.target.value)} required />
              </div>

              {/* FORGOT PASSWORD LINK */}
              {mode === 'login' && (
                <div style={{ display:'flex', justifyContent:'flex-end', marginTop:-4, marginBottom:2 }}>
                  <button type="button" onClick={() => setForgotMode(true)} style={{
                    background:'none', border:'none', cursor:'pointer',
                    fontSize:12, color:'var(--gold-dark)', fontWeight:600,
                    fontFamily:'Outfit, sans-serif',
                    textDecoration:'underline', textDecorationColor:'rgba(138,111,40,0.4)',
                    textUnderlineOffset:3, padding:0, letterSpacing:0.2
                  }}>
                    Forgot Password?
                  </button>
                </div>
              )}

              <button className="btn btn-gold" type="submit" disabled={loading}
                style={{ marginTop:6, justifyContent:'center', fontSize:14, padding:'13px 22px' }}>
                {loading ? <span className="spinner" /> : null}
                {loading ? 'Please wait...' : mode === 'login' ? '→ Sign In' : '→ Create Account'}
              </button>
            </form>

            <div className="auth-link">
              {mode === 'login'
                ? (<>Don't have an account? <button onClick={() => setMode('register')}>Register here</button></>)
                : (<>Already have an account? <button onClick={() => setMode('login')}>Sign in</button></>)
              }
            </div>

            <div style={{ marginTop:40, borderRadius:12, overflow:'hidden', height:80, position:'relative', border:'1px solid var(--gray-200)' }}>
              <img src="https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=800&q=70" alt="campus"
                style={{ width:'100%', height:'100%', objectFit:'cover', opacity:0.75 }} />
              <div style={{ position:'absolute', inset:0, background:'linear-gradient(90deg, rgba(10,14,26,0.5) 0%, transparent 60%)', display:'flex', alignItems:'center', padding:'0 18px' }}>
                <span style={{ color:'white', fontFamily:'Cormorant Garamond, serif', fontSize:13, fontStyle:'italic', opacity:0.85 }}>"Shaping futures through education"</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}