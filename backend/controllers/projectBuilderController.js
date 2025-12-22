import CustomProject from '../models/CustomProject.js';
import SuggestedProject from '../models/SuggestedProject.js';
import ProjectQuota from '../models/ProjectQuota.js';
import groqService from '../services/groqService.js';

// Link validation patterns
const LINK_VALIDATORS = {
    'github-repo': /^https?:\/\/(www\.)?github\.com\/[\w.-]+\/[\w.-]+/,
    'github-commit': /^https?:\/\/(www\.)?github\.com\/[\w.-]+\/[\w.-]+\/commit\//,
    'github-pr': /^https?:\/\/(www\.)?github\.com\/[\w.-]+\/[\w.-]+\/pull\/\d+/,
    'deployed-url': /^https?:\/\/.+/,
    'design-link': /^https?:\/\/(www\.)?(figma\.com|excalidraw\.com)/,
    'doc-link': /^https?:\/\/(www\.)?(docs\.google\.com|notion\.so)/,
    'screenshot-link': /^https?:\/\/(www\.)?(imgur\.com|i\.imgur\.com|postimg\.cc|i\.postimg\.cc)/,
    'any': /^https?:\/\/.+/,
};

// Validate link format
const validateLink = (url, linkType) => {
    if (!url) return false;

    // Check if it's a valid URL format
    try {
        const urlObj = new URL(url);
        // Must be http or https protocol
        if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
            return false;
        }

        // Additional validation for GitHub-specific link types
        if (linkType === 'github-repo' || linkType === 'github-commit' || linkType === 'github-pr') {
            return url.toLowerCase().includes('github');
        }

        return true;
    } catch (e) {
        return false;
    }
};

// Create new custom project
export const createCustomProject = async (req, res) => {
    try {
        const userId = req.user._id;
        const projectData = req.body;

        // Check project quota - use findOneAndUpdate with upsert to avoid duplicate key errors
        let quota = await ProjectQuota.findOneAndUpdate(
            { userId },
            { $setOnInsert: { userId, allowedProjects: 1, usedProjects: 0 } },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        // Check if user can create project
        if (!quota.canCreateProject()) {
            return res.status(403).json({
                success: false,
                message: 'Project limit reached',
                quotaInfo: {
                    allowed: quota.allowedProjects,
                    used: quota.usedProjects,
                    canRequestMore: true,
                    additionalProjectCost: 299
                }
            });
        }

        console.log('🚀 Generating custom project with AI...');

        // Generate AI guide and tasks using Groq service
        const aiGuideResult = await groqService.generateProjectGuide(projectData);
        const taskRoadmapResult = await groqService.generateTaskRoadmap(projectData);

        // Extract data from results
        const aiGuide = {
            readme: aiGuideResult.readme,
            folderStructure: aiGuideResult.folderStructure,
            fileDocumentation: aiGuideResult.fileDocumentation,
            setupInstructions: aiGuideResult.setupInstructions,
            configurationGuide: aiGuideResult.configurationGuide
        };

        const milestones = taskRoadmapResult.milestones;

        // Calculate total tasks
        const totalTasks = milestones.reduce((sum, m) => sum + m.tasks.length, 0);

        const customProject = new CustomProject({
            userId,
            ...projectData,
            aiGeneratedGuide: aiGuide,
            milestones,
            progress: {
                overallPercentage: 0,
                currentMilestoneId: 1,
                currentTaskId: 1,
                totalTasks,
                totalTasksCompleted: 0,
                startedAt: new Date(),
                lastActivityAt: new Date(),
            },
            status: 'active',
        });

        await customProject.save();

        // Increment quota usage
        await quota.incrementUsed();

        console.log(`✅ Project created successfully!`);
        console.log(`📊 AI Stats - Guide: ${aiGuideResult.metadata.model} (${aiGuideResult.metadata.duration}s, ${aiGuideResult.metadata.tokensUsed} tokens)`);
        console.log(`📊 AI Stats - Roadmap: ${taskRoadmapResult.metadata.model} (${taskRoadmapResult.metadata.duration}s, ${taskRoadmapResult.metadata.tokensUsed} tokens)`);

        res.status(201).json({
            success: true,
            message: 'Custom project created successfully!',
            project: customProject,
            aiMetadata: {
                guide: aiGuideResult.metadata,
                roadmap: taskRoadmapResult.metadata
            }
        });
    } catch (error) {
        console.error('Create custom project error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create custom project',
            error: error.message,
        });
    }
};

// Get all user's custom projects
export const getUserProjects = async (req, res) => {
    try {
        const userId = req.user._id;
        const projects = await CustomProject.find({ userId }).sort({ createdAt: -1 });

        res.json({
            success: true,
            projects,
        });
    } catch (error) {
        console.error('Get user projects error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch projects',
            error: error.message,
        });
    }
};

// Get user's single custom project (quota enforced)
export const getUserCustomProject = async (req, res) => {
    try {
        const userId = req.user._id;

        // Find the user's custom project
        const project = await CustomProject.findOne({ userId }).sort({ createdAt: -1 });

        // Get quota information
        let quota = await ProjectQuota.findOneAndUpdate(
            { userId },
            { $setOnInsert: { userId, allowedProjects: 1, usedProjects: 0 } },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        res.json({
            success: true,
            project: project || null,
            quotaInfo: {
                allowed: quota.allowedProjects,
                used: quota.usedProjects,
                canCreateMore: quota.canCreateProject(),
                pendingRequests: quota.pendingRequests.filter(r => r.status === 'pending').length
            }
        });
    } catch (error) {
        console.error('Get user custom project error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch custom project',
            error: error.message,
        });
    }
};

// Get specific project details
export const getProjectById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const project = await CustomProject.findOne({ _id: id, userId });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found',
            });
        }

        res.json({
            success: true,
            project,
        });
    } catch (error) {
        console.error('Get project error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch project',
            error: error.message,
        });
    }
};

// Update project
export const updateProject = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const updates = req.body;

        const project = await CustomProject.findOneAndUpdate(
            { _id: id, userId },
            { ...updates, 'progress.lastActivityAt': new Date() },
            { new: true }
        );

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found',
            });
        }

        res.json({
            success: true,
            message: 'Project updated successfully',
            project,
        });
    } catch (error) {
        console.error('Update project error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update project',
            error: error.message,
        });
    }
};

// Delete project
export const deleteProject = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const project = await CustomProject.findOneAndDelete({ _id: id, userId });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found',
            });
        }

        res.json({
            success: true,
            message: 'Project deleted successfully',
        });
    } catch (error) {
        console.error('Delete project error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete project',
            error: error.message,
        });
    }
};

// Submit task with artifact link
export const submitTask = async (req, res) => {
    try {
        const { id, taskId } = req.params;
        const userId = req.user._id;
        const { artifactUrl, secondaryUrl, notes } = req.body;

        const project = await CustomProject.findOne({ _id: id, userId });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found',
            });
        }

        // Find the task
        let task = null;
        let milestone = null;
        for (const m of project.milestones) {
            const t = m.tasks.find(t => t.taskId === parseInt(taskId));
            if (t) {
                task = t;
                milestone = m;
                break;
            }
        }

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found',
            });
        }

        // Validate task is active
        if (task.status !== 'active' && task.status !== 'reopened') {
            return res.status(400).json({
                success: false,
                message: 'Task is not active',
            });
        }

        // Validate artifact URL
        if (task.artifactConfig.required && !artifactUrl) {
            return res.status(400).json({
                success: false,
                message: 'Artifact URL is required',
            });
        }

        if (artifactUrl && !validateLink(artifactUrl, task.artifactConfig.linkType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid artifact URL format',
            });
        }

        if (secondaryUrl && task.secondaryArtifact && !validateLink(secondaryUrl, task.secondaryArtifact.linkType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid secondary URL format',
            });
        }

        // Update task submission
        task.submission = {
            artifactUrl,
            secondaryUrl: secondaryUrl || null,
            notes: notes || '',
            submittedAt: new Date(),
            verificationStatus: 'verified',
            verificationCheckedAt: new Date(),
            isLinkAccessible: true,
        };
        task.status = 'completed';

        // Unlock next task
        const nextTask = milestone.tasks.find(t => t.order === task.order + 1);
        if (nextTask && nextTask.status === 'locked') {
            nextTask.status = 'active';
        } else {
            // Check next milestone
            const nextMilestone = project.milestones.find(m => m.milestoneId === milestone.milestoneId + 1);
            if (nextMilestone && nextMilestone.tasks.length > 0) {
                if (nextMilestone.tasks[0].status === 'locked') {
                    nextMilestone.tasks[0].status = 'active';
                }
            }
        }

        // Calculate progress
        project.calculateProgress();

        // Update learning streak
        project.updateStreak();

        // Check for achievements
        const newAchievements = project.checkAchievements();
        if (newAchievements.length > 0) {
            project.achievements.push(...newAchievements);
        }

        // Update activity
        project.progress.lastActivityAt = new Date();

        await project.save();

        res.json({
            success: true,
            message: 'Task submitted successfully! 🎉',
            task,
            nextTask: nextTask || (nextMilestone ? nextMilestone.tasks[0] : null),
            progress: project.progress,
            achievements: newAchievements,
        });
    } catch (error) {
        console.error('Submit task error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit task',
            error: error.message,
        });
    }
};

// Reopen completed task
export const reopenTask = async (req, res) => {
    try {
        const { id, taskId } = req.params;
        const userId = req.user._id;

        const project = await CustomProject.findOne({ _id: id, userId });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found',
            });
        }

        // Find the task
        let task = null;
        for (const m of project.milestones) {
            const t = m.tasks.find(t => t.taskId === parseInt(taskId));
            if (t) {
                task = t;
                break;
            }
        }

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found',
            });
        }

        if (task.status !== 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Only completed tasks can be reopened',
            });
        }

        task.status = 'reopened';
        project.progress.lastActivityAt = new Date();

        await project.save();

        res.json({
            success: true,
            message: 'Task reopened successfully',
            task,
        });
    } catch (error) {
        console.error('Reopen task error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reopen task',
            error: error.message,
        });
    }
};

// Get progress statistics
export const getProgress = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const project = await CustomProject.findOne({ _id: id, userId });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found',
            });
        }

        res.json({
            success: true,
            progress: project.progress,
            achievements: project.achievements,
        });
    } catch (error) {
        console.error('Get progress error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch progress',
            error: error.message,
        });
    }
};

// Mark achievement as shared
export const shareAchievement = async (req, res) => {
    try {
        const { id } = req.params;
        const { achievementType } = req.body;
        const userId = req.user._id;

        const project = await CustomProject.findOne({ _id: id, userId });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found',
            });
        }

        const achievement = project.achievements.find(a => a.type === achievementType);
        if (achievement) {
            achievement.shared = true;
            await project.save();
        }

        res.json({
            success: true,
            message: 'Achievement shared!',
        });
    } catch (error) {
        console.error('Share achievement error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to share achievement',
            error: error.message,
        });
    }
};

// Get suggested projects
export const getSuggestedProjects = async (req, res) => {
    try {
        // Get 3 random active suggested projects
        const suggestions = await SuggestedProject.aggregate([
            { $match: { isActive: true } },
            { $sample: { size: 3 } }
        ]);

        res.json({
            success: true,
            suggestions,
        });
    } catch (error) {
        console.error('Get suggested projects error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch suggested projects',
            error: error.message,
        });
    }
};

// Select a suggested project
export const selectSuggestedProject = async (req, res) => {
    try {
        const { suggestionId } = req.params;
        const userId = req.user._id;

        const suggestion = await SuggestedProject.findById(suggestionId);

        if (!suggestion) {
            return res.status(404).json({
                success: false,
                message: 'Suggested project not found',
            });
        }

        // Update times selected
        suggestion.timesSelected += 1;
        suggestion.popularityScore += 1;
        await suggestion.save();

        // Create custom project from suggestion
        const milestones = generateTaskRoadmap({
            projectName: suggestion.title,
            description: suggestion.description,
            techStack: { custom: suggestion.techStack },
        });

        const totalTasks = milestones.reduce((sum, m) => sum + m.tasks.length, 0);

        const customProject = new CustomProject({
            userId,
            projectName: suggestion.title,
            description: suggestion.description,
            motivation: 'learning',
            techStack: {
                custom: suggestion.techStack,
            },
            complexity: suggestion.difficulty,
            skillLevel: suggestion.difficulty,
            aiGeneratedGuide: suggestion.templateGuide || await generateAIGuide({
                projectName: suggestion.title,
                description: suggestion.description,
                techStack: { custom: suggestion.techStack },
            }),
            milestones,
            source: 'suggested-project',
            suggestedProjectId: suggestion._id,
            progress: {
                overallPercentage: 0,
                currentMilestoneId: 1,
                currentTaskId: 1,
                totalTasks,
                totalTasksCompleted: 0,
                startedAt: new Date(),
                lastActivityAt: new Date(),
            },
            status: 'active',
        });

        await customProject.save();

        res.json({
            success: true,
            message: 'Project created from suggestion!',
            project: customProject,
        });
    } catch (error) {
        console.error('Select suggested project error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to select suggested project',
            error: error.message,
        });
    }
};

// Check user's project quota
export const checkProjectQuota = async (req, res) => {
    try {
        const userId = req.user._id;

        // Use findOneAndUpdate with upsert to avoid duplicate key errors
        let quota = await ProjectQuota.findOneAndUpdate(
            { userId },
            { $setOnInsert: { userId, allowedProjects: 1, usedProjects: 0 } },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        const activeProjects = await CustomProject.countDocuments({ userId, status: { $ne: 'archived' } });

        res.json({
            success: true,
            quota: {
                allowed: quota.allowedProjects,
                used: activeProjects,
                remaining: quota.allowedProjects - activeProjects,
                canCreate: quota.canCreateProject(),
                pendingRequests: quota.pendingRequests.filter(r => r.status === 'pending').length,
                totalApproved: quota.totalApproved
            }
        });
    } catch (error) {
        console.error('Check quota error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check quota',
            error: error.message,
        });
    }
};

// Request additional project slot
export const requestAdditionalProject = async (req, res) => {
    try {
        const userId = req.user._id;
        const { reason } = req.body;

        // Use findOneAndUpdate with upsert to avoid duplicate key errors
        let quota = await ProjectQuota.findOneAndUpdate(
            { userId },
            { $setOnInsert: { userId, allowedProjects: 1, usedProjects: 0 } },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        await quota.requestAdditionalProject(reason || 'Request for additional custom project');

        res.json({
            success: true,
            message: 'Request submitted successfully. This is a paid feature (₹299). Admin will review your request.',
            paymentInfo: {
                amount: 299,
                currency: 'INR',
                status: 'pending_admin_approval',
                note: 'Payment will be collected after admin approval'
            }
        });
    } catch (error) {
        console.error('Request additional project error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit request',
            error: error.message,
        });
    }
};

// Get project analytics
export const getProjectAnalytics = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const project = await CustomProject.findOne({ _id: id, userId });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found',
            });
        }

        // Calculate analytics
        const totalMilestones = project.milestones.length;
        const completedMilestones = project.milestones.filter(m =>
            m.tasks.every(t => t.status === 'completed')
        ).length;

        const totalTasks = project.progress.totalTasks;
        const completedTasks = project.milestones.reduce((sum, m) =>
            sum + m.tasks.filter(t => t.status === 'completed').length, 0
        );

        const activeTasks = project.milestones.reduce((sum, m) =>
            sum + m.tasks.filter(t => t.status === 'active').length, 0
        );

        const lockedTasks = project.milestones.reduce((sum, m) =>
            sum + m.tasks.filter(t => t.status === 'locked').length, 0
        );

        // Time analytics
        const startDate = project.progress.startedAt;
        const lastActivity = project.progress.lastActivityAt;
        const daysActive = Math.floor((lastActivity - startDate) / (1000 * 60 * 60 * 24)) + 1;

        // Achievements
        const achievements = project.achievements || [];
        const unlockedAchievements = achievements.filter(a => a.unlockedAt).length;

        const analytics = {
            overview: {
                projectName: project.projectName,
                status: project.status,
                complexity: project.complexity,
                techStack: project.techStack,
            },
            progress: {
                overall: project.progress.overallPercentage,
                milestones: {
                    total: totalMilestones,
                    completed: completedMilestones,
                    percentage: totalMilestones ? Math.round((completedMilestones / totalMilestones) * 100) : 0
                },
                tasks: {
                    total: totalTasks,
                    completed: completedTasks,
                    active: activeTasks,
                    locked: lockedTasks,
                    percentage: totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0
                }
            },
            timeline: {
                startedAt: startDate,
                lastActivity: lastActivity,
                daysActive: daysActive,
                estimatedCompletion: project.deadline || null
            },
            achievements: {
                total: achievements.length,
                unlocked: unlockedAchievements,
                recent: achievements
                    .filter(a => a.unlockedAt)
                    .sort((a, b) => new Date(b.unlockedAt) - new Date(a.unlockedAt))
                    .slice(0, 3)
            },
            learning: {
                skillLevel: project.skillLevel,
                completedLearningPoints: completedTasks * 3, // Approximate
                totalFilesDocs: project.aiGeneratedGuide?.fileDocumentation?.length || 0
            }
        };

        res.json({
            success: true,
            analytics
        });
    } catch (error) {
        console.error('Get analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch analytics',
            error: error.message,
        });
    }
};

// Get task help (commands and step-by-step guide)
export const getTaskHelp = async (req, res) => {
    try {
        const { id, taskId } = req.params;
        const userId = req.user._id;

        const project = await CustomProject.findOne({ _id: id, userId });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found',
            });
        }

        // Find the task
        let task = null;
        for (const milestone of project.milestones) {
            const foundTask = milestone.tasks.find(t => t.taskId === parseInt(taskId));
            if (foundTask) {
                task = foundTask;
                break;
            }
        }

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found',
            });
        }

        // Check if help already generated and has actual content (not empty arrays)
        if (task.helpContent &&
            task.helpContent.commands &&
            task.helpContent.steps &&
            task.helpContent.commands.length > 0 &&
            task.helpContent.steps.length > 0) {
            return res.json({
                success: true,
                help: task.helpContent
            });
        }

        // Generate help using AI
        console.log('🤖 Generating task help with AI for:', task.title);

        const helpPrompt = [
            {
                role: 'system',
                content: 'You are a friendly, patient coding mentor who explains things clearly for beginners. Always respond with valid JSON only. Use simple language, avoid jargon, and break down complex concepts into easy-to-understand steps.'
            },
            {
                role: 'user',
                content: `Generate beginner-friendly help for this task:
        
Task Title: ${task.title}
Task Description: ${task.description}
Task Type: ${task.type}
Project Context: ${project.projectName} - ${project.description}
Tech Stack: ${JSON.stringify(project.techStack)}
Skill Level: ${project.skillLevel}

Create BEGINNER-FRIENDLY help content:

1. Commands Section: 
   - Provide 3-5 essential commands/code snippets
   - Each command must have a clear, simple description explaining WHAT it does and WHY
   - Use actual, working code examples
   - Format: {"description": "Simple explanation", "command": "actual command"}

2. Step-by-Step Guide:
   - Break down the task into 5-8 clear, actionable steps
   - Each step should be simple and focused on ONE thing
   - Use friendly, encouraging language (e.g., "Let's start by...", "Now we'll...", "Great! Next...")
   - Include helpful explanations for WHY each step is important
   - Provide code snippets for technical steps (keep them short and clear)
   - Add tips or common pitfalls to avoid
   - Format: {"title": "Brief step name", "description": "Friendly detailed explanation with context", "code": "optional simple code example"}

IMPORTANT GUIDELINES:
- Write like you're explaining to a friend who's learning to code
- Avoid technical jargon, or explain it when necessary
- Be encouraging and positive in tone
- Make steps sequential and logical
- Include "why" explanations, not just "how"
- Keep code examples simple and well-commented

Return ONLY valid JSON with this EXACT structure:
{
  "commands": [
    {"description": "Clear description of what this does", "command": "npm install express"},
    {"description": "Why and what this command does", "command": "npm start"}
  ],
  "steps": [
    {"title": "Set up your project", "description": "Let's start by creating a new folder for your project. This keeps everything organized and makes it easier to manage your files. Open your terminal and navigate to where you want to create your project.", "code": "mkdir my-project\\ncd my-project"},
    {"title": "Initialize npm", "description": "Now we'll set up npm (Node Package Manager) which helps us manage our project's dependencies. Think of it like a shopping list for code libraries. Run this command and press Enter through the prompts (we can change these later).", "code": "npm init -y"}
  ]
}`
            }
        ];

        try {
            const helpResponse = await groqService.chat(helpPrompt);

            // Parse the AI response
            let helpContent;
            try {
                // Extract content from response object
                const responseText = helpResponse.content || helpResponse;

                // Try to extract JSON from the response
                const jsonMatch = responseText.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    helpContent = JSON.parse(jsonMatch[0]);
                } else {
                    // Fallback structure
                    helpContent = {
                        commands: [],
                        steps: [{ title: 'Guide', description: responseText }]
                    };
                }
            } catch (parseError) {
                console.error('Failed to parse help JSON:', parseError);
                helpContent = {
                    commands: [],
                    steps: [{ title: 'Guide', description: 'Unable to generate help content. Please try again.' }]
                };
            }

            // Store help content in task for future use
            task.helpContent = helpContent;
            await project.save();

            res.json({
                success: true,
                help: helpContent
            });

        } catch (aiError) {
            console.error('AI generation error:', aiError);

            // Fallback generic help
            const fallbackHelp = {
                commands: [
                    { description: 'Check task resources', command: 'See the resources section below for helpful links' }
                ],
                steps: [
                    { title: 'Read Task Description', description: 'Carefully read the task description and requirements' },
                    { title: 'Review Learning Points', description: 'Check what you will learn from this task' },
                    { title: 'Use Resources', description: 'Utilize the provided resources for guidance' },
                    { title: 'Complete and Submit', description: 'Once done, submit your work with the required link' }
                ]
            };

            res.json({
                success: true,
                help: fallbackHelp
            });
        }

    } catch (error) {
        console.error('Get task help error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch task help',
            error: error.message,
        });
    }
};
