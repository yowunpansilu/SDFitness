const WorkoutTemplate = require('../models/WorkoutTemplate');
const WorkoutLog = require('../models/WorkoutLog');
const mongoose = require('mongoose');
const { checkAchievements } = require('../services/achievementService');

// GET all workout templates
exports.getTemplates = async (req, res) => {
    try {
        const { difficulty, category } = req.query;
        let query = {};
        if (difficulty && difficulty !== 'all') query.difficulty = difficulty;
        if (category && category !== 'all') query.category = category;

        const templates = await WorkoutTemplate.find(query);
        res.json({
            success: true,
            data: templates
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// POST log a workout
exports.logWorkout = async (req, res) => {
    try {
        const { memberId, templateId, exercises, notes, difficulty, energyLevel, duration } = req.body;
        
        // Validation (basic)
        if (!memberId || !exercises) {
            return res.status(400).json({ success: false, message: 'Member ID and exercises are required' });
        }

        const workoutLog = await WorkoutLog.create({
            workoutId: 'W-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(-4).toUpperCase(),
            memberId,
            templateId: (templateId && templateId.length === 24) ? new mongoose.Types.ObjectId(templateId) : undefined,
            exercises,
            notes,
            difficulty,
            energyLevel,
            duration: duration || 0,
            status: 'completed'
        });

        res.status(201).json({
            success: true,
            data: workoutLog
        });

        // Background check for badges
        checkAchievements(memberId);
    } catch (err) {
        console.error('❌ LogWorkout Error:', err);
        res.status(400).json({ success: false, message: err.message });
    }
};

// GET member workout history
exports.getMemberHistory = async (req, res) => {
    try {
        const { id } = req.params;
        const { limit = 10 } = req.query;

        const history = await WorkoutLog.find({ memberId: id })
            .sort({ workoutDate: -1 })
            .limit(parseInt(limit))
            .populate('templateId', 'name category');

        // Calculate basic stats for the response
        const totalWorkouts = await WorkoutLog.countDocuments({ memberId: id });
        const recentWorkouts = await WorkoutLog.find({ 
            memberId: id,
            workoutDate: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        });

        const totalCalories = history.reduce((acc, curr) => acc + (curr.totalCaloriesBurned || 0), 0);
        const averageDuration = history.length > 0 ? history.reduce((acc, curr) => acc + (curr.duration || 0), 0) / history.length : 0;

        res.json({
            success: true,
            data: history,
            stats: {
                totalWorkouts,
                totalCaloriesBurned: Math.round(totalCalories),
                averageDuration: Math.round(averageDuration),
                thisWeek: recentWorkouts.length
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET specific workout stats
exports.getMemberStats = async (req, res) => {
    try {
        const { id } = req.params;
        const history = await WorkoutLog.find({ memberId: id });

        const stats = {
            totalWorkouts: history.length,
            totalCaloriesBurned: history.reduce((acc, curr) => acc + (curr.totalCaloriesBurned || 0), 0),
            averageDuration: history.length > 0 ? history.reduce((acc, curr) => acc + (curr.duration || 0), 0) / history.length : 0,
            weeklyCount: history.filter(w => w.workoutDate >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length
        };

        res.json({
            success: true,
            data: stats
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
