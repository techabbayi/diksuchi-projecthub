import Project from '../models/Project.js';
import User from '../models/User.js';
import Review from '../models/Review.js';
import cloudinary from '../config/cloudinary.js';
import { successResponse, errorResponse, getPagination } from '../utils/helpers.js';
import { trackProjectView, trackProjectDownload } from '../middleware/analytics.js';

// @desc    Get all projects (with filters)
// @route   GET /api/projects
// @access  Public
export const getProjects = async (req, res) => {
    try {
        const { page, limit, search, difficulty, type, category, techStack, minPrice, maxPrice, status } = req.query;

        const { page: pageNum, limit: limitNum, skip } = getPagination(page, limit);

        // Build query
        let query = {};

        // Only show approved projects for non-admin users
        if (!req.user || req.user.role !== 'admin') {
            query.status = 'approved';
        } else if (status) {
            query.status = status;
        }

        // Search
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } },
            ];
        }

        // Filters
        if (difficulty) query.difficulty = difficulty;
        if (type) query.type = type;
        if (category) query.category = category;
        if (techStack) query.techStack = { $in: techStack.split(',') };
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = parseInt(minPrice);
            if (maxPrice) query.price.$lte = parseInt(maxPrice);
        }

        const projects = await Project.find(query)
            .populate('author', 'username avatar')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);

        const total = await Project.countDocuments(query);

        successResponse(res, 200, 'Projects fetched successfully', {
            projects,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum),
            },
        });
    } catch (error) {
        console.error('Get projects error:', error);
        errorResponse(res, 500, error.message);
    }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Public
export const getProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id).populate('author', 'username avatar bio');

        if (!project) {
            return errorResponse(res, 404, 'Project not found');
        }

        // Increment views
        project.views += 1;
        await project.save();

        // Track analytics
        await trackProjectView(project._id.toString(), req);

        // Get reviews
        const reviews = await Review.find({ project: project._id })
            .populate('user', 'username avatar')
            .sort({ createdAt: -1 });

        successResponse(res, 200, 'Project fetched successfully', {
            project,
            reviews,
        });
    } catch (error) {
        console.error('Get project error:', error);
        errorResponse(res, 500, error.message);
    }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private (Creator/Admin)
export const createProject = async (req, res) => {
    try {
        const {
            title,
            description,
            techStack,
            difficulty,
            type,
            price,
            mode,
            zipUrl,
            githubLink,
            guideUrl,
            screenshots,
            tags,
            category,
        } = req.body;

        // Validate mode-specific requirements
        if (mode === 'zip' && !zipUrl) {
            return errorResponse(res, 400, 'ZIP URL is required for zip mode');
        }

        if (mode === 'github' && !githubLink) {
            return errorResponse(res, 400, 'GitHub link is required for github mode');
        }

        // Create project
        const project = await Project.create({
            title,
            description,
            techStack: Array.isArray(techStack) ? techStack : techStack.split(','),
            difficulty,
            type,
            price: type === 'free' ? 0 : price,
            mode,
            zipUrl,
            githubLink,
            guideUrl,
            screenshots: Array.isArray(screenshots) ? screenshots : screenshots ? [screenshots] : [],
            tags: Array.isArray(tags) ? tags : tags ? tags.split(',') : [],
            category,
            author: req.user._id,
            verifiedByAdmin: req.user.role === 'admin',
            status: req.user.role === 'admin' ? 'approved' : 'pending',
        });

        successResponse(res, 201, 'Project created successfully', project);
    } catch (error) {
        console.error('Create project error:', error);
        errorResponse(res, 500, error.message);
    }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (Creator/Admin - own projects only)
export const updateProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return errorResponse(res, 404, 'Project not found');
        }

        // Check ownership
        if (project.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return errorResponse(res, 403, 'Not authorized to update this project');
        }

        // Update fields
        const allowedFields = [
            'title',
            'description',
            'techStack',
            'difficulty',
            'type',
            'price',
            'zipUrl',
            'githubLink',
            'guideUrl',
            'screenshots',
            'tags',
            'category',
        ];

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                project[field] = req.body[field];
            }
        });

        // If project was edited by creator, reset to pending
        if (req.user.role !== 'admin') {
            project.status = 'pending';
        }

        await project.save();

        successResponse(res, 200, 'Project updated successfully', project);
    } catch (error) {
        console.error('Update project error:', error);
        errorResponse(res, 500, error.message);
    }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Creator/Admin - own projects only)
export const deleteProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return errorResponse(res, 404, 'Project not found');
        }

        // Check ownership
        if (project.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return errorResponse(res, 403, 'Not authorized to delete this project');
        }

        await project.deleteOne();

        successResponse(res, 200, 'Project deleted successfully');
    } catch (error) {
        console.error('Delete project error:', error);
        errorResponse(res, 500, error.message);
    }
};

// @desc    Upload file to Cloudinary
// @route   POST /api/projects/upload
// @access  Private (Creator/Admin)
export const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return errorResponse(res, 400, 'No file uploaded');
        }

        const fileType = req.body.fileType || 'auto';
        const folder = fileType === 'zip' ? 'projects/zips' : 'projects/screenshots';

        // Upload to Cloudinary
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder,
                    resource_type: fileType === 'zip' ? 'raw' : 'image',
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );

            uploadStream.end(req.file.buffer);
        });

        successResponse(res, 200, 'File uploaded successfully', {
            url: result.secure_url,
            publicId: result.public_id,
        });
    } catch (error) {
        console.error('Upload file error:', error);
        errorResponse(res, 500, error.message);
    }
};

// @desc    Get creator's projects
// @route   GET /api/projects/creator/my-projects
// @access  Private (Creator/Admin)
export const getMyProjects = async (req, res) => {
    try {
        const projects = await Project.find({ author: req.user._id }).sort({ createdAt: -1 });

        successResponse(res, 200, 'Projects fetched successfully', projects);
    } catch (error) {
        console.error('Get my projects error:', error);
        errorResponse(res, 500, error.message);
    }
};

// @desc    Download project
// @route   GET /api/projects/:id/download
// @access  Public
export const downloadProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return errorResponse(res, 404, 'Project not found');
        }

        if (project.status !== 'approved') {
            return errorResponse(res, 403, 'Project not approved for download');
        }

        // Increment downloads
        project.downloads += 1;
        await project.save();

        // Track download analytics
        const downloadData = {
            type: project.mode === 'zip' ? 'zip' : 'github',
            fileName: project.zipUrl ? project.zipUrl.split('/').pop() : `${project.title}.zip`,
            success: true
        };

        await trackProjectDownload(project._id.toString(), downloadData, req);

        // Return download URL or redirect
        if (project.mode === 'zip' && project.zipUrl) {
            successResponse(res, 200, 'Download URL retrieved', {
                downloadUrl: project.zipUrl,
                type: 'zip',
                fileName: project.zipUrl.split('/').pop()
            });
        } else if (project.mode === 'github' && project.githubLink) {
            successResponse(res, 200, 'GitHub repository link', {
                downloadUrl: project.githubLink,
                type: 'github',
                repository: project.githubLink
            });
        } else {
            return errorResponse(res, 400, 'No download available for this project');
        }
    } catch (error) {
        console.error('Download project error:', error);

        // Track failed download
        try {
            await trackProjectDownload(req.params.id, { success: false }, req);
        } catch (trackError) {
            console.error('Failed to track failed download:', trackError);
        }

        errorResponse(res, 500, error.message);
    }
};
