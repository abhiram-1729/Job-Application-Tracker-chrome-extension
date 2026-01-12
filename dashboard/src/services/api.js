import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

if (import.meta.env.PROD && !import.meta.env.VITE_API_URL) {
    console.warn('⚠️ VITE_API_URL is not set! Falling back to localhost:3000 which will likely fail in production.');
}

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true
});

// Add session ID to all requests
api.interceptors.request.use((config) => {
    const sessionId = localStorage.getItem('sessionId');
    if (sessionId) {
        config.headers['x-session-id'] = sessionId;
    }
    return config;
});

// Handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('sessionId');
            localStorage.removeItem('user');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

export default api;

// API methods
export const authAPI = {
    getAuthUrl: () => api.get('/auth/google'),
    getUser: () => api.get('/auth/me'),
    logout: (sessionId) => api.post('/auth/logout', { sessionId })
};

export const jobsAPI = {
    init: () => api.post('/api/jobs/init'),
    getAll: (params) => api.get('/api/jobs', { params }),
    create: (data) => api.post('/api/jobs', data),
    update: (id, data) => api.patch(`/api/jobs/${id}`, data),
    delete: (id) => api.delete(`/api/jobs/${id}`),
    getStats: () => api.get('/api/jobs/stats')
};
