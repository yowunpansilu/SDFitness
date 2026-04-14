const NutritionLog = require('../models/NutritionLog');
const mongoose = require('mongoose');
const { checkAchievements } = require('../services/achievementService');

// @desc    Log a meal entry
// @route   POST /api/nutrition
exports.logMeal = async (req, res, next) => {
    try {
        const { memberId, mealType, items } = req.body;

        if (!memberId || !mealType || !items || items.length === 0) {
            res.status(400);
            throw new Error('All fields are required');
        }

        const totalCalories = items.reduce((acc, item) => acc + (item.calories || 0), 0);
        const totalProtein = items.reduce((acc, item) => acc + (item.protein || 0), 0);
        const totalCarbs = items.reduce((acc, item) => acc + (item.carbs || 0), 0);
        const totalFats = items.reduce((acc, item) => acc + (item.fats || 0), 0);

        const nutritionLog = await NutritionLog.create({
            memberId,
            mealType,
            items,
            totalCalories,
            totalProtein,
            totalCarbs,
            totalFats
        });

        res.status(201).json({
            success: true,
            data: nutritionLog
        });

        // Background check
        checkAchievements(memberId);
    } catch (error) {
        next(error);
    }
};

// @desc    Get daily nutrition summary
// @route   GET /api/nutrition/member/:memberId/daily
exports.getDailySummary = async (req, res, next) => {
    try {
        const { memberId } = req.params;
        const date = req.query.date ? new Date(req.query.date) : new Date();
        
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const logs = await NutritionLog.find({
            memberId,
            date: { $gte: startOfDay, $lte: endOfDay }
        });

        const totals = logs.reduce((acc, log) => {
            acc.calories += log.totalCalories;
            acc.protein += log.totalProtein;
            acc.carbs += log.totalCarbs;
            acc.fats += log.totalFats;
            return acc;
        }, { calories: 0, protein: 0, carbs: 0, fats: 0 });

        res.json({
            success: true,
            date: startOfDay,
            totals,
            meals: logs
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get nutrition history
// @route   GET /api/nutrition/member/:memberId/history
exports.getHistory = async (req, res, next) => {
    try {
        const { memberId } = req.params;
        const { days = 7 } = req.query;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));

        const history = await NutritionLog.aggregate([
            { $match: { memberId: new mongoose.Types.ObjectId(memberId), date: { $gte: startDate } } },
            { $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                totalCalories: { $sum: "$totalCalories" },
                totalProtein: { $sum: "$totalProtein" },
                totalCarbs: { $sum: "$totalCarbs" },
                totalFats: { $sum: "$totalFats" }
            }},
            { $sort: { "_id": 1 } }
        ]);

        res.json({
            success: true,
            data: history
        });
    } catch (error) {
        next(error);
    }
};
