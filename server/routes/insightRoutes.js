import express from 'express';
import protect from '../middleware/auth.js';
import mealService from '../services/mealService.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = express.Router();

// GET /api/insights
router.get(
  '/',
  protect,
  asyncHandler(async (req, res) => {
    const user = req.user;
    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Fetch today's meals summary
    const summary = await mealService.getDailySummary(user._id, todayStr);
    const totals = summary.totals;
    const goals = user.goals || {
      calories: 2000,
      protein: 130,
      carbohydrate: 220,
      fat: 70,
      fiber: 30,
    };

    // 2. Calculate percentages
    const pctCalories = goals.calories > 0 ? Math.round((totals.calories / goals.calories) * 100) : 0;
    const pctProtein = goals.protein > 0 ? Math.round((totals.protein / goals.protein) * 100) : 0;
    const pctCarbs = goals.carbohydrate > 0 ? Math.round((totals.carbs / goals.carbohydrate) * 100) : 0;
    const pctFats = goals.fat > 0 ? Math.round((totals.fats / goals.fat) * 100) : 0;
    const pctFiber = goals.fiber > 0 ? Math.round((totals.fiber / goals.fiber) * 100) : 0;

    // 3. Compile warnings and suggestions deterministically
    const warnings = [];
    const suggestions = [];

    // Calorie rules
    if (totals.calories > goals.calories) {
      warnings.push(`You exceeded your daily calorie goal by ${totals.calories - goals.calories} kcal.`);
    } else if (totals.calories < goals.calories * 0.5) {
      suggestions.push("Your energy intake is quite low today. Ensure you are eating enough to sustain your basal metabolism.");
    }

    // Protein rules
    if (pctProtein < 80) {
      suggestions.push("Increase protein intake today. Lean meats, eggs, fish, dairy, or plant-based proteins will help reach your target.");
    }

    // Fat rules
    if (totals.fats > goals.fat) {
      warnings.push("Your fat intake has exceeded your custom target. Monitor high-fat oils, dressings, and fried ingredients.");
    }

    // Fiber rules
    if (pctFiber < 70) {
      suggestions.push("Consider adding fruits, vegetables, chia seeds, or whole grains to boost your dietary fiber.");
    }

    // General praise if goals are close
    const score = Math.round((Math.min(100, pctCalories) + Math.min(100, pctProtein) + Math.min(100, pctCarbs) + Math.min(100, pctFats) + Math.min(100, pctFiber)) / 5);

    res.status(200).json({
      success: true,
      data: {
        score,
        achievements: {
          calories: pctCalories,
          protein: pctProtein,
          carbs: pctCarbs,
          fats: pctFats,
          fiber: pctFiber,
        },
        warnings,
        suggestions: suggestions.length > 0 ? suggestions : ["Great job keeping your macros in check today!"],
      },
    });
  })
);

export default router;
