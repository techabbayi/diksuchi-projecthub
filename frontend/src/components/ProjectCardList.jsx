import { Link } from 'react-router-dom';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Download, Star, Eye, Heart, Github, FileArchive, Loader2, CheckCircle, ExternalLink } from 'lucide-react';
import { formatCurrency, getTierBadgeColor, getDifficultyColor } from '../lib/utils';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

const ProjectCardList = ({ project, isFavorite: initialFavorite, onFavoriteChange }) => {
    const { user } = useAuthStore();
    const [isFavorite, setIsFavorite] = useState(initialFavorite || false);
    const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

    useEffect(() => {
        setIsFavorite(initialFavorite || false);
    }, [initialFavorite]);

    const {
        _id,
        title,
        description,
        screenshots,
        tier,
        price,
        difficulty,
        rating,
        downloads,
        views,
        mode,
        techStack,
        verifiedByAdmin,
    } = project;

    const handleFavoriteClick = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            toast.error('Please login to add favorites');
            return;
        }

        if (isTogglingFavorite) return;

        setIsTogglingFavorite(true);
        try {
            const response = await api.post(`/reviews/favorite/${_id}`);
            setIsFavorite(response.data.data.isFavorite);
            toast.success(response.data.message);

            if (onFavoriteChange) {
                onFavoriteChange(_id, response.data.data.isFavorite);
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            toast.error(error.response?.data?.message || 'Failed to update favorite');
        } finally {
            setIsTogglingFavorite(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="relative bg-white dark:bg-slate-800 rounded-3xl border-2 border-[#d8e2dc] dark:border-slate-700 hover:border-[#2d6a4f] dark:hover:border-[#74c69d] shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group p-6">
                <div className="flex gap-6 items-start">
                    {/* Left: Image */}
                    <div className="relative w-64 h-48 flex-shrink-0 rounded-2xl overflow-hidden bg-gray-200 dark:bg-slate-700">
                        <img
                            src={screenshots?.[0] || 'https://via.placeholder.com/400x300?text=No+Image'}
                            alt={title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                    </div>

                    {/* Center: Content */}
                    <div className="flex-1 space-y-4 min-w-0">
                        {/* Header Section */}
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="font-black text-xl text-gray-900 dark:text-white group-hover:text-[#2d6a4f] dark:group-hover:text-[#74c69d] transition-colors line-clamp-1">
                                        {title}
                                    </h3>
                                    <Badge className={`${getDifficultyColor(difficulty)} font-bold text-xs flex-shrink-0`}>
                                        {difficulty}
                                    </Badge>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                                    {description}
                                </p>
                            </div>

                            <div className="text-right flex-shrink-0">
                                <div className="text-2xl font-black text-[#2d6a4f] dark:text-[#74c69d]">
                                    {formatCurrency(price)}
                                </div>
                                <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 justify-end mt-1">
                                    {mode === 'github' ? (
                                        <Github className="h-3.5 w-3.5" />
                                    ) : (
                                        <FileArchive className="h-3.5 w-3.5" />
                                    )}
                                    <span className="text-xs capitalize font-medium">{mode}</span>
                                </div>
                            </div>
                        </div>

                        {/* Tech Stack */}
                        <div className="flex flex-wrap gap-2">
                            {techStack?.slice(0, 6).map((tech, index) => (
                                <Badge
                                    key={index}
                                    variant="outline"
                                    className="text-xs font-semibold border-2 border-[#d8e2dc] text-[#2d6a4f] dark:border-slate-600 dark:text-[#74c69d] hover:bg-[#2d6a4f]/10 transition-colors"
                                >
                                    {tech}
                                </Badge>
                            ))}
                            {techStack?.length > 6 && (
                                <Badge
                                    variant="outline"
                                    className="text-xs font-semibold border-2 border-[#d8e2dc] text-[#2d6a4f] dark:border-slate-600 dark:text-[#74c69d]"
                                >
                                    +{techStack.length - 6}
                                </Badge>
                            )}
                        </div>

                        {/* Stats and Actions */}
                        <div className="flex items-center justify-between pt-3 border-t-2 border-[#d8e2dc] dark:border-slate-700">
                            <div className="flex items-center gap-5">
                                <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                                    <Star className="h-4 w-4 fill-[#ffb703] text-[#ffb703]" />
                                    <span className="font-bold text-sm">{rating?.toFixed(1) || '0.0'}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                                    <Download className="h-4 w-4" />
                                    <span className="font-semibold text-sm">{downloads || 0}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                                    <Eye className="h-4 w-4" />
                                    <span className="font-semibold text-sm">{views || 0}</span>
                                </div>
                                {verifiedByAdmin && (
                                    <Badge className="bg-gray-200 dark:bg-gray-800 hover:bg-green-400 dark:hover:bg-green-800 border-2 border-green-500 dark:border-green-700 text-green-700 dark:text-white font-bold flex items-center gap-1 text-xs px-2 py-0.5">
                                        <CheckCircle className="h-3 w-3" />
                                        Verified
                                    </Badge>
                                )}
                            </div>

                            <Link to={`/project/${_id}`}>
                                <Button
                                    size="sm"
                                    className="bg-[#2d6a4f] hover:bg-[#2d6a4f]/90 text-white shadow-md font-bold px-6 py-2 group-hover:shadow-lg transition-all flex items-center gap-2"
                                >
                                    View Details
                                    <ExternalLink className="h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Favorite Button */}
                <button
                    onClick={handleFavoriteClick}
                    disabled={isTogglingFavorite}
                    className={`absolute top-6 left-6 w-12 h-12 rounded-full backdrop-blur-xl flex items-center justify-center shadow-lg transition-all hover:scale-110 z-10 ${isFavorite
                        ? 'bg-rose-500 hover:bg-rose-600'
                        : 'bg-white/90 hover:bg-white dark:bg-slate-800/90 dark:hover:bg-slate-800 border-2 border-[#d8e2dc] dark:border-slate-600'
                        } ${isTogglingFavorite ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                    {isTogglingFavorite ? (
                        <Loader2 className="h-6 w-6 animate-spin text-gray-700 dark:text-gray-300" />
                    ) : (
                        <motion.div
                            key={isFavorite ? 'favorited' : 'not-favorited'}
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{
                                scale: 1,
                                opacity: 1,
                            }}
                            transition={{
                                type: "spring",
                                stiffness: 500,
                                damping: 15
                            }}
                        >
                            <Heart
                                className={`h-6 w-6 transition-all ${isFavorite
                                    ? 'fill-white text-white'
                                    : 'text-gray-700 dark:text-gray-300'
                                    }`}
                            />
                        </motion.div>
                    )}
                </button>
            </div>
        </motion.div>
    );
};

export default ProjectCardList;
