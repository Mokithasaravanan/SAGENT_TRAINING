import axios from 'axios';

const BASE_URL = 'http://localhost:8081/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const studentAPI = {
  create: (data) => api.post('/students', data),
  getAll: () => api.get('/students'),
  getById: (id) => api.get(`/students/${id}`),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
};

export const courseAPI = {
  create: (data) => api.post('/courses', data),
  getAll: () => api.get('/courses'),
  getById: (id) => api.get(`/courses/${id}`),
  update: (id, data) => api.put(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`),
};

export const applicationAPI = {
  apply: (data) => api.post('/applications', data),
  getAll: () => api.get('/applications'),
  getById: (id) => api.get(`/applications/${id}`),
  update: (id, data) => api.put(`/applications/${id}`, data),
  delete: (id) => api.delete(`/applications/${id}`),
};

export const documentAPI = {
  upload: (data) => api.post('/documents', data),
  getAll: () => api.get('/documents'),
  getById: (id) => api.get(`/documents/${id}`),
  update: (id, data) => api.put(`/documents/${id}`, data),
  delete: (id) => api.delete(`/documents/${id}`),
};

export const paymentAPI = {
  pay: (data) => api.post('/payments', data),
  getAll: () => api.get('/payments'),
  getById: (id) => api.get(`/payments/${id}`),
  update: (id, data) => api.put(`/payments/${id}`, data),
  delete: (id) => api.delete(`/payments/${id}`),
};

export const officerAPI = {
  create: (data) => api.post('/officers', data),
  getAll: () => api.get('/officers'),
  getById: (id) => api.get(`/officers/${id}`),
  update: (id, data) => api.put(`/officers/${id}`, data),
  delete: (id) => api.delete(`/officers/${id}`),
};

export default api;