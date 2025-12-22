import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Download, Star, Eye, Heart, Github, FileArchive, Check, Loader2, CheckCircle } from 'lucide-react';
import { formatCurrency, getTierBadgeColor, getDifficultyColor } from '../lib/utils';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

const ProjectCard = ({ project, isFavorite: initialFavorite, onFavoriteChange }) => {
    const { user } = useAuthStore();
    const [isFavorite, setIsFavorite] = useState(initialFavorite || false);
    const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

    // Sync local state when prop changes
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

            // Notify parent component if callback provided
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full"
        >
            <Card className="relative h-full hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden group border-2 border-[#d8e2dc] dark:border-slate-700 bg-white dark:bg-slate-800 rounded-2xl">
                {/* Image */}
                <div className="relative h-48 overflow-hidden bg-gray-200 dark:bg-slate-700">
                    <img
                        src={screenshots?.[0] || 'https://via.placeholder.com/400x300?text=No+Image'}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                {/* Favorite Button */}
                <button
                    onClick={handleFavoriteClick}
                    disabled={isTogglingFavorite}
                    className={`absolute top-3 right-3 w-10 h-10 rounded-full backdrop-blur-xl flex items-center justify-center shadow-lg transition-all hover:scale-110 z-10 ${isFavorite
                        ? 'bg-rose-500 hover:bg-rose-600'
                        : 'bg-white/90 hover:bg-white dark:bg-slate-800/90 dark:hover:bg-slate-800 border-2 border-[#d8e2dc] dark:border-slate-600'
                        } ${isTogglingFavorite ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                    {isTogglingFavorite ? (
                        <Loader2 className="h-5 w-5 animate-spin text-gray-700 dark:text-gray-300" />
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
                                className={`h-5 w-5 transition-all ${isFavorite
                                    ? 'fill-white text-white'
                                    : 'text-gray-700 dark:text-gray-300'
                                    }`}
                            />
                        </motion.div>
                    )}
                </button>


                <CardHeader className="pb-3 pt-4 px-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-bold text-lg line-clamp-1 text-gray-900 dark:text-white group-hover:text-[#2d6a4f] dark:group-hover:text-[#74c69d] transition-colors">
                            {title}
                        </h3>
                        <span className="text-lg font-black text-[#2d6a4f] dark:text-[#74c69d] whitespace-nowrap">
                            {formatCurrency(price)}
                        </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">{description}</p>
                </CardHeader>

                <CardContent className="space-y-3 pb-3 px-4">
                    {/* Tech Stack */}
                    <div className="flex flex-wrap gap-1.5">
                        {techStack?.slice(0, 4).map((tech, index) => (
                            <Badge
                                key={index}
                                variant="outline"
                                className="text-[10px] font-semibold border-2 border-[#d8e2dc] text-[#2d6a4f] dark:border-slate-600 dark:text-[#74c69d] px-2 py-0.5 hover:bg-[#2d6a4f]/10 transition-colors"
                            >
                                {tech}
                            </Badge>
                        ))}
                        {techStack?.length > 4 && (
                            <Badge
                                variant="outline"
                                className="text-[10px] font-semibold border-2 border-[#d8e2dc] text-[#2d6a4f] dark:border-slate-600 dark:text-[#74c69d] px-2 py-0.5"
                            >
                                +{techStack.length - 4}
                            </Badge>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                <Star className="h-4 w-4 fill-[#ffb703] text-[#ffb703]" />
                                <span className="font-bold text-sm">{rating?.toFixed(1) || '0.0'}</span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                <Download className="h-4 w-4" />
                                <span className="font-semibold text-sm">{downloads || 0}</span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                <Eye className="h-4 w-4" />
                                <span className="font-semibold text-sm">{views || 0}</span>
                            </div>
                            <Badge className={`${getDifficultyColor(difficulty)} font-bold text-[10px] px-2 py-0.5`}>
                                {difficulty}
                            </Badge>
                            {verifiedByAdmin && (
                                <Badge className={`bg-gray-200 dark:bg-gray-800 hover:bg-green-400 dark:hover:bg-green-800  border-2 border-green-500 dark:border-green-700 text-green-700 dark:text-white font-bold flex items-center gap-1 text-[10px] px-2 py-0.5`}>
                                    <CheckCircle className="h-3 w-3" />
                                    Verified
                                </Badge>
                            )}
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="flex items-center justify-between pt-3 pb-3 px-4 border-t-2 border-[#d8e2dc] dark:border-slate-700">
                    <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                        {mode === 'github' ? (
                            <Github className="h-4 w-4" />
                        ) : (
                            <FileArchive className="h-4 w-4" />
                        )}
                        <span className="text-xs capitalize font-medium">{mode}</span>
                    </div>
                    <Link to={`/project/${_id}`}>
                        <Button
                            size="sm"
                            className="bg-[#2d6a4f] hover:bg-[#2d6a4f]/90 text-white shadow-md group-hover:shadow-lg transition-all text-xs h-8 px-4 font-bold"
                        >
                            View Details
                        </Button>
                    </Link>
                </CardFooter>
            </Card>
        </motion.div>
    );
};

export default ProjectCard;
