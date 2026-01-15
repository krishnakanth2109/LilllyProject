// src/utils/api.js
import axios from 'axios';

// Base URL from environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token from sessionStorage
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear session and redirect to login
      sessionStorage.clear();
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  registerStaff: (userData) => api.post('/api/auth/register-staff', userData),
};

// Visitor API calls
export const visitorAPI = {
  register: (visitorData) => api.post('/api/visitors/register', visitorData),
  getMyVisitors: () => api.get('/api/visitors/my-visitors'),
  scanVisitor: (visitorId) => api.put(`/api/visitors/scan/${visitorId}`, {}),
  getAdminLogs: () => api.get('/api/visitors/admin-logs'),
  getEmployeeStats: (date) => api.get('/api/visitors/employee-stats', { params: { date } }),
  getSecurityStats: (date) => api.get('/api/visitors/security-stats', { params: { date } }),
};

export default api;