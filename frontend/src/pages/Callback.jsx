import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { handleCallback } from '../utils/auth';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

const Callback = () => {
    console.log('🚀 [Callback] Component mounted/rendered');
    console.log('📍 [Callback] Current location:', window.location.href);

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [error, setError] = useState(null);
    const { fetchUser } = useAuthStore();
    const hasProcessed = useRef(false);

    useEffect(() => {
        // Log environment info for debugging
        console.log('🌍 [Callback] Environment Info:', {
            href: window.location.href,
            pathname: window.location.pathname,
            hostname: window.location.hostname,
            origin: window.location.origin,
            baseURI: document.baseURI,
        });

        // Prevent double execution (React Strict Mode issue)
        if (hasProcessed.current) {
            console.log('⏭️ [Callback] Already processed, skipping...');
            return;
        }
        hasProcessed.current = true;
        const processCallback = async () => {
            console.log('\n🎯 [Callback] OAuth callback page loaded');
            console.log('📋 [Callback] URL params:', {
                code: searchParams.get('code')?.substring(0, 10) + '...',
                state: searchParams.get('state'),
                error: searchParams.get('error'),
                error_description: searchParams.get('error_description')
            });

            try {
                const code = searchParams.get('code');
                const state = searchParams.get('state');
                const errorParam = searchParams.get('error');

                if (errorParam) {
                    console.log('❌ [Callback] OAuth provider returned error:', errorParam);
                    throw new Error(searchParams.get('error_description') || 'OAuth authorization failed');
                }

                if (!code) {
                    console.log('❌ [Callback] No authorization code in URL');
                    throw new Error('No authorization code received');
                }

                // Verify state parameter (CSRF protection)
                const storedState = sessionStorage.getItem('oauth_state');
                console.log('🔒 [Callback] Verifying state parameter...');
                console.log('📋 [Callback] Received state:', state);
                console.log('📋 [Callback] Stored state:', storedState);

                if (!state || !storedState || state !== storedState) {
                    console.log('❌ [Callback] State mismatch - possible CSRF attack!');
                    throw new Error('Invalid state parameter. Please try logging in again.');
                }
                console.log('✅ [Callback] State verified successfully');

                console.log('✅ [Callback] Authorization code received, exchanging for token...');

                // Clear any old tokens first (but keep code_verifier - we need it!)
                console.log('🧹 [Callback] Clearing old tokens...');
                localStorage.removeItem('token');
                localStorage.removeItem('access_token');

                // Exchange code for token
                console.log('🔄 [Callback] Calling handleCallback with code...');
                console.log('📋 [Callback] Code:', code.substring(0, 20) + '...');
                console.log('📋 [Callback] Code verifier present:', !!sessionStorage.getItem('code_verifier'));

                const token = await handleCallback(code);
                console.log('✅ [Callback] handleCallback returned token:', token ? token.substring(0, 30) + '...' : 'NULL!');

                // Verify token was stored
                const storedToken = localStorage.getItem('access_token');
                console.log('🔍 [Callback] Token in localStorage:', storedToken ? storedToken.substring(0, 30) + '...' : 'NOT STORED!');

                if (!storedToken) {
                    throw new Error('Token was not saved to localStorage after exchange');
                }

                // Clean up OAuth session data
                console.log('🧹 [Callback] Cleaning up OAuth session data...');
                sessionStorage.removeItem('oauth_state');
                // Note: code_verifier is removed in handleCallback after use

                console.log('✅ [Callback] Token exchange successful!');
                console.log('👤 [Callback] Now fetching user data...');

                // Fetch user data with error handling
                try {
                    await fetchUser();
                } catch (fetchError) {
                    console.error('Failed to fetch user after OAuth:', fetchError);
                    // Don't throw here - we have a valid token, just couldn't fetch user details yet
                    // The user can still access the app
                    toast.error('Login successful, but failed to load user details. Please refresh.');
                }

                // Show success message
                toast.success('Successfully logged in with Diksuchi!');

                // Redirect to dashboard
                navigate('/dashboard');
            } catch (err) {
                console.error('OAuth callback error:', err);
                let errorMessage = err.message || 'Login failed';

                // Provide more helpful error messages
                if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
                    errorMessage = 'Cannot connect to server. Please make sure the backend is running at http://localhost:5000';
                }

                setError(errorMessage);
                toast.error(errorMessage);

                // Redirect to login after 5 seconds
                setTimeout(() => {
                    navigate('/login');
                }, 5000);
            }
        };

        processCallback();
    }, [searchParams, navigate, fetchUser]);

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
                <div className="max-w-md w-full mx-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 text-center">
                        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
                            <svg
                                className="w-8 h-8 text-red-600 dark:text-red-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            Login Failed
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            {error}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-500">
                            Redirecting to login page in 5 seconds...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
            <div className="max-w-md w-full mx-4">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 text-center">
                    <Loader2 className="w-16 h-16 text-emerald-600 dark:text-emerald-400 animate-spin mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Completing Login
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Please wait while we verify your account...
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Callback;
