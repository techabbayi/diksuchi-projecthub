import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Button } from '../components/ui/Button';
import { GraduationCap, Mail, ArrowLeft, CheckCircle, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../lib/api';

const ForgotPassword = () => {
    const [step, setStep] = useState('email'); // email, otp, newPassword, success
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/forgot-password', { email });
            toast.success('OTP sent to your email!');
            setStep('otp');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/verify-otp', { email, otp });
            toast.success('OTP verified successfully!');
            setStep('newPassword');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/reset-password', { email, otp, newPassword });
            toast.success('Password reset successfully!');
            setStep('success');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
            {/* Background decorative elements */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.15),transparent_50%)]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(20,184,166,0.15),transparent_50%)]"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md space-y-8 relative z-10"
            >
                {/* Header */}
                <div className="text-center">
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/15 mb-6"
                    >
                        <GraduationCap className="h-8 w-8 text-white" />
                    </motion.div>
                    <h2 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                        {step === 'success' ? 'Password Reset' : 'Forgot Password'}
                    </h2>
                    <p className="mt-3 text-gray-600 dark:text-gray-400 text-lg">
                        {step === 'email' && "We'll send you an OTP to reset your password"}
                        {step === 'otp' && 'Enter the OTP sent to your email'}
                        {step === 'newPassword' && 'Create a new password for your account'}
                        {step === 'success' && 'Your password has been successfully reset'}
                    </p>
                </div>

                {/* Card */}
                <Card className="border-none shadow-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
                    <CardHeader className="space-y-1 pb-6">
                        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                            {step === 'email' && 'Reset Password'}
                            {step === 'otp' && 'Verify OTP'}
                            {step === 'newPassword' && 'New Password'}
                            {step === 'success' && 'Success!'}
                        </CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-400">
                            {step === 'email' && 'Enter your email address to receive an OTP'}
                            {step === 'otp' && 'Check your email for the verification code'}
                            {step === 'newPassword' && 'Choose a strong password'}
                            {step === 'success' && 'You can now login with your new password'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {step === 'email' && (
                            <form onSubmit={handleSendOTP} className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-gray-700 dark:text-gray-300 font-medium">
                                        Email Address
                                    </Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="john@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="pl-11 h-12 border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                            required
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/15 hover:shadow-xl hover:shadow-emerald-500/20 transition-all"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center">
                                            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                                            Sending OTP...
                                        </span>
                                    ) : (
                                        'Send OTP'
                                    )}
                                </Button>
                            </form>
                        )}

                        {step === 'otp' && (
                            <form onSubmit={handleVerifyOTP} className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="otp" className="text-gray-700 dark:text-gray-300 font-medium">
                                        Enter OTP
                                    </Label>
                                    <Input
                                        id="otp"
                                        type="text"
                                        placeholder="123456"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className="h-12 text-center text-2xl tracking-widest border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        maxLength={6}
                                        required
                                    />
                                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                                        Sent to {email}
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1 h-12"
                                        onClick={() => setStep('email')}
                                    >
                                        Change Email
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-1 h-12 text-base font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                                        ) : (
                                            'Verify OTP'
                                        )}
                                    </Button>
                                </div>

                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="w-full text-emerald-600 hover:text-emerald-700"
                                    onClick={handleSendOTP}
                                    disabled={loading}
                                >
                                    Resend OTP
                                </Button>
                            </form>
                        )}

                        {step === 'newPassword' && (
                            <form onSubmit={handleResetPassword} className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="newPassword" className="text-gray-700 dark:text-gray-300 font-medium">
                                        New Password
                                    </Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <Input
                                            id="newPassword"
                                            type="password"
                                            placeholder="••••••••"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="pl-11 h-12 border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Must be at least 6 characters</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword" className="text-gray-700 dark:text-gray-300 font-medium">
                                        Confirm Password
                                    </Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            placeholder="••••••••"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="pl-11 h-12 border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                    {newPassword && confirmPassword && newPassword !== confirmPassword && (
                                        <p className="text-xs text-red-600 dark:text-red-400">Passwords do not match</p>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/15 hover:shadow-xl hover:shadow-emerald-500/20 transition-all"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center">
                                            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                                            Resetting Password...
                                        </span>
                                    ) : (
                                        'Reset Password'
                                    )}
                                </Button>
                            </form>
                        )}

                        {step === 'success' && (
                            <div className="text-center space-y-6">
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                                    <CheckCircle className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                        Password Reset Successful!
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        You can now login with your new password
                                    </p>
                                </div>
                                <Link to="/login">
                                    <Button className="w-full h-12 text-base font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white">
                                        Go to Login
                                    </Button>
                                </Link>
                            </div>
                        )}

                        {step !== 'success' && (
                            <div className="mt-6 text-center">
                                <Link to="/login" className="inline-flex items-center text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium hover:underline">
                                    <ArrowLeft className="h-4 w-4 mr-1" />
                                    Back to Login
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
