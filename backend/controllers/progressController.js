const DailyProgress = require('../models/DailyProgress');
const BodyMeasurement = require('../models/BodyMeasurement');

// POST submit daily progress
exports.submitDailyProgress = async (req, res) => {
    try {
        const { workoutCompleted, dietFollowed, notes, date } = req.body;
        const userId = req.user.id; // From protect middleware

        // Use provided date or today (start of day)
        const targetDate = date ? new Date(date) : new Date();
        targetDate.setHours(0, 0, 0, 0);

        // Check for duplicate
        const existing = await DailyProgress.findOne({ userId, date: targetDate });
        if (existing) {
            return res.status(409).json({
                success: false,
                code: 'DUPLICATE_ENTRY',
                message: 'You have already logged your progress for this date.'
            });
        }

        const progress = await DailyProgress.create({
            userId,
            date: targetDate,
            workoutCompleted,
            dietFollowed,
            notes
        });

        res.status(201).json({
            success: true,
            data: progress
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// GET daily progress for today
exports.getDailyProgress = async (req, res) => {
    try {
        const userId = req.user.id;
        const { date } = req.params;
        const targetDate = date ? new Date(date) : new Date();
        targetDate.setHours(0, 0, 0, 0);

        const progress = await DailyProgress.findOne({ userId, date: targetDate });
        res.json({
            success: true,
            data: progress || { userId, date: targetDate, workoutCompleted: false, dietFollowed: false }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// POST toggle daily progress (for specific task)
exports.toggleDailyProgress = async (req, res) => {
    try {
        const { date, type, value } = req.body;
        const userId = req.user.id;

        const targetDate = date ? new Date(date) : new Date();
        targetDate.setHours(0, 0, 0, 0);

        const updateField = type === 'workout' ? 'workoutCompleted' : 'dietFollowed';

        const progress = await DailyProgress.findOneAndUpdate(
            { userId, date: targetDate },
            { $set: { [updateField]: value } },
            { upsert: true, new: true }
        );

        res.json({
            success: true,
            data: progress
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// GET weekly progress (last 7 days)
exports.getWeeklyProgress = async (req, res) => {
    try {
        let userId = req.user.id;

        // If admin and userId provided in query, look up that user
        if ((req.user.role === 'admin' || req.user.role === 'trainer') && req.query.userId) {
            userId = req.query.userId;
        }

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const progress = await DailyProgress.find({
            userId,
            date: { $gte: sevenDaysAgo }
        }).sort({ date: 1 });

        res.json({
            success: true,
            data: progress
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// POST body measurement
exports.addBodyMeasurement = async (req, res) => {
    try {
        const { chest, waist, hips, notes, date } = req.body;
        const userId = req.user.id;

        if (chest < 0 || waist < 0 || hips < 0) {
            return res.status(400).json({
                success: false,
                code: 'INVALID_MEASUREMENT',
                message: 'Measurement values must be positive.'
            });
        }

        const measurement = await BodyMeasurement.create({
            userId,
            date: date || Date.now(),
            chest,
            waist,
            hips,
            notes
        });

        res.status(201).json({
            success: true,
            data: measurement
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// GET body measurements history
exports.getBodyMeasurements = async (req, res) => {
    try {
        const userId = req.user.id;
        const measurements = await BodyMeasurement.find({ userId }).sort({ date: -1 });

        res.json({
            success: true,
            data: measurements
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
