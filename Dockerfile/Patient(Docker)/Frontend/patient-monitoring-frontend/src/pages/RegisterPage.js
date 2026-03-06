import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { patientAPI, doctorAPI } from '../services/api';
import { toast } from 'react-toastify';

export default function RegisterPage() {
  const [role, setRole] = useState('patient');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [patientForm, setPatientForm] = useState({
    name: '', age: '', phnNo: '', mail: '', password: '', address: '', gender: 'Male'
  });

  const [doctorForm, setDoctorForm] = useState({
    name: '', email: '', password: '', specialization: '', contactNo: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (role === 'patient') {
        await patientAPI.create({ ...patientForm, age: parseInt(patientForm.age) });
        toast.success('Patient account created! Please login.');
      } else {
        await doctorAPI.create(doctorForm);
        toast.success('Doctor account created! Please login.');
      }
      navigate('/login');
    } catch (err) {
      toast.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.bg} />
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.header}>
            <span style={styles.logo}>🫀</span>
            <div>
              <h2 style={styles.title}>Create Account</h2>
              <p style={styles.sub}>Join MediWatch today</p>
            </div>
          </div>

          <div style={styles.roleToggle}>
            {['patient', 'doctor'].map(r => (
              <button
                key={r}
                type="button"
                style={{ ...styles.roleBtn, ...(role === r ? styles.roleActive : {}) }}
                onClick={() => setRole(r)}
              >
                {r === 'patient' ? '🧑' : '👨‍⚕️'} {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {role === 'patient' ? (
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-control" placeholder="John Doe" required
                    value={patientForm.name} onChange={e => setPatientForm({ ...patientForm, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Age</label>
                  <input className="form-control" type="number" placeholder="25" required
                    value={patientForm.age} onChange={e => setPatientForm({ ...patientForm, age: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-control" type="email" placeholder="john@email.com" required
                    value={patientForm.mail} onChange={e => setPatientForm({ ...patientForm, mail: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input className="form-control" placeholder="+91 9876543210" required
                    value={patientForm.phnNo} onChange={e => setPatientForm({ ...patientForm, phnNo: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select className="form-control" value={patientForm.gender}
                    onChange={e => setPatientForm({ ...patientForm, gender: e.target.value })}>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div className="input-wrapper">
                    <input className="form-control" type={showPass ? 'text' : 'password'} placeholder="Create password" required
                      value={patientForm.password} onChange={e => setPatientForm({ ...patientForm, password: e.target.value })} />
                    <span className="input-icon" onClick={() => setShowPass(!showPass)}>{showPass ? '🙈' : '👁️'}</span>
                  </div>
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Address</label>
                  <textarea className="form-control" placeholder="Enter your address" rows={2}
                    value={patientForm.address} onChange={e => setPatientForm({ ...patientForm, address: e.target.value })} />
                </div>
              </div>
            ) : (
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-control" placeholder="Dr. Jane Smith" required
                    value={doctorForm.name} onChange={e => setDoctorForm({ ...doctorForm, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-control" type="email" placeholder="doctor@hospital.com" required
                    value={doctorForm.email} onChange={e => setDoctorForm({ ...doctorForm, email: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Specialization</label>
                  <select className="form-control" value={doctorForm.specialization}
                    onChange={e => setDoctorForm({ ...doctorForm, specialization: e.target.value })}>
                    <option value="">Select Specialization</option>
                    <option>Cardiologist</option>
                    <option>Neurologist</option>
                    <option>Pediatrician</option>
                    <option>Orthopedic</option>
                    <option>Dermatologist</option>
                    <option>General Physician</option>
                    <option>Psychiatrist</option>
                    <option>Oncologist</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Contact Number</label>
                  <input className="form-control" placeholder="+91 9876543210" required
                    value={doctorForm.contactNo} onChange={e => setDoctorForm({ ...doctorForm, contactNo: e.target.value })} />
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Password</label>
                  <div className="input-wrapper">
                    <input className="form-control" type={showPass ? 'text' : 'password'} placeholder="Create password" required
                      value={doctorForm.password} onChange={e => setDoctorForm({ ...doctorForm, password: e.target.value })} />
                    <span className="input-icon" onClick={() => setShowPass(!showPass)}>{showPass ? '🙈' : '👁️'}</span>
                  </div>
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.9rem', marginTop: '0.5rem' }} disabled={loading}>
              {loading ? <span className="loading-spinner" /> : null}
              {loading ? 'Creating...' : '✨ Create Account'}
            </button>
          </form>

          <p style={styles.loginLink}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#00b4d8', textDecoration: 'none' }}>Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  bg: { position: 'fixed', inset: 0, background: 'radial-gradient(ellipse at 30% 40%, rgba(0,119,182,0.2) 0%, transparent 60%), #0a192f', zIndex: 0 },
  container: { position: 'relative', zIndex: 1, width: '100%', maxWidth: '700px', padding: '2rem' },
  card: {
    background: 'rgba(17,34,64,0.92)',
    border: '1px solid rgba(0,180,216,0.2)',
    borderRadius: '24px',
    padding: '2.5rem',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
  },
  header: { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' },
  logo: { fontSize: '2.5rem' },
  title: { fontFamily: 'Playfair Display, serif', fontSize: '1.7rem', color: '#e8f4f8' },
  sub: { color: '#8892b0', fontSize: '0.9rem' },
  roleToggle: {
    display: 'flex', gap: '0.5rem', marginBottom: '1.5rem',
    background: 'rgba(255,255,255,0.04)', padding: '0.3rem', borderRadius: '12px',
    border: '1px solid rgba(0,180,216,0.15)',
  },
  roleBtn: {
    flex: 1, padding: '0.55rem', background: 'transparent', border: 'none',
    borderRadius: '8px', color: '#8892b0', cursor: 'pointer', fontSize: '0.9rem',
    fontFamily: 'DM Sans, sans-serif', transition: 'all 0.2s',
  },
  roleActive: { background: 'rgba(0,180,216,0.2)', color: '#00b4d8', border: '1px solid rgba(0,180,216,0.4)' },
  loginLink: { textAlign: 'center', marginTop: '1.5rem', color: '#8892b0', fontSize: '0.9rem' },
};
