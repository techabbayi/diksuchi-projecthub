import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import api from '../lib/api';
import TaskCard from '../components/ProjectBuilder/TaskCard';
import CelebrationModal from '../components/ProjectBuilder/CelebrationModal';
import ShareModal from '../components/ProjectBuilder/ShareModal';
import ReadmeViewer from '../components/ProjectBuilder/ReadmeViewer';
import FolderStructureTree from '../components/ProjectBuilder/FolderStructureTree';
import DiksuchAI from '../components/DiksuchAI';
import { Button } from '../components/ui/Button';
import {
    Target, TrendingUp, Clock, Award, CheckCircle2, Circle,
    Lock, Play, ChevronDown, ChevronRight, Sparkles, Code2,
    FolderTree, BookOpen, Rocket, Zap, Trophy, Star, AlertCircle,
    Home, RefreshCw, Share2, Download, BarChart3, GitBranch,
    FileCode, Layout, Layers
} from 'lucide-react';

const ProjectBuilderDashboard = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [celebration, setCelebration] = useState(null);
    const [showShare, setShowShare] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [refreshing, setRefreshing] = useState(false);

    const fetchProject = useCallback(async () => {
        try {
            setError(null);
            const response = await api.get(`/project-builder/${id}`);
            setProject(response.data.project);
        } catch (error) {
            console.error('Error fetching project:', error);
            const errorMessage = error.response?.data?.message || 'Failed to load project';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [id]);

    useEffect(() => {
        fetchProject();
    }, [fetchProject]);

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            setError(null);
            const response = await api.get(`/project-builder/${id}`);
            setProject(response.data.project);
            toast.success('Project refreshed!');
        } catch (error) {
            console.error('Error fetching project:', error);
            const errorMessage = error.response?.data?.message || 'Failed to load project';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setRefreshing(false);
        }
    };

    const handleTaskComplete = async (projectId, taskId, submissionData) => {
        try {
            const response = await api.post(
                `/project-builder/${projectId}/tasks/${taskId}/submit`,
                submissionData
            );

            toast.success(response.data.message);

            // Check for new achievements
            if (response.data.achievements && response.data.achievements.length > 0) {
                setCelebration(response.data.achievements[0]);
            }

            // Refresh project data
            await fetchProject();
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to submit task');
        }
    };

    const handleShare = async () => {
        setShowShare(true);
        if (celebration) {
            try {
                await api.post(`/project-builder/${id}/share-achievement`, {
                    achievementType: celebration.type,
                });
            } catch (error) {
                console.error('Error marking achievement as shared:', error);
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-teal-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative inline-block">
                        <div className="absolute inset-0 bg-emerald-500 blur-3xl opacity-20 animate-pulse"></div>
                        <Rocket className="h-16 w-16 text-emerald-600 dark:text-emerald-400 animate-bounce relative z-10" />
                    </div>
                    <p className="mt-6 text-xl font-semibold text-gray-700 dark:text-gray-300">Loading your project...</p>
                    <div className="mt-4 flex gap-2 justify-center">
                        <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-teal-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 text-center border border-gray-200 dark:border-slate-700">
                    <div className="mb-6">
                        <div className="relative inline-block">
                            <div className="absolute inset-0 bg-red-500 blur-2xl opacity-30"></div>
                            <AlertCircle className="h-20 w-20 text-red-500 relative z-10" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                        {error ? 'Error Loading Project' : 'Project Not Found'}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        {error || 'The project you\'re looking for doesn\'t exist or has been removed.'}
                    </p>
                    <div className="flex gap-3 justify-center">
                        <Button onClick={() => navigate('/dashboard')} className="gap-2">
                            <Home className="h-4 w-4" />
                            Go to Dashboard
                        </Button>
                        <Button variant="outline" onClick={fetchProject} className="gap-2">
                            <RefreshCw className="h-4 w-4" />
                            Retry
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    const stats = [
        {
            icon: Target,
            label: 'Tasks',
            value: `${project.progress.totalTasksCompleted}/${project.progress.totalTasks}`,
            color: 'emerald',
            gradient: 'from-emerald-500 to-teal-500'
        },
        {
            icon: TrendingUp,
            label: 'Progress',
            value: `${project.progress.overallPercentage}%`,
            color: 'teal',
            gradient: 'from-teal-500 to-cyan-500'
        },
        {
            icon: Trophy,
            label: 'Achievements',
            value: project.achievements?.length || 0,
            color: 'yellow',
            gradient: 'from-yellow-500 to-orange-500'
        },
        {
            icon: Zap,
            label: 'Streak',
            value: `${project.progress.currentStreak || 0} days`,
            color: 'green',
            gradient: 'from-green-500 to-emerald-500'
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-teal-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
            <div className="container mx-auto px-4 py-6 sm:py-8 md:py-12">
                <div className="space-y-8">
                    {/* Header Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-slate-700"
                    >
                        {/* Top Banner */}
                        <div className="h-24 sm:h-32 bg-gradient-to-r from-emerald-600 to-teal-600 relative overflow-hidden">
                            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjIiIG9wYWNpdHk9Ii4xIi8+PC9nPjwvc3ZnPg==')] opacity-20"></div>
                            <div className="absolute top-4 right-4 flex gap-2">
                                <button
                                    onClick={handleRefresh}
                                    disabled={refreshing}
                                    className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-all"
                                >
                                    <RefreshCw className={`h-5 w-5 text-white ${refreshing ? 'animate-spin' : ''}`} />
                                </button>
                                <button
                                    onClick={() => setShowShare(true)}
                                    className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-all"
                                >
                                    <Share2 className="h-5 w-5 text-white" />
                                </button>
                            </div>
                        </div>

                        <div className="p-4 sm:p-6 md:p-8">
                            {/* Project Header */}
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 sm:gap-6 mb-4 sm:mb-6">
                                <div className="flex-1">
                                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                        {project.projectName}
                                    </h1>
                                    <p className="text-gray-600 dark:text-gray-400 mb-3 sm:mb-4 text-base sm:text-lg">
                                        {project.description}
                                    </p>
                                    <div className="flex flex-wrap gap-2 sm:gap-3">
                                        <span className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-sm sm:text-base font-semibold flex items-center gap-1 sm:gap-2 ${project.status === 'completed'
                                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/15'
                                            : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/15'
                                            }`}>
                                            {project.status === 'completed' ? (
                                                <><CheckCircle2 className="h-4 w-4" /> Completed</>
                                            ) : (
                                                <><Play className="h-4 w-4" /> In Progress</>
                                            )}
                                        </span>
                                        <span className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm sm:text-base font-medium flex items-center gap-1 sm:gap-2">
                                            <Clock className="h-4 w-4" />
                                            Started {new Date(project.progress.startedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-4 sm:mb-6">
                                <div className="flex justify-between items-center mb-2 sm:mb-3">
                                    <span className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-300">Overall Progress</span>
                                    <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                        {project.progress.overallPercentage}%
                                    </span>
                                </div>
                                <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full transition-all duration-1000 ease-out"
                                        style={{ width: `${project.progress.overallPercentage}%` }}
                                    ></div>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                    {project.progress.totalTasksCompleted} of {project.progress.totalTasks} tasks completed
                                </p>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                                {stats.map((stat, index) => (
                                    <div
                                        key={index}
                                        className="bg-white dark:bg-slate-700/50 rounded-xl p-4 border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all hover:-translate-y-1"
                                    >
                                        <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${stat.gradient} shadow-lg mb-3`}>
                                            <stat.icon className="h-6 w-6 text-white" />
                                        </div>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                            {stat.value}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {stat.label}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Navigation Tabs */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-2 border border-gray-200 dark:border-slate-700 inline-flex gap-2"
                    >
                        {[
                            { id: 'overview', icon: Layout, label: 'Overview' },
                            { id: 'tasks', icon: CheckCircle2, label: 'Tasks' },
                            { id: 'structure', icon: FolderTree, label: 'Structure' },
                            { id: 'readme', icon: BookOpen, label: 'README' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === tab.id
                                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/30'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
                                    }`}
                            >
                                <tab.icon className="h-5 w-5" />
                                <span className="hidden md:inline">{tab.label}</span>
                            </button>
                        ))}
                    </motion.div>

                    {/* Tab Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-6"
                    >
                        {/* Overview Tab */}
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Tech Stack */}
                                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-slate-700">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg">
                                                <Code2 className="h-6 w-6 text-white" />
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Tech Stack</h3>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {(() => {
                                                if (!project.techStack) {
                                                    return <span className="text-gray-500 dark:text-gray-400">No tech stack specified</span>;
                                                }

                                                // If it's an array, map over it
                                                if (Array.isArray(project.techStack)) {
                                                    return project.techStack.map((tech, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-lg font-medium text-sm border border-emerald-200 dark:border-emerald-800"
                                                        >
                                                            {tech}
                                                        </span>
                                                    ));
                                                }

                                                // If it's an object (with predefined, custom, frontend, backend, etc.)
                                                if (typeof project.techStack === 'object') {
                                                    const allTechs = [];
                                                    Object.values(project.techStack).forEach(value => {
                                                        if (Array.isArray(value)) {
                                                            allTechs.push(...value);
                                                        } else if (typeof value === 'string' && value) {
                                                            allTechs.push(value);
                                                        }
                                                    });

                                                    if (allTechs.length === 0) {
                                                        return <span className="text-gray-500 dark:text-gray-400">No tech stack specified</span>;
                                                    }

                                                    return allTechs.map((tech, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-lg font-medium text-sm border border-emerald-200 dark:border-emerald-800"
                                                        >
                                                            {tech}
                                                        </span>
                                                    ));
                                                }

                                                // If it's a string
                                                return (
                                                    <span className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-lg font-medium text-sm border border-emerald-200 dark:border-emerald-800">
                                                        {project.techStack}
                                                    </span>
                                                );
                                            })()}
                                        </div>
                                    </div>

                                    {/* Complexity & Timeline */}
                                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-slate-700">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                                                <BarChart3 className="h-6 w-6 text-white" />
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Project Info</h3>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600 dark:text-gray-400">Complexity</span>
                                                <span className="px-3 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-full font-medium text-sm border border-purple-200 dark:border-purple-800">
                                                    {project.complexity || 'Medium'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600 dark:text-gray-400">Skill Level</span>
                                                <span className="px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full font-medium text-sm border border-green-200 dark:border-green-800">
                                                    {project.skillLevel || 'Intermediate'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600 dark:text-gray-400">Estimated Time</span>
                                                <span className="font-semibold text-gray-900 dark:text-white">
                                                    {project.totalTimeEstimate || 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Milestones Overview */}
                                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-slate-700">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg">
                                            <GitBranch className="h-6 w-6 text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Milestones Progress</h3>
                                    </div>
                                    <div className="space-y-4">
                                        {project.milestones?.map((milestone) => {
                                            const completedTasks = milestone.tasks.filter(t => t.status === 'completed').length;
                                            const totalTasks = milestone.tasks.length;
                                            const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

                                            return (
                                                <div key={milestone.milestoneId} className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4 hover:shadow-md transition-all">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <h4 className="font-semibold text-gray-900 dark:text-white">{milestone.name}</h4>
                                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${milestone.status === 'completed'
                                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                                            : milestone.status === 'in-progress'
                                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                                                                : 'bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-300'
                                                            }`}>
                                                            {milestone.status}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full transition-all duration-500"
                                                                style={{ width: `${progress}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 min-w-[3rem] text-right">
                                                            {completedTasks}/{totalTasks}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* README Tab */}
                        {activeTab === 'readme' && (
                            <div>
                                {project.aiGeneratedGuide?.readme ? (
                                    <ReadmeViewer readme={project.aiGeneratedGuide.readme} />
                                ) : (
                                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-12 text-center border border-gray-200 dark:border-slate-700">
                                        <BookOpen className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No README Available</h3>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            The README documentation hasn't been generated yet.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Folder Structure Tab */}
                        {activeTab === 'structure' && (
                            <div>
                                {project.aiGeneratedGuide?.folderStructure ? (
                                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
                                        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6">
                                            <div className="flex items-center gap-3">
                                                <FolderTree className="h-8 w-8 text-white" />
                                                <h3 className="text-2xl font-bold text-white">Project Structure</h3>
                                            </div>
                                        </div>
                                        <div className="p-6">
                                            <FolderStructureTree
                                                structure={project.aiGeneratedGuide.folderStructure}
                                                fileDocumentation={project.aiGeneratedGuide.fileDocumentation || []}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-12 text-center border border-gray-200 dark:border-slate-700">
                                        <FolderTree className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Folder Structure Available</h3>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            The folder structure hasn't been generated yet.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Tasks Tab */}
                        {activeTab === 'tasks' && (
                            <div className="space-y-6">
                                {project.milestones && project.milestones.length > 0 ? (
                                    project.milestones.map((milestone) => (
                                        <div key={milestone.milestoneId} className="space-y-4">
                                            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-slate-700">
                                                <div className="flex items-center justify-between flex-wrap gap-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg">
                                                            <Layers className="h-6 w-6 text-white" />
                                                        </div>
                                                        <div>
                                                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{milestone.name}</h2>
                                                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                                                {milestone.description || `Estimated: ${milestone.estimatedDays} days`}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <span className={`px-5 py-2 rounded-full font-semibold text-sm ${milestone.status === 'completed'
                                                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/15'
                                                        : milestone.status === 'in-progress'
                                                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/15'
                                                            : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                                        }`}>
                                                        {milestone.status === 'completed' ? '✓ Completed' :
                                                            milestone.status === 'in-progress' ? '⚡ In Progress' :
                                                                '🔒 Locked'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="grid gap-4">
                                                {milestone.tasks.map((task) => (
                                                    <TaskCard
                                                        key={task.taskId}
                                                        task={task}
                                                        projectId={project._id}
                                                        onTaskComplete={handleTaskComplete}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-12 text-center border border-gray-200 dark:border-slate-700">
                                        <Target className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Tasks Available</h3>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            Tasks haven't been generated for this project yet.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>

            {/* Modals */}
            {celebration && (
                <CelebrationModal
                    achievement={celebration}
                    onClose={() => setCelebration(null)}
                    onShare={handleShare}
                />
            )}

            {showShare && (
                <ShareModal
                    achievement={celebration}
                    projectName={project.projectName}
                    onClose={() => setShowShare(false)}
                />
            )}

            {/* AI Assistant with Project Context */}
            <DiksuchAI
                projectContext={project ? {
                    title: project.projectName,
                    description: project.projectDescription || `Building ${project.projectName} - ${project.difficulty} level project`,
                    techStack: project.techStack || [],
                    features: project.tasks?.map(t => t.title) || [],
                    difficulty: project.difficulty,
                    tier: project.tier,
                    currentProgress: `${project.completedTasks || 0}/${project.totalTasks || 0} tasks completed`,
                    learningStreak: project.learningStreak
                } : null}
            />
        </div>
    );
};

export default ProjectBuilderDashboard;
