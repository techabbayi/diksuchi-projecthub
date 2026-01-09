// Performance optimization utilities for faster authentication
export const authPerformanceOptimizer = {
    // Preload critical authentication resources
    preloadAuthResources: () => {
        // Preload OAuth endpoints for faster token exchange
        const authServerUrl = import.meta.env.VITE_DIKSUCHI_AUTH_SERVER_URL;
        if (authServerUrl) {
            // DNS prefetch for faster domain resolution
            const linkDns = document.createElement('link');
            linkDns.rel = 'dns-prefetch';
            linkDns.href = authServerUrl;
            document.head.appendChild(linkDns);

            // Preconnect for faster connection establishment
            const linkPreconnect = document.createElement('link');
            linkPreconnect.rel = 'preconnect';
            linkPreconnect.href = authServerUrl;
            linkPreconnect.crossOrigin = 'anonymous';
            document.head.appendChild(linkPreconnect);
        }

        // Preload API endpoint
        const apiUrl = import.meta.env.VITE_API_URL;
        if (apiUrl) {
            const linkApiDns = document.createElement('link');
            linkApiDns.rel = 'dns-prefetch';
            linkApiDns.href = apiUrl;
            document.head.appendChild(linkApiDns);

            const linkApiPreconnect = document.createElement('link');
            linkApiPreconnect.rel = 'preconnect';
            linkApiPreconnect.href = apiUrl;
            linkApiPreconnect.crossOrigin = 'anonymous';
            document.head.appendChild(linkApiPreconnect);
        }
    },

    // Initialize performance optimizations
    init: () => {
        // Run preload when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', authPerformanceOptimizer.preloadAuthResources);
        } else {
            authPerformanceOptimizer.preloadAuthResources();
        }

        // Preload critical authentication state
        authPerformanceOptimizer.preloadAuthState();
    },

    // Preload authentication state for instant access
    preloadAuthState: () => {
        const token = localStorage.getItem('access_token') || localStorage.getItem('token');
        if (token) {
            // Store in memory for instant access
            window.__AUTH_TOKEN__ = token;

            // Validate token format to avoid bad tokens reaching the server
            try {
                const parts = token.split('.');
                if (parts.length === 3) {
                    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));

                    // Check if token is expired
                    if (payload.exp && payload.exp * 1000 < Date.now()) {
                        // Token expired, clear it
                        localStorage.removeItem('access_token');
                        localStorage.removeItem('token');
                        window.__AUTH_TOKEN__ = null;
                    } else {
                        // Cache user ID for faster access
                        window.__USER_ID__ = payload.sub || payload.id;
                    }
                }
            } catch (e) {
                // Invalid token format, clear it
                localStorage.removeItem('access_token');
                localStorage.removeItem('token');
                window.__AUTH_TOKEN__ = null;
            }
        }
    },

    // Fast token validation without API call
    isTokenValid: () => {
        const token = window.__AUTH_TOKEN__ || localStorage.getItem('access_token') || localStorage.getItem('token');
        if (!token) return false;

        try {
            const parts = token.split('.');
            if (parts.length !== 3) return false;

            const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
            return payload.exp ? payload.exp * 1000 > Date.now() : true;
        } catch (e) {
            return false;
        }
    },

    // Get cached user ID without API call
    getCachedUserId: () => {
        return window.__USER_ID__ || null;
    }
};