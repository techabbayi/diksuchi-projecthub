// OAuth authentication utilities with PKCE
// Diksuchi OAuth Configuration
const AUTH_SERVER_URL = import.meta.env.VITE_DIKSUCHI_AUTH_SERVER_URL;
const CLIENT_ID = import.meta.env.VITE_DIKSUCHI_CLIENT_ID || 'projectshub';
const REDIRECT_URI = import.meta.env.VITE_DIKSUCHI_REDIRECT_URI || 'http://localhost:5173/callback';
const SCOPES = 'openid profile email';

// Generate random code verifier for PKCE
export const generateCodeVerifier = () => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return base64URLEncode(array);
};

// Generate code challenge from verifier
export const generateCodeChallenge = async (verifier) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return base64URLEncode(new Uint8Array(hash));
};

// Base64 URL encode helper
const base64URLEncode = (buffer) => {
    const base64 = btoa(String.fromCharCode(...buffer));
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
};

// Initiate OAuth login flow
export const login = async () => {
    try {
        // Validate configuration
        if (!AUTH_SERVER_URL) {
            throw new Error('OAuth server URL not configured. Please set VITE_DIKSUCHI_AUTH_SERVER_URL');
        }
        if (!CLIENT_ID) {
            throw new Error('Client ID not configured. Please set VITE_DIKSUCHI_CLIENT_ID');
        }
        if (!REDIRECT_URI) {
            throw new Error('Redirect URI not configured. Please set VITE_DIKSUCHI_REDIRECT_URI');
        }

        // Generate PKCE parameters
        const codeVerifier = generateCodeVerifier();
        const codeChallenge = await generateCodeChallenge(codeVerifier);

        // Store code verifier for token exchange
        sessionStorage.setItem('code_verifier', codeVerifier);

        // Generate and store state for CSRF protection
        const state = generateRandomState();
        sessionStorage.setItem('oauth_state', state);

        // Build authorization URL (handle trailing slashes)
        const baseUrl = AUTH_SERVER_URL.replace(/\/$/, '');
        const authUrl = new URL(`${baseUrl}/api/oauth/authorize`);
        authUrl.searchParams.append('response_type', 'code');
        authUrl.searchParams.append('client_id', CLIENT_ID);
        authUrl.searchParams.append('redirect_uri', REDIRECT_URI);
        authUrl.searchParams.append('scope', SCOPES);
        authUrl.searchParams.append('code_challenge', codeChallenge);
        authUrl.searchParams.append('code_challenge_method', 'S256');
        authUrl.searchParams.append('state', state);

        // Redirect to OAuth provider
        window.location.href = authUrl.toString();
    } catch (error) {
        console.error('OAuth login error:', error);
        throw error;
    }
};

// Generate random state for CSRF protection
const generateRandomState = () => {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return base64URLEncode(array);
};

// Handle OAuth callback and exchange code for token
export const handleCallback = async (code) => {
    try {
        const codeVerifier = sessionStorage.getItem('code_verifier');

        if (!codeVerifier) {
            throw new Error('Code verifier not found. Please try logging in again.');
        }

        // Call auth server directly (CORS is enabled on auth server)
        const baseUrl = AUTH_SERVER_URL.replace(/\/$/, '');
        const tokenEndpoint = `${baseUrl}/api/oauth/token`;

        const requestBody = {
            grant_type: 'authorization_code',
            code,
            redirect_uri: REDIRECT_URI,
            code_verifier: codeVerifier,
            client_id: CLIENT_ID,
        };

        // Optimized fetch with timeout for faster performance
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        try {
            const response = await fetch(tokenEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                let errorMessage = 'Token exchange failed';
                try {
                    const error = await response.json();
                    errorMessage = error.error_description || error.error || error.message || errorMessage;
                } catch (e) {
                    errorMessage = `Server error: ${response.status} ${response.statusText}`;
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            const access_token = data.access_token;

            if (!access_token) {
                throw new Error('No access token received from server');
            }

            // Store access token immediately with both keys for compatibility
            localStorage.setItem('access_token', access_token);
            localStorage.setItem('token', access_token); // Fallback compatibility

            // Clean up code verifier
            sessionStorage.removeItem('code_verifier');

            return access_token;
        } catch (fetchError) {
            clearTimeout(timeoutId);
            if (fetchError.name === 'AbortError') {
                throw new Error('Token exchange timed out. Please try again.');
            }
            throw fetchError;
        }
    } catch (error) {
        console.error('OAuth callback error:', error);
        sessionStorage.removeItem('code_verifier');
        throw error;
    }
};

// Get stored token
export const getToken = () => {
    return localStorage.getItem('access_token');
};

// Check if user is authenticated
export const isAuthenticated = () => {
    return !!getToken();
};

// Logout - clear tokens
export const logout = () => {
    localStorage.removeItem('access_token');
    sessionStorage.removeItem('code_verifier');
};

// Decode JWT token (client-side only - don't trust for security!)
export const decodeToken = (token) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Token decode error:', error);
        return null;
    }
};

// Get current user from token
export const getCurrentUser = () => {
    const token = getToken();
    if (!token) return null;

    const decoded = decodeToken(token);
    if (!decoded) return null;

    return {
        id: decoded.sub,
        email: decoded.email,
        name: decoded.name,
        apps: decoded.apps,
    };
};
