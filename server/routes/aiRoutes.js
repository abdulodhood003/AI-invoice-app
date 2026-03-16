import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createDescription,
  createEmail,
  getBusinessInsights
} from '../controllers/aiController.js';

const router = express.Router();

// Both AI generation routes should be protected by JWT
router.use(protect);

// Route: POST /api/ai/generate-description
router.post('/generate-description', createDescription);

// Route: POST /api/ai/generate-email
router.post('/generate-email', createEmail);

// Route: POST /api/ai/business-insights
router.post('/business-insights', getBusinessInsights);

export default router;
