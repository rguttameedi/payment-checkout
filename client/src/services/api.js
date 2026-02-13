import axios from 'axios';

// Base API URL - uses proxy from package.json in development
// In development, use relative path so React proxy forwards to backend (port 50155)
// In production, set REACT_APP_API_URL environment variable
const API_URL = process.env.REACT_APP_API_URL || '/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 errors (unauthorized) - redirect to login
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============================================
// AUTH SERVICES
// ============================================

export const authService = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  register: (userData) => apiClient.post('/auth/register', userData),
  logout: () => apiClient.post('/auth/logout'),
  me: () => apiClient.get('/auth/me'),
  refreshToken: () => apiClient.post('/auth/refresh')
};

// ============================================
// TENANT SERVICES
// ============================================

export const tenantService = {
  // Dashboard
  getDashboard: () => apiClient.get('/tenant/dashboard'),

  // Payments
  getPaymentHistory: (params) => apiClient.get('/tenant/payments', { params }),
  getPaymentDetails: (id) => apiClient.get(`/tenant/payments/${id}`),

  // Payment Methods
  getPaymentMethods: () => apiClient.get('/tenant/payment-methods'),
  addPaymentMethod: (data) => apiClient.post('/tenant/payment-methods', data),
  updatePaymentMethod: (id, data) => apiClient.put(`/tenant/payment-methods/${id}`, data),
  deletePaymentMethod: (id) => apiClient.delete(`/tenant/payment-methods/${id}`),

  // Auto-Pay / Recurring Schedule
  getRecurringSchedule: () => apiClient.get('/tenant/recurring-schedule'),
  createRecurringSchedule: (data) => apiClient.post('/tenant/recurring-schedule', data),
  updateRecurringSchedule: (id, data) => apiClient.put(`/tenant/recurring-schedule/${id}`, data),
  cancelRecurringSchedule: (id) => apiClient.delete(`/tenant/recurring-schedule/${id}`)
};

// ============================================
// ADMIN SERVICES
// ============================================

export const adminService = {
  // Dashboard
  getDashboard: () => apiClient.get('/admin/dashboard'),

  // Properties
  getProperties: (params) => apiClient.get('/admin/properties', { params }),
  getPropertyDetails: (id) => apiClient.get(`/admin/properties/${id}`),
  createProperty: (data) => apiClient.post('/admin/properties', data),
  updateProperty: (id, data) => apiClient.put(`/admin/properties/${id}`, data),
  deleteProperty: (id) => apiClient.delete(`/admin/properties/${id}`),

  // Units
  getUnits: (propertyId, params) => apiClient.get(`/admin/properties/${propertyId}/units`, { params }),
  createUnit: (propertyId, data) => apiClient.post(`/admin/properties/${propertyId}/units`, data),
  updateUnit: (id, data) => apiClient.put(`/admin/units/${id}`, data),
  deleteUnit: (id) => apiClient.delete(`/admin/units/${id}`),

  // Tenants
  getTenants: (params) => apiClient.get('/admin/tenants', { params }),

  // Leases
  getLeases: (params) => apiClient.get('/admin/leases', { params }),
  createLease: (data) => apiClient.post('/admin/leases', data),
  updateLease: (id, data) => apiClient.put(`/admin/leases/${id}`, data),
  terminateLease: (id) => apiClient.put(`/admin/leases/${id}/terminate`),

  // Payments
  getPayments: (params) => apiClient.get('/admin/payments', { params })
};

export default apiClient;
