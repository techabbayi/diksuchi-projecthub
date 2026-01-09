import express from 'express';
import {
    getProjects,
    getProject,
    createProject,
    updateProject,
    deleteProject,
    uploadFile,
    getMyProjects,
    downloadProject,
} from '../controllers/projectController.js';
import { protect, isCreatorOrAdmin } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import { trackInteraction } from '../middleware/analytics.js';

const router = express.Router();

// Public routes
router.get('/', getProjects);
router.get('/:id', trackInteraction('view'), getProject);
router.get('/:id/download', trackInteraction('download'), downloadProject);

// Protected routes (Creator/Admin)
router.post('/', protect, isCreatorOrAdmin, createProject);
router.put('/:id', protect, isCreatorOrAdmin, updateProject);
router.delete('/:id', protect, isCreatorOrAdmin, deleteProject);
router.post('/upload', protect, isCreatorOrAdmin, upload.single('file'), uploadFile);
router.get('/creator/my-projects', protect, isCreatorOrAdmin, getMyProjects);

export default router;
