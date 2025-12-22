import express from 'express';
import { protect } from '../middleware/auth.js';
import { chatWithAI, getCreditInfo, getCreditHistory } from '../controllers/chatbotController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Chat with AI
router.post('/chat', chatWithAI);

// Get credit info
router.get('/credits', getCreditInfo);

// Get credit history
router.get('/credits/history', getCreditHistory);

export default router;
