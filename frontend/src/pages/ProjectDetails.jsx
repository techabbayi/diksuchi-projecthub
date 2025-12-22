import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card, CardContent } from '../components/ui/Card';
import { Download, Star, Eye, Github, FileArchive, Heart, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import DownloadModal from '../components/DownloadModal';
import DiksuchAI from '../components/DiksuchAI';

const ProjectDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);
    const [checkingFavorite, setCheckingFavorite] = useState(true);
    const [showDownloadModal, setShowDownloadModal] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [userReview, setUserReview] = useState(null);
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const abortController = new AbortController();

        const fetchProject = async () => {
            try {
                const { data } = await api.get(`/projects/${id}`, {
                    signal: abortController.signal
                });
                if (isMounted) {
                    setProject(data.data.project);
                }
            } catch (error) {
                if (error.name === 'AbortError' || error.name === 'CanceledError') {
                    return; // Request was cancelled, ignore
                }
                console.error('Error fetching project:', error);
                if (isMounted) {
                    toast.error('Failed to load project');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        const checkFavoriteStatus = async () => {
            if (!user) {
                if (isMounted) {
                    setCheckingFavorite(false);
                }
                return;
            }
            try {
                const { data } = await api.get('/reviews/favorites/my', {
                    signal: abortController.signal
                });
                if (isMounted) {
                    const favoriteIds = data.data.map(p => p._id);
                    setIsFavorite(favoriteIds.includes(id));
                }
            } catch (error) {
                if (error.name === 'AbortError' || error.name === 'CanceledError') {
                    return; // Request was cancelled, ignore
                }
                console.error('Error checking favorite status:', error);
            } finally {
                if (isMounted) {
                    setCheckingFavorite(false);
                }
            }
        };

        const fetchReviews = async () => {
            try {
                const { data } = await api.get(`/reviews/${id}`, {
                    signal: abortController.signal
                });
                if (isMounted) {
                    setReviews(data.data);
                    if (user) {
                        const existingReview = data.data.find(r => r.user._id === user._id);
                        if (existingReview) {
                            setUserReview(existingReview);
                            setRating(existingReview.rating);
                            setComment(existingReview.comment || '');
                        }
                    }
                }
            } catch (error) {
                if (error.name === 'AbortError' || error.name === 'CanceledError') {
                    return;
                }
                console.error('Error fetching reviews:', error);
            }
        };

        fetchProject();
        checkFavoriteStatus();
        fetchReviews();

        return () => {
            isMounted = false;
            abortController.abort();
        };
    }, [id, user]);

    const handleDownload = async () => {
        if (!user) {
            toast.error('Please login to download');
            return;
        }
        // Show the download modal
        setShowDownloadModal(true);
    };

    const performDownload = async () => {
        try {
            if (project.type === 'free') {
                if (project.mode === 'github') {
                    // For GitHub projects, get the link and open in new tab
                    const { data } = await api.post(`/payment/download-free/${id}`);
                    window.open(data.data.project.githubLink, '_blank');
                } else {
                    // For ZIP projects, use the download endpoint with auth token
                    const token = localStorage.getItem('token');
                    const downloadUrl = `${import.meta.env.VITE_API_URL}/payment/download-file/${id}`;

                    // Use fetch to handle the download with auth header
                    const response = await fetch(downloadUrl, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (!response.ok) {
                        throw new Error('Download failed');
                    }

                    // Get the blob and create download link
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `${project.title}.zip`;
                    link.style.display = 'none';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);
                }
            } else {
                toast.info('Payment integration coming soon!');
            }
        } catch (error) {
            console.error('Error downloading:', error);
            toast.error(error.response?.data?.message || error.message || 'Download failed');
            setShowDownloadModal(false);
        }
    };

    const handleToggleFavorite = async () => {
        if (!user) {
            toast.error('Please login to add favorites');
            return;
        }

        try {
            const response = await api.post(`/reviews/favorite/${id}`);
            setIsFavorite(response.data.data.isFavorite);
            toast.success(response.data.message);
        } catch (error) {
            console.error('Error toggling favorite:', error);
            toast.error(error.response?.data?.message || 'Failed to update favorite');
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();

        if (!user) {
            toast.error('Please login to submit a review');
            return;
        }

        if (rating === 0) {
            toast.error('Please select a rating');
            return;
        }

        setSubmittingReview(true);
        try {
            const { data } = await api.post(`/reviews/${id}`, {
                rating,
                comment: comment.trim()
            });

            setUserReview(data.data);
            toast.success(userReview ? 'Review updated successfully!' : 'Review submitted successfully!');

            // Refresh reviews
            const reviewsRes = await api.get(`/reviews/${id}`);
            setReviews(reviewsRes.data.data);

            // Refresh project to get updated rating
            const projectRes = await api.get(`/projects/${id}`);
            setProject(projectRes.data.data.project);
        } catch (error) {
            console.error('Error submitting review:', error);
            toast.error(error.response?.data?.message || 'Failed to submit review');
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Loading project...</p>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <p className="text-gray-600 dark:text-gray-400">Project not found</p>
                <Button onClick={() => window.history.back()} className="mt-4">
                    Go Back
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f8faf9] via-white to-[#d8e2dc]/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
            {/* Hero Section */}
            <div>
                <div className="container mx-auto px-6 py-12">
                    {/* Back Button */}
                    <Button
                        onClick={() => navigate(-1)}
                        className="mb-6 bg-gray-900/10 dark:bg-white/10 backdrop-blur-sm border-2 border-gray-900/30 dark:border-white/30 text-gray-900 dark:text-white hover:bg-gray-900/20 dark:hover:bg-white/20 font-semibold px-4 py-2 rounded-xl transition-all"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                    <div className="grid grid-cols-1 lg:grid-cols-6 gap-12 items-center">
                        {/* Left: Project Info */}
                        <div className="lg:col-span-3 space-y-6 text-gray-900 dark:text-white">
                            <div className="flex flex-wrap gap-3">
                                <Badge className="bg-gray-900/20 dark:bg-white/20 backdrop-blur-sm border-2 border-gray-900/30 dark:border-white/30 text-gray-900 dark:text-white font-bold text-sm px-4 py-1.5">
                                    {project.tier}
                                </Badge>
                                <Badge className="bg-gray-900/20 dark:bg-white/20 backdrop-blur-sm border-2 border-gray-900/30 dark:border-white/30 text-gray-900 dark:text-white font-bold text-sm px-4 py-1.5">
                                    {project.difficulty}
                                </Badge>
                                {project.verifiedByAdmin && (
                                    <Badge className="bg-[#ffb703] border-2 border-gray-900/30 dark:border-white/30 text-white font-bold text-sm px-4 py-1.5 flex items-center gap-1.5">
                                        <Star className="h-3.5 w-3.5" />
                                        Verified
                                    </Badge>
                                )}
                            </div>

                            <h1 className="text-5xl lg:text-6xl font-black leading-tight">{project.title}</h1>

                            <p className="text-xl text-gray-800 dark:text-white/90 leading-relaxed">{project.description}</p>

                            {/* Stats Bar */}
                            <div className="flex flex-wrap items-center gap-6 pt-4">
                                <div className="flex items-center gap-2">
                                    <Star className="h-6 w-6 fill-[#ffb703] text-[#ffb703]" />
                                    <span className="text-2xl font-black">{project.rating?.toFixed(1) || '0.0'}</span>
                                    <span className="text-gray-700 dark:text-white/80 text-sm">({project.reviewCount || 0})</span>
                                </div>
                                <div className="h-8 w-px bg-gray-900/30 dark:bg-white/30"></div>
                                <div className="flex items-center gap-2">
                                    <Download className="h-6 w-6" />
                                    <span className="text-xl font-bold">{project.downloads || 0}</span>
                                    <span className="text-gray-700 dark:text-white/80 text-sm">downloads</span>
                                </div>
                                <div className="h-8 w-px bg-gray-900/30 dark:bg-white/30"></div>
                                <div className="flex items-center gap-2">
                                    <Eye className="h-6 w-6" />
                                    <span className="text-xl font-bold">{project.views || 0}</span>
                                    <span className="text-gray-700 dark:text-white/80 text-sm">views</span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-4 pt-4">
                                <Button
                                    className="bg-white text-[#2d6a4f] hover:bg-white/90 shadow-2xl hover:shadow-white/20 font-bold px-8 py-6 text-lg rounded-2xl transition-all hover:scale-105"
                                    onClick={handleDownload}
                                >
                                    {project.mode === 'github' ? (
                                        <>
                                            <Github className="mr-2 h-6 w-6" />
                                            View on GitHub
                                        </>
                                    ) : (
                                        <>
                                            <FileArchive className="mr-2 h-6 w-6" />
                                            Download ZIP
                                        </>
                                    )}
                                </Button>

                                {user && (
                                    <Button
                                        variant="outline"
                                        className={`border-2 font-bold px-8 py-6 text-lg rounded-2xl transition-all hover:scale-105 ${isFavorite
                                            ? 'bg-rose-500 border-rose-500 text-white hover:bg-rose-600'
                                            : 'bg-gray-900/10 dark:bg-white/10 backdrop-blur-sm border-gray-900/30 dark:border-white/30 text-gray-900 dark:text-white hover:bg-gray-900/20 dark:hover:bg-white/20'
                                            }`}
                                        onClick={handleToggleFavorite}
                                        disabled={checkingFavorite}
                                    >
                                        <Heart className={`mr-2 h-6 w-6 ${isFavorite ? 'fill-current' : ''}`} />
                                        {isFavorite ? 'Favorited' : 'Add to Favorites'}
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Right: Screenshot */}
                        <div className="lg:col-span-3 relative">
                            <div className="rounded-3xl overflow-hidden border-4 border-gray-900/20 dark:border-white/20 shadow-2xl backdrop-blur-sm">
                                <img
                                    src={project.screenshots?.[0] || 'https://via.placeholder.com/800x600'}
                                    alt={project.title}
                                    className="w-full h-[400px] object-cover transform hover:scale-110 transition-transform duration-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Tech Stack - Below Screenshot */}
                    <div className="pt-8">
                        <div className="bg-gray-900/10 dark:bg-white/10 backdrop-blur-sm border-2 border-gray-900/20 dark:border-white/20 rounded-2xl p-6">
                            <h3 className="text-gray-900 dark:text-white font-bold text-lg mb-4 flex items-center gap-2">
                                <div className="w-1.5 h-6 bg-gray-900 dark:bg-white rounded-full"></div>
                                Technologies Used
                            </h3>
                            <div className="flex flex-wrap gap-3">
                                {project.techStack?.map((tech, index) => (
                                    <Badge
                                        key={index}
                                        className="bg-white dark:bg-slate-800 text-[#2d6a4f] dark:text-[#74c69d] border border-gray-200 dark:border-slate-700 font-bold text-sm px-4 py-2 rounded-xl hover:scale-105 transition-transform cursor-default"
                                    >
                                        {tech}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                    {/* Left Column - Reviews Display - 2/3 Width */}
                    <div className="lg:col-span-3">
                        {/* Reviews Display Section */}
                        <Card className="border-none shadow-2xl rounded-3xl overflow-hidden bg-white dark:bg-slate-800">
                            <div className="bg-gray-50 dark:bg-slate-900 px-8 py-6 border-b border-gray-200 dark:border-slate-700">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                        <div className="w-1 h-8 bg-gradient-to-b from-[#2d6a4f] to-[#74c69d] rounded-full"></div>
                                        Reviews
                                        <span className="text-lg font-normal text-gray-500 dark:text-gray-400">({reviews.length})</span>
                                    </h2>
                                </div>
                            </div>
                            <CardContent className="p-8">
                                {reviews.length > 0 ? (
                                    <div className="space-y-4">
                                        {reviews.map((review) => (
                                            <div
                                                key={review._id}
                                                className="p-6 bg-gray-50 dark:bg-slate-900/50 rounded-2xl border border-gray-200 dark:border-slate-700 hover:border-[#2d6a4f] dark:hover:border-[#74c69d] hover:shadow-md transition-all"
                                            >
                                                <div className="flex items-start gap-4 mb-3">
                                                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-[#2d6a4f] to-[#74c69d] flex items-center justify-center text-white font-bold text-lg shadow-md">
                                                        {review.user?.username?.charAt(0).toUpperCase() || 'U'}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div>
                                                                <p className="font-bold text-base text-gray-900 dark:text-white">
                                                                    {review.user?.username || 'Anonymous'}
                                                                </p>
                                                                <div className="flex items-center gap-1.5 mt-1">
                                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                                        <Star
                                                                            key={star}
                                                                            className={`h-4 w-4 ${star <= review.rating
                                                                                ? 'fill-[#ffb703] text-[#ffb703]'
                                                                                : 'text-gray-300 dark:text-gray-600'
                                                                                }`}
                                                                        />
                                                                    ))}
                                                                    <span className="ml-1 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                                        {review.rating}.0
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                                                {new Date(review.createdAt).toLocaleDateString('en-US', {
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                    year: 'numeric'
                                                                })}
                                                            </span>
                                                        </div>
                                                        {review.comment && (
                                                            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mt-2">
                                                                {review.comment}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-16">
                                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-slate-700 mb-6">
                                            <Star className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                            No Reviews Yet
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                                            Be the first to share your experience with this project! Your feedback helps others make informed decisions.
                                        </p>
                                        {user && (
                                            <p className="text-sm text-[#2d6a4f] dark:text-[#74c69d] font-semibold">
                                                👉 Use the form on the right to submit your review
                                            </p>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Sidebar - 1/3 Width */}
                    <div className="space-y-6">
                        {/* Write Review Card */}
                        {user && (
                            <Card className="border-none shadow-2xl rounded-3xl overflow-hidden bg-white dark:bg-slate-800">
                                <div className="bg-gradient-to-r from-[#2d6a4f] to-[#74c69d] px-6 py-5">
                                    <h3 className="text-white font-bold text-lg flex items-center gap-2">
                                        <Star className="h-5 w-5 fill-white" />
                                        {userReview ? 'Update Review' : 'Write Review'}
                                    </h3>
                                </div>
                                <CardContent className="p-6">
                                    <form onSubmit={handleSubmitReview} className="space-y-5">
                                        {/* Star Rating Input */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                                Rating <span className="text-red-500">*</span>
                                            </label>
                                            <div className="flex items-center justify-center gap-1 bg-gray-50 dark:bg-slate-700/50 p-4 rounded-xl">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        onClick={() => setRating(star)}
                                                        onMouseEnter={() => setHoveredRating(star)}
                                                        onMouseLeave={() => setHoveredRating(0)}
                                                        className="transition-all hover:scale-110 focus:outline-none p-1"
                                                    >
                                                        <Star
                                                            className={`h-8 w-8 transition-all ${star <= (hoveredRating || rating)
                                                                ? 'fill-[#ffb703] text-[#ffb703]'
                                                                : 'text-gray-300 dark:text-gray-500'
                                                                }`}
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                            {rating > 0 && (
                                                <div className="text-center">
                                                    <span className="inline-block px-4 py-2 bg-gradient-to-r from-[#ffb703] to-[#ff9500] text-white font-bold text-lg rounded-xl shadow-md">
                                                        {rating}.0
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Comment Textarea */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-900 dark:text-white">
                                                Comment <span className="text-gray-400 text-xs font-normal">(Optional)</span>
                                            </label>
                                            <div className="relative">
                                                <textarea
                                                    value={comment}
                                                    onChange={(e) => setComment(e.target.value)}
                                                    placeholder="Share your thoughts..."
                                                    className="w-full h-32 px-4 py-3 border-2 border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-[#2d6a4f] focus:border-transparent transition-all resize-none text-sm leading-relaxed"
                                                    maxLength={500}
                                                />
                                                <div className="absolute bottom-2 right-2 text-xs font-medium text-gray-400 bg-gray-50 dark:bg-slate-600 px-2 py-1 rounded">
                                                    {comment.length}/500
                                                </div>
                                            </div>
                                        </div>

                                        {/* Submit Button */}
                                        <Button
                                            type="submit"
                                            disabled={submittingReview || rating === 0}
                                            className="w-full bg-gradient-to-r from-[#2d6a4f] to-[#74c69d] hover:from-[#256050] hover:to-[#5db88a] text-white font-bold py-3 text-sm rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                        >
                                            {submittingReview ? (
                                                <div className="flex items-center justify-center">
                                                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                                                    Submitting...
                                                </div>
                                            ) : userReview ? (
                                                'Update Review'
                                            ) : (
                                                'Submit Review'
                                            )}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        )}

                        {/* Project Details Card */}
                        <Card className="border-none shadow-2xl rounded-3xl overflow-hidden bg-white dark:bg-slate-800">
                            <div className="bg-gradient-to-r from-[#2d6a4f] to-[#74c69d] px-6 py-5">
                                <h3 className="text-white font-bold text-lg">Project Details</h3>
                            </div>
                            <CardContent className="p-6 space-y-5">
                                {/* Category */}
                                {project.category && (
                                    <div className="flex items-center justify-between pb-5 border-b border-gray-200 dark:border-slate-700">
                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Category</span>
                                        <span className="text-base font-semibold text-gray-900 dark:text-white">{project.category}</span>
                                    </div>
                                )}

                                {/* Type */}
                                <div className="flex items-center justify-between pb-5 border-b border-gray-200 dark:border-slate-700">
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Type</span>
                                    <Badge className={`${project.type === 'free' ? 'bg-green-500/10 text-green-600 border border-green-500/20' : 'bg-blue-500/10 text-blue-600 border border-blue-500/20'} font-semibold text-sm px-3 py-1`}>
                                        {project.type === 'free' ? 'Free' : 'Premium'}
                                    </Badge>
                                </div>

                                {/* Downloads */}
                                <div className="flex items-center justify-between pb-5 border-b border-gray-200 dark:border-slate-700">
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Downloads</span>
                                    <span className="text-2xl font-bold text-[#2d6a4f] dark:text-[#74c69d]">{project.downloads || 0}</span>
                                </div>

                                {/* Created Date */}
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Published</span>
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {new Date(project.createdAt).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Download Modal */}
            <DownloadModal
                isOpen={showDownloadModal}
                onClose={() => setShowDownloadModal(false)}
                projectTitle={project.title}
                onDownloadComplete={performDownload}
            />
        </div>
    );
};

export default ProjectDetails;
