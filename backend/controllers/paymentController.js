import Razorpay from 'razorpay';
import crypto from 'crypto';
import Transaction from '../models/Transaction.js';
import Project from '../models/Project.js';
import User from '../models/User.js';
import { successResponse, errorResponse, calculateEarnings } from '../utils/helpers.js';

// Initialize Razorpay lazily to ensure env vars are loaded
let razorpay;
const getRazorpayInstance = () => {
    if (!razorpay) {
        razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
    }
    return razorpay;
};

// @desc    Create Razorpay order
// @route   POST /api/payment/create-order
// @access  Private
export const createOrder = async (req, res) => {
    try {
        const { projectId } = req.body;

        const project = await Project.findById(projectId);

        if (!project) {
            return errorResponse(res, 404, 'Project not found');
        }

        if (project.type === 'free') {
            return errorResponse(res, 400, 'This project is free');
        }

        if (project.status !== 'approved') {
            return errorResponse(res, 400, 'This project is not approved yet');
        }

        // Check if user already purchased
        const alreadyPurchased = req.user.purchasedProjects.some(
            (p) => p.project.toString() === projectId
        );

        if (alreadyPurchased) {
            return errorResponse(res, 400, 'You have already purchased this project');
        }

        const amount = project.price * 100; // Convert to paise

        const options = {
            amount,
            currency: 'INR',
            receipt: `order_${Date.now()}`,
            notes: {
                projectId: project._id.toString(),
                userId: req.user._id.toString(),
            },
        };

        const order = await getRazorpayInstance().orders.create(options);

        successResponse(res, 200, 'Order created successfully', {
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            projectId: project._id,
            projectTitle: project.title,
        });
    } catch (error) {
        console.error('Create order error:', error);
        errorResponse(res, 500, error.message);
    }
};

// @desc    Verify payment
// @route   POST /api/payment/verify
// @access  Private
export const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, projectId } = req.body;

        // Verify signature
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return errorResponse(res, 400, 'Invalid payment signature');
        }

        const project = await Project.findById(projectId);

        if (!project) {
            return errorResponse(res, 404, 'Project not found');
        }

        // Calculate earnings
        const { adminCommission, creatorEarning } = calculateEarnings(project.price);

        // Create transaction
        const transaction = await Transaction.create({
            user: req.user._id,
            project: project._id,
            creator: project.author,
            amount: project.price,
            adminCommission,
            creatorEarning,
            paymentId: razorpay_payment_id,
            orderId: razorpay_order_id,
            signature: razorpay_signature,
            status: 'completed',
        });

        // Update user's purchased projects
        req.user.purchasedProjects.push({
            project: project._id,
        });
        await req.user.save();

        // Update creator's wallet
        const creator = await User.findById(project.author);
        creator.wallet += creatorEarning;
        await creator.save();

        // Update project stats
        project.sales += 1;
        project.downloads += 1;
        project.revenue += project.price;
        await project.save();

        successResponse(res, 200, 'Payment verified successfully', {
            transaction,
            project: {
                _id: project._id,
                title: project.title,
                zipUrl: project.zipUrl,
                githubLink: project.githubLink,
            },
        });
    } catch (error) {
        console.error('Verify payment error:', error);
        errorResponse(res, 500, error.message);
    }
};

// @desc    Get user's purchase history
// @route   GET /api/payment/purchases
// @access  Private
export const getPurchaseHistory = async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.user._id, status: 'completed' })
            .populate('project', 'title screenshots price mode zipUrl githubLink')
            .sort({ createdAt: -1 });

        successResponse(res, 200, 'Purchase history fetched', transactions);
    } catch (error) {
        console.error('Get purchase history error:', error);
        errorResponse(res, 500, error.message);
    }
};

// @desc    Download free project
// @route   POST /api/payment/download-free/:id
// @access  Private
export const downloadFreeProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return errorResponse(res, 404, 'Project not found');
        }

        if (project.type !== 'free') {
            return errorResponse(res, 400, 'This project is not free');
        }

        if (project.status !== 'approved') {
            return errorResponse(res, 400, 'This project is not approved yet');
        }

        // Increment downloads
        project.downloads += 1;
        await project.save();

        successResponse(res, 200, 'Download link retrieved', {
            project: {
                _id: project._id,
                title: project.title,
                mode: project.mode,
                zipUrl: project.zipUrl,
                githubLink: project.githubLink,
            },
        });
    } catch (error) {
        console.error('Download free project error:', error);
        errorResponse(res, 500, error.message);
    }
};

// @desc    Download project file with proper headers
// @route   GET /api/payment/download-file/:id
// @access  Public (for free projects)
export const downloadProjectFile = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return errorResponse(res, 404, 'Project not found');
        }

        if (project.type !== 'free') {
            return errorResponse(res, 400, 'This project is not free');
        }

        if (project.status !== 'approved') {
            return errorResponse(res, 400, 'This project is not approved yet');
        }

        if (project.mode === 'github') {
            return res.redirect(project.githubLink);
        }

        if (!project.zipUrl) {
            return errorResponse(res, 400, 'ZIP file not available');
        }

        // Import fetch at the top of file or use axios
        const fetch = (await import('node-fetch')).default;

        // Fetch the file from Cloudinary
        const response = await fetch(project.zipUrl);

        if (!response.ok) {
            return errorResponse(res, 400, 'Failed to fetch file from storage');
        }

        // Create a safe filename from project title
        const safeTitle = project.title
            .replace(/[^a-zA-Z0-9\s-_]/g, '') // Remove special characters
            .replace(/\s+/g, '_') // Replace spaces with underscores
            .substring(0, 50); // Limit length

        const filename = `${safeTitle}.zip`;

        // Set proper headers for file download
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', 'application/zip');

        // Increment downloads
        project.downloads += 1;
        await project.save();

        // Stream the file
        response.body.pipe(res);

    } catch (error) {
        console.error('Download project file error:', error);
        errorResponse(res, 500, error.message);
    }
};

// @desc    Get creator earnings
// @route   GET /api/payment/earnings
// @access  Private (Creator)
export const getCreatorEarnings = async (req, res) => {
    try {
        const transactions = await Transaction.find({
            creator: req.user._id,
            status: 'completed',
        })
            .populate('project', 'title')
            .populate('user', 'username')
            .sort({ createdAt: -1 });

        const totalEarnings = transactions.reduce((sum, t) => sum + t.creatorEarning, 0);

        successResponse(res, 200, 'Earnings fetched', {
            wallet: req.user.wallet,
            totalEarnings,
            transactions,
        });
    } catch (error) {
        console.error('Get creator earnings error:', error);
        errorResponse(res, 500, error.message);
    }
};
