import axios from 'axios';

const API_BASE = 'http://localhost:8081/api';
const api = axios.create({ baseURL: API_BASE });

export const getBooks = () => api.get('/books');
export const addBook = (book) => api.post('/books', book);
export const updateBook = (id, book) => api.put(`/books/${id}`, book);
export const deleteBook = (id) => api.delete(`/books/${id}`);

export const getMembers = () => api.get('/members');
export const addMember = (member) => api.post('/members', member);

export const getBorrows = () => api.get('/borrow');
export const borrowBook = (borrow) => api.post('/borrow', borrow);
export const returnBook = (id) => api.put(`/borrow/return/${id}`);

export const getFines = () => api.get('/fines');
export const addFine = (fine) => api.post('/fines', fine);
export const payFine = (id) => api.put(`/fines/${id}/pay`);

export default api;