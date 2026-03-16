import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getInsights } from '../controllers/insightsController.js';

const router = express.Router();

// Apply JWT protection. Only logged-in users can see their own data.
router.use(protect);

// Route: GET /api/insights
router.route('/').get(getInsights);

export default router;
