import axios from 'axios';

const BASE_URL = 'http://localhost:8081/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Customers
export const customerAPI = {
  create: (data) => api.post('/customers', data),
  getAll: () => api.get('/customers'),
  getById: (id) => api.get(`/customers/${id}`),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`),
};

// Products
export const productAPI = {
  create: (data) => api.post('/products', data),
  getAll: () => api.get('/products'),
  getById: (id) => api.get(`/products/${id}`),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

// Categories
export const categoryAPI = {
  create: (data) => api.post('/categories', data),
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

// Cart
export const cartAPI = {
  create: (data) => api.post('/carts', data),
  getAll: () => api.get('/carts'),
  getById: (id) => api.get(`/carts/${id}`),
  update: (id, data) => api.put(`/carts/${id}`, data),
  delete: (id) => api.delete(`/carts/${id}`),
};

// Orders
export const orderAPI = {
  create: (data) => api.post('/orders', data),
  getAll: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
  update: (id, data) => api.put(`/orders/${id}`, data),
  delete: (id) => api.delete(`/orders/${id}`),
};

// Payments
export const paymentAPI = {
  create: (data) => api.post('/payments', data),
  getAll: () => api.get('/payments'),
  getById: (id) => api.get(`/payments/${id}`),
  update: (id, data) => api.put(`/payments/${id}`, data),
};

// Delivery Persons
export const deliveryAPI = {
  create: (data) => api.post('/delivery-persons', data),
  getAll: () => api.get('/delivery-persons'),
  getById: (id) => api.get(`/delivery-persons/${id}`),
  update: (id, data) => api.put(`/delivery-persons/${id}`, data),
  delete: (id) => api.delete(`/delivery-persons/${id}`),
};

// Notifications
export const notificationAPI = {
  create: (data) => api.post('/notifications', data),
  getAll: () => api.get('/notifications'),
  getById: (id) => api.get(`/notifications/${id}`),
  update: (id, data) => api.put(`/notifications/${id}`, data),
};

// Admin (uses customers with role=admin concept)
export const adminAPI = {
  create: (data) => api.post('/admins', data),
  getAll: () => api.get('/admins'),
  getById: (id) => api.get(`/admins/${id}`),
  update: (id, data) => api.put(`/admins/${id}`, data),
};

export default api;
