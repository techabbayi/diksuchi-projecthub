import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { formatCurrency, formatDate } from '../lib/utils';
import { TrendingUp, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const CreatorDashboard = () => {
    const [projects, setProjects] = useState([]);
    const [earnings, setEarnings] = useState({ wallet: 0, totalEarnings: 0, transactions: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [projectsRes, earningsRes] = await Promise.all([
                api.get('/projects/creator/my-projects'),
                api.get('/payment/earnings'),
            ]);
            setProjects(projectsRes.data.data);
            setEarnings(earningsRes.data.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this project?')) return;

        try {
            await api.delete(`/projects/${id}`);
            toast.success('Project deleted');
            fetchData();
        } catch (error) {
            toast.error('Failed to delete project');
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        };
        return colors[status] || colors.pending;
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6 sm:py-8">
            <div className="space-y-6 sm:space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-heading">Creator Dashboard</h1>
                        <p className="text-sm sm:text-base text-muted-foreground mt-2">Manage your projects and track earnings</p>
                    </div>
                    <Link to="/creator/upload" className="w-full sm:w-auto">
                        <Button className="w-full sm:w-auto">Upload New Project</Button>
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(earnings.wallet)}</div>
                            <p className="text-xs text-muted-foreground">Available to withdraw</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(earnings.totalEarnings)}</div>
                            <p className="text-xs text-muted-foreground">All time earnings</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Projects</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{projects.length}</div>
                            <p className="text-xs text-muted-foreground">Total uploaded</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Projects Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg sm:text-xl">My Projects</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 sm:p-6">
                        <div className="overflow-x-auto -mx-4 sm:mx-0">
                            <div className="inline-block min-w-full align-middle">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                                    <thead className="bg-gray-50 dark:bg-slate-700/50">
                                        <tr>
                                            <th className="text-left py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">Project</th>
                                            <th className="text-left py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                                            <th className="text-left py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">Price</th>
                                            <th className="text-left py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold text-gray-900 dark:text-white hidden sm:table-cell">Downloads</th>
                                            <th className="text-left py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold text-gray-900 dark:text-white hidden md:table-cell">Revenue</th>
                                            <th className="text-left py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {projects.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="text-center py-8 text-muted-foreground">
                                                    No projects yet. Upload your first project!
                                                </td>
                                            </tr>
                                        ) : (
                                            projects.map((project) => (
                                                <tr key={project._id} className="border-b border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/30">
                                                    <td className="py-3 px-3 sm:px-4">
                                                        <div className="flex items-center gap-2 sm:gap-3">
                                                            <img
                                                                src={project.screenshots?.[0] || 'https://via.placeholder.com/50'}
                                                                alt={project.title}
                                                                className="w-10 h-10 sm:w-12 sm:h-12 rounded object-cover flex-shrink-0"
                                                            />
                                                            <div className="min-w-0">
                                                                <div className="font-medium text-sm sm:text-base truncate">{project.title}</div>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {formatDate(project.createdAt)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-3 sm:px-4">
                                                        <Badge className={getStatusColor(project.status)}>
                                                            {project.status}
                                                        </Badge>
                                                        {project.verifiedByAdmin && (
                                                            <Badge variant="secondary" className="ml-1 sm:ml-2 text-xs">
                                                                ✓
                                                            </Badge>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-3 sm:px-4 text-sm sm:text-base">{formatCurrency(project.price)}</td>
                                                    <td className="py-3 px-3 sm:px-4 text-sm sm:text-base hidden sm:table-cell">{project.downloads || 0}</td>
                                                    <td className="py-3 px-3 sm:px-4 text-sm sm:text-base hidden md:table-cell">{formatCurrency(project.revenue || 0)}</td>
                                                    <td className="py-3 px-3 sm:px-4">
                                                        <div className="flex gap-1 sm:gap-2">
                                                            <Link to={`/project/${project._id}`}>
                                                                <Button size="sm" variant="ghost" className="h-8 text-xs sm:text-sm">
                                                                    View
                                                                </Button>
                                                            </Link>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => handleDelete(project._id)}
                                                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 h-8 w-8"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Transactions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Sales</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {earnings.transactions.length === 0 ? (
                                <p className="text-center py-4 text-muted-foreground">No sales yet</p>
                            ) : (
                                earnings.transactions.slice(0, 5).map((transaction) => (
                                    <div
                                        key={transaction._id}
                                        className="flex items-center justify-between py-2 border-b last:border-0"
                                    >
                                        <div>
                                            <p className="font-medium">{transaction.project?.title}</p>
                                            <p className="text-xs text-muted-foreground">
                                                Sold to {transaction.user?.username}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-green-600">
                                                +{formatCurrency(transaction.creatorEarning)}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatDate(transaction.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default CreatorDashboard;
