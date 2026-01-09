import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import api from '../lib/api';
import {
    TrendingUp, TrendingDown, Eye, Download, Users, Globe,
    Smartphone, Laptop, Activity, Calendar, BarChart3,
    PieChart as PieChartIcon, Monitor, Tablet, Phone,
    ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const AnalyticsPage = () => {
    const [analytics, setAnalytics] = useState(null);
    const [projectAnalytics, setProjectAnalytics] = useState(null);
    const [browseProjectsAnalytics, setBrowseProjectsAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeframe, setTimeframe] = useState('30d');
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [projects, setProjects] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        fetchAnalytics();
        fetchProjects();
        fetchBrowseProjectsAnalytics();
    }, [timeframe]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);

            const response = await api.get(`/admin/analytics?timeframe=${timeframe}`);

            const analyticsData = response.data.data;

            setAnalytics(analyticsData);
        } catch (error) {
            console.error('❌ [Frontend] Error fetching analytics:', error);
            toast.error('Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    const fetchProjects = async () => {
        try {
            const response = await api.get('/projects');

            // Projects API returns: { data: { projects: [...], pagination: {...} } }
            const projectsData = response.data?.data?.projects || response.data?.projects || [];
            setProjects(Array.isArray(projectsData) ? projectsData : []);
        } catch (error) {
            console.error('❌ [Frontend] Error fetching projects:', error);
            setProjects([]); // Ensure projects is always an array
            toast.error('Failed to load projects');
        }
    };

    const fetchBrowseProjectsAnalytics = async () => {
        try {
            const response = await api.get('/admin/analytics/browse-projects');
            setBrowseProjectsAnalytics(response.data.data);
        } catch (error) {
            console.error('❌ [Frontend] Error fetching browse projects analytics:', error);
        }
    };

    const fetchProjectAnalytics = async (projectId) => {
        if (!projectId) {
            toast.error('Please select a project');
            return;
        }
        try {
            const response = await api.get(`/admin/analytics/projects?projectId=${projectId}`);
            setProjectAnalytics(response.data.data);
        } catch (error) {
            console.error('Error fetching project analytics:', error);
            toast.error('Failed to load project analytics');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <BarChart3 className="h-6 w-6 text-indigo-600" />
                        </div>
                    </div>
                    <p className="mt-4 text-xl text-gray-700 font-medium">Loading Analytics Dashboard...</p>
                    <p className="text-sm text-gray-500 mt-2">Fetching comprehensive data insights</p>
                </div>
            </div>
        );
    }

    const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

    const timeframeLabels = {
        '7d': '7 Days',
        '30d': '30 Days',
        '90d': '90 Days',
        '1y': '1 Year'
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            {/* Header Section */}
            <div className="bg-white shadow-sm border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-3 rounded-xl shadow-lg">
                                <BarChart3 className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
                                <p className="text-gray-600 mt-1">Comprehensive insights into your platform performance</p>
                            </div>
                        </div>

                        {/* Timeframe Selector */}
                        <div className="mt-4 md:mt-0">
                            <div className="bg-gray-100 p-1 rounded-xl inline-flex shadow-inner">
                                {Object.entries(timeframeLabels).map(([key, label]) => (
                                    <button
                                        key={key}
                                        onClick={() => setTimeframe(key)}
                                        className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${timeframe === key
                                            ? 'bg-white text-indigo-600 shadow-md transform scale-105'
                                            : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                                            }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex space-x-8">
                        {[
                            { id: 'overview', label: 'Overview', icon: BarChart3 },
                            { id: 'website', label: 'Website', icon: Globe },
                            { id: 'projects', label: 'Projects', icon: Activity },
                            { id: 'browse', label: 'Browse Analytics', icon: Eye }
                        ].map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`py-4 px-1 inline-flex items-center space-x-2 border-b-2 font-medium text-sm transition-all duration-200 ${activeTab === tab.id
                                        ? 'border-indigo-500 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Overview Tab */}
                {activeTab === 'overview' && analytics && (
                    <div className="space-y-8">
                        {/* KPI Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-blue-100 text-sm font-medium uppercase tracking-wide">Total Page Views</p>
                                            <p className="text-3xl font-bold mt-2">{analytics.overview?.website?.totalPageViews?.toLocaleString() || '0'}</p>
                                            <div className="flex items-center mt-2">
                                                <ArrowUpRight className="h-4 w-4 text-blue-200 mr-1" />
                                                <p className="text-blue-200 text-sm">
                                                    {analytics.overview?.website?.uniqueVisitors?.toLocaleString() || '0'} unique visitors
                                                </p>
                                            </div>
                                        </div>
                                        <div className="bg-blue-400/30 p-3 rounded-full">
                                            <Eye className="h-8 w-8 text-blue-100" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-green-100 text-sm font-medium uppercase tracking-wide">Project Views</p>
                                            <p className="text-3xl font-bold mt-2">{analytics.overview?.projects?.totalViews?.toLocaleString() || '0'}</p>
                                            <div className="flex items-center mt-2">
                                                <ArrowUpRight className="h-4 w-4 text-green-200 mr-1" />
                                                <p className="text-green-200 text-sm">
                                                    {analytics.overview?.projects?.uniqueViewers?.toLocaleString() || '0'} unique viewers
                                                </p>
                                            </div>
                                        </div>
                                        <div className="bg-green-400/30 p-3 rounded-full">
                                            <Activity className="h-8 w-8 text-green-100" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-orange-100 text-sm font-medium uppercase tracking-wide">Downloads</p>
                                            <p className="text-3xl font-bold mt-2">{analytics.overview?.projects?.totalDownloads?.toLocaleString() || '0'}</p>
                                            <div className="flex items-center mt-2">
                                                <ArrowUpRight className="h-4 w-4 text-orange-200 mr-1" />
                                                <p className="text-orange-200 text-sm">
                                                    {analytics.overview?.projects?.uniqueDownloaders?.toLocaleString() || '0'} unique downloaders
                                                </p>
                                            </div>
                                        </div>
                                        <div className="bg-orange-400/30 p-3 rounded-full">
                                            <Download className="h-8 w-8 text-orange-100" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-purple-100 text-sm font-medium uppercase tracking-wide">Conversion Rate</p>
                                            <p className="text-3xl font-bold mt-2">{analytics.overview?.projects?.conversionRate?.toFixed(2) || '0.00'}%</p>
                                            <div className="flex items-center mt-2">
                                                <TrendingUp className="h-4 w-4 text-purple-200 mr-1" />
                                                <p className="text-purple-200 text-sm">Views to downloads</p>
                                            </div>
                                        </div>
                                        <div className="bg-purple-400/30 p-3 rounded-full">
                                            <TrendingUp className="h-8 w-8 text-purple-100" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Revenue Overview */}
                        <Card className="shadow-xl border-0 bg-white/70 backdrop-blur-sm">
                            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 rounded-t-lg">
                                <CardTitle className="text-xl font-semibold text-gray-800 flex items-center">
                                    <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                                    Revenue Overview
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 shadow-sm">
                                        <div className="bg-green-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <TrendingUp className="h-6 w-6 text-white" />
                                        </div>
                                        <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">Total Revenue</p>
                                        <p className="text-3xl font-bold text-green-600 mt-2">
                                            ${analytics.overview?.revenue?.totalRevenue?.toFixed(2) || '0.00'}
                                        </p>
                                    </div>
                                    <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-sm">
                                        <div className="bg-blue-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Users className="h-6 w-6 text-white" />
                                        </div>
                                        <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">Admin Commission</p>
                                        <p className="text-3xl font-bold text-blue-600 mt-2">
                                            ${analytics.overview?.revenue?.adminCommission?.toFixed(2) || '0.00'}
                                        </p>
                                    </div>
                                    <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-200 shadow-sm">
                                        <div className="bg-orange-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Activity className="h-6 w-6 text-white" />
                                        </div>
                                        <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">Creator Earnings</p>
                                        <p className="text-3xl font-bold text-orange-600 mt-2">
                                            ${analytics.overview?.revenue?.creatorEarnings?.toFixed(2) || '0.00'}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Website Analytics Tab */}
                {activeTab === 'website' && analytics?.websiteAnalytics && (
                    <div className="space-y-8">
                        {/* Daily Page Views Chart */}
                        <Card className="shadow-xl border-0">
                            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 rounded-t-lg">
                                <CardTitle className="text-xl font-semibold text-gray-800 flex items-center">
                                    <Activity className="h-5 w-5 mr-2 text-blue-600" />
                                    Daily Page Views Trend
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <ResponsiveContainer width="100%" height={400}>
                                    <LineChart data={analytics.websiteAnalytics.dailyPageViews}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" />
                                        <XAxis dataKey="date" stroke="#6b7280" tick={{ fontSize: 12 }} />
                                        <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'white',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '12px',
                                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                                            }}
                                        />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="views"
                                            stroke="#3B82F6"
                                            strokeWidth={3}
                                            name="Page Views"
                                            dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                                            activeDot={{ r: 6, fill: '#3B82F6' }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="uniqueVisitors"
                                            stroke="#10B981"
                                            strokeWidth={3}
                                            name="Unique Visitors"
                                            dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                                            activeDot={{ r: 6, fill: '#10B981' }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Traffic Sources and Device Stats */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <Card className="shadow-xl border-0">
                                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100 rounded-t-lg">
                                    <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
                                        <PieChartIcon className="h-5 w-5 mr-2 text-purple-600" />
                                        Traffic Sources
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={analytics.websiteAnalytics.trafficSources}
                                                dataKey="visits"
                                                nameKey="source"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={100}
                                                innerRadius={40}
                                            >
                                                {analytics.websiteAnalytics.trafficSources?.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'white',
                                                    border: '1px solid #e5e7eb',
                                                    borderRadius: '8px',
                                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                                }}
                                            />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            <Card className="shadow-xl border-0">
                                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100 rounded-t-lg">
                                    <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
                                        <Monitor className="h-5 w-5 mr-2 text-green-600" />
                                        Device Breakdown
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={analytics.websiteAnalytics.deviceStats}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" />
                                            <XAxis dataKey="device" stroke="#6b7280" tick={{ fontSize: 12 }} />
                                            <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'white',
                                                    border: '1px solid #e5e7eb',
                                                    borderRadius: '8px',
                                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                                }}
                                            />
                                            <Legend />
                                            <Bar dataKey="visits" fill="#10B981" name="Visits" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="uniqueUsers" fill="#3B82F6" name="Unique Users" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {/* Project Analytics Tab */}
                {activeTab === 'projects' && (
                    <div className="space-y-8">
                        {/* Projects Overview Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Top Projects by Views */}
                            <Card className="shadow-xl border-0">
                                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 rounded-t-lg">
                                    <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
                                        <Eye className="h-5 w-5 mr-2 text-blue-600" />
                                        Top Projects by Views
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-4">
                                        {analytics?.projectAnalytics?.topProjectsByViews?.slice(0, 5).map((project, index) => (
                                            <div key={project._id} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-transparent rounded-lg border border-blue-100 hover:shadow-md transition-all duration-200">
                                                <div className="flex items-center space-x-3">
                                                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 font-bold rounded-full text-sm">
                                                        {index + 1}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-gray-800 truncate max-w-[200px]">{project.title}</h4>
                                                        <p className="text-sm text-gray-600 flex items-center">
                                                            <Eye className="h-4 w-4 mr-1" />
                                                            {project.views?.toLocaleString()} views
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                                                        {project.category || 'General'}
                                                    </Badge>
                                                    {index === 0 && (
                                                        <TrendingUp className="h-5 w-5 text-green-500" />
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        {!analytics?.projectAnalytics?.topProjectsByViews?.length && (
                                            <div className="text-center py-8 text-gray-500">
                                                <Eye className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                                <p>No project views data yet</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Top Projects by Downloads */}
                            <Card className="shadow-xl border-0">
                                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100 rounded-t-lg">
                                    <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
                                        <Download className="h-5 w-5 mr-2 text-green-600" />
                                        Top Projects by Downloads
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-4">
                                        {analytics?.projectAnalytics?.topProjectsByDownloads?.slice(0, 5).map((project, index) => (
                                            <div key={project._id} className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-transparent rounded-lg border border-green-100 hover:shadow-md transition-all duration-200">
                                                <div className="flex items-center space-x-3">
                                                    <div className="flex items-center justify-center w-8 h-8 bg-green-100 text-green-700 font-bold rounded-full text-sm">
                                                        {index + 1}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-gray-800 truncate max-w-[200px]">{project.title}</h4>
                                                        <p className="text-sm text-gray-600 flex items-center">
                                                            <Download className="h-4 w-4 mr-1" />
                                                            {project.downloads?.toLocaleString()} downloads
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Badge className="bg-green-100 text-green-700 border-green-200">
                                                        {project.type === 'free' ? 'Free' : 'Premium'}
                                                    </Badge>
                                                    {index === 0 && (
                                                        <TrendingUp className="h-5 w-5 text-green-500" />
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        {!analytics?.projectAnalytics?.topProjectsByDownloads?.length && (
                                            <div className="text-center py-8 text-gray-500">
                                                <Download className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                                <p>No project downloads data yet</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Projects Performance Chart */}
                        {analytics?.projectAnalytics?.topProjectsByViews?.length > 0 && (
                            <Card className="shadow-xl border-0">
                                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100 rounded-t-lg">
                                    <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
                                        <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
                                        Projects Performance Comparison
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <ResponsiveContainer width="100%" height={400}>
                                        <BarChart data={analytics.projectAnalytics.topProjectsByViews?.slice(0, 10)}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" />
                                            <XAxis
                                                dataKey="title"
                                                stroke="#6b7280"
                                                tick={{ fontSize: 12 }}
                                                angle={-45}
                                                textAnchor="end"
                                                height={100}
                                            />
                                            <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'white',
                                                    border: '1px solid #e5e7eb',
                                                    borderRadius: '8px',
                                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                                }}
                                                formatter={(value, name) => [value?.toLocaleString(), name]}
                                            />
                                            <Legend />
                                            <Bar dataKey="views" fill="#3B82F6" name="Views" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="downloads" fill="#10B981" name="Downloads" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        )}

                        <Card className="shadow-xl border-0">
                            <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-indigo-100 rounded-t-lg">
                                <CardTitle className="text-xl font-semibold text-gray-800 flex items-center">
                                    <Activity className="h-5 w-5 mr-2 text-indigo-600" />
                                    Individual Project Analysis
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="flex gap-4 mb-6">
                                    <select
                                        value={selectedProjectId}
                                        onChange={(e) => setSelectedProjectId(e.target.value)}
                                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                                    >
                                        <option value="">Select a project to analyze...</option>
                                        {Array.isArray(projects) && projects.map(project => (
                                            <option key={project._id} value={project._id}>
                                                {project.title}
                                            </option>
                                        ))}
                                    </select>
                                    <Button
                                        onClick={() => fetchProjectAnalytics(selectedProjectId)}
                                        className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-lg hover:from-indigo-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
                                    >
                                        Analyze Project
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {projectAnalytics ? (
                            <div className="space-y-6">
                                <Card className="shadow-xl border-0">
                                    <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 rounded-t-lg">
                                        <CardTitle className="text-lg font-semibold text-gray-800">
                                            {projectAnalytics.project?.title || 'Project Analytics'}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                                                <p className="text-gray-600 text-sm font-medium">Total Views</p>
                                                <p className="text-2xl font-bold text-blue-600 mt-2">
                                                    {projectAnalytics.project?.analytics?.totalViews?.toLocaleString() || '0'}
                                                </p>
                                            </div>
                                            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                                                <p className="text-gray-600 text-sm font-medium">Total Downloads</p>
                                                <p className="text-2xl font-bold text-green-600 mt-2">
                                                    {projectAnalytics.project?.analytics?.totalDownloads?.toLocaleString() || '0'}
                                                </p>
                                            </div>
                                            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                                                <p className="text-gray-600 text-sm font-medium">Conversion Rate</p>
                                                <p className="text-2xl font-bold text-purple-600 mt-2">
                                                    {projectAnalytics.project?.analytics?.conversionRate?.toFixed(2) || '0.00'}%
                                                </p>
                                            </div>
                                            <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                                                <p className="text-gray-600 text-sm font-medium">Revenue</p>
                                                <p className="text-2xl font-bold text-orange-600 mt-2">
                                                    ${projectAnalytics.project?.analytics?.revenue?.toFixed(2) || '0.00'}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        ) : (
                            <Card className="shadow-lg border-0">
                                <CardContent className="p-12 text-center">
                                    <div className="text-gray-400 mb-4">
                                        <BarChart3 className="h-16 w-16 mx-auto" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-600 mb-2">Select a Project</h3>
                                    <p className="text-gray-500">Choose a project from the dropdown to view detailed analytics</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}

                {/* Browse Analytics Tab */}
                {activeTab === 'browse' && browseProjectsAnalytics && (
                    <div className="space-y-8">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="shadow-lg border-0">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-gray-600 text-sm font-medium">Total Visits</p>
                                            <p className="text-3xl font-bold mt-2">{browseProjectsAnalytics.summary?.totalVisits?.toLocaleString() || '0'}</p>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Unique: {browseProjectsAnalytics.summary?.uniqueUserCount?.toLocaleString() || '0'}
                                            </p>
                                        </div>
                                        <Eye className="h-8 w-8 text-blue-600" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-lg border-0">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-gray-600 text-sm font-medium">Bounce Rate</p>
                                            <p className="text-3xl font-bold mt-2">{browseProjectsAnalytics.summary?.bounceRate?.toFixed(2) || '0.00'}%</p>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Avg: {Math.round((browseProjectsAnalytics.summary?.avgDuration || 0) / 1000)}s
                                            </p>
                                        </div>
                                        <TrendingDown className="h-8 w-8 text-orange-600" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-lg border-0">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-gray-600 text-sm font-medium">New vs Returning</p>
                                            <p className="text-3xl font-bold mt-2">
                                                {browseProjectsAnalytics.summary?.newVisitors?.toLocaleString() || '0'}/
                                                {browseProjectsAnalytics.summary?.returningVisitors?.toLocaleString() || '0'}
                                            </p>
                                            <p className="text-sm text-gray-500 mt-1">New / Returning</p>
                                        </div>
                                        <Users className="h-8 w-8 text-green-600" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {/* Empty state for tabs without data */}
                {((activeTab === 'website' && !analytics?.websiteAnalytics) ||
                    (activeTab === 'browse' && !browseProjectsAnalytics)) && (
                        <Card className="shadow-lg border-0">
                            <CardContent className="p-12 text-center">
                                <div className="text-gray-400 mb-4">
                                    <BarChart3 className="h-16 w-16 mx-auto" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Data Available</h3>
                                <p className="text-gray-500">Analytics data will appear here once available</p>
                            </CardContent>
                        </Card>
                    )}
            </div>
        </div>
    );
};

export default AnalyticsPage;