import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create optimized axios instance with performance improvements
const api = axios.create({
    baseURL: API_URL,
    timeout: 10000, // 10 second timeout for faster failures
    headers: {
        'Content-Type': 'application/json',
    },
    // Browser will automatically use the best available adapter (xhr or fetch)
});

// Cache for recent requests to prevent redundant API calls
const requestCache = new Map();
const CACHE_DURATION = 30000; // 30 seconds cache

// Request interceptor with caching and optimized token handling
api.interceptors.request.use(
    (config) => {
        // Priority: OAuth access_token > regular token
        const oauthToken = localStorage.getItem('access_token');
        const regularToken = localStorage.getItem('token');
        const token = oauthToken || regularToken;

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Add caching for GET requests to user profile
        if (config.method === 'get' && config.url === '/auth/me') {
            const cacheKey = `${config.method}:${config.url}:${token}`;
            const cached = requestCache.get(cacheKey);

            if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
                // Return cached response
                return Promise.reject({
                    __CACHED_RESPONSE__: true,
                    data: cached.data
                });
            }
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Don't handle canceled/aborted requests
        if (error.code === 'ERR_CANCELED' || error.name === 'CanceledError' || error.message?.includes('canceled')) {
            return Promise.reject(error);
        }

        if (error.response?.status === 401) {
            // Show toast notification before redirect
            const toastMessage = error.response?.data?.message || 'Session expired. Please login again.';

            // Import toast dynamically to avoid circular dependencies
            import('react-hot-toast').then(({ default: toast }) => {
                toast.error(toastMessage, { duration: 3000 });
            });

            // Clear both OAuth and regular auth data
            localStorage.removeItem('access_token');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            sessionStorage.removeItem('code_verifier');

            // Delay redirect to allow toast to show
            setTimeout(() => {
                window.location.href = '/login';
            }, 500);
        }
        return Promise.reject(error);
    }
);

export default api;
