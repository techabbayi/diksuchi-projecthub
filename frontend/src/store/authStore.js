import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/api';
import toast from 'react-hot-toast';

export const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,

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
                localStorage.removeItem('user');
                toast.success('Logged out successfully');
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
