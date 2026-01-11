import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000',
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
