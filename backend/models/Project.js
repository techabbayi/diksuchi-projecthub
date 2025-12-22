import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Project title is required'],
            trim: true,
            maxlength: [100, 'Title cannot exceed 100 characters'],
        },
        description: {
            type: String,
            required: [true, 'Project description is required'],
            maxlength: [2000, 'Description cannot exceed 2000 characters'],
        },
        techStack: [
            {
                type: String,
                required: true,
            },
        ],
        difficulty: {
            type: String,
            enum: ['Beginner', 'Intermediate', 'Advanced'],
            required: [true, 'Difficulty level is required'],
        },
        type: {
            type: String,
            enum: ['free', 'paid'],
            required: [true, 'Project type is required'],
        },
        price: {
            type: Number,
            default: 0,
            min: 0,
            enum: [0, 49, 99, 299],
            validate: {
                validator: function (value) {
                    if (this.type === 'free') return value === 0;
                    if (this.type === 'paid') return [49, 99, 299].includes(value);
                    return true;
                },
                message: 'Price must be 0 for free projects or 49/99/299 for paid projects',
            },
        },
        tier: {
            type: String,
            enum: ['Free', 'Mini', 'Medium', 'Full Stack'],
            default: function () {
                if (this.price === 0) return 'Free';
                if (this.price === 49) return 'Mini';
                if (this.price === 99) return 'Medium';
                if (this.price === 299) return 'Full Stack';
                return 'Free';
            },
        },
        mode: {
            type: String,
            enum: ['zip', 'github'],
            required: [true, 'Upload mode is required'],
        },
        zipUrl: {
            type: String,
            validate: {
                validator: function (value) {
                    if (this.mode === 'zip') return !!value;
                    return true;
                },
                message: 'ZIP URL is required for zip mode',
            },
        },
        githubLink: {
            type: String,
            validate: {
                validator: function (value) {
                    if (this.mode === 'github') return !!value;
                    return true;
                },
                message: 'GitHub link is required for github mode',
            },
        },
        guideUrl: {
            type: String,
        },
        screenshots: [
            {
                type: String,
            },
        ],
        tags: [
            {
                type: String,
            },
        ],
        category: {
            type: String,
            enum: ['Web Development', 'Mobile App', 'AI/ML', 'Game Development', 'DevOps', 'Data Science', 'Blockchain', 'Other'],
            default: 'Other',
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
        },
        verifiedByAdmin: {
            type: Boolean,
            default: false,
        },
        rejectionReason: {
            type: String,
        },
        downloads: {
            type: Number,
            default: 0,
            min: 0,
        },
        views: {
            type: Number,
            default: 0,
            min: 0,
        },
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        reviewCount: {
            type: Number,
            default: 0,
            min: 0,
        },
        sales: {
            type: Number,
            default: 0,
            min: 0,
        },
        revenue: {
            type: Number,
            default: 0,
            min: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for better query performance
projectSchema.index({ title: 'text', description: 'text', tags: 'text' });
projectSchema.index({ status: 1, type: 1 });
projectSchema.index({ author: 1 });

const Project = mongoose.model('Project', projectSchema);

export default Project;
