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
            initAuth: async () => {
                const storedToken = localStorage.getItem('access_token') || localStorage.getItem('token');
                if (storedToken && !get().token) {
                    set({ token: storedToken });
                    // Try to fetch user data to restore full auth state
                    try {
                        await get().fetchUser();
                    } catch (error) {
                        // If token is invalid, clear it
                        console.warn('Token validation failed during init, clearing auth state');
                    }
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

            // Optimized fetchUser with caching and faster execution
            fetchUser: async () => {
                try {
                    // Use OAuth token with priority, fallback to regular token
                    const oauthToken = localStorage.getItem('access_token');
                    const regularToken = localStorage.getItem('token');
                    const storedToken = oauthToken || regularToken;

                    if (!storedToken) {
                        set({ user: null, token: null, isAuthenticated: false });
                        throw new Error('No authentication token found');
                    }

                    // Check if user data is already cached and token hasn't changed
                    const currentState = get();
                    if (currentState.user && currentState.token === storedToken && currentState.isAuthenticated) {
                        return currentState.user; // Return cached user immediately
                    }

                    // Fetch with timeout for faster performance
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

                    try {
                        const { data } = await api.get('/auth/me', {
                            signal: controller.signal,
                            timeout: 8000 // Additional axios timeout
                        });

                        clearTimeout(timeoutId);

                        // Update state with fetched user data
                        const userData = data.data;
                        set({
                            user: userData,
                            token: storedToken,
                            isAuthenticated: true
                        });

                        return userData;
                    } catch (fetchError) {
                        clearTimeout(timeoutId);
                        if (fetchError.name === 'AbortError') {
                            throw new Error('User fetch timed out. Please check your connection.');
                        }
                        throw fetchError;
                    }
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
