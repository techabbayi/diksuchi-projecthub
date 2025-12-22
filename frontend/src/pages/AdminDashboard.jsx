import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { formatCurrency, formatDate } from '../lib/utils';
import { Users, FolderKanban, DollarSign, TrendingUp, Check, X, Upload, Sparkles, AlertCircle, Clock, CheckCircle2, XCircle, Send, FileText, Zap, RefreshCw, Plus, Minus, History, Award, Edit2, Trash2, BarChart3, Database, Cloud, MessageSquare, Activity, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState(null);
    const [pendingProjects, setPendingProjects] = useState([]);
    const [users, setUsers] = useState([]);
    const [quotaRequests, setQuotaRequests] = useState([]);
    const [customProjects, setCustomProjects] = useState([]);
    const [customProjectStats, setCustomProjectStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [rejectionReason, setRejectionReason] = useState('');
    const [selectedProject, setSelectedProject] = useState(null);
    const [adminNote, setAdminNote] = useState('');
    const [selectedRequest, setSelectedRequest] = useState(null);

    // AI Credits Management State
    const [creditsData, setCreditsData] = useState([]);
    const [creditsStats, setCreditsStats] = useState(null);
    const [creditSearch, setCreditSearch] = useState('');
    const [creditPage, setCreditPage] = useState(1);
    const [creditsPagination, setCreditsPagination] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [creditAction, setCreditAction] = useState('add');
    const [creditAmount, setCreditAmount] = useState('');
    const [showCreditModal, setShowCreditModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [creditHistory, setCreditHistory] = useState([]);
    const [showDefaultCreditsModal, setShowDefaultCreditsModal] = useState(false);
    const [defaultCredits, setDefaultCredits] = useState(50);
    const [defaultDailyLimit, setDefaultDailyLimit] = useState(50);

    // Projects Management State
    const [allProjects, setAllProjects] = useState([]);
    const [projectsPage, setProjectsPage] = useState(1);
    const [projectsPagination, setProjectsPagination] = useState(null);
    const [projectSearch, setProjectSearch] = useState('');
    const [projectFilter, setProjectFilter] = useState({ status: '', type: '' });
    const [selectedProjectForEdit, setSelectedProjectForEdit] = useState(null);
    const [showProjectEditModal, setShowProjectEditModal] = useState(false);

    // Analytics State
    const [analyticsData, setAnalyticsData] = useState(null);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        try {
            const promises = [
                api.get('/admin/stats'),
                api.get('/admin/projects/pending'),
                api.get('/admin/users'),
            ];

            if (activeTab === 'quota-requests') {
                promises.push(api.get('/admin/quota-requests'));
            }

            if (activeTab === 'custom-projects') {
                promises.push(api.get('/admin/custom-projects'));
                promises.push(api.get('/admin/custom-projects/stats'));
            }

            const results = await Promise.all(promises);

            setStats(results[0].data.data);
            setPendingProjects(results[1].data.data);
            setUsers(results[2].data.data);

            if (activeTab === 'quota-requests' && results[3]) {
                setQuotaRequests(results[3].data.data);
            }

            if (activeTab === 'custom-projects' && results[3] && results[4]) {
                setCustomProjects(results[3].data.data);
                setCustomProjectStats(results[4].data.data);
            }

            if (activeTab === 'ai-credits') {
                fetchCreditsData();
            }

            if (activeTab === 'projects') {
                fetchAllProjects();
            }

            if (activeTab === 'analytics') {
                fetchAnalytics();
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load admin data');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            await api.put(`/admin/projects/${id}/approve`);
            toast.success('Project approved!');
            fetchData();
        } catch (error) {
            toast.error('Failed to approve project');
        }
    };

    const handleReject = async (id) => {
        if (!rejectionReason) {
            toast.error('Please provide a rejection reason');
            return;
        }

        try {
            await api.put(`/admin/projects/${id}/reject`, { reason: rejectionReason });
            toast.success('Project rejected');
            setSelectedProject(null);
            setRejectionReason('');
            fetchData();
        } catch (error) {
            toast.error('Failed to reject project');
        }
    };

    const handleDeleteUser = async (id) => {
        if (!confirm('Are you sure you want to delete this user?')) return;

        try {
            await api.delete(`/admin/users/${id}`);
            toast.success('User deleted');
            fetchData();
        } catch (error) {
            toast.error('Failed to delete user');
        }
    };

    const handleRoleChange = async (id, newRole) => {
        try {
            await api.put(`/admin/users/${id}/role`, { role: newRole });
            toast.success('User role updated');
            fetchData();
        } catch (error) {
            toast.error('Failed to update role');
        }
    };

    const handleApproveQuotaRequest = async (quotaId, requestId) => {
        if (!confirm('Confirm payment received? This will allow the user to create one more custom project.')) {
            return;
        }

        try {
            await api.put(`/admin/quota-requests/${quotaId}/approve/${requestId}`, {
                paymentConfirmed: true,
                adminNote: adminNote || 'Payment confirmed, quota increased'
            });
            toast.success('Quota request approved!');
            setSelectedRequest(null);
            setAdminNote('');
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to approve request');
        }
    };

    const handleRejectQuotaRequest = async (quotaId, requestId) => {
        if (!adminNote) {
            toast.error('Please provide a reason for rejection');
            return;
        }

        try {
            await api.put(`/admin/quota-requests/${quotaId}/reject/${requestId}`, {
                adminNote
            });
            toast.success('Quota request rejected');
            setSelectedRequest(null);
            setAdminNote('');
            fetchData();
        } catch (error) {
            toast.error('Failed to reject request');
        }
    };

    // ==================== AI CREDITS MANAGEMENT FUNCTIONS ====================

    const fetchCreditsData = async () => {
        try {
            const response = await api.get('/admin/ai-credits', {
                params: { page: creditPage, limit: 20, search: creditSearch }
            });
            setCreditsData(response.data.data);
            setCreditsPagination(response.data.pagination);

            // Calculate stats
            const stats = {
                totalUsers: response.data.data.length,
                premiumUsers: response.data.data.filter(u => u.isPremium).length,
                totalCreditsUsed: response.data.data.reduce((sum, u) => sum + (u.totalUsed || 0), 0),
                avgCredits: response.data.data.length > 0
                    ? Math.round(response.data.data.reduce((sum, u) => sum + u.credits, 0) / response.data.data.length)
                    : 0
            };
            setCreditsStats(stats);
        } catch (error) {
            console.error('Error fetching credits:', error);
            toast.error('Failed to load credits data');
        }
    };

    const handleUpdateCredits = async () => {
        if (!selectedUser || !creditAmount) {
            toast.error('Please enter a valid amount');
            return;
        }

        try {
            await api.put(`/admin/ai-credits/${selectedUser._id}`, {
                action: creditAction,
                credits: parseInt(creditAmount)
            });
            toast.success(`Credits ${creditAction === 'add' ? 'added' : creditAction === 'deduct' ? 'deducted' : 'set'} successfully!`);
            setShowCreditModal(false);
            setSelectedUser(null);
            setCreditAmount('');
            fetchCreditsData();
        } catch (error) {
            toast.error('Failed to update credits');
        }
    };

    const handleTogglePremium = async (user) => {
        try {
            await api.put(`/admin/ai-credits/${user._id}`, {
                isPremium: !user.isPremium
            });
            toast.success(`Premium ${!user.isPremium ? 'activated' : 'deactivated'} for ${user.username}`);
            fetchCreditsData();
        } catch (error) {
            toast.error('Failed to update premium status');
        }
    };

    const handleViewHistory = async (user) => {
        try {
            const response = await api.get(`/admin/ai-credits/${user._id}/history`);
            setCreditHistory(response.data.data.history || []);
            setSelectedUser(user);
            setShowHistoryModal(true);
        } catch (error) {
            toast.error('Failed to load credit history');
        }
    };

    const handleResetAllCredits = async () => {
        if (!confirm('Are you sure you want to reset all non-premium user credits to daily limit?')) {
            return;
        }

        try {
            const response = await api.post('/admin/ai-credits/reset-all');
            toast.success(response.data.message);
            fetchCreditsData();
        } catch (error) {
            toast.error('Failed to reset credits');
        }
    };

    const fetchDefaultCredits = async () => {
        try {
            const response = await api.get('/admin/ai-credits/defaults');
            setDefaultCredits(response.data.data.defaultCredits);
            setDefaultDailyLimit(response.data.data.defaultDailyLimit);
        } catch (error) {
            toast.error('Failed to load default credit settings');
        }
    };

    const handleUpdateDefaultCredits = async () => {
        if (defaultCredits < 0 || defaultDailyLimit < 0) {
            toast.error('Credits must be non-negative');
            return;
        }

        try {
            await api.put('/admin/ai-credits/defaults', {
                defaultCredits,
                defaultDailyLimit
            });
            toast.success('Default credit settings updated successfully');
            setShowDefaultCreditsModal(false);
            fetchCreditsData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update default credits');
        }
    };

    // ==================== PROJECTS MANAGEMENT FUNCTIONS ====================

    const fetchAllProjects = async () => {
        try {
            const response = await api.get('/admin/projects/all', {
                params: {
                    page: projectsPage,
                    limit: 20,
                    search: projectSearch,
                    status: projectFilter.status,
                    type: projectFilter.type
                }
            });
            setAllProjects(response.data.data);
            setProjectsPagination(response.data.pagination);
        } catch (error) {
            toast.error('Failed to load projects');
        }
    };

    const handleUpdateProject = async (projectId, updates) => {
        try {
            await api.put(`/admin/projects/${projectId}`, updates);
            toast.success('Project updated successfully');
            setShowProjectEditModal(false);
            setSelectedProjectForEdit(null);
            fetchAllProjects();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update project');
        }
    };

    const handleDeleteProject = async (projectId) => {
        if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
            return;
        }

        try {
            await api.delete(`/admin/projects/${projectId}`);
            toast.success('Project deleted successfully');
            fetchAllProjects();
        } catch (error) {
            toast.error('Failed to delete project');
        }
    };

    // ==================== ANALYTICS FUNCTIONS ====================

    const fetchAnalytics = async () => {
        try {
            const response = await api.get('/admin/analytics');
            setAnalyticsData(response.data.data);
        } catch (error) {
            toast.error('Failed to load analytics');
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-heading">Admin Dashboard</h1>
                        <p className="text-sm sm:text-base text-muted-foreground mt-2">Manage your platform and users</p>
                    </div>
                    <Button onClick={() => navigate('/admin/bulk-upload')} className="gap-2">
                        <Upload className="h-4 w-4" />
                        Bulk Upload Projects
                    </Button>
                </div>

                {/* Tabs */}
                <div className="border-b">
                    <div className="flex space-x-4 overflow-x-auto">
                        {['overview', 'projects', 'pending', 'quota-requests', 'custom-projects', 'ai-credits', 'analytics', 'users'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 capitalize border-b-2 transition-colors whitespace-nowrap ${activeTab === tab
                                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 font-medium'
                                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                                    }`}
                            >
                                {tab.replace(/-/g, ' ')}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats?.users?.total || 0}</div>
                                    <p className="text-xs text-muted-foreground">
                                        {stats?.users?.creators || 0} creators
                                    </p>
                                </CardContent>
                            </Card>

                            <Card
                                className="cursor-pointer hover:shadow-lg transition-shadow"
                                onClick={() => setActiveTab('projects')}
                            >
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                                    <FolderKanban className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats?.projects?.total || 0}</div>
                                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                        Click to manage →
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {formatCurrency(stats?.revenue?.totalRevenue || 0)}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {stats?.transactions?.total || 0} transactions
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Admin Commission</CardTitle>
                                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {formatCurrency(stats?.revenue?.adminCommission || 0)}
                                    </div>
                                    <p className="text-xs text-muted-foreground">Platform earnings</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Top Projects */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Top Performing Projects</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {stats?.topProjects?.map((project, index) => (
                                        <div key={project._id} className="flex items-center justify-between py-2">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl font-bold text-muted-foreground">
                                                    #{index + 1}
                                                </span>
                                                <div>
                                                    <p className="font-medium">{project.title}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        by {project.author?.username}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold">{project.sales || 0} sales</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatCurrency(project.revenue || 0)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Transactions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Transactions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left py-2 sm:py-3 px-3 sm:px-4 text-sm sm:text-base">User</th>
                                                <th className="text-left py-2 sm:py-3 px-3 sm:px-4 text-sm sm:text-base">Project</th>
                                                <th className="text-left py-2 sm:py-3 px-3 sm:px-4 text-sm sm:text-base">Amount</th>
                                                <th className="text-left py-2 sm:py-3 px-3 sm:px-4 text-sm sm:text-base">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {stats?.recentTransactions?.map((transaction) => (
                                                <tr key={transaction._id} className="border-b">
                                                    <td className="py-2 sm:py-3 px-3 sm:px-4 text-sm sm:text-base">{transaction.user?.username}</td>
                                                    <td className="py-2 sm:py-3 px-3 sm:px-4 text-sm sm:text-base truncate max-w-[150px] sm:max-w-none">{transaction.project?.title}</td>
                                                    <td className="py-2 sm:py-3 px-3 sm:px-4 text-sm sm:text-base">{formatCurrency(transaction.amount)}</td>
                                                    <td className="py-2 sm:py-3 px-3 sm:px-4 text-sm sm:text-base">{formatDate(transaction.createdAt)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Pending Projects Tab */}
                {activeTab === 'pending' && (
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Pending Projects ({pendingProjects.length})</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {pendingProjects.length === 0 ? (
                                    <p className="text-center py-8 text-muted-foreground">
                                        No pending projects to review
                                    </p>
                                ) : (
                                    <div className="space-y-4">
                                        {pendingProjects.map((project) => (
                                            <div
                                                key={project._id}
                                                className="border rounded-lg p-3 sm:p-4 hover:bg-muted/50 transition-colors"
                                            >
                                                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                                    <img
                                                        src={project.screenshots?.[0] || 'https://via.placeholder.com/150'}
                                                        alt={project.title}
                                                        className="w-full sm:w-32 h-48 sm:h-32 rounded object-cover"
                                                    />
                                                    <div className="flex-1 space-y-2">
                                                        <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                                                            <div>
                                                                <h3 className="text-lg sm:text-xl font-bold">{project.title}</h3>
                                                                <p className="text-sm text-muted-foreground">
                                                                    by {project.author?.username} • {formatDate(project.createdAt)}
                                                                </p>
                                                            </div>
                                                            <Badge>{formatCurrency(project.price)}</Badge>
                                                        </div>
                                                        <p className="text-sm line-clamp-2">{project.description}</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {project.techStack?.slice(0, 5).map((tech, index) => (
                                                                <Badge key={index} variant="secondary">
                                                                    {tech}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                        <div className="flex flex-wrap gap-2 pt-2">
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleApprove(project._id)}
                                                                className="bg-green-600 hover:bg-green-700"
                                                            >
                                                                <Check className="h-4 w-4 mr-1" />
                                                                Approve
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="destructive"
                                                                onClick={() => setSelectedProject(project._id)}
                                                            >
                                                                <X className="h-4 w-4 mr-1" />
                                                                Reject
                                                            </Button>
                                                            {project.mode === 'github' && project.githubLink && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => window.open(project.githubLink, '_blank')}
                                                                >
                                                                    View GitHub
                                                                </Button>
                                                            )}
                                                            {project.mode === 'zip' && project.zipUrl && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => {
                                                                        const downloadUrl = `${import.meta.env.VITE_API_URL}/payment/download-file/${project._id}`;
                                                                        const link = document.createElement('a');
                                                                        link.href = downloadUrl;
                                                                        link.style.display = 'none';
                                                                        document.body.appendChild(link);
                                                                        link.click();
                                                                        document.body.removeChild(link);
                                                                    }}
                                                                >
                                                                    Download ZIP
                                                                </Button>
                                                            )}
                                                        </div>

                                                        {/* Rejection Form */}
                                                        {selectedProject === project._id && (
                                                            <div className="mt-4 p-4 bg-muted rounded-md space-y-2">
                                                                <label className="text-sm font-medium">Rejection Reason</label>
                                                                <Input
                                                                    placeholder="Enter reason for rejection..."
                                                                    value={rejectionReason}
                                                                    onChange={(e) => setRejectionReason(e.target.value)}
                                                                />
                                                                <div className="flex gap-2">
                                                                    <Button
                                                                        size="sm"
                                                                        variant="destructive"
                                                                        onClick={() => handleReject(project._id)}
                                                                    >
                                                                        Confirm Reject
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() => {
                                                                            setSelectedProject(null);
                                                                            setRejectionReason('');
                                                                        }}
                                                                    >
                                                                        Cancel
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Quota Requests Tab */}
                {activeTab === 'quota-requests' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <Card className="border-2 border-purple-200 dark:border-purple-800">
                            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <Sparkles className="h-6 w-6 text-purple-600" />
                                        Custom Project Quota Requests ({quotaRequests.length})
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                {quotaRequests.length === 0 ? (
                                    <div className="text-center py-12">
                                        <CheckCircle2 className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                                        <p className="text-gray-600 dark:text-gray-400 font-medium">No pending quota requests</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">All requests have been processed</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {quotaRequests.map((request) => (
                                            <div
                                                key={request.requestId}
                                                className="border-2 border-purple-200 dark:border-purple-800 rounded-lg p-4 sm:p-6 hover:shadow-lg transition-all bg-white dark:bg-slate-800"
                                            >
                                                <div className="space-y-4">
                                                    {/* User Info */}
                                                    <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-0">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                                                                {request.user?.name?.charAt(0).toUpperCase() || 'U'}
                                                            </div>
                                                            <div>
                                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                                                    {request.user?.name || request.user?.username}
                                                                </h3>
                                                                <p className="text-sm text-gray-600 dark:text-gray-400">{request.user?.email}</p>
                                                            </div>
                                                        </div>
                                                        <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                                                            ₹{request.paymentAmount}
                                                        </Badge>
                                                    </div>

                                                    {/* Request Details */}
                                                    <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-4 space-y-2">
                                                        <div className="flex items-center justify-between text-sm">
                                                            <span className="text-gray-600 dark:text-gray-400">Request Date:</span>
                                                            <span className="font-medium text-gray-900 dark:text-white">
                                                                {formatDate(request.requestDate)}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center justify-between text-sm">
                                                            <span className="text-gray-600 dark:text-gray-400">Current Quota:</span>
                                                            <span className="font-medium text-gray-900 dark:text-white">
                                                                {request.currentQuota.used} / {request.currentQuota.allowed}
                                                            </span>
                                                        </div>
                                                        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Reason:</p>
                                                            <p className="text-sm text-gray-900 dark:text-white">{request.reason}</p>
                                                        </div>
                                                    </div>

                                                    {/* Action Form */}
                                                    {selectedRequest === request.requestId ? (
                                                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-3">
                                                            <label className="text-sm font-medium text-gray-900 dark:text-white">
                                                                Admin Note
                                                            </label>
                                                            <Input
                                                                placeholder="Add a note (optional for approval, required for rejection)..."
                                                                value={adminNote}
                                                                onChange={(e) => setAdminNote(e.target.value)}
                                                                className="bg-white dark:bg-slate-800"
                                                            />
                                                            <div className="flex gap-2">
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => handleApproveQuotaRequest(request.quotaId, request.requestId)}
                                                                    className="bg-green-600 hover:bg-green-700 text-white"
                                                                >
                                                                    <CheckCircle2 className="h-4 w-4 mr-1" />
                                                                    Approve (Payment Confirmed)
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="destructive"
                                                                    onClick={() => handleRejectQuotaRequest(request.quotaId, request.requestId)}
                                                                >
                                                                    <XCircle className="h-4 w-4 mr-1" />
                                                                    Reject
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => {
                                                                        setSelectedRequest(null);
                                                                        setAdminNote('');
                                                                    }}
                                                                >
                                                                    Cancel
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex gap-2">
                                                            <Button
                                                                size="sm"
                                                                onClick={() => setSelectedRequest(request.requestId)}
                                                                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                                                            >
                                                                <Send className="h-4 w-4 mr-1" />
                                                                Review Request
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Custom Projects Tab */}
                {activeTab === 'custom-projects' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* Stats Cards */}
                        {customProjectStats && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                                <Card className="border-2 border-purple-200 dark:border-purple-800">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Total Custom Projects</CardTitle>
                                        <Sparkles className="h-4 w-4 text-purple-600" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{customProjectStats.total || 0}</div>
                                    </CardContent>
                                </Card>

                                <Card className="border-2 border-green-200 dark:border-green-800">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                                        <Clock className="h-4 w-4 text-green-600" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{customProjectStats.active || 0}</div>
                                    </CardContent>
                                </Card>

                                <Card className="border-2 border-blue-200 dark:border-blue-800">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Completed</CardTitle>
                                        <CheckCircle2 className="h-4 w-4 text-blue-600" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{customProjectStats.completed || 0}</div>
                                    </CardContent>
                                </Card>

                                <Card className="border-2 border-orange-200 dark:border-orange-800">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
                                        <TrendingUp className="h-4 w-4 text-orange-600" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{customProjectStats.avgProgress || 0}%</div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Projects List */}
                        <Card>
                            <CardHeader>
                                <CardTitle>All Custom Projects ({Array.isArray(customProjects) ? customProjects.length : 0})</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left py-3 px-4">Project Details</th>
                                                <th className="text-left py-3 px-4">Creator</th>
                                                <th className="text-left py-3 px-4">Status</th>
                                                <th className="text-left py-3 px-4">Progress</th>
                                                <th className="text-left py-3 px-4">Tasks</th>
                                                <th className="text-left py-3 px-4">User Quota</th>
                                                <th className="text-left py-3 px-4">Created</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Array.isArray(customProjects) && customProjects.length > 0 ? (
                                                customProjects.map((project) => (
                                                    <tr key={project._id} className="border-b hover:bg-muted/50">
                                                        <td className="py-3 px-4">
                                                            <div className="max-w-xs">
                                                                <div className="font-semibold text-gray-900 dark:text-white truncate">
                                                                    {project.projectName}
                                                                </div>
                                                                <div className="text-xs text-muted-foreground capitalize mt-1">
                                                                    {project.complexity} • {project.motivation}
                                                                </div>
                                                                <div className="text-xs text-muted-foreground truncate mt-1">
                                                                    {project.description?.substring(0, 50)}...
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <div className="flex items-center gap-2">
                                                                <img
                                                                    src={project.userId?.avatar || 'https://via.placeholder.com/32'}
                                                                    alt={project.userId?.username}
                                                                    className="w-8 h-8 rounded-full"
                                                                />
                                                                <div>
                                                                    <div className="font-medium text-sm">
                                                                        {project.userId?.username || 'Unknown'}
                                                                    </div>
                                                                    <div className="text-xs text-muted-foreground truncate max-w-[120px]">
                                                                        {project.userId?.email}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <Badge className={
                                                                project.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                                                                    project.status === 'active' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                                                                        project.status === 'paused' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                                                                            'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                                                            }>
                                                                {project.status}
                                                            </Badge>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <div className="w-24">
                                                                <div className="flex justify-between text-xs mb-1">
                                                                    <span className="font-medium">{project.progress?.overallPercentage || 0}%</span>
                                                                </div>
                                                                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                                    <div
                                                                        className="h-full bg-emerald-500 transition-all"
                                                                        style={{ width: `${project.progress?.overallPercentage || 0}%` }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <div className="text-sm">
                                                                <div className="font-semibold text-emerald-600 dark:text-emerald-400">
                                                                    {project.progress?.totalTasksCompleted || 0} / {project.progress?.totalTasks || 0}
                                                                </div>
                                                                <div className="text-xs text-muted-foreground">
                                                                    completed
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <div className="text-sm">
                                                                <div className="font-semibold">
                                                                    {project.userQuota?.used || 0} / {project.userQuota?.limit || 1}
                                                                </div>
                                                                <div className="text-xs text-muted-foreground">
                                                                    {project.userQuota?.remaining || 0} left
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4 text-sm">
                                                            {formatDate(project.createdAt)}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="7" className="text-center py-12">
                                                        <p className="text-gray-600 dark:text-gray-400">No custom projects found</p>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>All Users ({users.length})</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left py-2 sm:py-3 px-3 sm:px-4 text-sm sm:text-base">User</th>
                                                <th className="text-left py-2 sm:py-3 px-3 sm:px-4 text-sm sm:text-base">Email</th>
                                                <th className="text-left py-2 sm:py-3 px-3 sm:px-4 text-sm sm:text-base">Role</th>
                                                <th className="text-left py-2 sm:py-3 px-3 sm:px-4 text-sm sm:text-base">Joined</th>
                                                <th className="text-left py-2 sm:py-3 px-3 sm:px-4 text-sm sm:text-base">Wallet</th>
                                                <th className="text-left py-2 sm:py-3 px-3 sm:px-4 text-sm sm:text-base">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map((user) => (
                                                <tr key={user._id} className="border-b hover:bg-muted/50">
                                                    <td className="py-2 sm:py-3 px-3 sm:px-4">
                                                        <div className="flex items-center gap-2">
                                                            <img
                                                                src={user.avatar || 'https://via.placeholder.com/40'}
                                                                alt={user.username}
                                                                className="w-8 h-8 rounded-full"
                                                            />
                                                            <span className="font-medium text-sm sm:text-base">{user.username}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-2 sm:py-3 px-3 sm:px-4 text-sm sm:text-base truncate max-w-[150px] sm:max-w-none">{user.email}</td>
                                                    <td className="py-2 sm:py-3 px-3 sm:px-4">
                                                        <select
                                                            className="h-8 rounded-md border border-input bg-background px-2 text-sm"
                                                            value={user.role}
                                                            onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                                        >
                                                            <option value="user">User</option>
                                                            <option value="creator">Creator</option>
                                                            <option value="admin">Admin</option>
                                                        </select>
                                                    </td>
                                                    <td className="py-2 sm:py-3 px-3 sm:px-4 text-sm sm:text-base">{formatDate(user.createdAt)}</td>
                                                    <td className="py-2 sm:py-3 px-3 sm:px-4 text-sm sm:text-base">{formatCurrency(user.wallet || 0)}</td>
                                                    <td className="py-2 sm:py-3 px-3 sm:px-4">
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => handleDeleteUser(user._id)}
                                                        >
                                                            Delete
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Projects Management Tab */}
                {activeTab === 'projects' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <Card>
                            <CardHeader>
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <CardTitle>All Projects Management</CardTitle>
                                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                        <Input
                                            placeholder="Search projects..."
                                            value={projectSearch}
                                            onChange={(e) => setProjectSearch(e.target.value)}
                                            className="w-full sm:w-64"
                                        />
                                        <select
                                            className="h-10 rounded-md border border-input bg-background px-3"
                                            value={projectFilter.status}
                                            onChange={(e) => setProjectFilter({ ...projectFilter, status: e.target.value })}
                                        >
                                            <option value="">All Status</option>
                                            <option value="approved">Approved</option>
                                            <option value="pending">Pending</option>
                                            <option value="rejected">Rejected</option>
                                        </select>
                                        <select
                                            className="h-10 rounded-md border border-input bg-background px-3"
                                            value={projectFilter.type}
                                            onChange={(e) => setProjectFilter({ ...projectFilter, type: e.target.value })}
                                        >
                                            <option value="">All Types</option>
                                            <option value="free">Free</option>
                                            <option value="paid">Paid</option>
                                        </select>
                                        <Button onClick={() => { setProjectsPage(1); fetchAllProjects(); }} className="gap-2">
                                            <Search className="h-4 w-4" />
                                            Search
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left py-3 px-4">Project</th>
                                                <th className="text-left py-3 px-4">Author</th>
                                                <th className="text-left py-3 px-4">Type</th>
                                                <th className="text-left py-3 px-4">Status</th>
                                                <th className="text-left py-3 px-4">Downloads</th>
                                                <th className="text-left py-3 px-4">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {allProjects.map((project) => (
                                                <tr key={project._id} className="border-b hover:bg-muted/50">
                                                    <td className="py-3 px-4">
                                                        <div className="max-w-xs">
                                                            <div className="font-medium truncate">{project.title}</div>
                                                            <div className="text-xs text-muted-foreground truncate">{project.difficulty}</div>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span className="text-sm">{project.author?.username || 'N/A'}</span>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <Badge className={project.type === 'free' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}>
                                                            {project.type} {project.type === 'paid' && `- ${formatCurrency(project.price)}`}
                                                        </Badge>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <Badge className={
                                                            project.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                                                                project.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                                    'bg-red-100 text-red-700'
                                                        }>
                                                            {project.status}
                                                        </Badge>
                                                    </td>
                                                    <td className="py-3 px-4 text-sm">{project.downloads || 0}</td>
                                                    <td className="py-3 px-4">
                                                        <div className="flex gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => {
                                                                    setSelectedProjectForEdit(project);
                                                                    setShowProjectEditModal(true);
                                                                }}
                                                            >
                                                                <Edit2 className="h-3 w-3" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="destructive"
                                                                onClick={() => handleDeleteProject(project._id)}
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {projectsPagination && (
                                    <div className="flex justify-center gap-2 mt-4">
                                        <Button
                                            size="sm"
                                            disabled={projectsPage === 1}
                                            onClick={() => { setProjectsPage(projectsPage - 1); fetchAllProjects(); }}
                                        >
                                            Previous
                                        </Button>
                                        <span className="px-4 py-2 text-sm">
                                            Page {projectsPage} of {projectsPagination.pages}
                                        </span>
                                        <Button
                                            size="sm"
                                            disabled={projectsPage === projectsPagination.pages}
                                            onClick={() => { setProjectsPage(projectsPage + 1); fetchAllProjects(); }}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Analytics Tab */}
                {activeTab === 'analytics' && analyticsData && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* AI Usage Stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MessageSquare className="h-5 w-5 text-purple-600" />
                                    AI Usage Analytics
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="border rounded-lg p-4">
                                        <div className="text-sm text-muted-foreground mb-1">Total Chat Sessions</div>
                                        <div className="text-2xl font-bold">{analyticsData.aiUsage.totalChatSessions}</div>
                                    </div>
                                    <div className="border rounded-lg p-4">
                                        <div className="text-sm text-muted-foreground mb-1">Total Messages</div>
                                        <div className="text-2xl font-bold">{analyticsData.aiUsage.totalMessages}</div>
                                    </div>
                                    <div className="border rounded-lg p-4">
                                        <div className="text-sm text-muted-foreground mb-1">Credits Used</div>
                                        <div className="text-2xl font-bold">{analyticsData.aiUsage.creditsUsage.totalCreditsUsed}</div>
                                    </div>
                                    <div className="border rounded-lg p-4">
                                        <div className="text-sm text-muted-foreground mb-1">Premium Users</div>
                                        <div className="text-2xl font-bold">{analyticsData.aiUsage.creditsUsage.premiumUsers}</div>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <h4 className="font-semibold mb-2">Messages by Mode</h4>
                                    <div className="grid grid-cols-3 gap-3">
                                        {Object.entries(analyticsData.aiUsage.messagesByMode).map(([mode, count]) => (
                                            <div key={mode} className="border rounded-lg p-3 text-center">
                                                <div className="text-sm capitalize text-muted-foreground">{mode}</div>
                                                <div className="text-xl font-bold mt-1">{count}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Database Stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Database className="h-5 w-5 text-blue-600" />
                                    Database Analytics
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                    <div className="border rounded-lg p-4">
                                        <div className="text-sm text-muted-foreground mb-1">Total Size</div>
                                        <div className="text-2xl font-bold">{(analyticsData.database.totalSize / (1024 * 1024)).toFixed(2)} MB</div>
                                    </div>
                                    <div className="border rounded-lg p-4">
                                        <div className="text-sm text-muted-foreground mb-1">Storage Size</div>
                                        <div className="text-2xl font-bold">{(analyticsData.database.storageSize / (1024 * 1024)).toFixed(2)} MB</div>
                                    </div>
                                    <div className="border rounded-lg p-4">
                                        <div className="text-sm text-muted-foreground mb-1">Index Size</div>
                                        <div className="text-2xl font-bold">{(analyticsData.database.indexSize / (1024 * 1024)).toFixed(2)} MB</div>
                                    </div>
                                    <div className="border rounded-lg p-4">
                                        <div className="text-sm text-muted-foreground mb-1">Collections</div>
                                        <div className="text-2xl font-bold">{analyticsData.database.totalCollections}</div>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left py-2 px-3">Collection</th>
                                                <th className="text-left py-2 px-3">Documents</th>
                                                <th className="text-left py-2 px-3">Size</th>
                                                <th className="text-left py-2 px-3">Avg Size</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {analyticsData.database.collections.map((col) => (
                                                <tr key={col.name} className="border-b">
                                                    <td className="py-2 px-3 font-medium">{col.name}</td>
                                                    <td className="py-2 px-3">{col.count}</td>
                                                    <td className="py-2 px-3">{(col.size / 1024).toFixed(2)} KB</td>
                                                    <td className="py-2 px-3">{(col.avgObjSize / 1024).toFixed(2)} KB</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Cloudinary Stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Cloud className="h-5 w-5 text-orange-600" />
                                    Cloudinary Storage
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="border rounded-lg p-4">
                                        <div className="text-sm text-muted-foreground mb-1">Projects with Images</div>
                                        <div className="text-2xl font-bold">{analyticsData.cloudinary.estimatedProjects}</div>
                                    </div>
                                    <div className="border rounded-lg p-4">
                                        <div className="text-sm text-muted-foreground mb-1">Total Images (Est.)</div>
                                        <div className="text-2xl font-bold">{analyticsData.cloudinary.estimatedImages}</div>
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground mt-4 p-3 bg-muted rounded">
                                    <strong>Note:</strong> {analyticsData.cloudinary.note}
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* AI Credits Management Tab */}
                {activeTab === 'ai-credits' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* Credit Statistics */}
                        {creditsStats && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                                <Card className="border-2 border-blue-200 dark:border-blue-800">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                                        <Users className="h-4 w-4 text-blue-600" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{creditsPagination?.total || 0}</div>
                                        <p className="text-xs text-muted-foreground">
                                            Showing {creditsData.length} users
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card className="border-2 border-purple-200 dark:border-purple-800">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Premium Users</CardTitle>
                                        <Award className="h-4 w-4 text-purple-600" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{creditsStats.premiumUsers}</div>
                                        <p className="text-xs text-muted-foreground">
                                            Unlimited AI access
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card className="border-2 border-orange-200 dark:border-orange-800">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Total AI Usage</CardTitle>
                                        <Zap className="h-4 w-4 text-orange-600" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{creditsStats.totalCreditsUsed}</div>
                                        <p className="text-xs text-muted-foreground">
                                            Credits consumed
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card className="border-2 border-green-200 dark:border-green-800">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Avg Credits/User</CardTitle>
                                        <TrendingUp className="h-4 w-4 text-green-600" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{creditsStats.avgCredits}</div>
                                        <p className="text-xs text-muted-foreground">
                                            Current average
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Actions and Search */}
                        <Card>
                            <CardHeader>
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <CardTitle>AI Credits Management</CardTitle>
                                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                        <Input
                                            placeholder="Search users..."
                                            value={creditSearch}
                                            onChange={(e) => setCreditSearch(e.target.value)}
                                            className="w-full sm:w-64"
                                        />
                                        <Button
                                            onClick={() => { setCreditPage(1); fetchCreditsData(); }}
                                            className="gap-2"
                                        >
                                            <Sparkles className="h-4 w-4" />
                                            Search
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                fetchDefaultCredits();
                                                setShowDefaultCreditsModal(true);
                                            }}
                                            variant="outline"
                                            className="gap-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                                        >
                                            <Zap className="h-4 w-4" />
                                            Edit Defaults
                                        </Button>
                                        <Button
                                            onClick={handleResetAllCredits}
                                            variant="outline"
                                            className="gap-2"
                                        >
                                            <RefreshCw className="h-4 w-4" />
                                            Reset All
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left py-3 px-4">User</th>
                                                <th className="text-left py-3 px-4">Email</th>
                                                <th className="text-left py-3 px-4">Credits</th>
                                                <th className="text-left py-3 px-4">Daily Limit</th>
                                                <th className="text-left py-3 px-4">Total Used</th>
                                                <th className="text-left py-3 px-4">Status</th>
                                                <th className="text-left py-3 px-4">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {creditsData.map((user) => (
                                                <tr key={user._id} className="border-b hover:bg-muted/50">
                                                    <td className="py-3 px-4">
                                                        <span className="font-medium">{user.username}</span>
                                                    </td>
                                                    <td className="py-3 px-4 text-sm text-muted-foreground">
                                                        {user.email}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="flex items-center gap-2">
                                                            <Zap className="h-4 w-4 text-yellow-500" />
                                                            <span className="font-semibold text-lg">{user.credits}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4 text-sm">
                                                        {user.isPremium ? '∞' : user.dailyLimit}
                                                    </td>
                                                    <td className="py-3 px-4 text-sm">
                                                        {user.totalUsed || 0}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <Badge
                                                            className={user.isPremium
                                                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                                                                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                                                            }
                                                        >
                                                            {user.isPremium ? '⭐ Premium' : 'Free'}
                                                        </Badge>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="flex gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => {
                                                                    setSelectedUser(user);
                                                                    setCreditAction('add');
                                                                    setShowCreditModal(true);
                                                                }}
                                                                className="gap-1"
                                                            >
                                                                <Plus className="h-3 w-3" />
                                                                Add
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => {
                                                                    setSelectedUser(user);
                                                                    setCreditAction('deduct');
                                                                    setShowCreditModal(true);
                                                                }}
                                                                className="gap-1"
                                                            >
                                                                <Minus className="h-3 w-3" />
                                                                Deduct
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleTogglePremium(user)}
                                                                className={user.isPremium ? 'border-purple-500' : ''}
                                                            >
                                                                <Award className="h-3 w-3" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => handleViewHistory(user)}
                                                            >
                                                                <History className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {creditsPagination && creditsPagination.pages > 1 && (
                                    <div className="flex justify-center items-center gap-2 mt-6">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            disabled={creditPage === 1}
                                            onClick={() => {
                                                setCreditPage(creditPage - 1);
                                                fetchCreditsData();
                                            }}
                                        >
                                            Previous
                                        </Button>
                                        <span className="text-sm text-muted-foreground">
                                            Page {creditPage} of {creditsPagination.pages}
                                        </span>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            disabled={creditPage === creditsPagination.pages}
                                            onClick={() => {
                                                setCreditPage(creditPage + 1);
                                                fetchCreditsData();
                                            }}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Credit Management Modal */}
                        {showCreditModal && selectedUser && (
                            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                                <Card className="w-full max-w-md">
                                    <CardHeader>
                                        <CardTitle className="capitalize">{creditAction} Credits for {selectedUser.username}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium mb-2 block">Action</label>
                                            <select
                                                className="w-full h-10 rounded-md border border-input bg-background px-3"
                                                value={creditAction}
                                                onChange={(e) => setCreditAction(e.target.value)}
                                            >
                                                <option value="add">Add Credits</option>
                                                <option value="deduct">Deduct Credits</option>
                                                <option value="set">Set Credits</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium mb-2 block">Amount</label>
                                            <Input
                                                type="number"
                                                min="0"
                                                placeholder="Enter amount..."
                                                value={creditAmount}
                                                onChange={(e) => setCreditAmount(e.target.value)}
                                            />
                                        </div>
                                        <div className="bg-muted p-3 rounded-md text-sm">
                                            <p className="text-muted-foreground">Current Credits: <span className="font-bold text-foreground">{selectedUser.credits}</span></p>
                                            {creditAmount && (
                                                <p className="text-muted-foreground mt-1">
                                                    New Credits: <span className="font-bold text-foreground">
                                                        {creditAction === 'add' ? selectedUser.credits + parseInt(creditAmount || 0) :
                                                            creditAction === 'deduct' ? Math.max(0, selectedUser.credits - parseInt(creditAmount || 0)) :
                                                                parseInt(creditAmount || 0)}
                                                    </span>
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                className="flex-1"
                                                onClick={handleUpdateCredits}
                                            >
                                                Confirm
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="flex-1"
                                                onClick={() => {
                                                    setShowCreditModal(false);
                                                    setSelectedUser(null);
                                                    setCreditAmount('');
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* History Modal */}
                        {showHistoryModal && selectedUser && (
                            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                                <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                                    <CardHeader>
                                        <CardTitle>Credit History for {selectedUser.username}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="overflow-y-auto flex-1">
                                        <div className="space-y-3">
                                            {creditHistory.length > 0 ? (
                                                creditHistory.map((entry, index) => (
                                                    <div key={index} className="border rounded-lg p-3 bg-muted/30">
                                                        <div className="flex justify-between items-start">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <Badge className={
                                                                        entry.action === 'use' ? 'bg-red-100 text-red-700' :
                                                                            entry.action === 'reset' ? 'bg-blue-100 text-blue-700' :
                                                                                entry.action === 'admin_add' ? 'bg-green-100 text-green-700' :
                                                                                    entry.action === 'admin_deduct' ? 'bg-orange-100 text-orange-700' :
                                                                                        'bg-purple-100 text-purple-700'
                                                                    }>
                                                                        {entry.action.replace('_', ' ')}
                                                                    </Badge>
                                                                    <span className={`font-bold ${entry.amount > 0 ? 'text-green-600' : entry.amount < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                                                                        {entry.amount > 0 ? '+' : ''}{entry.amount}
                                                                    </span>
                                                                </div>
                                                                <p className="text-sm text-muted-foreground">{entry.message}</p>
                                                            </div>
                                                            <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                                                                {formatDate(entry.timestamp)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-center py-8 text-muted-foreground">No history available</p>
                                            )}
                                        </div>
                                    </CardContent>
                                    <div className="p-4 border-t">
                                        <Button
                                            onClick={() => {
                                                setShowHistoryModal(false);
                                                setSelectedUser(null);
                                                setCreditHistory([]);
                                            }}
                                            className="w-full"
                                        >
                                            Close
                                        </Button>
                                    </div>
                                </Card>
                            </div>
                        )}

                        {/* Default Credits Settings Modal */}
                        {showDefaultCreditsModal && (
                            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                                <Card className="w-full max-w-md">
                                    <CardHeader className="border-b pb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                                                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                                            </div>
                                            <div>
                                                <CardTitle>Edit Default Credits</CardTitle>
                                                <p className="text-sm text-muted-foreground mt-1">Configure default credit values for new users</p>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4 pt-6">
                                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex items-start gap-3">
                                            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                                            <div className="text-sm">
                                                <p className="font-semibold text-yellow-900 dark:text-yellow-200 mb-1">Warning: You are editing default credits</p>
                                                <p className="text-yellow-700 dark:text-yellow-300">These values will apply to all new users. Existing users won't be affected unless you reset their credits.</p>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium mb-2 block">Default Initial Credits</label>
                                            <Input
                                                type="number"
                                                min="0"
                                                placeholder="Enter default credits..."
                                                value={defaultCredits}
                                                onChange={(e) => setDefaultCredits(parseInt(e.target.value) || 0)}
                                            />
                                            <p className="text-xs text-muted-foreground mt-1">Credits given to new users when they register</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium mb-2 block">Default Daily Limit</label>
                                            <Input
                                                type="number"
                                                min="0"
                                                placeholder="Enter daily limit..."
                                                value={defaultDailyLimit}
                                                onChange={(e) => setDefaultDailyLimit(parseInt(e.target.value) || 0)}
                                            />
                                            <p className="text-xs text-muted-foreground mt-1">Maximum credits users can have after daily reset</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                className="flex-1 gap-2"
                                                onClick={handleUpdateDefaultCredits}
                                            >
                                                <CheckCircle2 className="h-4 w-4" />
                                                Save Changes
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="flex-1"
                                                onClick={() => {
                                                    setShowDefaultCreditsModal(false);
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
