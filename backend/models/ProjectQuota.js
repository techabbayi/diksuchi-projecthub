import mongoose from 'mongoose';

const projectQuotaSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        allowedProjects: {
            type: Number,
            default: 1, // Free tier: 1 custom project
        },
        usedProjects: {
            type: Number,
            default: 0,
        },
        pendingRequests: [
            {
                requestDate: {
                    type: Date,
                    default: Date.now,
                },
                reason: String,
                status: {
                    type: String,
                    enum: ['pending', 'approved', 'rejected'],
                    default: 'pending',
                },
                adminNote: String,
                processedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                },
                processedAt: Date,
                paymentRequired: {
                    type: Boolean,
                    default: true,
                },
                paymentAmount: {
                    type: Number,
                    default: 299, // ₹299 for additional project
                },
                paymentStatus: {
                    type: String,
                    enum: ['pending', 'completed', 'failed'],
                    default: 'pending',
                },
            }
        ],
        totalApproved: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Method to check if user can create new project
projectQuotaSchema.methods.canCreateProject = function () {
    return this.usedProjects < this.allowedProjects;
};

// Method to increment used projects
projectQuotaSchema.methods.incrementUsed = async function () {
    this.usedProjects += 1;
    return await this.save();
};

// Method to add pending request
projectQuotaSchema.methods.requestAdditionalProject = async function (reason) {
    this.pendingRequests.push({
        reason,
        status: 'pending',
        paymentRequired: true,
        paymentAmount: 299,
        paymentStatus: 'pending',
    });
    return await this.save();
};

const ProjectQuota = mongoose.model('ProjectQuota', projectQuotaSchema);

export default ProjectQuota;
