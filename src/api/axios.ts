// Import the axios library for making HTTP requests
import axios from 'axios';

// Create a pre-configured axios instance shared across the whole app
const api = axios.create({
    baseURL: `${(import.meta as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL ?? ''}/api`,  // Use env var for LAN access, fallback to proxy
    withCredentials: false,   // Don't send cookies — we use header-based identity instead
    headers: {
        'Accept': 'application/json',       // Tell the server we expect JSON responses
        'Content-Type': 'application/json', // Tell the server we're sending JSON
    },
});

// Attach current user identity to every request for activity logging
api.interceptors.request.use((config) => {
    // Read the logged-in user from localStorage (set during login)
    const saved = localStorage.getItem('library_current_user');
    if (saved) {
        const user = JSON.parse(saved); // Parse the JSON string back into an object
        // Attach the user's full name as a custom header so the backend can log who made the request
        config.headers['X-User-Name'] = user.fullName ?? user.username ?? 'Unknown';
        // Attach the user's role (admin or staff) for the same reason
        config.headers['X-User-Role'] = user.role ?? 'staff';
    }
    return config; // Return the modified config so the request proceeds
});

// Export the configured instance as the default export so all files use the same base URL and headers
export default api;
