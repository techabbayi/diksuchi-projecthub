import { errorResponse, successResponse } from '../utils/helpers.js';
import fetch from 'node-fetch';

const DAS_IDENTITY_BASE_URL = process.env.AUTH_SERVER_URL || 'https://dasnextjs.vercel.app';

// @desc    Initiate password change for OAuth users via DAS Identity
// @route   POST /api/auth/password/request-change
// @access  Private (OAuth users only)
export const requestPasswordChange = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return errorResponse(res, 400, 'Current password and new password are required');
        }

        if (newPassword.length < 8) {
            return errorResponse(res, 400, 'New password must be at least 8 characters');
        }

        // Verify this is an OAuth user
        if (!req.user.oauthId) {
            return errorResponse(res, 400, 'This endpoint is only for DAS Identity authenticated accounts');
        }

        // Store the new password temporarily (you might want to encrypt this)
        // For now, we'll send it in the next step

        // Call DAS Identity forgot-password endpoint with user's email
        const response = await fetch(`${DAS_IDENTITY_BASE_URL}/api/auth/forgot-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: req.user.email }),
        });

        const data = await response.json();

        if (!response.ok) {
            return errorResponse(res, response.status, data.error || 'Failed to send password reset OTP');
        }

        successResponse(res, 200, 'OTP sent to your email for password verification', {
            message: 'Please check your email for the OTP code',
            email: req.user.email,
            nextStep: 'verify-otp'
        });
    } catch (error) {
        console.error('Request password change error:', error);
        errorResponse(res, 500, 'Failed to initiate password change');
    }
};

// @desc    Complete password change for OAuth users via DAS Identity
// @route   POST /api/auth/password/complete-change
// @access  Private (OAuth users only)
export const completePasswordChange = async (req, res) => {
    try {
        const { otp, newPassword } = req.body;

        if (!otp || !newPassword) {
            return errorResponse(res, 400, 'OTP and new password are required');
        }

        // Verify this is an OAuth user
        if (!req.user.oauthId) {
            return errorResponse(res, 400, 'This endpoint is only for DAS Identity authenticated accounts');
        }

        // Call DAS Identity reset-password endpoint
        const response = await fetch(`${DAS_IDENTITY_BASE_URL}/api/auth/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: req.user.email,
                otp,
                newPassword
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            return errorResponse(res, response.status, data.error || 'Failed to reset password');
        }

        successResponse(res, 200, 'Password changed successfully via DAS Identity', {
            message: 'Your password has been updated successfully'
        });
    } catch (error) {
        console.error('Complete password change error:', error);
        errorResponse(res, 500, 'Failed to complete password change');
    }
};

// @desc    Check user type for forgot password flow
// @route   POST /api/auth/check-user-type
// @access  Public
export const checkUserType = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return errorResponse(res, 400, 'Email is required');
        }

        // Import User model here to avoid circular imports
        const { default: User } = await import('../models/User.js');

        // Check if user exists in ProjectHub database
        const user = await User.findOne({ email: email.toLowerCase() });

        if (user) {
            // Determine user type
            const userType = user.oauthId ? 'das-identity' : 'projecthub';

            successResponse(res, 200, 'User type identified', {
                userType,
                email: user.email,
                message: userType === 'das-identity'
                    ? 'This is a DAS Identity authenticated account'
                    : 'This is a ProjectHub local account'
            });
        } else {
            // Check if user exists in DAS Identity by trying forgot password
            try {
                const response = await fetch(`${DAS_IDENTITY_BASE_URL}/api/auth/forgot-password`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email }),
                });

                if (response.ok) {
                    successResponse(res, 200, 'User type identified', {
                        userType: 'das-identity',
                        email,
                        message: 'This is a DAS Identity authenticated account'
                    });
                } else {
                    return errorResponse(res, 404, 'No account found with this email address');
                }
            } catch (error) {
                return errorResponse(res, 404, 'No account found with this email address');
            }
        }
    } catch (error) {
        console.error('Check user type error:', error);
        errorResponse(res, 500, 'Failed to check user type');
    }
};