// Import the axios library for making HTTP requests
import axios from 'axios';

// Create a pre-configured axios instance shared across the whole app
const api = axios.create({
    baseURL: `${(import.meta as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL ?? ''}/api`,
    withCredentials: false,
    headers: {
        'Accept': 'application/json',
        // NOTE: Do NOT set a global Content-Type here.
        // axios sets it automatically per-request (including the multipart boundary for FormData).
    },
});

api.interceptors.request.use((config) => {
    const saved = localStorage.getItem('library_current_user');
    if (saved) {
        const user = JSON.parse(saved);
        config.headers['X-User-Name'] = user.fullName ?? user.username ?? 'Unknown';
        config.headers['X-User-Role'] = user.role ?? 'staff';
        config.headers['X-User-Id']   = user.id;
    }
    // Set JSON content type only when not sending FormData
    // (FormData needs axios to set Content-Type automatically with the multipart boundary)
    if (!(config.data instanceof FormData)) {
        config.headers['Content-Type'] = 'application/json';
    }
    return config;
});

// Export the configured instance as the default export so all files use the same base URL and headers
export default api;
