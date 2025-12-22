import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
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

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Show toast notification before redirect
            const toastMessage = error.response?.data?.message || 'Session expired. Please login again.';

            // Import toast dynamically to avoid circular dependencies
            import('react-hot-toast').then(({ default: toast }) => {
                toast.error(toastMessage, { duration: 3000 });
            });

            // Clear auth data
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            // Delay redirect to allow toast to show
            setTimeout(() => {
                window.location.href = '/login';
            }, 500);
        }
        return Promise.reject(error);
    }
);

export default api;
