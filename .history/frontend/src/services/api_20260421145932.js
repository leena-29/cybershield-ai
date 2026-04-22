import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  verifyToken: (token) => api.post('/auth/verify-token', { token })
};

// Scanner APIs
export const scanAPI = {
  scanPassword: (password) => api.post('/scan/password', { password }),
  scanWebsite: (url) => api.post('/scan/website', { url }, { timeout: 12000 }),
  scanPhishing: (url) => api.post('/scan/phishing', { url }),
  scanDomain: (domain) => api.post('/scan/domain', { domain }),
  scanBreach: (email) => api.post('/scan/breach', { email }),
  scanIP: (ip) => api.post('/scan/ip', { ip }),
  scanEmail: (email, domain, content) => api.post('/scan/email', { email, domain, content }),
  riskAnalysis: (results) => api.post('/scan/risk-analysis', { results })
};

// History APIs
export const historyAPI = {
  getScans: (limit = 50, skip = 0) => api.get('/history/scans', { params: { limit, skip } }),
  getScansByType: (type, limit = 20) => api.get(`/history/scans/${type}`, { params: { limit } }),
  getAlerts: (limit = 20) => api.get('/history/alerts', { params: { limit } }),
  getStatistics: () => api.get('/history/statistics'),
  deleteScan: (scanId) => api.delete(`/history/delete/${scanId}`)
};

// Health check
export const healthCheck = () => api.get('/health');

export default api;
