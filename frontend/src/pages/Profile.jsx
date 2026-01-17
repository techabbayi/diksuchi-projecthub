import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { User, Mail, Lock, Edit2, Check, X, KeyRound, Shield, Settings, UserCircle2, AtSign } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

const Profile = () => {
    const { user, updateUser, fetchUser } = useAuthStore();
    const [activeTab, setActiveTab] = useState('profile');

    // Edit states
    const [editingName, setEditingName] = useState(false);
    const [editingEmail, setEditingEmail] = useState(false);
    const [editingPassword, setEditingPassword] = useState(false);

    // Form data
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [tempName, setTempName] = useState('');
    const [tempEmail, setTempEmail] = useState('');

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // OAuth password change states
    const [oauthPasswordStep, setOauthPasswordStep] = useState(1); // 1: Traditional form, 2: OTP verification
    const [oauthCurrentPassword, setOauthCurrentPassword] = useState('');
    const [oauthNewPassword, setOauthNewPassword] = useState('');
    const [oauthConfirmPassword, setOauthConfirmPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Fetch user data on mount to ensure we have latest data
        const loadUserData = async () => {
            try {
                await fetchUser();
            } catch (error) {
                console.error('Failed to fetch user:', error);
                // Redirect to login if user fetch fails (401 or no token)
                if (error.response?.status === 401 || error.message === 'No authentication token found') {
                    toast.error('Session expired. Please login again.');
                    window.location.href = '/login';
                }
            }
        };
        loadUserData();
    }, [fetchUser]);

    useEffect(() => {
        if (user) {
            setName(user.name || user.username || '');
            setEmail(user.email || '');
            setTempName(user.name || user.username || '');
            setTempEmail(user.email || '');
        }
    }, [user]);

    const handleNameEdit = () => {
        setTempName(name);
        setEditingName(true);
    };

    const handleNameSave = async () => {
        if (!tempName.trim()) {
            toast.error('Name cannot be empty');
            return;
        }

        setLoading(true);
        try {
            const response = await api.put('/auth/profile', { name: tempName.trim() });
            if (response.data.success) {
                setName(tempName);
                updateUser(response.data.data);
                setEditingName(false);
                toast.success('Name updated successfully!');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update name');
        } finally {
            setLoading(false);
        }
    };

    const handleNameCancel = () => {
        setTempName(name);
        setEditingName(false);
    };

    const handleEmailEdit = () => {
        // Prevent email editing for OAuth users
        if (user?.oauthId) {
            toast.error('Cannot change email for OAuth users');
            return;
        }
        setTempEmail(email);
        setEditingEmail(true);
    };

    const handleEmailSave = async () => {
        if (!tempEmail.trim()) {
            toast.error('Email cannot be empty');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(tempEmail)) {
            toast.error('Please enter a valid email');
            return;
        }

        setLoading(true);
        try {
            const response = await api.put('/auth/profile', { email: tempEmail.trim() });
            if (response.data.success) {
                setEmail(tempEmail);
                updateUser(response.data.data);
                setEditingEmail(false);
                toast.success('Email updated successfully!');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update email');
        } finally {
            setLoading(false);
        }
    };

    const handleEmailCancel = () => {
        setTempEmail(email);
        setEditingEmail(false);
    };

    const handlePasswordSave = async () => {
        // Prevent OAuth users from attempting password change
        if (user?.oauthId) {
            toast.error('Cannot change password for OAuth accounts. Please use your OAuth provider to change password.');
            return;
        }

        if (!passwordData.currentPassword) {
            toast.error('Current password is required');
            return;
        }

        if (!passwordData.newPassword) {
            toast.error('New password is required');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            toast.error('New password must be at least 6 characters');
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }

        if (passwordData.currentPassword === passwordData.newPassword) {
            toast.error('New password must be different from current password');
            return;
        }

        setLoading(true);
        try {
            const response = await api.put('/auth/password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });

            if (response.data.success) {
                toast.success('Password changed successfully!');
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                setEditingPassword(false);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordCancel = () => {
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setEditingPassword(false);
    };

    // OAuth password change handlers
    const handleOAuthPasswordStart = async () => {
        if (!oauthCurrentPassword || !oauthNewPassword || !oauthConfirmPassword) {
            toast.error('All fields are required');
            return;
        }

        if (oauthNewPassword.length < 8) {
            toast.error('New password must be at least 8 characters');
            return;
        }

        if (oauthNewPassword !== oauthConfirmPassword) {
            toast.error('New passwords do not match');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/auth/password/request-change', {
                currentPassword: oauthCurrentPassword,
                newPassword: oauthNewPassword
            });

            if (response.data.success) {
                toast.success('OTP sent to your email!');
                setOtpSent(true);
                setOauthPasswordStep(2);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleOAuthPasswordComplete = async () => {
        if (!otp) {
            toast.error('OTP is required');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/auth/password/complete-change', {
                otp,
                newPassword: oauthNewPassword
            });

            if (response.data.success) {
                toast.success('Password changed successfully!');
                setEditingPassword(false);
                setOauthPasswordStep(1);
                setOauthCurrentPassword('');
                setOauthNewPassword('');
                setOauthConfirmPassword('');
                setOtp('');
                setOtpSent(false);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    const handleOAuthPasswordCancel = () => {
        setEditingPassword(false);
        setOauthPasswordStep(1);
        setOauthCurrentPassword('');
        setOauthNewPassword('');
        setOauthConfirmPassword('');
        setOtp('');
        setOtpSent(false);
    };


    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
            <div className="container mx-auto px-4 py-6 sm:py-8">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="mb-6 sm:mb-8">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Manage your account settings and preferences</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
                        {/* Sidebar */}
                        <div className="lg:col-span-3">
                            <Card>
                                <CardContent className="p-4">
                                    <nav className="space-y-1">
                                        <button
                                            onClick={() => setActiveTab('profile')}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'profile'
                                                ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                                                }`}
                                        >
                                            <User className="h-5 w-5" />
                                            <span className="font-medium">Profile</span>
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('account')}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'account'
                                                ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                                                }`}
                                        >
                                            <Settings className="h-5 w-5" />
                                            <span className="font-medium">Account Settings</span>
                                        </button>
                                    </nav>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Main Content */}
                        <div className="lg:col-span-9">
                            {activeTab === 'profile' && (
                                <div className="space-y-6">
                                    {/* Profile Information */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Profile Information</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            {/* Profile Avatar */}
                                            <div className="flex items-center gap-6">
                                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                                                    {user?.avatar ? (
                                                        <img src={user.avatar} alt={name} className="w-full h-full rounded-full object-cover" />
                                                    ) : (
                                                        (name || user?.username || 'U').charAt(0).toUpperCase()
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{name || user?.username}</h3>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">{email}</p>
                                                    {user?.authProvider && user.authProvider !== 'diksuchi' && (
                                                        <div className="mt-1 inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-md">
                                                            <Shield className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                                            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                                                                Managed by Diksuchi OneAuth - {user.authProvider.charAt(0).toUpperCase() + user.authProvider.slice(1)}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Name Field */}
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                                                <div className="flex items-center gap-3">
                                                    {editingName ? (
                                                        <>
                                                            <div className="flex-1 relative">
                                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                                <Input
                                                                    value={tempName}
                                                                    onChange={(e) => setTempName(e.target.value)}
                                                                    className="pl-10"
                                                                    autoFocus
                                                                />
                                                            </div>
                                                            <Button
                                                                size="sm"
                                                                onClick={handleNameSave}
                                                                disabled={loading}
                                                                className="shrink-0"
                                                            >
                                                                <Check className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={handleNameCancel}
                                                                disabled={loading}
                                                                className="shrink-0"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="flex-1 px-4 py-2 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
                                                                <p className="text-gray-900 dark:text-white">{name || 'Not set'}</p>
                                                            </div>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={handleNameEdit}
                                                                className="shrink-0"
                                                            >
                                                                <Edit2 className="h-4 w-4" />
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Email Field */}
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                                                <div className="flex items-center gap-3">
                                                    {editingEmail ? (
                                                        <>
                                                            <div className="flex-1 relative">
                                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                                <Input
                                                                    type="email"
                                                                    value={tempEmail}
                                                                    onChange={(e) => setTempEmail(e.target.value)}
                                                                    className="pl-10"
                                                                    autoFocus
                                                                />
                                                            </div>
                                                            <Button
                                                                size="sm"
                                                                onClick={handleEmailSave}
                                                                disabled={loading}
                                                                className="shrink-0"
                                                            >
                                                                <Check className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={handleEmailCancel}
                                                                disabled={loading}
                                                                className="shrink-0"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="flex-1 px-4 py-2 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
                                                                <p className="text-gray-900 dark:text-white">{email || 'Not set'}</p>
                                                            </div>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={handleEmailEdit}
                                                                className="shrink-0"
                                                            >
                                                                <Edit2 className="h-4 w-4" />
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            {activeTab === 'account' && (
                                <div className="space-y-6">
                                    {/* Password Change */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <KeyRound className="h-5 w-5 text-emerald-600" />
                                                Change Password
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            {user?.oauthId ? (
                                                // OAuth User - DAS Identity password change with traditional form first
                                                <>
                                                    {!editingPassword ? (
                                                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
                                                            <div className="flex items-center gap-3">
                                                                <Shield className="h-5 w-5 text-emerald-600" />
                                                                <div>
                                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">DAS Identity Password</p>
                                                                    <p className="text-xs text-emerald-600 dark:text-emerald-400">Authenticated via DAS Identity</p>
                                                                </div>
                                                            </div>
                                                            <Button
                                                                variant="outline"
                                                                onClick={() => setEditingPassword(true)}
                                                            >
                                                                <Edit2 className="h-4 w-4 mr-2" />
                                                                Change Password
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        // Traditional password change form with OTP flow
                                                        <div className="space-y-4">
                                                            {oauthPasswordStep === 1 && (
                                                                <>
                                                                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                                                        <p className="text-sm text-blue-700 dark:text-blue-300">
                                                                            <strong>DAS Identity Account:</strong> After clicking "Change Password", we'll send an OTP to {user.email} for verification.
                                                                        </p>
                                                                    </div>

                                                                    <div className="space-y-4">
                                                                        <div className="space-y-2">
                                                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Password</label>
                                                                            <div className="relative">
                                                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                                                <Input
                                                                                    type="password"
                                                                                    placeholder="Enter current password"
                                                                                    value={oauthCurrentPassword}
                                                                                    onChange={(e) => setOauthCurrentPassword(e.target.value)}
                                                                                    className="pl-10"
                                                                                    disabled={loading}
                                                                                />
                                                                            </div>
                                                                        </div>

                                                                        <div className="space-y-2">
                                                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
                                                                            <div className="relative">
                                                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                                                <Input
                                                                                    type="password"
                                                                                    placeholder="Enter new password (min. 8 characters)"
                                                                                    value={oauthNewPassword}
                                                                                    onChange={(e) => setOauthNewPassword(e.target.value)}
                                                                                    className="pl-10"
                                                                                    disabled={loading}
                                                                                />
                                                                            </div>
                                                                        </div>

                                                                        <div className="space-y-2">
                                                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Confirm New Password</label>
                                                                            <div className="relative">
                                                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                                                <Input
                                                                                    type="password"
                                                                                    placeholder="Confirm new password"
                                                                                    value={oauthConfirmPassword}
                                                                                    onChange={(e) => setOauthConfirmPassword(e.target.value)}
                                                                                    className="pl-10"
                                                                                    disabled={loading}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex gap-3 pt-2">
                                                                        <Button
                                                                            onClick={handleOAuthPasswordStart}
                                                                            disabled={loading}
                                                                            className="flex-1"
                                                                        >
                                                                            {loading ? 'Sending OTP...' : 'Change Password'}
                                                                        </Button>
                                                                        <Button
                                                                            variant="outline"
                                                                            onClick={handleOAuthPasswordCancel}
                                                                            disabled={loading}
                                                                        >
                                                                            Cancel
                                                                        </Button>
                                                                    </div>
                                                                </>
                                                            )}

                                                            {oauthPasswordStep === 2 && (
                                                                <>
                                                                    <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                                                                        <p className="text-sm text-emerald-700 dark:text-emerald-300">
                                                                            <strong>OTP Sent!</strong> Please check your email ({user.email}) and enter the OTP below to complete password change.
                                                                        </p>
                                                                    </div>

                                                                    <div className="space-y-4">
                                                                        <div className="space-y-2">
                                                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Enter OTP</label>
                                                                            <Input
                                                                                type="text"
                                                                                value={otp}
                                                                                onChange={(e) => setOtp(e.target.value)}
                                                                                placeholder="Enter 6-digit OTP"
                                                                                maxLength="6"
                                                                                disabled={loading}
                                                                                className="text-center text-lg tracking-widest"
                                                                            />
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex gap-3 pt-2">
                                                                        <Button
                                                                            onClick={handleOAuthPasswordComplete}
                                                                            disabled={loading}
                                                                            className="flex-1"
                                                                        >
                                                                            {loading ? 'Verifying...' : 'Verify & Update Password'}
                                                                        </Button>
                                                                        <Button
                                                                            variant="outline"
                                                                            onClick={() => setOauthPasswordStep(1)}
                                                                            disabled={loading}
                                                                        >
                                                                            Back
                                                                        </Button>
                                                                        <Button
                                                                            variant="outline"
                                                                            onClick={handleOAuthPasswordCancel}
                                                                            disabled={loading}
                                                                        >
                                                                            Cancel
                                                                        </Button>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                // Regular User - Show password change form
                                                <>
                                                    {!editingPassword ? (
                                                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
                                                            <div className="flex items-center gap-3">
                                                                <Lock className="h-5 w-5 text-gray-400" />
                                                                <div>
                                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">Password</p>
                                                                    <p className="text-xs text-gray-500 dark:text-gray-400">••••••••</p>
                                                                </div>
                                                            </div>
                                                            <Button
                                                                variant="outline"
                                                                onClick={() => setEditingPassword(true)}
                                                            >
                                                                <Edit2 className="h-4 w-4 mr-2" />
                                                                Change Password
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-4">
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Password</label>
                                                                <div className="relative">
                                                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                                    <Input
                                                                        type="password"
                                                                        placeholder="Enter current password"
                                                                        value={passwordData.currentPassword}
                                                                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                                        className="pl-10"
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
                                                                <div className="relative">
                                                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                                    <Input
                                                                        type="password"
                                                                        placeholder="Enter new password (min. 6 characters)"
                                                                        value={passwordData.newPassword}
                                                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                                        className="pl-10"
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Confirm New Password</label>
                                                                <div className="relative">
                                                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                                    <Input
                                                                        type="password"
                                                                        placeholder="Confirm new password"
                                                                        value={passwordData.confirmPassword}
                                                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                                        className="pl-10"
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="flex gap-3 pt-2">
                                                                <Button
                                                                    onClick={handlePasswordSave}
                                                                    disabled={loading}
                                                                    className="flex-1"
                                                                >
                                                                    {loading ? 'Updating...' : 'Update Password'}
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    onClick={handlePasswordCancel}
                                                                    disabled={loading}
                                                                >
                                                                    Cancel
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
