import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request automatically
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Handle auth errors globally
api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(err);
    }
);

// ── Auth ──────────────────────────────────────────────
export const authApi = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me'),
    updateProfile: (data) => api.put('/auth/profile', data),
    changePassword: (data) => api.put('/auth/password', data),
};

// ── Services ─────────────────────────────────────────
export const servicesApi = {
    getAll: (params) => api.get('/services', { params }),
    getById: (id) => api.get(`/services/${id}`),
    getAdminAll: () => api.get('/services/admin/all'),
    create: (data) => api.post('/services', data),
    update: (id, data) => api.put(`/services/${id}`, data),
    delete: (id) => api.delete(`/services/${id}`),
    getAvailability: (id) => api.get(`/services/${id}/availability`),
    getReviews: (id) => api.get(`/services/${id}/reviews`),
    addReview: (id, data) => api.post(`/services/${id}/reviews`, data),
};

// ── Bookings ──────────────────────────────────────────
export const bookingsApi = {
    create: (data) => api.post('/bookings', data),
    getMy: () => api.get('/bookings/my'),
    getById: (id) => api.get(`/bookings/${id}`),
    cancel: (id) => api.put(`/bookings/${id}/cancel`),
    getAll: () => api.get('/bookings/admin'),
};

// ── Payments ──────────────────────────────────────────
export const paymentsApi = {
    pay: (data) => api.post('/payments/pay', data),
    getStatus: (bookingId) => api.get(`/payments/${bookingId}`),
};

// ── Admin ─────────────────────────────────────────────
export const adminApi = {
    getStats: () => api.get('/admin/stats'),
    getUsers: () => api.get('/admin/users'),
    updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
};

export default api;
