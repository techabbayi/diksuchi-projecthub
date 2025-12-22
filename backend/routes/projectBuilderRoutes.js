import express from 'express';
import {
    createCustomProject,
    getUserProjects,
    getProjectById,
    updateProject,
    deleteProject,
    submitTask,
    reopenTask,
    getProgress,
    shareAchievement,
    getSuggestedProjects,
    selectSuggestedProject,
    checkProjectQuota,
    requestAdditionalProject,
    getProjectAnalytics,
    getTaskHelp,
    getUserCustomProject,
} from '../controllers/projectBuilderController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Quota management
router.get('/quota/check', protect, checkProjectQuota);
router.post('/request-quota', protect, requestAdditionalProject);

// Get user's custom project
router.get('/my-project', protect, getUserCustomProject);

// Custom project routes
router.post('/create', protect, createCustomProject);
router.get('/user-projects', protect, getUserProjects);
router.get('/:id', protect, getProjectById);
router.put('/:id', protect, updateProject);
router.delete('/:id', protect, deleteProject);

// Analytics
router.get('/:id/analytics', protect, getProjectAnalytics);

// Task management
router.post('/:id/tasks/:taskId/submit', protect, submitTask);
router.put('/:id/tasks/:taskId/reopen', protect, reopenTask);
router.get('/:id/tasks/:taskId/help', protect, getTaskHelp);

// Progress tracking
router.get('/:id/progress', protect, getProgress);

// Achievements
router.post('/:id/share-achievement', protect, shareAchievement);

// Suggested projects
router.get('/suggestions/random', protect, getSuggestedProjects);
router.post('/suggestions/:suggestionId/select', protect, selectSuggestedProject);

export default router;
