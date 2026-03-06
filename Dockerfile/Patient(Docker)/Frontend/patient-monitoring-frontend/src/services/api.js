import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8081/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

// ===== PATIENTS =====
export const patientAPI = {
  getAll: () => api.get('/patients'),
  getById: (id) => api.get(`/patients/${id}`),
  create: (data) => api.post('/patients', data),
  update: (id, data) => api.put(`/patients/${id}`, data),
  delete: (id) => api.delete(`/patients/${id}`),
  login: (email, password) => api.get('/patients').then(res => {
    const patients = Array.isArray(res.data) ? res.data : [];
    const found = patients.find(p => {
      const dbEmail = (p.mail || p.email || '').toLowerCase().trim();
      const inputEmail = (email || '').toLowerCase().trim();
      const dbPass = (p.password || '').trim();
      const inputPass = (password || '').trim();
      return dbEmail === inputEmail && dbPass === inputPass;
    });
    if (!found) throw new Error('Invalid credentials');
    return found;
  })
};

// ===== DOCTORS =====
export const doctorAPI = {
  getAll: () => api.get('/doctors'),
  getById: (id) => api.get(`/doctors/${id}`),
  create: (data) => api.post('/doctors', data),
  update: (id, data) => api.put(`/doctors/${id}`, data),
  delete: (id) => api.delete(`/doctors/${id}`),
  login: (email, password) => api.get('/doctors').then(res => {
    const doctors = Array.isArray(res.data) ? res.data : [];
    const found = doctors.find(d => {
      const dbEmail = (d.email || d.mail || '').toLowerCase().trim();
      const inputEmail = (email || '').toLowerCase().trim();
      const dbPass = (d.password || '').trim();
      const inputPass = (password || '').trim();
      return dbEmail === inputEmail && dbPass === inputPass;
    });
    if (!found) throw new Error('Invalid credentials');
    return found;
  })
};

// ===== APPOINTMENTS =====
export const appointmentAPI = {
  getAll: () => api.get('/appointments'),
  getById: (id) => api.get(`/appointments/${id}`),
  create: (data) => api.post('/appointments', data),
  update: (id, data) => api.put(`/appointments/${id}`, data),
  delete: (id) => api.delete(`/appointments/${id}`)
};

// ===== CONSULTATIONS =====
export const consultationAPI = {
  getAll: () => api.get('/consultations'),
  getById: (id) => api.get(`/consultations/${id}`),
  create: (data) => api.post('/consultations', data),
  update: (id, data) => api.put(`/consultations/${id}`, data),
  delete: (id) => api.delete(`/consultations/${id}`)
};

// ===== DAILY READINGS =====
export const dailyReadingAPI = {
  getAll: () => api.get('/readings'),
  getById: (id) => api.get(`/readings/${id}`),
  create: (data) => api.post('/readings', data),
  update: (id, data) => api.put(`/readings/${id}`, data),
  delete: (id) => api.delete(`/readings/${id}`)
};

// ===== HEALTH DATA =====
export const healthDataAPI = {
  getAll: () => api.get('/health-data'),
  getById: (id) => api.get(`/health-data/${id}`),
  create: (data) => api.post('/health-data', data),
  update: (id, data) => api.put(`/health-data/${id}`, data),
  delete: (id) => api.delete(`/health-data/${id}`)
};

// ===== MESSAGES =====
export const messageAPI = {
  getAll: () => api.get('/messages'),
  getById: (id) => api.get(`/messages/${id}`),
  create: (data) => api.post('/messages', data),
  update: (id, data) => api.put(`/messages/${id}`, data),
  delete: (id) => api.delete(`/messages/${id}`)
};

// ===== REPORTS =====
export const reportAPI = {
  getAll: () => api.get('/reports'),
  getById: (id) => api.get(`/reports/${id}`),
  create: (data) => api.post('/reports', data),
  update: (id, data) => api.put(`/reports/${id}`, data),
  delete: (id) => api.delete(`/reports/${id}`)
};

export default api;