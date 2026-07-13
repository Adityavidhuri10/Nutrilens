import express from 'express';
import protect from '../middleware/auth.js';
import mealService from '../services/mealService.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = express.Router();

// GET /api/dashboard/today
router.get(
    '/today',
    protect,
    asyncHandler(async (req, res) => {
        const userId = req.user._id;
        // Use the current date string in local/UTC format
        const todayStr = new Date().toISOString().split('T')[0];

        const result = await mealService.getDailySummary(userId, todayStr);

        res.status(200).json({
            success: true,
            data: {
                totals: result.totals,
                meals: result.meals,
            },
        });
    })
);

export default router;
