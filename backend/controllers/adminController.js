import Project from '../models/Project.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import Review from '../models/Review.js';
import CustomProject from '../models/CustomProject.js';
import SuggestedProject from '../models/SuggestedProject.js';
import ProjectQuota from '../models/ProjectQuota.js';
import AICredit from '../models/AICredit.js';
import ChatHistory from '../models/ChatHistory.js';
import Analytics from '../models/Analytics.js';
import PageVisit from '../models/PageVisit.js';
import { successResponse, errorResponse } from '../utils/helpers.js';
import csvParser from 'csv-parser';
import mongoose from 'mongoose';

// @desc    Get all pending projects
// @route   GET /api/admin/projects/pending
// @access  Private (Admin)
export const getPendingProjects = async (req, res) => {
    try {
        const projects = await Project.find({ status: 'pending' })
            .populate('author', 'username email avatar')
            .sort({ createdAt: -1 });

        successResponse(res, 200, 'Pending projects fetched', projects);
    } catch (error) {
        console.error('Get pending projects error:', error);
        errorResponse(res, 500, error.message);
    }
};

// @desc    Approve project
// @route   PUT /api/admin/projects/:id/approve
// @access  Private (Admin)
export const approveProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return errorResponse(res, 404, 'Project not found');
        }

        project.status = 'approved';
        project.verifiedByAdmin = true;
        await project.save();

        successResponse(res, 200, 'Project approved successfully', project);
    } catch (error) {
        console.error('Approve project error:', error);
        errorResponse(res, 500, error.message);
    }
};

// @desc    Reject project
// @route   PUT /api/admin/projects/:id/reject
// @access  Private (Admin)
export const rejectProject = async (req, res) => {
    try {
        const { reason } = req.body;

        const project = await Project.findById(req.params.id);

        if (!project) {
            return errorResponse(res, 404, 'Project not found');
        }

        project.status = 'rejected';
        project.rejectionReason = reason || 'Does not meet platform standards';
        await project.save();

        successResponse(res, 200, 'Project rejected', project);
    } catch (error) {
        console.error('Reject project error:', error);
        errorResponse(res, 500, error.message);
    }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });

        successResponse(res, 200, 'Users fetched successfully', users);
    } catch (error) {
        console.error('Get all users error:', error);
        errorResponse(res, 500, error.message);
    }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private (Admin)
export const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;

        if (!['user', 'creator', 'admin'].includes(role)) {
            return errorResponse(res, 400, 'Invalid role');
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return errorResponse(res, 404, 'User not found');
        }

        user.role = role;
        await user.save();

        successResponse(res, 200, 'User role updated', user);
    } catch (error) {
        console.error('Update user role error:', error);
        errorResponse(res, 500, error.message);
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return errorResponse(res, 404, 'User not found');
        }

        // Don't allow deleting own account
        if (user._id.toString() === req.user._id.toString()) {
            return errorResponse(res, 400, 'Cannot delete your own account');
        }

        await user.deleteOne();

        successResponse(res, 200, 'User deleted successfully');
    } catch (error) {
        console.error('Delete user error:', error);
        errorResponse(res, 500, error.message);
    }
};

// @desc    Get platform statistics
// @route   GET /api/admin/stats
// @access  Private (Admin)
export const getPlatformStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalCreators = await User.countDocuments({ role: 'creator' });
        const totalProjects = await Project.countDocuments();
        const approvedProjects = await Project.countDocuments({ status: 'approved' });
        const pendingProjects = await Project.countDocuments({ status: 'pending' });
        const totalTransactions = await Transaction.countDocuments({ status: 'completed' });

        // Revenue calculation
        const revenueData = await Transaction.aggregate([
            { $match: { status: 'completed' } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$amount' },
                    adminCommission: { $sum: '$adminCommission' },
                    creatorEarnings: { $sum: '$creatorEarning' },
                },
            },
        ]);

        const revenue = revenueData[0] || {
            totalRevenue: 0,
            adminCommission: 0,
            creatorEarnings: 0,
        };

        // Top projects
        const topProjects = await Project.find({ status: 'approved' })
            .sort({ sales: -1 })
            .limit(5)
            .populate('author', 'username');

        // Recent transactions
        const recentTransactions = await Transaction.find({ status: 'completed' })
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('user', 'username')
            .populate('project', 'title');

        successResponse(res, 200, 'Statistics fetched', {
            users: {
                total: totalUsers,
                creators: totalCreators,
                regular: totalUsers - totalCreators,
            },
            projects: {
                total: totalProjects,
                approved: approvedProjects,
                pending: pendingProjects,
            },
            transactions: {
                total: totalTransactions,
            },
            revenue,
            topProjects,
            recentTransactions,
        });
    } catch (error) {
        console.error('Get stats error:', error);
        errorResponse(res, 500, error.message);
    }
};

// @desc    Bulk upload projects (CSV or JSON)
// @route   POST /api/admin/projects/bulk-upload
// @access  Private (Admin)
export const bulkUploadProjects = async (req, res) => {
    try {
        const { projects, format } = req.body;

        if (!projects || !Array.isArray(projects)) {
            return errorResponse(res, 400, 'Projects array is required');
        }

        const results = {
            success: [],
            failed: [],
            total: projects.length,
        };

        // Get admin user ID for author field
        const adminId = req.user._id;

        for (let i = 0; i < projects.length; i++) {
            try {
                const projectData = projects[i];

                // Validate required fields
                if (!projectData.title || !projectData.description) {
                    results.failed.push({
                        index: i + 1,
                        data: projectData,
                        error: 'Missing required fields: title and description',
                    });
                    continue;
                }

                // Set defaults for optional fields
                const newProject = {
                    title: projectData.title,
                    description: projectData.description,
                    techStack: projectData.techStack || [],
                    difficulty: projectData.difficulty || 'Beginner',
                    type: projectData.type || 'free',
                    price: projectData.price || 0,
                    mode: projectData.mode || 'github',
                    githubLink: projectData.githubLink || '',
                    zipUrl: projectData.zipUrl || '',
                    screenshots: projectData.screenshots || [],
                    tags: projectData.tags || [],
                    category: projectData.category || 'Other',
                    author: projectData.author || adminId,
                    status: projectData.status || 'approved', // Auto-approve admin uploads
                    verifiedByAdmin: true,
                };

                // Validate type and price
                if (newProject.type === 'free') {
                    newProject.price = 0;
                } else if (newProject.type === 'paid') {
                    if (![49, 99, 299].includes(newProject.price)) {
                        results.failed.push({
                            index: i + 1,
                            data: projectData,
                            error: 'Invalid price for paid project. Must be 49, 99, or 299',
                        });
                        continue;
                    }
                }

                // Validate mode
                if (newProject.mode === 'zip' && !newProject.zipUrl) {
                    results.failed.push({
                        index: i + 1,
                        data: projectData,
                        error: 'zipUrl is required for zip mode',
                    });
                    continue;
                }

                if (newProject.mode === 'github' && !newProject.githubLink) {
                    results.failed.push({
                        index: i + 1,
                        data: projectData,
                        error: 'githubLink is required for github mode',
                    });
                    continue;
                }

                // Create project
                const project = await Project.create(newProject);
                results.success.push({
                    index: i + 1,
                    projectId: project._id,
                    title: project.title,
                });

            } catch (error) {
                results.failed.push({
                    index: i + 1,
                    data: projects[i],
                    error: error.message,
                });
            }
        }

        successResponse(res, 200, 'Bulk upload completed', {
            results,
            summary: {
                total: results.total,
                successful: results.success.length,
                failed: results.failed.length,
            },
        });
    } catch (error) {
        console.error('Bulk upload error:', error);
        errorResponse(res, 500, error.message);
    }
};

// @desc    Get bulk upload template
// @route   GET /api/admin/projects/bulk-upload-template
// @access  Private (Admin)
export const getBulkUploadTemplate = async (req, res) => {
    try {
        const template = [
            {
                title: 'Example Project 1',
                description: 'This is a sample project description with at least 50 characters for demonstration.',
                techStack: ['React', 'Node.js', 'MongoDB'],
                difficulty: 'Intermediate',
                type: 'free',
                price: 0,
                mode: 'github',
                githubLink: 'https://github.com/username/repo',
                zipUrl: '',
                screenshots: ['https://example.com/screenshot1.jpg', 'https://example.com/screenshot2.jpg'],
                tags: ['react', 'fullstack', 'mongodb'],
                category: 'Web Development',
            },
            {
                title: 'Example Project 2',
                description: 'This is another sample paid project with detailed description for demonstration purposes.',
                techStack: ['Python', 'Django', 'PostgreSQL'],
                difficulty: 'Advanced',
                type: 'paid',
                price: 99,
                mode: 'zip',
                githubLink: '',
                zipUrl: 'https://res.cloudinary.com/example/raw/upload/project.zip',
                screenshots: ['https://example.com/screenshot1.jpg'],
                tags: ['python', 'django', 'backend'],
                category: 'Web Development',
            },
        ];

        successResponse(res, 200, 'Bulk upload template', template);
    } catch (error) {
        console.error('Get template error:', error);
        errorResponse(res, 500, error.message);
    }
};

// ============================================
// CUSTOM PROJECT BUILDER - ADMIN ENDPOINTS
// ============================================

// @desc    Get all custom projects with analytics
// @route   GET /api/admin/custom-projects
// @access  Private (Admin)
export const getAllCustomProjects = async (req, res) => {
    try {
        const { status, search, page = 1, limit = 20 } = req.query;

        const filter = {};
        if (status) filter.status = status;
        if (search) {
            filter.$or = [
                { projectName: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }

        const projects = await CustomProject.find(filter)
            .populate('userId', 'username email avatar')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        // Fetch quota information for each user
        const projectsWithQuota = await Promise.all(
            projects.map(async (project) => {
                const quota = await ProjectQuota.findOne({ userId: project.userId._id });
                return {
                    ...project.toObject(),
                    userQuota: {
                        limit: quota?.limit || 1,
                        used: quota?.used || 0,
                        remaining: (quota?.limit || 1) - (quota?.used || 0)
                    }
                };
            })
        );

        const total = await CustomProject.countDocuments(filter);

        successResponse(res, 200, 'Custom projects fetched', {
            projects: projectsWithQuota,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total,
        });
    } catch (error) {
        console.error('Get all custom projects error:', error);
        errorResponse(res, 500, error.message);
    }
};

// @desc    Get custom project analytics/stats
// @route   GET /api/admin/custom-projects/stats
// @access  Private (Admin)
export const getCustomProjectStats = async (req, res) => {
    try {
        const total = await CustomProject.countDocuments();
        const active = await CustomProject.countDocuments({ status: 'active' });
        const completed = await CustomProject.countDocuments({ status: 'completed' });
        const paused = await CustomProject.countDocuments({ status: 'paused' });
        const abandoned = await CustomProject.countDocuments({ status: 'abandoned' });

        // Most popular tech stacks
        const techStackStats = await CustomProject.aggregate([
            { $match: { 'techStack.predefined': { $exists: true, $ne: null } } },
            { $group: { _id: '$techStack.predefined', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        // Average completion rate
        const completionRate = total > 0 ? ((completed / total) * 100).toFixed(2) : 0;

        // Average time to complete (for completed projects)
        const completedProjects = await CustomProject.find({
            status: 'completed',
            'progress.startedAt': { $exists: true },
            'progress.completedAt': { $exists: true },
        });

        let avgDaysToComplete = 0;
        if (completedProjects.length > 0) {
            const totalDays = completedProjects.reduce((sum, proj) => {
                const days = Math.ceil((new Date(proj.progress.completedAt) - new Date(proj.progress.startedAt)) / (1000 * 60 * 60 * 24));
                return sum + days;
            }, 0);
            avgDaysToComplete = Math.round(totalDays / completedProjects.length);
        }

        successResponse(res, 200, 'Custom project stats', {
            total,
            active,
            completed,
            paused,
            abandoned,
            completionRate: parseFloat(completionRate),
            avgDaysToComplete,
            popularTechStacks: techStackStats,
        });
    } catch (error) {
        console.error('Get custom project stats error:', error);
        errorResponse(res, 500, error.message);
    }
};

// @desc    Get specific custom project details (admin view)
// @route   GET /api/admin/custom-projects/:id
// @access  Private (Admin)
export const getCustomProjectById = async (req, res) => {
    try {
        const project = await CustomProject.findById(req.params.id)
            .populate('userId', 'username email avatar');

        if (!project) {
            return errorResponse(res, 404, 'Custom project not found');
        }

        successResponse(res, 200, 'Custom project details', project);
    } catch (error) {
        console.error('Get custom project by ID error:', error);
        errorResponse(res, 500, error.message);
    }
};

// ============================================
// SUGGESTED PROJECTS - ADMIN MANAGEMENT
// ============================================

// @desc    Get all suggested projects
// @route   GET /api/admin/suggested-projects
// @access  Private (Admin)
export const getAllSuggestedProjects = async (req, res) => {
    try {
        const projects = await SuggestedProject.find().sort({ popularityScore: -1, createdAt: -1 });

        successResponse(res, 200, 'Suggested projects fetched', projects);
    } catch (error) {
        console.error('Get suggested projects error:', error);
        errorResponse(res, 500, error.message);
    }
};

// @desc    Create new suggested project
// @route   POST /api/admin/suggested-projects
// @access  Private (Admin)
export const createSuggestedProject = async (req, res) => {
    try {
        const suggestedProject = new SuggestedProject(req.body);
        await suggestedProject.save();

        successResponse(res, 201, 'Suggested project created', suggestedProject);
    } catch (error) {
        console.error('Create suggested project error:', error);
        errorResponse(res, 500, error.message);
    }
};

// @desc    Update suggested project
// @route   PUT /api/admin/suggested-projects/:id
// @access  Private (Admin)
export const updateSuggestedProject = async (req, res) => {
    try {
        const project = await SuggestedProject.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!project) {
            return errorResponse(res, 404, 'Suggested project not found');
        }

        successResponse(res, 200, 'Suggested project updated', project);
    } catch (error) {
        console.error('Update suggested project error:', error);
        errorResponse(res, 500, error.message);
    }
};

// @desc    Delete suggested project
// @route   DELETE /api/admin/suggested-projects/:id
// @access  Private (Admin)
export const deleteSuggestedProject = async (req, res) => {
    try {
        const project = await SuggestedProject.findByIdAndDelete(req.params.id);

        if (!project) {
            return errorResponse(res, 404, 'Suggested project not found');
        }

        successResponse(res, 200, 'Suggested project deleted');
    } catch (error) {
        console.error('Delete suggested project error:', error);
        errorResponse(res, 500, error.message);
    }
};

// @desc    Get all pending quota requests
// @route   GET /api/admin/quota-requests
// @access  Private (Admin)
export const getQuotaRequests = async (req, res) => {
    try {
        const quotas = await ProjectQuota.find({
            'pendingRequests.status': 'pending'
        }).populate('userId', 'name username email');

        const pendingRequests = [];
        quotas.forEach(quota => {
            quota.pendingRequests.forEach(request => {
                if (request.status === 'pending') {
                    pendingRequests.push({
                        quotaId: quota._id,
                        requestId: request._id,
                        user: quota.userId,
                        reason: request.reason,
                        requestDate: request.requestDate,
                        paymentAmount: request.paymentAmount,
                        currentQuota: {
                            allowed: quota.allowedProjects,
                            used: quota.usedProjects
                        }
                    });
                }
            });
        });

        successResponse(res, 200, 'Quota requests fetched', pendingRequests);
    } catch (error) {
        console.error('Get quota requests error:', error);
        errorResponse(res, 500, error.message);
    }
};

// @desc    Approve quota request
// @route   PUT /api/admin/quota-requests/:quotaId/approve/:requestId
// @access  Private (Admin)
export const approveQuotaRequest = async (req, res) => {
    try {
        const { quotaId, requestId } = req.params;
        const { paymentConfirmed, adminNote } = req.body;

        if (!paymentConfirmed) {
            return errorResponse(res, 400, 'Payment confirmation required');
        }

        const quota = await ProjectQuota.findById(quotaId);
        if (!quota) {
            return errorResponse(res, 404, 'Quota not found');
        }

        const request = quota.pendingRequests.id(requestId);
        if (!request) {
            return errorResponse(res, 404, 'Request not found');
        }

        // Update request status
        request.status = 'approved';
        request.paymentStatus = 'completed';
        request.processedBy = req.user._id;
        request.processedAt = new Date();
        request.adminNote = adminNote || 'Approved after payment confirmation';

        // Increment allowed projects
        quota.allowedProjects += 1;

        await quota.save();

        successResponse(res, 200, 'Quota request approved', {
            quota,
            message: 'User can now create one more custom project'
        });
    } catch (error) {
        console.error('Approve quota request error:', error);
        errorResponse(res, 500, error.message);
    }
};

// @desc    Reject quota request
// @route   PUT /api/admin/quota-requests/:quotaId/reject/:requestId
// @access  Private (Admin)
export const rejectQuotaRequest = async (req, res) => {
    try {
        const { quotaId, requestId } = req.params;
        const { adminNote } = req.body;

        const quota = await ProjectQuota.findById(quotaId);
        if (!quota) {
            return errorResponse(res, 404, 'Quota not found');
        }

        const request = quota.pendingRequests.id(requestId);
        if (!request) {
            return errorResponse(res, 404, 'Request not found');
        }

        request.status = 'rejected';
        request.processedBy = req.user._id;
        request.processedAt = new Date();
        request.adminNote = adminNote || 'Request rejected';

        await quota.save();

        successResponse(res, 200, 'Quota request rejected', quota);
    } catch (error) {
        console.error('Reject quota request error:', error);
        errorResponse(res, 500, error.message);
    }
};

// ==================== AI CREDIT MANAGEMENT ====================

// @desc    Get all users with their AI credit info
// @route   GET /api/admin/ai-credits
// @access  Private (Admin)
export const getAllUserCredits = async (req, res) => {
    try {
        const { page = 1, limit = 20, search = '' } = req.query;

        // Find users matching search
        const userQuery = search
            ? { $or: [{ username: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }] }
            : {};

        const users = await User.find(userQuery)
            .select('username email role createdAt')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const userIds = users.map(u => u._id);

        // Get credit records for these users
        const credits = await AICredit.find({ userId: { $in: userIds } });
        const creditMap = {};
        credits.forEach(c => {
            creditMap[c.userId.toString()] = c;
        });

        // Combine data
        const userData = users.map(user => ({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            credits: creditMap[user._id.toString()]?.credits || 50,
            dailyLimit: creditMap[user._id.toString()]?.dailyLimit || 50,
            isPremium: creditMap[user._id.toString()]?.isPremium || false,
            totalUsed: creditMap[user._id.toString()]?.totalUsed || 0,
            lastResetDate: creditMap[user._id.toString()]?.lastResetDate
        }));

        const total = await User.countDocuments(userQuery);

        res.json({
            success: true,
            data: userData,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get all user credits error:', error);
        errorResponse(res, 500, error.message);
    }
};

// @desc    Update user AI credits
// @route   PUT /api/admin/ai-credits/:userId
// @access  Private (Admin)
export const updateUserCredits = async (req, res) => {
    try {
        const { userId } = req.params;
        const { credits, dailyLimit, isPremium, action } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return errorResponse(res, 404, 'User not found');
        }

        let creditRecord = await AICredit.findOne({ userId });
        if (!creditRecord) {
            creditRecord = await AICredit.create({ userId });
        }

        // Handle different actions
        if (action === 'add' && credits) {
            creditRecord.credits += credits;
            creditRecord.history.push({
                action: 'admin_add',
                amount: credits,
                message: `Admin added ${credits} credits`
            });
        } else if (action === 'deduct' && credits) {
            creditRecord.credits = Math.max(0, creditRecord.credits - credits);
            creditRecord.history.push({
                action: 'admin_deduct',
                amount: -credits,
                message: `Admin deducted ${credits} credits`
            });
        } else if (action === 'set' && credits !== undefined) {
            creditRecord.credits = credits;
            creditRecord.history.push({
                action: 'admin_add',
                amount: credits,
                message: `Admin set credits to ${credits}`
            });
        }

        if (dailyLimit !== undefined) {
            creditRecord.dailyLimit = dailyLimit;
        }

        if (isPremium !== undefined) {
            creditRecord.isPremium = isPremium;
            creditRecord.history.push({
                action: 'premium_activated',
                amount: 0,
                message: isPremium ? 'Premium activated by admin' : 'Premium deactivated by admin'
            });
        }

        await creditRecord.save();

        res.json({
            success: true,
            message: 'Credits updated successfully',
            data: {
                userId: user._id,
                username: user.username,
                credits: creditRecord.credits,
                dailyLimit: creditRecord.dailyLimit,
                isPremium: creditRecord.isPremium,
                totalUsed: creditRecord.totalUsed
            }
        });
    } catch (error) {
        console.error('Update user credits error:', error);
        errorResponse(res, 500, error.message);
    }
};

// @desc    Get user credit history
// @route   GET /api/admin/ai-credits/:userId/history
// @access  Private (Admin)
export const getUserCreditHistory = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId).select('username email');
        if (!user) {
            return errorResponse(res, 404, 'User not found');
        }

        const creditRecord = await AICredit.findOne({ userId });
        if (!creditRecord) {
            return res.json({
                success: true,
                data: {
                    user,
                    history: []
                }
            });
        }

        res.json({
            success: true,
            data: {
                user,
                credits: creditRecord.credits,
                isPremium: creditRecord.isPremium,
                totalUsed: creditRecord.totalUsed,
                history: creditRecord.history.reverse()
            }
        });
    } catch (error) {
        console.error('Get user credit history error:', error);
        errorResponse(res, 500, error.message);
    }
};

// @desc    Reset all daily credits
// @route   POST /api/admin/ai-credits/reset-all
// @access  Private (Admin)
export const resetAllDailyCredits = async (req, res) => {
    try {
        const result = await AICredit.updateMany(
            { isPremium: false },
            {
                $set: { credits: 50, lastResetDate: new Date() },
                $push: {
                    history: {
                        action: 'reset',
                        amount: 50,
                        timestamp: new Date(),
                        message: 'Admin forced daily reset'
                    }
                }
            }
        );

        res.json({
            success: true,
            message: `Reset ${result.modifiedCount} user credits`
        });
    } catch (error) {
        console.error('Reset all credits error:', error);
        errorResponse(res, 500, error.message);
    }
};

// @desc    Get default credit settings
// @route   GET /api/admin/ai-credits/defaults
// @access  Private (Admin)
export const getDefaultCreditSettings = async (req, res) => {
    try {
        // Get the default values from the schema
        const schema = AICredit.schema.obj;
        const defaultSettings = {
            defaultCredits: schema.credits.default,
            defaultDailyLimit: schema.dailyLimit.default
        };

        res.json({
            success: true,
            data: defaultSettings
        });
    } catch (error) {
        console.error('Get default credit settings error:', error);
        errorResponse(res, 500, error.message);
    }
};

// @desc    Update default credit settings
// @route   PUT /api/admin/ai-credits/defaults
// @access  Private (Admin)
export const updateDefaultCreditSettings = async (req, res) => {
    try {
        const { defaultCredits, defaultDailyLimit } = req.body;

        if (defaultCredits === undefined && defaultDailyLimit === undefined) {
            return errorResponse(res, 400, 'Please provide default credits or daily limit');
        }

        if (defaultCredits !== undefined && (defaultCredits < 0 || !Number.isInteger(defaultCredits))) {
            return errorResponse(res, 400, 'Default credits must be a non-negative integer');
        }

        if (defaultDailyLimit !== undefined && (defaultDailyLimit < 0 || !Number.isInteger(defaultDailyLimit))) {
            return errorResponse(res, 400, 'Default daily limit must be a non-negative integer');
        }

        // Update the schema defaults
        if (defaultCredits !== undefined) {
            AICredit.schema.obj.credits.default = defaultCredits;
        }
        if (defaultDailyLimit !== undefined) {
            AICredit.schema.obj.dailyLimit.default = defaultDailyLimit;
        }

        const newSettings = {
            defaultCredits: AICredit.schema.obj.credits.default,
            defaultDailyLimit: AICredit.schema.obj.dailyLimit.default
        };

        res.json({
            success: true,
            message: 'Default credit settings updated successfully',
            data: newSettings
        });
    } catch (error) {
        console.error('Update default credit settings error:', error);
        errorResponse(res, 500, error.message);
    }
};
// @desc    Get all projects for admin management
// @route   GET /api/admin/projects/all
// @access  Private (Admin)
export const getAllProjects = async (req, res) => {
    try {
        const { page = 1, limit = 20, search = '', status = '', type = '' } = req.query;

        const query = {};
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        if (status) query.status = status;
        if (type) query.type = type;

        const projects = await Project.find(query)
            .populate('author', 'username email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Project.countDocuments(query);

        res.json({
            success: true,
            data: projects,
            pagination: {
                total: count,
                page: parseInt(page),
                pages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Get all projects error:', error);
        errorResponse(res, 500, error.message);
    }
};

// @desc    Update project
// @route   PUT /api/admin/projects/:id
// @access  Private (Admin)
export const updateProject = async (req, res) => {
    try {
        const project = await Project.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!project) {
            return errorResponse(res, 404, 'Project not found');
        }

        successResponse(res, 200, 'Project updated successfully', project);
    } catch (error) {
        console.error('Update project error:', error);
        errorResponse(res, 500, error.message);
    }
};

// @desc    Delete project
// @route   DELETE /api/admin/projects/:id
// @access  Private (Admin)
export const deleteProject = async (req, res) => {
    try {
        const project = await Project.findByIdAndDelete(req.params.id);

        if (!project) {
            return errorResponse(res, 404, 'Project not found');
        }

        successResponse(res, 200, 'Project deleted successfully');
    } catch (error) {
        console.error('Delete project error:', error);
        errorResponse(res, 500, error.message);
    }
};

// @desc    Get comprehensive analytics data
// @route   GET /api/admin/analytics
// @access  Private (Admin)
export const getAnalytics = async (req, res) => {
    try {
        const { startDate, endDate, timeframe = '30d' } = req.query;

        // Calculate date range
        const endDateTime = endDate ? new Date(endDate) : new Date();
        let startDateTime;

        if (startDate) {
            startDateTime = new Date(startDate);
        } else {
            startDateTime = new Date();
            switch (timeframe) {
                case '7d':
                    startDateTime.setDate(startDateTime.getDate() - 7);
                    break;
                case '30d':
                    startDateTime.setDate(startDateTime.getDate() - 30);
                    break;
                case '90d':
                    startDateTime.setDate(startDateTime.getDate() - 90);
                    break;
                case '1y':
                    startDateTime.setFullYear(startDateTime.getFullYear() - 1);
                    break;
                default:
                    startDateTime.setDate(startDateTime.getDate() - 30);
            }
        }

        // Check data counts first
        const pageVisitCount = await PageVisit.countDocuments();
        const analyticsCount = await Analytics.countDocuments();
        const projectCount = await Project.countDocuments();

        // Website Analytics
        const totalPageViews = await PageVisit.countDocuments({
            startTime: { $gte: startDateTime, $lte: endDateTime }
        });

        const uniqueVisitors = await PageVisit.distinct('ipAddress', {
            startTime: { $gte: startDateTime, $lte: endDateTime }
        }).then(ips => ips.length);

        const uniqueSessions = await PageVisit.distinct('sessionId', {
            startTime: { $gte: startDateTime, $lte: endDateTime }
        }).then(sessions => sessions.length);

        // Page views by day
        const dailyPageViews = await PageVisit.aggregate([
            {
                $match: {
                    startTime: { $gte: startDateTime, $lte: endDateTime }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$startTime' }
                    },
                    views: { $sum: 1 },
                    uniqueIPs: { $addToSet: '$ipAddress' },
                    uniqueSessions: { $addToSet: '$sessionId' }
                }
            },
            {
                $project: {
                    date: '$_id',
                    views: 1,
                    uniqueVisitors: { $size: '$uniqueIPs' },
                    sessions: { $size: '$uniqueSessions' }
                }
            },
            { $sort: { date: 1 } }
        ]);

        // Top pages
        const topPages = await PageVisit.getTopPages(startDateTime, endDateTime, 10);

        // Traffic sources
        const trafficSources = await PageVisit.getTrafficSources(startDateTime, endDateTime);

        // Device breakdown
        const deviceStats = await PageVisit.aggregate([
            {
                $match: {
                    startTime: { $gte: startDateTime, $lte: endDateTime }
                }
            },
            {
                $group: {
                    _id: '$device',
                    visits: { $sum: 1 },
                    uniqueUsers: { $addToSet: '$ipAddress' }
                }
            },
            {
                $project: {
                    device: '$_id',
                    visits: 1,
                    uniqueUsers: { $size: '$uniqueUsers' }
                }
            },
            { $sort: { visits: -1 } }
        ]);

        // Country breakdown
        const countryStats = await PageVisit.aggregate([
            {
                $match: {
                    startTime: { $gte: startDateTime, $lte: endDateTime }
                }
            },
            {
                $group: {
                    _id: '$country',
                    visits: { $sum: 1 },
                    uniqueUsers: { $addToSet: '$ipAddress' }
                }
            },
            {
                $project: {
                    country: '$_id',
                    visits: 1,
                    uniqueUsers: { $size: '$uniqueUsers' }
                }
            },
            { $sort: { visits: -1 } },
            { $limit: 10 }
        ]);

        // Project Analytics
        const totalProjectViews = await Analytics.countDocuments({
            type: 'view',
            resourceType: 'Project',
            createdAt: { $gte: startDateTime, $lte: endDateTime }
        });

        const totalProjectDownloads = await Analytics.countDocuments({
            type: 'download',
            resourceType: 'Project',
            createdAt: { $gte: startDateTime, $lte: endDateTime }
        });

        const uniqueProjectViewers = await Analytics.distinct('ipAddress', {
            type: 'view',
            resourceType: 'Project',
            createdAt: { $gte: startDateTime, $lte: endDateTime }
        }).then(ips => ips.length);

        const uniqueProjectDownloaders = await Analytics.distinct('ipAddress', {
            type: 'download',
            resourceType: 'Project',
            createdAt: { $gte: startDateTime, $lte: endDateTime }
        }).then(ips => ips.length);

        // Top projects by views
        const topProjectsByViews = await Analytics.aggregate([
            {
                $match: {
                    type: 'view',
                    resourceType: 'Project',
                    createdAt: { $gte: startDateTime, $lte: endDateTime }
                }
            },
            {
                $group: {
                    _id: '$resourceId',
                    views: { $sum: 1 },
                    uniqueViewers: { $addToSet: '$ipAddress' }
                }
            },
            {
                $project: {
                    projectId: '$_id',
                    views: 1,
                    uniqueViewers: { $size: '$uniqueViewers' }
                }
            },
            { $sort: { views: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'projects',
                    localField: 'projectId',
                    foreignField: '_id',
                    as: 'project'
                }
            },
            { $unwind: '$project' },
            {
                $project: {
                    title: '$project.title',
                    views: 1,
                    uniqueViewers: 1,
                    type: '$project.type',
                    price: '$project.price'
                }
            }
        ]);

        // Top projects by downloads
        const topProjectsByDownloads = await Analytics.aggregate([
            {
                $match: {
                    type: 'download',
                    resourceType: 'Project',
                    createdAt: { $gte: startDateTime, $lte: endDateTime }
                }
            },
            {
                $group: {
                    _id: '$resourceId',
                    downloads: { $sum: 1 },
                    uniqueDownloaders: { $addToSet: '$ipAddress' }
                }
            },
            {
                $project: {
                    projectId: '$_id',
                    downloads: 1,
                    uniqueDownloaders: { $size: '$uniqueDownloaders' }
                }
            },
            { $sort: { downloads: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'projects',
                    localField: 'projectId',
                    foreignField: '_id',
                    as: 'project'
                }
            },
            { $unwind: '$project' },
            {
                $project: {
                    title: '$project.title',
                    downloads: 1,
                    uniqueDownloaders: 1,
                    type: '$project.type',
                    price: '$project.price'
                }
            }
        ]);

        // Daily project interactions
        const dailyProjectInteractions = await Analytics.aggregate([
            {
                $match: {
                    resourceType: 'Project',
                    createdAt: { $gte: startDateTime, $lte: endDateTime }
                }
            },
            {
                $group: {
                    _id: {
                        date: {
                            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                        },
                        type: '$type'
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: '$_id.date',
                    interactions: {
                        $push: {
                            type: '$_id.type',
                            count: '$count'
                        }
                    }
                }
            },
            { $sort: { '_id': 1 } }
        ]);

        // AI Usage Stats
        const totalAIChatSessions = await ChatHistory.countDocuments();
        const totalAIMessages = await ChatHistory.aggregate([
            { $unwind: '$messages' },
            { $count: 'total' }
        ]);

        const messagesByMode = await ChatHistory.aggregate([
            { $unwind: '$messages' },
            { $group: { _id: '$messages.mode', count: { $sum: 1 } } }
        ]);

        const aiCreditsUsage = await AICredit.aggregate([
            {
                $group: {
                    _id: null,
                    totalCreditsUsed: { $sum: '$totalUsed' },
                    totalActiveUsers: { $sum: 1 },
                    premiumUsers: {
                        $sum: { $cond: ['$isPremium', 1, 0] }
                    },
                    avgCreditsPerUser: { $avg: '$credits' }
                }
            }
        ]);

        // Custom Projects AI Usage
        const customProjectsCount = await CustomProject.countDocuments();
        const customProjectsByStatus = await CustomProject.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        // Database Stats
        const db = mongoose.connection.db;
        const dbStats = await db.stats();

        const collections = await db.listCollections().toArray();
        const collectionStats = await Promise.all(
            collections.map(async (col) => {
                try {
                    const stats = await db.command({ collStats: col.name });
                    return {
                        name: col.name,
                        count: stats.count || 0,
                        size: stats.size || 0,
                        avgObjSize: stats.avgObjSize || 0
                    };
                } catch (error) {
                    return {
                        name: col.name,
                        count: 0,
                        size: 0,
                        avgObjSize: 0
                    };
                }
            })
        );

        // Projects Stats
        const totalProjects = await Project.countDocuments();
        const projectsByStatus = await Project.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);
        const projectsByType = await Project.aggregate([
            { $group: { _id: '$type', count: { $sum: 1 } } }
        ]);

        // Revenue Analytics
        const revenueData = await Transaction.aggregate([
            {
                $match: {
                    status: 'completed',
                    createdAt: { $gte: startDateTime, $lte: endDateTime }
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$amount' },
                    adminCommission: { $sum: '$adminCommission' },
                    creatorEarnings: { $sum: '$creatorEarning' },
                    totalTransactions: { $sum: 1 }
                }
            }
        ]);

        const revenue = revenueData[0] || {
            totalRevenue: 0,
            adminCommission: 0,
            creatorEarnings: 0,
            totalTransactions: 0
        };

        // Create response object
        const responseData = {
            overview: {
                dateRange: {
                    start: startDateTime,
                    end: endDateTime,
                    timeframe
                },
                website: {
                    totalPageViews,
                    uniqueVisitors,
                    uniqueSessions,
                    avgPagesPerSession: uniqueSessions > 0 ? Math.round((totalPageViews / uniqueSessions) * 100) / 100 : 0
                },
                projects: {
                    totalViews: totalProjectViews,
                    totalDownloads: totalProjectDownloads,
                    uniqueViewers: uniqueProjectViewers,
                    uniqueDownloaders: uniqueProjectDownloaders,
                    conversionRate: totalProjectViews > 0 ? Math.round((totalProjectDownloads / totalProjectViews) * 100 * 100) / 100 : 0
                },
                revenue
            },
            websiteAnalytics: {
                dailyPageViews,
                topPages,
                trafficSources,
                deviceStats,
                countryStats
            },
            projectAnalytics: {
                topProjectsByViews,
                topProjectsByDownloads,
                dailyProjectInteractions
            },
            aiUsage: {
                totalChatSessions: totalAIChatSessions,
                totalMessages: totalAIMessages[0]?.total || 0,
                messagesByMode: messagesByMode.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {}),
                creditsUsage: aiCreditsUsage[0] || {
                    totalCreditsUsed: 0,
                    totalActiveUsers: 0,
                    premiumUsers: 0,
                    avgCreditsPerUser: 0
                },
                customProjects: {
                    total: customProjectsCount,
                    byStatus: customProjectsByStatus
                }
            },
            database: {
                totalSize: dbStats.dataSize,
                storageSize: dbStats.storageSize,
                indexSize: dbStats.indexSize,
                collections: collectionStats,
                totalCollections: collections.length
            },
            projects: {
                total: totalProjects,
                byStatus: projectsByStatus,
                byType: projectsByType
            },
            cloudinary: {
                estimatedProjects: totalProjects,
                estimatedImages: totalProjects * 3, // Estimate 3 images per project
                note: "Cloudinary usage is estimated based on project count. Actual usage may vary depending on image uploads per project."
            }
        };

        successResponse(res, 200, 'Comprehensive analytics data fetched', responseData);
    } catch (error) {
        console.error('Get analytics error:', error);
        errorResponse(res, 500, error.message);
    }
};

// @desc    Get detailed project analytics
// @route   GET /api/admin/analytics/projects
// @access  Private (Admin)
export const getProjectAnalytics = async (req, res) => {
    try {
        const { projectId, startDate, endDate } = req.query;

        if (!projectId) {
            return errorResponse(res, 400, 'projectId is required');
        }

        const project = await Project.findById(projectId).populate('author', 'username email');

        if (!project) {
            return errorResponse(res, 404, 'Project not found');
        }

        // Get view analytics
        const viewAnalytics = await Analytics.getProjectViews(projectId, startDate, endDate);

        // Get download analytics
        const downloadAnalytics = await Analytics.getProjectDownloads(projectId, startDate, endDate);

        // Device breakdown
        const deviceBreakdown = await Analytics.aggregate([
            {
                $match: {
                    resourceId: new mongoose.Types.ObjectId(projectId),
                    type: { $in: ['view', 'download'] }
                }
            },
            {
                $group: {
                    _id: '$device',
                    views: {
                        $sum: { $cond: [{ $eq: ['$type', 'view'] }, 1, 0] }
                    },
                    downloads: {
                        $sum: { $cond: [{ $eq: ['$type', 'download'] }, 1, 0] }
                    }
                }
            },
            { $sort: { views: -1 } }
        ]);

        // Geographic breakdown
        const geoBreakdown = await Analytics.aggregate([
            {
                $match: {
                    resourceId: new mongoose.Types.ObjectId(projectId),
                    type: { $in: ['view', 'download'] }
                }
            },
            {
                $group: {
                    _id: { country: '$country', city: '$city' },
                    views: {
                        $sum: { $cond: [{ $eq: ['$type', 'view'] }, 1, 0] }
                    },
                    downloads: {
                        $sum: { $cond: [{ $eq: ['$type', 'download'] }, 1, 0] }
                    }
                }
            },
            { $sort: { views: -1 } },
            { $limit: 20 }
        ]);

        successResponse(res, 200, 'Project analytics fetched', {
            project: {
                id: project._id,
                title: project.title,
                author: project.author,
                type: project.type,
                price: project.price,
                status: project.status,
                createdAt: project.createdAt,
                analytics: project.analytics
            },
            viewAnalytics,
            downloadAnalytics,
            breakdown: {
                byDevice: deviceBreakdown,
                byGeo: geoBreakdown
            }
        });
    } catch (error) {
        console.error('Get project analytics error:', error);
        errorResponse(res, 500, error.message);
    }
};

// @desc    Get browse projects page analytics
// @route   GET /api/admin/analytics/browse-projects
// @access  Private (Admin)
export const getBrowseProjectsAnalytics = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const browseProjectsPage = '/projects';

        // Check if PageVisit collection exists and has data
        const pageVisitCount = await PageVisit.countDocuments({ page: browseProjectsPage });

        if (pageVisitCount === 0) {
            // Return empty analytics if no data exists
            return successResponse(res, 200, 'Browse projects page analytics fetched (no data)', {
                page: browseProjectsPage,
                summary: {
                    totalVisits: 0,
                    uniqueUserCount: 0,
                    uniqueIPCount: 0,
                    avgDuration: 0,
                    avgScrollDepth: 0,
                    bounceRate: 0,
                    newVisitors: 0,
                    returningVisitors: 0,
                    avgPageLoadTime: 0
                },
                dailyAnalytics: [],
                breakdown: {
                    byDevice: [],
                    byGeo: []
                }
            });
        }

        // Page specific analytics
        const pageAnalytics = await PageVisit.getPageAnalytics(browseProjectsPage, startDate, endDate);

        // Total stats
        const totalStats = await PageVisit.aggregate([
            {
                $match: {
                    page: browseProjectsPage
                }
            },
            {
                $group: {
                    _id: null,
                    totalVisits: { $sum: 1 },
                    uniqueUsers: { $addToSet: '$userId' },
                    uniqueIPs: { $addToSet: '$ipAddress' },
                    avgDuration: { $avg: '$duration' },
                    avgScrollDepth: { $avg: '$scrollDepth' },
                    totalBounces: { $sum: { $cond: ['$bounced', 1, 0] } },
                    newVisitors: { $sum: { $cond: ['$isNewVisitor', 1, 0] } },
                    returningVisitors: { $sum: { $cond: ['$isReturningVisitor', 1, 0] } },
                    avgPageLoadTime: { $avg: '$pageLoadTime' }
                }
            },
            {
                $addFields: {
                    uniqueUserCount: { $size: '$uniqueUsers' },
                    uniqueIPCount: { $size: '$uniqueIPs' },
                    bounceRate: {
                        $cond: [
                            { $eq: ['$totalVisits', 0] },
                            0,
                            { $multiply: [{ $divide: ['$totalBounces', '$totalVisits'] }, 100] }
                        ]
                    }
                }
            }
        ]);

        // Device breakdown
        const deviceBreakdown = await PageVisit.aggregate([
            { $match: { page: browseProjectsPage } },
            {
                $group: {
                    _id: '$device',
                    visits: { $sum: 1 },
                    totalBounces: { $sum: { $cond: ['$bounced', 1, 0] } }
                }
            },
            {
                $addFields: {
                    bounceRate: {
                        $cond: [
                            { $eq: ['$visits', 0] },
                            0,
                            { $multiply: [{ $divide: ['$totalBounces', '$visits'] }, 100] }
                        ]
                    }
                }
            },
            { $sort: { visits: -1 } }
        ]);

        // Geographic breakdown
        const geoBreakdown = await PageVisit.aggregate([
            { $match: { page: browseProjectsPage } },
            {
                $group: {
                    _id: '$country',
                    visits: { $sum: 1 }
                }
            },
            { $sort: { visits: -1 } },
            { $limit: 15 }
        ]);

        successResponse(res, 200, 'Browse projects page analytics fetched', {
            page: browseProjectsPage,
            summary: totalStats[0] || {
                totalVisits: 0,
                uniqueUserCount: 0,
                uniqueIPCount: 0,
                avgDuration: 0,
                avgScrollDepth: 0,
                bounceRate: 0,
                newVisitors: 0,
                returningVisitors: 0,
                avgPageLoadTime: 0
            },
            dailyAnalytics: pageAnalytics || [],
            breakdown: {
                byDevice: deviceBreakdown || [],
                byGeo: geoBreakdown || []
            }
        });
    } catch (error) {
        console.error('Get browse projects analytics error:', error);
        console.error('Error stack:', error.stack);
        errorResponse(res, 500, `Analytics error: ${error.message}`);
    }
};