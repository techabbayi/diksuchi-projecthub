import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, TrendingUp, Target, Clock, Award, Plus } from 'lucide-react';
import api from '../lib/api';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

const CustomProjectCard = () => {
    const [quota, setQuota] = useState(null);
    const [project, setProject] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [requesting, setRequesting] = useState(false);

    useEffect(() => {
        fetchQuotaAndProject();
    }, []);

    const fetchQuotaAndProject = async () => {
        try {
            const [quotaRes, projectsRes] = await Promise.all([
                api.get('/project-builder/quota/check'),
                api.get('/project-builder/user-projects')
            ]);

            setQuota(quotaRes.data.quota);

            if (projectsRes.data.projects && projectsRes.data.projects.length > 0) {
                const activeProject = projectsRes.data.projects[0];
                setProject(activeProject);

                // Fetch analytics
                const analyticsRes = await api.get(`/project-builder/${activeProject._id}/analytics`);
                setAnalytics(analyticsRes.data.analytics);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRequestAdditional = async () => {
        try {
            setRequesting(true);
            const response = await api.post('/project-builder/quota/request-additional', {
                reason: 'Need additional custom project for my portfolio'
            });

            alert(response.data.message);
            fetchQuotaAndProject();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to submit request');
        } finally {
            setRequesting(false);
        }
    };

    if (loading) {
        return (
            <Card className="p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </Card>
        );
    }

    // No project yet - Show greeting and build button
    if (!project) {
        return (
            <Card className="p-8 dark:bg-slate-900 border-2 border-dashed dark:border-slate-700 hover:shadow-2xl transition-all" style={{ backgroundColor: '#f8faf9', borderColor: '#d8e2dc' }}>
                <div className="text-center">
                    <div className="inline-flex p-4 rounded-full mb-4 shadow-lg" style={{ backgroundColor: '#2d6a4f' }}>
                        <Sparkles className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2" style={{ color: '#2d6a4f' }}>Build Your Custom Project!</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto leading-relaxed">
                        Create a personalized project guide with AI-powered roadmap, task tracking, and learning resources tailored to your goals.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link to="/project-builder">
                            <Button size="lg" style={{ backgroundColor: '#2d6a4f' }} className="hover:opacity-90 shadow-lg text-white">
                                <Sparkles className="h-5 w-5 mr-2" />
                                Start Building Now
                            </Button>
                        </Link>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                        Free: {quota?.remaining || 1} project{quota?.remaining !== 1 ? 's' : ''} remaining
                    </p>
                </div>
            </Card>
        );
    }

    // Has project - Show analytics
    return (
        <Card className="p-6 border dark:border-slate-700 dark:bg-slate-800 shadow-lg hover:shadow-2xl transition-all" style={{ borderColor: '#d8e2dc', backgroundColor: '#f8faf9' }}>
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-2xl font-bold mb-1 flex items-center text-gray-900 dark:text-white">
                        <Target className="h-6 w-6 mr-2" style={{ color: '#2d6a4f' }} />
                        {project.projectName}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                        {project.complexity} • {project.skillLevel}
                    </p>
                </div>
                <Link to={`/project-builder/${project._id}`}>
                    <Button size="sm">View Dashboard</Button>
                </Link>
            </div>

            {analytics && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {/* Overall Progress */}
                    <div className="rounded-xl p-4 border dark:bg-slate-800" style={{ backgroundColor: '#f8faf9', borderColor: '#d8e2dc' }}>
                        <div className="flex items-center justify-between mb-2">
                            <TrendingUp className="h-5 w-5" style={{ color: '#2d6a4f' }} />
                            <span className="text-2xl font-bold" style={{ color: '#2d6a4f' }}>
                                {analytics.progress.overall}%
                            </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Overall Progress</p>
                    </div>

                    {/* Tasks Completed */}
                    <div className="rounded-xl p-4 border dark:bg-slate-800" style={{ backgroundColor: '#f8faf9', borderColor: '#d8e2dc' }}>
                        <div className="flex items-center justify-between mb-2">
                            <Target className="h-5 w-5" style={{ color: '#74c69d' }} />
                            <span className="text-2xl font-bold" style={{ color: '#74c69d' }}>
                                {analytics.progress.tasks.completed}/{analytics.progress.tasks.total}
                            </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Tasks Done</p>
                    </div>

                    {/* Days Active */}
                    <div className="rounded-xl p-4 border dark:bg-slate-800" style={{ backgroundColor: '#f8faf9', borderColor: '#d8e2dc' }}>
                        <div className="flex items-center justify-between mb-2">
                            <Clock className="h-5 w-5" style={{ color: '#2ec4b6' }} />
                            <span className="text-2xl font-bold" style={{ color: '#2ec4b6' }}>
                                {analytics.timeline.daysActive}
                            </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Days Active</p>
                    </div>

                    {/* Achievements */}
                    <div className="rounded-xl p-4 border dark:bg-slate-800" style={{ backgroundColor: '#f8faf9', borderColor: '#d8e2dc' }}>
                        <div className="flex items-center justify-between mb-2">
                            <Award className="h-5 w-5" style={{ color: '#ffb703' }} />
                            <span className="text-2xl font-bold" style={{ color: '#ffb703' }}>
                                {analytics.achievements.unlocked}
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground">Achievements</p>
                    </div>
                </div>
            )}

            {/* Milestones Progress */}
            {analytics && (
                <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600 dark:text-gray-400">Milestones</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                            {analytics.progress.milestones.completed}/{analytics.progress.milestones.total} completed
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3">
                        <div
                            className="h-3 rounded-full transition-all shadow-md"
                            style={{ width: `${analytics.progress.milestones.percentage}%`, backgroundColor: '#2d6a4f' }}
                        ></div>
                    </div>
                </div>
            )}

            {/* Request Additional Project */}
            {quota && !quota.canCreate && (
                <div className="mt-4 p-4 rounded-lg border dark:bg-slate-800" style={{ backgroundColor: 'rgba(255, 183, 3, 0.1)', borderColor: '#ffb703' }}>
                    <p className="text-sm mb-3" style={{ color: '#9a6c02' }}>
                        <strong>Project limit reached!</strong> Need another custom project?
                    </p>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleRequestAdditional}
                        disabled={requesting || quota.pendingRequests > 0}
                        className="w-full"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        {quota.pendingRequests > 0
                            ? 'Request Pending (₹199)'
                            : 'Request Additional Project (₹199)'}
                    </Button>
                    {quota.pendingRequests > 0 && (
                        <p className="text-xs text-muted-foreground mt-2 text-center">
                            Your request is being reviewed by admin
                        </p>
                    )}
                </div>
            )}
        </Card>
    );
};

export default CustomProjectCard;
