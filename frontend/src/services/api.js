import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
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

// Auth API
export const authAPI = {
  register: (formData) => api.post('/auth/register', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  login: (credentials) => api.post('/auth/login', credentials),
  getCurrentUser: () => api.get('/auth/me'),
  requestPasswordReset: (email) => api.post('/auth/forgot-password', { email }),
  resetPasswordWithOTP: (email, otp, newPassword) =>
    api.post('/auth/reset-password', { email, otp, newPassword })
};

// Users API
export const usersAPI = {
  getPendingDeans: () => api.get('/users/pending-deans'),
  getPendingStudents: () => api.get('/users/pending-students'),
  verifyUser: (userId, action) => api.patch(`/users/${userId}/verify`, { action }),
  getUserById: (userId) => api.get(`/users/${userId}`)
};

// Applications API
export const applicationsAPI = {
  submit: (applicationData) => api.post('/applications', applicationData),
  getAll: () => api.get('/applications'),
  getById: (id) => api.get(`/applications/${id}`),
  updateStatus: (id, status, rejectionReason) =>
    api.patch(`/applications/${id}/status`, { status, rejectionReason }),
  assignAdvisor: (id, advisorId) =>
    api.patch(`/applications/${id}/assign-advisor`, { advisorId })
};

// Advisors API
export const advisorsAPI = {
  create: (advisorData) => api.post('/advisors', advisorData),
  getAll: () => api.get('/advisors'),
  getById: (id) => api.get(`/advisors/${id}`),
  update: (id, advisorData) => api.put(`/advisors/${id}`, advisorData),
  delete: (id) => api.delete(`/advisors/${id}`)
};

// Chats API
export const chatsAPI = {
  send: (messageData) => api.post('/chats', messageData),
  getHistory: (applicationId) => api.get(`/chats/${applicationId}`),
  getUnreadCount: () => api.get('/chats/unread/count')
};

// Evaluations API
export const evaluationsAPI = {
  submit: (evaluationData) => api.post('/evaluations', evaluationData),
  getByApplication: (applicationId) => api.get(`/evaluations/application/${applicationId}`),
  getByStudent: (studentId) => api.get(`/evaluations/student/${studentId}`),
  update: (id, evaluationData) => api.put(`/evaluations/${id}`, evaluationData)
};

// Reports API
export const reportsAPI = {
  upload: (formData) => api.post('/reports', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getByApplication: (applicationId) => api.get(`/reports/application/${applicationId}`),
  getByStudent: (studentId) => api.get(`/reports/student/${studentId}`),
  getById: (id) => api.get(`/reports/${id}`),
  addFeedback: (id, feedback) => api.patch(`/reports/${id}/feedback`, { feedback })
};

export default api;
