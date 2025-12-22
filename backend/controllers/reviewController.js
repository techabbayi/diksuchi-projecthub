import Review from '../models/Review.js';
import Project from '../models/Project.js';
import User from '../models/User.js';
import { successResponse, errorResponse } from '../utils/helpers.js';

// @desc    Add or update review
// @route   POST /api/reviews/:projectId
// @access  Private
export const addReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const { projectId } = req.params;

        const project = await Project.findById(projectId);

        if (!project) {
            return errorResponse(res, 404, 'Project not found');
        }

        // Check if user purchased the project (for paid projects)
        if (project.type === 'paid') {
            const hasPurchased = req.user.purchasedProjects.some(
                (p) => p.project.toString() === projectId
            );

            if (!hasPurchased) {
                return errorResponse(res, 403, 'You must purchase this project before reviewing');
            }
        }

        // Check if review already exists
        let review = await Review.findOne({ project: projectId, user: req.user._id });

        if (review) {
            // Update existing review
            review.rating = rating;
            review.comment = comment;
            await review.save();
        } else {
            // Create new review
            review = await Review.create({
                project: projectId,
                user: req.user._id,
                rating,
                comment,
            });
        }

        // Update project rating
        const reviews = await Review.find({ project: projectId });
        const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

        project.rating = avgRating;
        project.reviewCount = reviews.length;
        await project.save();

        successResponse(res, 201, 'Review added successfully', review);
    } catch (error) {
        console.error('Add review error:', error);
        errorResponse(res, 500, error.message);
    }
};

// @desc    Get reviews for a project
// @route   GET /api/reviews/:projectId
// @access  Public
export const getProjectReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ project: req.params.projectId })
            .populate('user', 'username avatar')
            .sort({ createdAt: -1 });

        successResponse(res, 200, 'Reviews fetched successfully', reviews);
    } catch (error) {
        console.error('Get reviews error:', error);
        errorResponse(res, 500, error.message);
    }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
export const deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return errorResponse(res, 404, 'Review not found');
        }

        // Check ownership
        if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return errorResponse(res, 403, 'Not authorized to delete this review');
        }

        const projectId = review.project;
        await review.deleteOne();

        // Update project rating
        const reviews = await Review.find({ project: projectId });
        const project = await Project.findById(projectId);

        if (reviews.length > 0) {
            const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
            project.rating = avgRating;
            project.reviewCount = reviews.length;
        } else {
            project.rating = 0;
            project.reviewCount = 0;
        }

        await project.save();

        successResponse(res, 200, 'Review deleted successfully');
    } catch (error) {
        console.error('Delete review error:', error);
        errorResponse(res, 500, error.message);
    }
};

// @desc    Toggle favorite
// @route   POST /api/reviews/favorite/:projectId
// @access  Private
export const toggleFavorite = async (req, res) => {
    try {
        const { projectId } = req.params;

        const project = await Project.findById(projectId);

        if (!project) {
            return errorResponse(res, 404, 'Project not found');
        }

        const user = await User.findById(req.user._id);
        const isFavorite = user.favorites.includes(projectId);

        if (isFavorite) {
            // Remove from favorites
            user.favorites = user.favorites.filter((id) => id.toString() !== projectId);
        } else {
            // Add to favorites
            user.favorites.push(projectId);
        }

        await user.save();

        successResponse(res, 200, isFavorite ? 'Removed from favorites' : 'Added to favorites', {
            isFavorite: !isFavorite,
        });
    } catch (error) {
        console.error('Toggle favorite error:', error);
        errorResponse(res, 500, error.message);
    }
};

// @desc    Get user favorites
// @route   GET /api/reviews/favorites
// @access  Private
export const getFavorites = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate({
            path: 'favorites',
            populate: { path: 'author', select: 'username avatar' },
        });

        successResponse(res, 200, 'Favorites fetched successfully', user.favorites);
    } catch (error) {
        console.error('Get favorites error:', error);
        errorResponse(res, 500, error.message);
    }
};
