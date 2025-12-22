import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import ProjectCard from '../components/ProjectCard';
import CustomProjectCard from '../components/CustomProjectCard';
import DiksuchAI from '../components/DiksuchAI';
import { Heart, ShoppingBag, TrendingUp, Package, Sparkles, Boxes, HeartHandshake, Code2, CheckCircle2, Wand2, ArrowRight, Clock, Target } from 'lucide-react';

const Dashboard = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [favorites, setFavorites] = useState([]);
    const [purchases, setPurchases] = useState([]);
    const [customProject, setCustomProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [favoriteIds, setFavoriteIds] = useState([]);

    const fetchData = useCallback(async () => {
        if (!user) return;

        try {
            const [favRes, purchaseRes, customProjectRes] = await Promise.all([
                api.get('/reviews/favorites/my'),
                api.get('/payment/purchases'),
                api.get('/project-builder/my-project').catch(() => ({ data: { project: null } })),
            ]);
            const favoritesData = favRes.data.data;
            setFavorites(favoritesData);
            setFavoriteIds(favoritesData.map(p => p._id));
            setPurchases(purchaseRes.data.data);
            setCustomProject(customProjectRes.data.project);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        // Redirect admins to admin dashboard
        if (user?.role === 'admin') {
            navigate('/admin/dashboard');
            return;
        }

        if (!user) return;

        fetchData();
    }, [user, navigate, fetchData]);

    // Refetch data when page becomes visible (user returns to dashboard)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden && user) {
                fetchData();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [fetchData, user]);

    const handleFavoriteChange = useCallback(async (projectId, isFavorite) => {
        if (isFavorite) {
            // Fetch updated favorites list
            try {
                const { data } = await api.get('/reviews/favorites/my');
                setFavorites(data.data);
                setFavoriteIds(data.data.map(p => p._id));
            } catch (error) {
                console.error('Error fetching favorites:', error);
            }
        } else {
            // Remove from local state
            setFavorites(prev => prev.filter(p => p._id !== projectId));
            setFavoriteIds(prev => prev.filter(id => id !== projectId));
        }
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            {/* Hero Header Section */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 dark:from-green-800 dark:to-green-900 text-white">
                <div className="container mx-auto px-4 py-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-6"
                    >
                        <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-3xl border-2 border-white/30 shadow-lg">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1">
                            <h1 className="text-4xl font-bold mb-2">
                                Welcome back, {user?.name}!
                            </h1>
                            <p className="text-green-100 text-lg">
                                Track your learning journey and manage your projects
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="space-y-8">
                    {/* Quick Stats Overview */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    >
                        {/* Total Purchases Card */}
                        <Card className="border-green-200 dark:border-green-800 hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Projects</p>
                                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{purchases.length}</h3>
                                        <p className="text-sm text-green-600 dark:text-green-400 mt-1">Purchased</p>
                                    </div>
                                    <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-xl">
                                        <Package className="h-6 w-6 text-green-600 dark:text-green-400" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Favorites Card */}
                        <Card className="border-green-200 dark:border-green-800 hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Favorites</p>
                                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{favorites.length}</h3>
                                        <p className="text-sm text-green-600 dark:text-green-400 mt-1">Saved projects</p>
                                    </div>
                                    <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-xl">
                                        <Heart className="h-6 w-6 text-red-600 dark:text-red-400" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Custom Project Status */}
                        <Card className="border-green-200 dark:border-green-800 hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Custom Project</p>
                                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                                            {customProject ? `${customProject.progress?.overallPercentage || 0}%` : 'None'}
                                        </h3>
                                        <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                                            {customProject ? 'In Progress' : 'Not Started'}
                                        </p>
                                    </div>
                                    <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-xl">
                                        <Code2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Custom Project Builder Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-4"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-green-600 dark:bg-green-700 p-2 rounded-lg">
                                    <Sparkles className="h-5 w-5 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">AI Custom Project</h2>
                            </div>
                            {customProject && (
                                <Link to={`/project-builder/${customProject._id}`}>
                                    <Button variant="ghost" size="sm" className="text-green-600 dark:text-green-400">
                                        View All <ArrowRight className="ml-1 h-4 w-4" />
                                    </Button>
                                </Link>
                            )}
                        </div>

                        {customProject ? (
                            <Card className="border-2 border-green-200 dark:border-green-800 hover:shadow-lg transition-shadow">
                                <CardContent className="p-6">
                                    <div className="grid md:grid-cols-3 gap-6">
                                        {/* Project Info */}
                                        <div className="md:col-span-2 space-y-4">
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{customProject.projectName}</h3>
                                                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">{customProject.description}</p>
                                            </div>

                                            {/* Tech Stack Tags */}
                                            <div className="flex flex-wrap gap-2">
                                                {Array.isArray(customProject.techStack) && customProject.techStack.slice(0, 6).map((tech, idx) => (
                                                    <span key={idx} className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-xs font-medium">
                                                        {tech}
                                                    </span>
                                                ))}
                                            </div>

                                            {/* Progress Bar */}
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Overall Progress</span>
                                                    <span className="text-sm font-bold text-green-600 dark:text-green-400">{customProject.progress?.overallPercentage || 0}%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                                    <div
                                                        className="bg-green-600 dark:bg-green-500 h-2.5 rounded-full transition-all duration-300"
                                                        style={{ width: `${customProject.progress?.overallPercentage || 0}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Milestones Sidebar */}
                                        <div className="space-y-3">
                                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                                <Target className="h-4 w-4" />
                                                Recent Activities
                                            </h4>
                                            {(() => {
                                                // Filter milestones that have progress (in-progress or completed status, or have completed tasks)
                                                const activeMilestones = customProject.milestones?.filter(milestone =>
                                                    milestone.status === 'in-progress' ||
                                                    milestone.status === 'completed' ||
                                                    milestone.tasks?.some(task => task.status === 'completed')
                                                ) || [];

                                                return activeMilestones.length > 0 ? (
                                                    <div className="space-y-2">
                                                        {activeMilestones.slice(0, 2).map((milestone, idx) => {
                                                            const milestoneTitle = milestone.title || milestone.name || `Milestone ${idx + 1}`;
                                                            const completedTasks = milestone.tasks?.filter(t => t.status === 'completed').length || 0;
                                                            const totalTasks = milestone.tasks?.length || 0;

                                                            return (
                                                                <div key={idx} className="flex items-start gap-2 p-2.5 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                                                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                                                    <div className="flex-1">
                                                                        <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">{milestoneTitle}</p>
                                                                        {totalTasks > 0 && (
                                                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                                                {completedTasks}/{totalTasks} tasks completed
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-6 space-y-2">
                                                        <Clock className="h-8 w-8 text-gray-400 dark:text-gray-600 mx-auto mb-2" />
                                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">No activities yet</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-500">Start working on your project to see progress here</p>
                                                    </div>
                                                );
                                            })()}
                                            <Link to={`/project-builder/${customProject._id}`}>
                                                <Button className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white mt-2">
                                                    <Code2 className="mr-2 h-4 w-4" />
                                                    {(customProject.progress?.overallPercentage || 0) > 0 ? 'Continue Building' : 'Start Building'}
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="border-2 border-dashed border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-900/10">
                                <CardContent className="py-12 text-center">
                                    <div className="max-w-md mx-auto space-y-4">
                                        <div className="w-16 h-16 rounded-full bg-green-600 dark:bg-green-700 flex items-center justify-center mx-auto">
                                            <Wand2 className="h-8 w-8 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Create Your AI-Powered Project</h3>
                                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                                Generate a personalized project roadmap with AI guidance, tailored to your goals and skill level.
                                            </p>
                                        </div>
                                        <Link to="/project-builder">
                                            <Button className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white">
                                                <Sparkles className="mr-2 h-5 w-5" />
                                                Start Building Now
                                            </Button>
                                        </Link>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">1 free custom project included</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </motion.div>

                    {/* Recent Purchases Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-4"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-green-600 dark:bg-green-700 p-2 rounded-lg">
                                    <Package className="h-5 w-5 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Purchases</h2>
                            </div>
                            {purchases.length > 3 && (
                                <Link to="/projects">
                                    <Button variant="ghost" size="sm" className="text-green-600 dark:text-green-400">
                                        View All <ArrowRight className="ml-1 h-4 w-4" />
                                    </Button>
                                </Link>
                            )}
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin h-12 w-12 border-4 border-green-600 border-t-transparent rounded-full"></div>
                            </div>
                        ) : purchases.length === 0 ? (
                            <Card className="border-2 border-dashed border-gray-300 dark:border-gray-700">
                                <CardContent className="py-16 text-center">
                                    <ShoppingBag className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">No purchases yet</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Start exploring projects to begin your learning journey</p>
                                    <Link to="/projects">
                                        <Button className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white">
                                            Browse Projects
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {purchases.slice(0, 3).map((purchase) => (
                                    <ProjectCard
                                        key={purchase._id}
                                        project={purchase.project}
                                        isFavorite={favoriteIds.includes(purchase.project._id)}
                                        onFavoriteChange={handleFavoriteChange}
                                    />
                                ))}
                            </div>
                        )}
                    </motion.div>

                    {/* Favorites Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="space-y-4"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-red-600 dark:bg-red-700 p-2 rounded-lg">
                                    <Heart className="h-5 w-5 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Favorites</h2>
                            </div>
                            {favorites.length > 3 && (
                                <Link to="/projects">
                                    <Button variant="ghost" size="sm" className="text-green-600 dark:text-green-400">
                                        View All <ArrowRight className="ml-1 h-4 w-4" />
                                    </Button>
                                </Link>
                            )}
                        </div>

                        {favorites.length === 0 ? (
                            <Card className="border-2 border-dashed border-gray-300 dark:border-gray-700">
                                <CardContent className="py-16 text-center">
                                    <Heart className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">No favorites yet</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Click the heart icon on projects to save them here</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {favorites.slice(0, 3).map((project) => (
                                    <ProjectCard
                                        key={project._id}
                                        project={project}
                                        isFavorite={true}
                                        onFavoriteChange={handleFavoriteChange}
                                    />
                                ))}
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>

            {/* Floating AI Chatbot */}
            <DiksuchAI />
        </div>
    );
};

export default Dashboard;
