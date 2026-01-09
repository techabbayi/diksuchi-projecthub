import express from 'express';
import {
    getPendingProjects,
    approveProject,
    rejectProject,
    getAllUsers,
    updateUserRole,
    deleteUser,
    getPlatformStats,
    bulkUploadProjects,
    getBulkUploadTemplate,
    getAllCustomProjects,
    getCustomProjectStats,
    getCustomProjectById,
    getAllSuggestedProjects,
    createSuggestedProject,
    updateSuggestedProject,
    deleteSuggestedProject,
    getQuotaRequests,
    approveQuotaRequest,
    rejectQuotaRequest,
    getAllUserCredits,
    updateUserCredits,
    getUserCreditHistory,
    resetAllDailyCredits,
    getDefaultCreditSettings,
    updateDefaultCreditSettings,
    getAllProjects,
    updateProject,
    deleteProject,
    getAnalytics,
    getProjectAnalytics,
    getBrowseProjectsAnalytics,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes are admin only
router.use(protect);
router.use(authorize('admin'));

// Project management
router.get('/projects/pending', getPendingProjects);
router.get('/projects/all', getAllProjects);
router.put('/projects/:id/approve', approveProject);
router.put('/projects/:id/reject', rejectProject);
router.put('/projects/:id', updateProject);
router.delete('/projects/:id', deleteProject);

// Bulk upload
router.post('/projects/bulk-upload', bulkUploadProjects);
router.get('/projects/bulk-upload-template', getBulkUploadTemplate);

// User management
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

// Statistics
router.get('/stats', getPlatformStats);

// Analytics
router.get('/analytics', getAnalytics);
router.get('/analytics/projects', getProjectAnalytics);
router.get('/analytics/browse-projects', getBrowseProjectsAnalytics);

// Custom Project Builder management
router.get('/custom-projects', getAllCustomProjects);
router.get('/custom-projects/stats', getCustomProjectStats);
router.get('/custom-projects/:id', getCustomProjectById);

// Quota requests management
router.get('/quota-requests', getQuotaRequests);
router.put('/quota-requests/:quotaId/approve/:requestId', approveQuotaRequest);
router.put('/quota-requests/:quotaId/reject/:requestId', rejectQuotaRequest);

// Suggested Projects management
router.get('/suggested-projects', getAllSuggestedProjects);
router.post('/suggested-projects', createSuggestedProject);
router.put('/suggested-projects/:id', updateSuggestedProject);
router.delete('/suggested-projects/:id', deleteSuggestedProject);

// AI Credit Management
router.get('/ai-credits', getAllUserCredits);
router.put('/ai-credits/:userId', updateUserCredits);
router.get('/ai-credits/:userId/history', getUserCreditHistory);
router.post('/ai-credits/reset-all', resetAllDailyCredits);
router.get('/ai-credits/defaults', getDefaultCreditSettings);
router.put('/ai-credits/defaults', updateDefaultCreditSettings);

export default router;
