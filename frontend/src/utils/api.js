import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,  // ✅ use env var
  timeout: 10000,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('lms_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401/403 globally — redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      localStorage.removeItem('lms_token');
      localStorage.removeItem('lms_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Leave APIs ──────────────────────────────────────────────────────────────
export const leaveAPI = {
  apply:    (data)      => api.post('/leave', data),
  getMy:    ()          => api.get('/leave/my'),
  getAll:   ()          => api.get('/leave/all'),
  process:  (id, data)  => api.put(`/leave/${id}`, data),
};

// ── Employee APIs (Manager only) ────────────────────────────────────────────
export const employeeAPI = {
  getAll:   ()    => api.get('/employees'),
  add:      (data) => api.post('/employees', data),
  remove:   (id)  => api.delete(`/employees/${id}`),
};

// ── Auth API ─────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (data) => api.post('/auth/login', data),  // ✅
};

export default api;
