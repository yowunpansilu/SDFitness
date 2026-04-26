const WorkoutTemplate = require('../models/WorkoutTemplate');
const WorkoutLog = require('../models/WorkoutLog');
const mongoose = require('mongoose');
const { generateWorkoutPlan } = require('../services/workoutAIService');
const Member = require('../models/Member');

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

// AI WORKOUT GENERATION

exports.generateWorkout = async (req, res) => {
    try {
        const { memberId, targetDuration, difficulty, category, notes } = req.body;

        const member = await Member.findById(memberId);
        if (!member) {
            return res.status(404).json({ success: false, message: 'Member not found' });
        }

        const profile = {
            age: member.dateOfBirth ? Math.floor((Date.now() - new Date(member.dateOfBirth).getTime()) / 31557600000) : 25,
            weight_kg: member.currentWeight?.value || 70,
        };

        const aiResponse = await generateWorkoutPlan(profile, { targetDuration, difficulty, category, notes });

        // Save to DB as pending_review
        const newTemplate = await WorkoutTemplate.create({
            templateId: 'AIT-' + Date.now().toString(36),
            memberId,
            name: aiResponse.planName || `AI ${category} Workout`,
            description: aiResponse.description || '',
            difficulty: aiResponse.difficulty || difficulty || 'beginner',
            category: aiResponse.category || category || 'cardio',
            duration: aiResponse.duration || targetDuration || 30,
            estimatedCaloriesBurned: aiResponse.estimatedCaloriesBurned || 250,
            exercises: aiResponse.exercises.map(ex => ({
                exerciseId: 'E-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 7),
                name: ex.name,
                sets: ex.sets || 1,
                reps: ex.reps || 0,
                duration: ex.duration || 0,
                restPeriod: ex.restPeriod || 60,
                notes: ex.notes || '',
                muscleGroups: ex.muscleGroups || []
            })),
            status: 'pending_review',
            aiGenerated: true,
            aiPrompt: { targetDuration, difficulty, category, notes }
        });

        res.status(201).json({ success: true, data: newTemplate });
    } catch (err) {
        console.error('generateWorkout Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getAdminWorkouts = async (req, res) => {
    try {
        const { status } = req.query;
        let query = { aiGenerated: true };
        if (status) query.status = status;

        const templates = await WorkoutTemplate.find(query).populate('memberId', 'userId currentWeight height').sort({ createdAt: -1 });
        res.json({ success: true, data: templates });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.approveWorkout = async (req, res) => {
    try {
        const template = await WorkoutTemplate.findByIdAndUpdate(req.params.id, {
            status: 'approved',
            adminNotes: req.body.adminNotes || ''
        }, { new: true });
        res.json({ success: true, data: template });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.rejectWorkout = async (req, res) => {
    try {
        const template = await WorkoutTemplate.findByIdAndUpdate(req.params.id, {
            status: 'rejected',
            adminNotes: req.body.adminNotes || ''
        }, { new: true });
        res.json({ success: true, data: template });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getMemberApprovedWorkouts = async (req, res) => {
    try {
        const templates = await WorkoutTemplate.find({ memberId: req.params.memberId, status: 'approved' });
        res.json({ success: true, data: templates });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// UPDATE workout template (Rename)
exports.updateTemplate = async (req, res) => {
    try {
        const { name } = req.body;
        const template = await WorkoutTemplate.findByIdAndUpdate(req.params.id, {
            name
        }, { new: true });

        if (!template) {
            return res.status(404).json({ success: false, message: 'Template not found' });
        }

        res.json({ success: true, data: template });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// DELETE workout template
exports.deleteTemplate = async (req, res) => {
    try {
        const template = await WorkoutTemplate.findByIdAndDelete(req.params.id);
        if (!template) {
            return res.status(404).json({ success: false, message: 'Template not found' });
        }
        res.json({ success: true, message: 'Template deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET 30-day workout history aggregated per day (for progress chart)
exports.getMemberHistory30Days = async (req, res) => {
    try {
        const { id } = req.params;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        startDate.setHours(0, 0, 0, 0);

        const workouts = await WorkoutLog.find({
            memberId: id,
            workoutDate: { $gte: startDate },
            status: 'completed'
        }).sort({ workoutDate: 1 });

        // Build a per-day aggregated map for chart rendering
        const dayMap = {};
        for (let i = 30; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toISOString().split('T')[0];
            dayMap[key] = { date: key, calories: 0, duration: 0, count: 0 };
        }

        for (const w of workouts) {
            const key = new Date(w.workoutDate).toISOString().split('T')[0];
            if (dayMap[key]) {
                dayMap[key].calories += w.totalCaloriesBurned || 0;
                dayMap[key].duration += w.duration || 0;
                dayMap[key].count += 1;
            }
        }

        res.json({ success: true, data: Object.values(dayMap), workouts });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
