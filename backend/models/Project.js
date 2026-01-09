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
        uniqueViews: {
            type: Number,
            default: 0,
            min: 0,
        },
        uniqueDownloads: {
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
        // Enhanced analytics
        analytics: {
            totalViews: {
                type: Number,
                default: 0,
            },
            uniqueViews: {
                type: Number,
                default: 0,
            },
            totalDownloads: {
                type: Number,
                default: 0,
            },
            uniqueDownloads: {
                type: Number,
                default: 0,
            },
            viewsToday: {
                type: Number,
                default: 0,
            },
            downloadsToday: {
                type: Number,
                default: 0,
            },
            viewsThisWeek: {
                type: Number,
                default: 0,
            },
            downloadsThisWeek: {
                type: Number,
                default: 0,
            },
            viewsThisMonth: {
                type: Number,
                default: 0,
            },
            downloadsThisMonth: {
                type: Number,
                default: 0,
            },
            lastViewedAt: {
                type: Date,
            },
            lastDownloadedAt: {
                type: Date,
            },
            topCountries: [{
                country: String,
                count: Number,
            }],
            topDevices: [{
                device: String,
                count: Number,
            }],
            topSources: [{
                source: String,
                count: Number,
            }],
            conversionRate: {
                type: Number,
                default: 0, // views to downloads ratio
                min: 0,
                max: 100,
            },
            avgSessionDuration: {
                type: Number,
                default: 0, // in milliseconds
            },
            bounceRate: {
                type: Number,
                default: 0,
                min: 0,
                max: 100,
            },
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
projectSchema.index({ 'analytics.totalViews': -1 });
projectSchema.index({ 'analytics.totalDownloads': -1 });
projectSchema.index({ 'analytics.lastViewedAt': -1 });
projectSchema.index({ 'analytics.lastDownloadedAt': -1 });

// Instance methods for analytics
projectSchema.methods.incrementViews = function (isUnique = false) {
    this.views = (this.views || 0) + 1;
    this.analytics.totalViews = (this.analytics.totalViews || 0) + 1;
    this.analytics.viewsToday = (this.analytics.viewsToday || 0) + 1;
    this.analytics.viewsThisWeek = (this.analytics.viewsThisWeek || 0) + 1;
    this.analytics.viewsThisMonth = (this.analytics.viewsThisMonth || 0) + 1;
    this.analytics.lastViewedAt = new Date();

    if (isUnique) {
        this.uniqueViews = (this.uniqueViews || 0) + 1;
        this.analytics.uniqueViews = (this.analytics.uniqueViews || 0) + 1;
    }

    return this.save();
};

projectSchema.methods.incrementDownloads = function (isUnique = false) {
    this.downloads = (this.downloads || 0) + 1;
    this.analytics.totalDownloads = (this.analytics.totalDownloads || 0) + 1;
    this.analytics.downloadsToday = (this.analytics.downloadsToday || 0) + 1;
    this.analytics.downloadsThisWeek = (this.analytics.downloadsThisWeek || 0) + 1;
    this.analytics.downloadsThisMonth = (this.analytics.downloadsThisMonth || 0) + 1;
    this.analytics.lastDownloadedAt = new Date();

    if (isUnique) {
        this.uniqueDownloads = (this.uniqueDownloads || 0) + 1;
        this.analytics.uniqueDownloads = (this.analytics.uniqueDownloads || 0) + 1;
    }

    // Update conversion rate
    this.updateConversionRate();

    return this.save();
};

projectSchema.methods.updateConversionRate = function () {
    const totalViews = this.analytics.totalViews || this.views || 0;
    const totalDownloads = this.analytics.totalDownloads || this.downloads || 0;

    if (totalViews > 0) {
        this.analytics.conversionRate = Math.round((totalDownloads / totalViews) * 100 * 100) / 100;
    } else {
        this.analytics.conversionRate = 0;
    }
};

projectSchema.methods.updateAnalyticsFromData = function (analyticsData) {
    if (!analyticsData) return;

    // Update top countries
    if (analyticsData.topCountries) {
        this.analytics.topCountries = analyticsData.topCountries.slice(0, 5);
    }

    // Update top devices
    if (analyticsData.topDevices) {
        this.analytics.topDevices = analyticsData.topDevices.slice(0, 5);
    }

    // Update top sources
    if (analyticsData.topSources) {
        this.analytics.topSources = analyticsData.topSources.slice(0, 5);
    }

    // Update session metrics
    if (analyticsData.avgSessionDuration !== undefined) {
        this.analytics.avgSessionDuration = analyticsData.avgSessionDuration;
    }

    if (analyticsData.bounceRate !== undefined) {
        this.analytics.bounceRate = analyticsData.bounceRate;
    }

    return this.save();
};

// Static method to reset daily/weekly/monthly counters
projectSchema.statics.resetPeriodCounters = function (period) {
    const updateObj = {};

    switch (period) {
        case 'daily':
            updateObj['analytics.viewsToday'] = 0;
            updateObj['analytics.downloadsToday'] = 0;
            break;
        case 'weekly':
            updateObj['analytics.viewsThisWeek'] = 0;
            updateObj['analytics.downloadsThisWeek'] = 0;
            break;
        case 'monthly':
            updateObj['analytics.viewsThisMonth'] = 0;
            updateObj['analytics.downloadsThisMonth'] = 0;
            break;
    }

    return this.updateMany({}, { $set: updateObj });
};

// Static method to get trending projects
projectSchema.statics.getTrending = function (timeframe = 'week', limit = 10) {
    let sortField;
    switch (timeframe) {
        case 'today':
            sortField = 'analytics.viewsToday';
            break;
        case 'week':
            sortField = 'analytics.viewsThisWeek';
            break;
        case 'month':
            sortField = 'analytics.viewsThisMonth';
            break;
        default:
            sortField = 'analytics.totalViews';
    }

    return this.find({ status: 'approved' })
        .sort({ [sortField]: -1 })
        .limit(limit)
        .populate('author', 'username avatar');
};

const Project = mongoose.model('Project', projectSchema);

export default Project;
