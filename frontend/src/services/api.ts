import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// Invoice APIs
export const getInvoices = (params: Record<string, string | number>) =>
  api.get('/invoices', { params });

export const createInvoice = (data: Record<string, unknown>) =>
  api.post('/invoices', data);

export const updateInvoice = (id: string, data: Record<string, unknown>) =>
  api.put(`/invoices/${id}`, data);

// Customer APIs
export const getCustomers = () => api.get('/customers');

export const getCustomerById = (id: string) => api.get(`/customers/${id}`);

// Dashboard APIs
export const getDashboardSummary = () => api.get('/dashboard/summary');

export const getTopCustomers = () => api.get('/dashboard/top-customers');

export default api;
