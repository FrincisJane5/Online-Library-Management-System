import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api',
    withCredentials: false,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    },
});

// Attach current user identity to every request for activity logging
api.interceptors.request.use((config) => {
    const saved = localStorage.getItem('library_current_user');
    if (saved) {
        const user = JSON.parse(saved);
        config.headers['X-User-Name'] = user.fullName ?? user.username ?? 'Unknown';
        config.headers['X-User-Role'] = user.role ?? 'staff';
    }
    return config;
});

export default api;
