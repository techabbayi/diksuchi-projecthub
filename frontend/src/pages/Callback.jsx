import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { handleCallback } from '../utils/auth';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

const Callback = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [error, setError] = useState(null);
    const { fetchUser } = useAuthStore();
    const hasProcessed = useRef(false);

    useEffect(() => {
        // Prevent double execution (React Strict Mode issue)
        if (hasProcessed.current) {
            return;
        }
        hasProcessed.current = true;

        const processCallback = async () => {
            try {
                const code = searchParams.get('code');
                const state = searchParams.get('state');
                const errorParam = searchParams.get('error');

                if (errorParam) {
                    throw new Error(searchParams.get('error_description') || 'OAuth authorization failed');
                }

                if (!code) {
                    throw new Error('No authorization code received');
                }

                // Verify state parameter for CSRF protection
                const storedState = sessionStorage.getItem('oauth_state');
                if (!state || state !== storedState) {
                    throw new Error('Invalid state parameter - possible security threat');
                }

                // Exchange code for token (optimized with timeout)
                const token = await handleCallback(code);

                if (!token) {
                    throw new Error('Failed to obtain access token');
                }

                // Clean up OAuth session data immediately
                sessionStorage.removeItem('oauth_state');

                // Show success message immediately
                toast.success('Successfully logged in!', {
                    duration: 2000,
                    position: 'top-center'
                });

                // Fetch user data in background while redirecting (don't wait)
                fetchUser().catch(fetchError => {
                    console.error('Background user fetch failed:', fetchError);
                    // User can still use the app, just refresh to get user data
                });

                // Immediate redirect for faster UX (don't wait for user fetch)
                navigate('/dashboard', { replace: true });

            } catch (err) {
                console.error('OAuth callback error:', err);
                let errorMessage = err.message || 'Login failed';

                // Provide more helpful error messages
                if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
                    errorMessage = 'Cannot connect to server. Please check your connection.';
                }
                if (errorMessage.includes('timed out')) {
                    errorMessage = 'Login is taking longer than expected. Please try again.';
                }

                setError(errorMessage);
                toast.error(errorMessage);

                // Faster redirect on error
                setTimeout(() => {
                    navigate('/login');
                }, 5000); // Reduced from 15s to 5s
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
