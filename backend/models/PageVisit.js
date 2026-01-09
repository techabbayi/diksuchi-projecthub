import mongoose from 'mongoose';

const pageVisitSchema = new mongoose.Schema(
    {
        // Page information
        page: {
            type: String,
            required: true,
            index: true,
        },
        route: {
            type: String, // Full route path
        },
        title: {
            type: String, // Page title
        },

        // Visit information
        visitId: {
            type: String,
            required: true,
        },
        sessionId: {
            type: String,
            required: true,
            index: true,
        },

        // User information
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            sparse: true,
        },
        isAuthenticated: {
            type: Boolean,
            default: false,
        },

        // Request information
        ipAddress: {
            type: String,
            required: true,
        },
        userAgent: {
            type: String,
        },

        // Geographic information
        country: String,
        region: String,
        city: String,
        timezone: String,

        // Referrer information
        referrer: String,
        referrerDomain: String,
        source: {
            type: String,
            enum: ['direct', 'search', 'social', 'referral', 'email', 'ads'],
            default: 'direct',
        },
        medium: String, // organic, cpc, referral, etc.
        campaign: String, // utm_campaign

        // Device information
        device: {
            type: String,
            enum: ['desktop', 'mobile', 'tablet', 'unknown'],
            default: 'unknown',
        },
        browser: String,
        browserVersion: String,
        os: String,
        osVersion: String,
        isMobile: {
            type: Boolean,
            default: false,
        },

        // Visit behavior
        startTime: {
            type: Date,
            default: Date.now,
        },
        endTime: Date,
        duration: {
            type: Number, // in milliseconds
            default: 0,
        },
        isNewVisitor: {
            type: Boolean,
            default: true,
        },
        isReturningVisitor: {
            type: Boolean,
            default: false,
        },

        // Page interaction
        scrollDepth: {
            type: Number, // percentage
            default: 0,
            min: 0,
            max: 100,
        },
        clickCount: {
            type: Number,
            default: 0,
        },
        formSubmissions: {
            type: Number,
            default: 0,
        },

        // Performance metrics
        pageLoadTime: {
            type: Number, // in milliseconds
        },
        timeToFirstByte: {
            type: Number, // in milliseconds
        },

        // Exit information
        exitPage: String,
        bounced: {
            type: Boolean,
            default: false,
        },

        // Additional metadata
        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },

        // A/B testing
        experiments: [{
            name: String,
            variant: String,
        }],

        // Conversion tracking
        goalCompletions: [{
            goalName: String,
            completedAt: Date,
            value: Number,
        }],
    },
    {
        timestamps: true,
        // Automatic expiration after 2 years
        expireAfterSeconds: 63072000,
    }
);

// Indexes for performance
pageVisitSchema.index({ page: 1, createdAt: -1 });
pageVisitSchema.index({ userId: 1, createdAt: -1 });
pageVisitSchema.index({ sessionId: 1, createdAt: -1 });
pageVisitSchema.index({ visitId: 1 }, { unique: true });
pageVisitSchema.index({ ipAddress: 1, createdAt: -1 });
pageVisitSchema.index({ source: 1, createdAt: -1 });
pageVisitSchema.index({ device: 1, createdAt: -1 });
pageVisitSchema.index({ country: 1, createdAt: -1 });
pageVisitSchema.index({ isNewVisitor: 1, createdAt: -1 });

// Compound indexes for analytics queries
pageVisitSchema.index({ page: 1, startTime: -1 });
pageVisitSchema.index({ page: 1, device: 1, createdAt: -1 });
pageVisitSchema.index({ page: 1, source: 1, createdAt: -1 });

// Static methods for analytics
pageVisitSchema.statics.getPageAnalytics = function (page, startDate, endDate) {
    const match = { page };

    if (startDate || endDate) {
        match.startTime = {};
        if (startDate) match.startTime.$gte = new Date(startDate);
        if (endDate) match.startTime.$lte = new Date(endDate);
    }

    return this.aggregate([
        { $match: match },
        {
            $group: {
                _id: {
                    date: {
                        $dateToString: { format: '%Y-%m-%d', date: '$startTime' }
                    }
                },
                totalVisits: { $sum: 1 },
                uniqueUsers: { $addToSet: '$userId' },
                uniqueIPs: { $addToSet: '$ipAddress' },
                uniqueSessions: { $addToSet: '$sessionId' },
                avgDuration: { $avg: '$duration' },
                avgScrollDepth: { $avg: '$scrollDepth' },
                totalBounces: {
                    $sum: { $cond: ['$bounced', 1, 0] }
                },
                newVisitors: {
                    $sum: { $cond: ['$isNewVisitor', 1, 0] }
                },
                returningVisitors: {
                    $sum: { $cond: ['$isReturningVisitor', 1, 0] }
                },
                avgPageLoadTime: { $avg: '$pageLoadTime' }
            }
        },
        {
            $addFields: {
                uniqueUserCount: { $size: '$uniqueUsers' },
                uniqueIPCount: { $size: '$uniqueIPs' },
                sessionCount: { $size: '$uniqueSessions' },
                bounceRate: {
                    $multiply: [
                        { $divide: ['$totalBounces', '$totalVisits'] },
                        100
                    ]
                }
            }
        },
        { $sort: { '_id.date': 1 } },
        {
            $project: {
                date: '$_id.date',
                totalVisits: 1,
                uniqueUserCount: 1,
                uniqueIPCount: 1,
                sessionCount: 1,
                avgDuration: { $round: ['$avgDuration', 2] },
                avgScrollDepth: { $round: ['$avgScrollDepth', 2] },
                bounceRate: { $round: ['$bounceRate', 2] },
                newVisitors: 1,
                returningVisitors: 1,
                avgPageLoadTime: { $round: ['$avgPageLoadTime', 2] }
            }
        }
    ]);
};

pageVisitSchema.statics.getTopPages = function (startDate, endDate, limit = 10) {
    const match = {};

    if (startDate || endDate) {
        match.startTime = {};
        if (startDate) match.startTime.$gte = new Date(startDate);
        if (endDate) match.startTime.$lte = new Date(endDate);
    }

    return this.aggregate([
        { $match: match },
        {
            $group: {
                _id: '$page',
                visits: { $sum: 1 },
                uniqueUsers: { $addToSet: '$userId' },
                avgDuration: { $avg: '$duration' },
                bounces: { $sum: { $cond: ['$bounced', 1, 0] } }
            }
        },
        {
            $addFields: {
                uniqueUserCount: { $size: '$uniqueUsers' },
                bounceRate: {
                    $multiply: [
                        { $divide: ['$bounces', '$visits'] },
                        100
                    ]
                }
            }
        },
        { $sort: { visits: -1 } },
        { $limit: limit },
        {
            $project: {
                page: '$_id',
                visits: 1,
                uniqueUserCount: 1,
                avgDuration: { $round: ['$avgDuration', 2] },
                bounceRate: { $round: ['$bounceRate', 2] }
            }
        }
    ]);
};

pageVisitSchema.statics.getTrafficSources = function (startDate, endDate) {
    const match = {};

    if (startDate || endDate) {
        match.startTime = {};
        if (startDate) match.startTime.$gte = new Date(startDate);
        if (endDate) match.startTime.$lte = new Date(endDate);
    }

    return this.aggregate([
        { $match: match },
        {
            $group: {
                _id: {
                    source: '$source',
                    medium: '$medium'
                },
                visits: { $sum: 1 },
                uniqueUsers: { $addToSet: '$userId' },
                sessions: { $addToSet: '$sessionId' }
            }
        },
        {
            $addFields: {
                uniqueUserCount: { $size: '$uniqueUsers' },
                sessionCount: { $size: '$sessions' }
            }
        },
        { $sort: { visits: -1 } },
        {
            $project: {
                source: '$_id.source',
                medium: '$_id.medium',
                visits: 1,
                uniqueUserCount: 1,
                sessionCount: 1
            }
        }
    ]);
};

// Instance methods
pageVisitSchema.methods.calculateDuration = function () {
    if (this.endTime && this.startTime) {
        this.duration = this.endTime.getTime() - this.startTime.getTime();
    }
    return this.duration;
};

pageVisitSchema.methods.markAsExited = function (exitTime = new Date()) {
    this.endTime = exitTime;
    this.calculateDuration();
    return this.save();
};

const PageVisit = mongoose.model('PageVisit', pageVisitSchema);

export default PageVisit;