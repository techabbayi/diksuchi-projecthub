import jwt from 'jsonwebtoken';

// Generate JWT token
export const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d',
    });
};

// Calculate admin commission and creator earning
export const calculateEarnings = (amount) => {
    const commissionRate = parseInt(process.env.ADMIN_COMMISSION) || 15;
    const adminCommission = (amount * commissionRate) / 100;
    const creatorEarning = amount - adminCommission;

    return {
        adminCommission,
        creatorEarning,
    };
};

// Pagination helper
export const getPagination = (page, limit) => {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 12;
    const skip = (pageNum - 1) * limitNum;

    return {
        page: pageNum,
        limit: limitNum,
        skip,
    };
};

// Success response
export const successResponse = (res, statusCode, message, data = null) => {
    const response = { success: true, message };
    if (data) response.data = data;
    return res.status(statusCode).json(response);
};

// Error response
export const errorResponse = (res, statusCode, message) => {
    return res.status(statusCode).json({ success: false, message });
};
