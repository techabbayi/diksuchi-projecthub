import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema(
    {
        // What was tracked
        type: {
            type: String,
            enum: ['view', 'download', 'page_visit'],
            required: true,
        },

        // Resource being tracked
        resourceId: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'resourceType'
        },
        resourceType: {
            type: String,
            enum: ['Project', 'User', 'Page'],
        },

        // Page tracking specific fields
        page: {
            type: String, // e.g., '/projects', '/projects/browse', '/project/:id'
        },

        // User information
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            sparse: true, // Allow null for anonymous users
        },

        // Session and request information
        sessionId: {
            type: String,
            index: true,
        },
        ipAddress: {
            type: String,
            required: true,
        },
        userAgent: {
            type: String,
        },

        // Geographic information (if available)
        country: String,
        city: String,

        // Referrer information
        referrer: String,
        source: String, // 'direct', 'search', 'social', 'referral'

        // Device information
        device: {
            type: String,
            enum: ['desktop', 'mobile', 'tablet'],
        },
        browser: String,
        os: String,

        // Additional metadata
        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },

        // Timing information
        duration: {
            type: Number, // in milliseconds, useful for page visits
        },

        // Download specific fields
        downloadSize: {
            type: Number, // in bytes
        },
        downloadSuccess: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
        // Automatic expiration after 2 years for privacy compliance
        expireAfterSeconds: 63072000, // 2 years in seconds
    }
);

// Indexes for better query performance
analyticsSchema.index({ type: 1, createdAt: -1 });
analyticsSchema.index({ resourceId: 1, type: 1, createdAt: -1 });
analyticsSchema.index({ userId: 1, type: 1, createdAt: -1 });
analyticsSchema.index({ page: 1, type: 1, createdAt: -1 });
analyticsSchema.index({ sessionId: 1, createdAt: -1 });
analyticsSchema.index({ ipAddress: 1, createdAt: -1 });
analyticsSchema.index({ createdAt: -1 });

// Compound indexes for common queries
analyticsSchema.index({ type: 1, resourceId: 1, createdAt: -1 });
analyticsSchema.index({ type: 1, page: 1, createdAt: -1 });

// Static methods for common analytics queries
analyticsSchema.statics.getProjectViews = function (projectId, startDate, endDate) {
    const match = {
        type: 'view',
        resourceId: new mongoose.Types.ObjectId(projectId),
        resourceType: 'Project'
    };

    if (startDate || endDate) {
        match.createdAt = {};
        if (startDate) match.createdAt.$gte = new Date(startDate);
        if (endDate) match.createdAt.$lte = new Date(endDate);
    }

    return this.aggregate([
        { $match: match },
        {
            $group: {
                _id: {
                    $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                },
                views: { $sum: 1 },
                uniqueUsers: { $addToSet: '$userId' },
                uniqueIPs: { $addToSet: '$ipAddress' }
            }
        },
        {
            $addFields: {
                uniqueUserCount: { $size: '$uniqueUsers' },
                uniqueIPCount: { $size: '$uniqueIPs' }
            }
        },
        { $sort: { '_id': 1 } },
        {
            $project: {
                date: '$_id',
                views: 1,
                uniqueUserCount: 1,
                uniqueIPCount: 1
            }
        }
    ]);
};

analyticsSchema.statics.getProjectDownloads = function (projectId, startDate, endDate) {
    const match = {
        type: 'download',
        resourceId: new mongoose.Types.ObjectId(projectId),
        resourceType: 'Project'
    };

    if (startDate || endDate) {
        match.createdAt = {};
        if (startDate) match.createdAt.$gte = new Date(startDate);
        if (endDate) match.createdAt.$lte = new Date(endDate);
    }

    return this.aggregate([
        { $match: match },
        {
            $group: {
                _id: {
                    $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                },
                downloads: { $sum: 1 },
                uniqueUsers: { $addToSet: '$userId' },
                uniqueIPs: { $addToSet: '$ipAddress' },
                totalSize: { $sum: '$downloadSize' },
                successfulDownloads: {
                    $sum: { $cond: ['$downloadSuccess', 1, 0] }
                }
            }
        },
        {
            $addFields: {
                uniqueUserCount: { $size: '$uniqueUsers' },
                uniqueIPCount: { $size: '$uniqueIPs' }
            }
        },
        { $sort: { '_id': 1 } },
        {
            $project: {
                date: '$_id',
                downloads: 1,
                uniqueUserCount: 1,
                uniqueIPCount: 1,
                totalSize: 1,
                successfulDownloads: 1,
                successRate: {
                    $multiply: [
                        { $divide: ['$successfulDownloads', '$downloads'] },
                        100
                    ]
                }
            }
        }
    ]);
};

analyticsSchema.statics.getPageViews = function (page, startDate, endDate) {
    const match = {
        type: 'page_visit',
        page: page
    };

    if (startDate || endDate) {
        match.createdAt = {};
        if (startDate) match.createdAt.$gte = new Date(startDate);
        if (endDate) match.createdAt.$lte = new Date(endDate);
    }

    return this.aggregate([
        { $match: match },
        {
            $group: {
                _id: {
                    $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                },
                visits: { $sum: 1 },
                uniqueUsers: { $addToSet: '$userId' },
                uniqueIPs: { $addToSet: '$ipAddress' },
                totalDuration: { $sum: '$duration' },
                avgDuration: { $avg: '$duration' }
            }
        },
        {
            $addFields: {
                uniqueUserCount: { $size: '$uniqueUsers' },
                uniqueIPCount: { $size: '$uniqueIPs' }
            }
        },
        { $sort: { '_id': 1 } },
        {
            $project: {
                date: '$_id',
                visits: 1,
                uniqueUserCount: 1,
                uniqueIPCount: 1,
                totalDuration: 1,
                avgDuration: { $round: ['$avgDuration', 2] }
            }
        }
    ]);
};

// Instance methods
analyticsSchema.methods.toSafeObject = function () {
    const obj = this.toObject();
    delete obj.ipAddress;
    delete obj.userAgent;
    return obj;
};

const Analytics = mongoose.model('Analytics', analyticsSchema);

export default Analytics;