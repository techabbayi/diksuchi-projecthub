import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
    taskId: {
        type: Number,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['setup', 'code', 'testing', 'deployment', 'documentation'],
        required: true,
    },
    order: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['locked', 'active', 'completed', 'reopened'],
        default: 'locked',
    },
    artifactConfig: {
        type: {
            type: String,
            default: 'link',
        },
        linkType: {
            type: String,
            enum: ['github-repo', 'github-commit', 'github-pr', 'deployed-url', 'design-link', 'doc-link', 'screenshot-link', 'any'],
            required: true,
        },
        required: {
            type: Boolean,
            default: true,
        },
        label: String,
        placeholder: String,
        validationPattern: String,
        helpText: String,
    },
    secondaryArtifact: {
        type: {
            type: String,
            default: 'link',
        },
        linkType: String,
        required: Boolean,
        label: String,
        placeholder: String,
    },
    submission: {
        artifactUrl: String,
        secondaryUrl: String,
        notes: String,
        submittedAt: Date,
        verificationStatus: {
            type: String,
            enum: ['verified', 'pending', 'failed'],
            default: 'pending',
        },
        verificationCheckedAt: Date,
        isLinkAccessible: Boolean,
    },
    learningPoints: [String],
    resources: [String],
    estimatedTime: String,
    helpContent: {
        commands: [
            {
                description: String,
                command: String
            }
        ],
        steps: [
            {
                title: String,
                description: String,
                code: String
            }
        ]
    }
});

const milestoneSchema = new mongoose.Schema({
    milestoneId: {
        type: Number,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    estimatedDays: Number,
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed'],
        default: 'pending',
    },
    tasks: [taskSchema],
});

const customProjectSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        projectName: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        motivation: {
            type: String,
            enum: ['college', 'portfolio', 'business', 'learning', 'freelance', 'opensource', 'other'],
            required: true,
        },
        targetAudience: String,

        // Tech Stack
        techStack: {
            predefined: String,
            custom: [String],
            frontend: [String],
            backend: [String],
            database: [String],
            others: [String],
        },

        // Project Scope
        complexity: {
            type: String,
            enum: ['basic', 'intermediate', 'advanced', 'production'],
        },
        features: [String],

        // Time Planning
        totalTimeEstimate: String,
        dailyTimeCommitment: String,
        deadline: Date,
        skillLevel: {
            type: String,
            enum: ['beginner', 'intermediate', 'advanced'],
        },

        // Learning Preferences
        learningStyle: String,
        helpNeeded: [String],

        // AI Generated Content
        aiGeneratedGuide: {
            readme: String,
            folderStructure: mongoose.Schema.Types.Mixed,
            fileDocumentation: [
                {
                    filePath: String,
                    purpose: String,
                    whatYouLearn: [String],
                    keyConcepts: [String],
                    estimatedTime: String,
                }
            ],
            configurationGuide: mongoose.Schema.Types.Mixed,
            setupInstructions: String,
        },

        // Milestones & Tasks
        milestones: [milestoneSchema],

        // Progress Tracking
        progress: {
            overallPercentage: {
                type: Number,
                default: 0,
                min: 0,
                max: 100,
            },
            currentMilestoneId: Number,
            currentTaskId: Number,
            totalTasksCompleted: {
                type: Number,
                default: 0,
            },
            totalTasks: {
                type: Number,
                default: 0,
            },
            totalTimeSpent: {
                type: Number,
                default: 0,
            },
            currentStreak: {
                type: Number,
                default: 0,
            },
            longestStreak: {
                type: Number,
                default: 0,
            },
            lastSubmissionDate: Date,
            startedAt: Date,
            lastActivityAt: Date,
            completedAt: Date,
        },

        // Achievements & Celebrations
        achievements: [
            {
                type: {
                    type: String,
                    enum: ['first-task', 'milestone-completed', 'project-started', 'halfway', 'project-completed', 'week-streak', 'fast-learner'],
                },
                unlockedAt: Date,
                shared: Boolean,
            }
        ],

        // Source
        source: {
            type: String,
            enum: ['custom-form', 'suggested-project'],
            default: 'custom-form',
        },
        suggestedProjectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SuggestedProject',
        },

        // Status
        status: {
            type: String,
            enum: ['planning', 'active', 'paused', 'completed', 'abandoned'],
            default: 'planning',
        },
    },
    {
        timestamps: true,
    }
);

// Calculate progress when tasks are updated
customProjectSchema.methods.calculateProgress = function () {
    let totalTasks = 0;
    let completedTasks = 0;

    this.milestones.forEach(milestone => {
        milestone.tasks.forEach(task => {
            totalTasks++;
            if (task.status === 'completed') {
                completedTasks++;
            }
        });
    });

    this.progress.totalTasks = totalTasks;
    this.progress.totalTasksCompleted = completedTasks;
    this.progress.overallPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Update milestone statuses
    this.milestones.forEach(milestone => {
        const milestoneTasks = milestone.tasks;
        const completedMilestoneTasks = milestoneTasks.filter(t => t.status === 'completed').length;

        if (completedMilestoneTasks === 0) {
            milestone.status = 'pending';
        } else if (completedMilestoneTasks === milestoneTasks.length) {
            milestone.status = 'completed';
        } else {
            milestone.status = 'in-progress';
        }
    });

    return this.progress;
};

// Check for new achievements
customProjectSchema.methods.checkAchievements = function () {
    const newAchievements = [];

    // First task completed
    if (this.progress.totalTasksCompleted === 1 && !this.achievements.find(a => a.type === 'first-task')) {
        newAchievements.push({ type: 'first-task', unlockedAt: new Date(), shared: false });
    }

    // Project started (first milestone in progress)
    if (this.milestones.some(m => m.status === 'in-progress') && !this.achievements.find(a => a.type === 'project-started')) {
        newAchievements.push({ type: 'project-started', unlockedAt: new Date(), shared: false });
    }

    // Halfway point
    if (this.progress.overallPercentage >= 50 && !this.achievements.find(a => a.type === 'halfway')) {
        newAchievements.push({ type: 'halfway', unlockedAt: new Date(), shared: false });
    }

    // Milestone completed
    const completedMilestones = this.milestones.filter(m => m.status === 'completed').length;
    const existingMilestoneAchievements = this.achievements.filter(a => a.type === 'milestone-completed').length;
    if (completedMilestones > existingMilestoneAchievements) {
        newAchievements.push({ type: 'milestone-completed', unlockedAt: new Date(), shared: false });
    }

    // Week streak achievement (7 days)
    if (this.progress.currentStreak >= 7 && !this.achievements.find(a => a.type === 'week-streak')) {
        newAchievements.push({ type: 'week-streak', unlockedAt: new Date(), shared: false });
    }

    // Project completed
    if (this.progress.overallPercentage === 100 && !this.achievements.find(a => a.type === 'project-completed')) {
        newAchievements.push({ type: 'project-completed', unlockedAt: new Date(), shared: false });
        this.status = 'completed';
        this.progress.completedAt = new Date();
    }

    if (newAchievements.length > 0) {
        this.achievements.push(...newAchievements);
    }

    return newAchievements;
};

// Update learning streak based on task submissions
customProjectSchema.methods.updateStreak = function () {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!this.progress.lastSubmissionDate) {
        // First submission
        this.progress.currentStreak = 1;
        this.progress.longestStreak = 1;
        this.progress.lastSubmissionDate = today;
    } else {
        const lastDate = new Date(this.progress.lastSubmissionDate);
        lastDate.setHours(0, 0, 0, 0);

        const daysDiff = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));

        if (daysDiff === 0) {
            // Same day submission - no change to streak
            return;
        } else if (daysDiff === 1) {
            // Consecutive day - increment streak
            this.progress.currentStreak += 1;
            this.progress.longestStreak = Math.max(this.progress.longestStreak, this.progress.currentStreak);
            this.progress.lastSubmissionDate = today;
        } else {
            // Streak broken - reset to 1
            this.progress.currentStreak = 1;
            this.progress.lastSubmissionDate = today;
        }
    }
};

const CustomProject = mongoose.model('CustomProject', customProjectSchema);

export default CustomProject;
