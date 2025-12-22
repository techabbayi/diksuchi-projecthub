import express from 'express';
import {
    createOrder,
    verifyPayment,
    getPurchaseHistory,
    downloadFreeProject,
    downloadProjectFile,
    getCreatorEarnings,
} from '../controllers/paymentController.js';
import { protect, isCreatorOrAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public routes (no auth required)
router.get('/download-file/:id', downloadProjectFile);

// Protected routes
router.use(protect);

router.post('/create-order', createOrder);
router.post('/verify', verifyPayment);
router.get('/purchases', getPurchaseHistory);
router.post('/download-free/:id', downloadFreeProject);
router.get('/earnings', isCreatorOrAdmin, getCreatorEarnings);

export default router;
