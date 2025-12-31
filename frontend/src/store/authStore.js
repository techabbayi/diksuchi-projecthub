import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/api';
import toast from 'react-hot-toast';

export const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,

            // Initialize auth state from localStorage
            initAuth: () => {
                const storedToken = localStorage.getItem('access_token') || localStorage.getItem('token');
                if (storedToken && !get().token) {
                    set({ token: storedToken });
                }
            },

            login: async (credentials) => {
                try {
                    const { data } = await api.post('/auth/login', credentials);
                    set({
                        user: data.data,
                        token: data.data.token,
                        isAuthenticated: true,
                    });
                    localStorage.setItem('token', data.data.token);
                    toast.success('Login successful!');
                    return data.data;
                } catch (error) {
                    toast.error(error.response?.data?.message || 'Login failed');
                    throw error;
                }
            },

            register: async (userData) => {
                try {
                    const { data } = await api.post('/auth/register', userData);
                    set({
                        user: data.data,
                        token: data.data.token,
                        isAuthenticated: true,
                    });
                    localStorage.setItem('token', data.data.token);
                    toast.success('Registration successful!');
                    return data.data;
                } catch (error) {
                    toast.error(error.response?.data?.message || 'Registration failed');
                    throw error;
                }
            },

            logout: () => {
                set({ user: null, token: null, isAuthenticated: false });
                localStorage.removeItem('token');
                localStorage.removeItem('access_token');
                localStorage.removeItem('user');
                sessionStorage.removeItem('code_verifier');
                toast.success('Logged out successfully');
            },

            fetchUser: async () => {
                try {
                    // Sync token from localStorage to Zustand state
                    const storedToken = localStorage.getItem('access_token') || localStorage.getItem('token');

                    if (!storedToken) {
                        // No token available, clear auth state
                        set({ user: null, token: null, isAuthenticated: false });
                        throw new Error('No authentication token found');
                    }

                    const { data } = await api.get('/auth/me');
                    set({
                        user: data.data,
                        token: storedToken,
                        isAuthenticated: true
                    });
                    return data.data;
                } catch (error) {
                    console.error('Fetch user error:', error);
                    // Clear auth state on error (token expired or invalid)
                    set({ user: null, token: null, isAuthenticated: false });
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    sessionStorage.removeItem('code_verifier');
                    throw error;
                }
            },

            updateUser: (userData) => {
                if (!userData || typeof userData !== 'object') {
                    console.warn('Invalid user data provided to updateUser');
                    return;
                }
                set((state) => {
                    // Only update if there are actual changes
                    const hasChanges = Object.keys(userData).some(
                        key => state.user?.[key] !== userData[key]
                    );
                    if (!hasChanges) return state;

                    return {
                        user: { ...state.user, ...userData },
                    };
                });
            },
        }),
        {
            name: 'auth-storage',
        }
    )
);
