import express from 'express';
import {
    addReview,
    getProjectReviews,
    deleteReview,
    toggleFavorite,
    getFavorites,
} from '../controllers/reviewController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/:projectId', protect, addReview);
router.get('/:projectId', getProjectReviews);
router.delete('/:id', protect, deleteReview);
router.post('/favorite/:projectId', protect, toggleFavorite);
router.get('/favorites/my', protect, getFavorites);

export default router;
