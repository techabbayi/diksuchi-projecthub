import User from '../models/User.js';
import { generateToken, successResponse, errorResponse } from '../utils/helpers.js';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

// Email configuration (using environment variables in production)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password'
    }
});

// In-memory OTP storage (in production, use Redis or database)
const otpStore = new Map();

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ $or: [{ email }, { username }] });

        if (userExists) {
            return errorResponse(res, 400, 'User already exists with this email or username');
        }

        // Validate role
        const allowedRoles = ['user', 'creator'];
        const userRole = allowedRoles.includes(role) ? role : 'user';

        // Create user
        const user = await User.create({
            username,
            email,
            password,
            role: userRole,
        });

        const token = generateToken(user._id);

        successResponse(res, 201, 'User registered successfully', {
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            token,
        });
    } catch (error) {
        console.error('Register error:', error);
        errorResponse(res, 500, error.message);
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user and include password
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return errorResponse(res, 401, 'Invalid email or password');
        }

        // Check password
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return errorResponse(res, 401, 'Invalid email or password');
        }

        const token = generateToken(user._id);

        successResponse(res, 200, 'Login successful', {
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            wallet: user.wallet,
            token,
        });
    } catch (error) {
        console.error('Login error:', error);
        errorResponse(res, 500, error.message);
    }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('favorites', 'title screenshots price');

        successResponse(res, 200, 'User profile fetched', user);
    } catch (error) {
        console.error('Get me error:', error);
        errorResponse(res, 500, error.message);
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
    try {
        const { name, email, username, bio, avatar } = req.body;

        const user = await User.findById(req.user._id);

        if (!user) {
            return errorResponse(res, 404, 'User not found');
        }

        // Check if email is being changed and if it's already taken
        if (email && email !== user.email) {
            const emailExists = await User.findOne({ email });
            if (emailExists) {
                return errorResponse(res, 400, 'Email already in use');
            }
            user.email = email;
        }

        // Check if username is being changed and if it's already taken
        if (username && username !== user.username) {
            const usernameExists = await User.findOne({ username });
            if (usernameExists) {
                return errorResponse(res, 400, 'Username already in use');
            }
            user.username = username;
        }

        if (name) user.name = name;
        if (bio !== undefined) user.bio = bio;
        if (avatar) user.avatar = avatar;

        await user.save();

        successResponse(res, 200, 'Profile updated successfully', {
            _id: user._id,
            name: user.name,
            username: user.username,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            bio: user.bio,
            wallet: user.wallet,
        });
    } catch (error) {
        console.error('Update profile error:', error);
        errorResponse(res, 500, error.message);
    }
};

// @desc    Change password
// @route   PUT /api/auth/password
// @access  Private
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user._id).select('+password');

        const isMatch = await user.comparePassword(currentPassword);

        if (!isMatch) {
            return errorResponse(res, 401, 'Current password is incorrect');
        }

        user.password = newPassword;
        await user.save();

        successResponse(res, 200, 'Password changed successfully');
    } catch (error) {
        console.error('Change password error:', error);
        errorResponse(res, 500, error.message);
    }
};

// @desc    Request password reset OTP
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return errorResponse(res, 404, 'No account found with this email');
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Store OTP with 10-minute expiry
        otpStore.set(email, {
            otp,
            expiresAt: Date.now() + 10 * 60 * 1000
        });

        // Send email
        try {
            await transporter.sendMail({
                from: process.env.EMAIL_USER || 'ProjectHub <noreply@projecthub.com>',
                to: email,
                subject: 'Password Reset OTP - ProjectHub',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #10b981;">Password Reset Request</h2>
                        <p>You requested to reset your password. Use the OTP below to proceed:</p>
                        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                            <h1 style="color: #10b981; margin: 0; font-size: 36px; letter-spacing: 8px;">${otp}</h1>
                        </div>
                        <p>This OTP will expire in 10 minutes.</p>
                        <p>If you didn't request this, please ignore this email.</p>
                        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                        <p style="color: #6b7280; font-size: 12px;">ProjectHub - Your Learning Platform</p>
                    </div>
                `
            });
        } catch (emailError) {
            console.error('Email send error:', emailError);
            // Continue anyway - in development mode
        }

        successResponse(res, 200, 'OTP sent to your email');
    } catch (error) {
        console.error('Forgot password error:', error);
        errorResponse(res, 500, error.message);
    }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const stored = otpStore.get(email);

        if (!stored) {
            return errorResponse(res, 400, 'OTP expired or not found');
        }

        if (Date.now() > stored.expiresAt) {
            otpStore.delete(email);
            return errorResponse(res, 400, 'OTP has expired');
        }

        if (stored.otp !== otp) {
            return errorResponse(res, 400, 'Invalid OTP');
        }

        successResponse(res, 200, 'OTP verified successfully');
    } catch (error) {
        console.error('Verify OTP error:', error);
        errorResponse(res, 500, error.message);
    }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        const stored = otpStore.get(email);

        if (!stored) {
            return errorResponse(res, 400, 'OTP expired or not found');
        }

        if (Date.now() > stored.expiresAt) {
            otpStore.delete(email);
            return errorResponse(res, 400, 'OTP has expired');
        }

        if (stored.otp !== otp) {
            return errorResponse(res, 400, 'Invalid OTP');
        }

        const user = await User.findOne({ email });

        if (!user) {
            return errorResponse(res, 404, 'User not found');
        }

        user.password = newPassword;
        await user.save();

        // Clear OTP
        otpStore.delete(email);

        successResponse(res, 200, 'Password reset successfully');
    } catch (error) {
        console.error('Reset password error:', error);
        errorResponse(res, 500, error.message);
    }
};
