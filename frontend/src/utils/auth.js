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
        console.log('🚀 [OAuth] Starting login flow...');

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

        console.log('📋 [OAuth] Config:', {
            AUTH_SERVER_URL,
            CLIENT_ID,
            REDIRECT_URI,
            SCOPES
        });

        // Generate PKCE parameters
        const codeVerifier = generateCodeVerifier();
        const codeChallenge = await generateCodeChallenge(codeVerifier);
        console.log('🔐 [OAuth] PKCE generated:', {
            verifier: codeVerifier.substring(0, 10) + '...',
            challenge: codeChallenge.substring(0, 10) + '...'
        });

        // Store code verifier for token exchange
        sessionStorage.setItem('code_verifier', codeVerifier);
        console.log('💾 [OAuth] Stored code_verifier in sessionStorage');

        // Generate and store state for CSRF protection
        const state = generateRandomState();
        sessionStorage.setItem('oauth_state', state);
        console.log('💾 [OAuth] Stored oauth_state in sessionStorage');

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

        console.log('🔗 [OAuth] Full Authorization URL:', authUrl.toString());
        console.log('📍 [OAuth] Now redirecting browser to OAuth provider...');
        console.log('⏳ [OAuth] Please wait for redirect...');

        // Use setTimeout to ensure logs are visible before redirect
        setTimeout(() => {
            window.location.href = authUrl.toString();
        }, 100);
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
        console.log('🚀 [handleCallback] Starting token exchange...');
        console.log('📋 [handleCallback] Code:', code ? code.substring(0, 20) + '...' : 'MISSING!');

        const codeVerifier = sessionStorage.getItem('code_verifier');
        console.log('🔑 [handleCallback] Code verifier:', codeVerifier ? codeVerifier.substring(0, 20) + '...' : 'MISSING!');

        if (!codeVerifier) {
            throw new Error('Code verifier not found. Please try logging in again.');
        }

        // Call auth server directly (CORS is enabled on auth server)
        const baseUrl = AUTH_SERVER_URL.replace(/\/$/, '');
        const tokenEndpoint = `${baseUrl}/api/oauth/token`;
        console.log('🔄 [handleCallback] Exchanging code for token at:', tokenEndpoint);

        const requestBody = {
            grant_type: 'authorization_code',
            code,
            redirect_uri: REDIRECT_URI,
            code_verifier: codeVerifier,
            client_id: CLIENT_ID,
        };
        console.log('📦 [handleCallback] Request body:', JSON.stringify(requestBody, null, 2));

        const response = await fetch(tokenEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(requestBody),
        });

        console.log('📡 [handleCallback] Response status:', response.status, response.statusText);
        console.log('📡 [handleCallback] Response OK:', response.ok);

        if (!response.ok) {
            let errorMessage = 'Token exchange failed';
            try {
                const error = await response.json();
                console.error('❌ [handleCallback] Server error response:', error);
                errorMessage = error.error_description || error.error || error.message || errorMessage;
            } catch (e) {
                // Response wasn't JSON
                errorMessage = `Server error: ${response.status} ${response.statusText}`;
                console.error('❌ [handleCallback] Non-JSON error response:', errorMessage);
            }
            throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log('📦 [handleCallback] Response data:', JSON.stringify(data, null, 2));

        // Auth server returns token directly (not wrapped in data object)
        const access_token = data.access_token;
        console.log('🎫 [handleCallback] Access token:', access_token ? access_token.substring(0, 30) + '...' : 'MISSING!');

        if (!access_token) {
            throw new Error('No access token received from server');
        }

        // Store access token
        console.log('💾 [handleCallback] Saving token to localStorage...');
        localStorage.setItem('access_token', access_token);

        // Verify it was saved
        const saved = localStorage.getItem('access_token');
        console.log('🔍 [handleCallback] Token saved successfully:', saved ? 'YES (' + saved.substring(0, 30) + '...)' : 'NO!');

        // Clean up code verifier
        console.log('🧹 [handleCallback] Removing code_verifier from session...');
        sessionStorage.removeItem('code_verifier');

        console.log('✅ [handleCallback] Token exchange complete!');
        return access_token;
    } catch (error) {
        console.error('❌ [handleCallback] OAuth callback error:', error);
        console.error('❌ [handleCallback] Error message:', error.message);
        console.error('❌ [handleCallback] Error stack:', error.stack);
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
