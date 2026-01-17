import express from 'express';
import {
    register,
    login,
    getMe,
    updateProfile,
    changePassword,
    forgotPassword,
    verifyOTP,
    resetPassword,
} from '../controllers/authController.js';
import { requestPasswordChange, completePasswordChange, checkUserType } from '../controllers/oauthPasswordController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);
router.post('/password/request-change', protect, requestPasswordChange);
router.post('/password/complete-change', protect, completePasswordChange);
router.post('/check-user-type', checkUserType);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);

export default router;
