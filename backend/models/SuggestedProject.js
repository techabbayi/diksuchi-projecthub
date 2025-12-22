import mongoose from 'mongoose';

const suggestedProjectSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        techStack: [String],
        difficulty: {
            type: String,
            enum: ['beginner', 'intermediate', 'advanced'],
            required: true,
        },
        estimatedWeeks: {
            type: Number,
            required: true,
        },
        category: {
            type: String,
            enum: ['Web Development', 'Mobile App', 'AI/ML', 'Game Development', 'DevOps', 'Data Science', 'Blockchain', 'Other'],
            default: 'Web Development',
        },
        learningOutcomes: [String],
        trending: {
            type: Boolean,
            default: false,
        },
        popularityScore: {
            type: Number,
            default: 0,
        },
        targetAudience: [String],

        // Pre-generated template
        templateGuide: {
            readme: String,
            folderStructure: mongoose.Schema.Types.Mixed,
            tasks: mongoose.Schema.Types.Mixed,
        },

        isActive: {
            type: Boolean,
            default: true,
        },
        timesSelected: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

const SuggestedProject = mongoose.model('SuggestedProject', suggestedProjectSchema);

export default SuggestedProject;
