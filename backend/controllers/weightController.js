const WeightLog = require('../models/WeightLog');
const Member = require('../models/Member');
const WeightGoal = require('../models/WeightGoal');

// POST add weight log
exports.addWeightLog = async (req, res) => {
    try {
        const { weight, unit, date, note } = req.body;
        const userId = req.user.id;

        if (weight <= 0) {
            return res.status(400).json({
                success: false,
                code: 'WEIGHT_NEGATIVE',
                message: 'Weight must be greater than zero.'
            });
        }

        // Convert to kg for internal storage
        const weightKg = unit === 'lbs' ? weight * 0.45359237 : weight;

        // Range validation
        if (weightKg < 20) {
            return res.status(400).json({
                success: false,
                code: 'WEIGHT_BELOW_MIN',
                message: 'Weight is below minimum limit (20kg).'
            });
        }
        if (weightKg > 500) {
            return res.status(400).json({
                success: false,
                code: 'WEIGHT_ABOVE_MAX',
                message: 'Weight is above maximum limit (500kg).'
            });
        }

        const log = await WeightLog.create({
            userId,
            weight,
            unit: unit || 'kg',
            weightKg,
            date: date || Date.now(),
            note
        });

        // Update Member profile with current weight
        const member = await Member.findOne({ userId });
        if (member) {
            member.currentWeight = {
                value: Math.round(weightKg * 100) / 100, // Round to 2 decimal places
                unit: 'kg'
            };
            await member.save();
        }

        // Check if active goal is reached
        let goalReached = false;
        const activeGoal = await WeightGoal.findOne({ userId, status: 'active' });

        if (activeGoal) {
            if (activeGoal.type === 'lose' && weightKg <= activeGoal.targetWeight) {
                goalReached = true;
            } else if (activeGoal.type === 'gain' && weightKg >= activeGoal.targetWeight) {
                goalReached = true;
            }

            if (goalReached) {
                activeGoal.status = 'completed';
                activeGoal.completedDate = Date.now();
                await activeGoal.save();
            }
        }

        res.status(201).json({
            success: true,
            data: log,
            goalReached,
            activeGoal: activeGoal && goalReached ? activeGoal : undefined
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// POST set weight goal
exports.setWeightGoal = async (req, res) => {
    try {
        const { targetWeight, type, targetDate } = req.body;
        const userId = req.user.id;

        // Deactivate previous active goals
        await WeightGoal.updateMany(
            { userId, status: 'active' },
            { status: 'abandoned' }
        );

        // Get current weight for startWeight
        const latestLog = await WeightLog.findOne({ userId }).sort({ date: -1 });
        const startWeight = latestLog ? latestLog.weightKg : 0;

        const goal = await WeightGoal.create({
            userId,
            startWeight,
            targetWeight,
            type,
            targetDate
        });

        // Update Member profile with target weight
        const member = await Member.findOne({ userId });
        if (member) {
            member.targetWeight = {
                value: targetWeight,
                unit: 'kg'
            };
            await member.save();
        }

        res.status(201).json({
            success: true,
            data: goal
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// GET active weight goal
exports.getActiveGoal = async (req, res) => {
    try {
        let userId = req.user.id;
        if ((req.user.role === 'admin' || req.user.role === 'trainer') && req.query.userId) {
            userId = req.query.userId;
        }
        const goal = await WeightGoal.findOne({ userId, status: 'active' });

        res.json({
            success: true,
            data: goal
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET weight history
exports.getWeightHistory = async (req, res) => {
    try {
        let userId = req.user.id;
        if ((req.user.role === 'admin' || req.user.role === 'trainer') && req.query.userId) {
            userId = req.query.userId;
        }
        const logs = await WeightLog.find({ userId }).sort({ date: -1 });

        res.json({
            success: true,
            data: logs
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// DELETE weight log
exports.deleteWeightLog = async (req, res) => {
    try {
        const log = await WeightLog.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!log) {
            return res.status(404).json({ success: false, message: 'Log not found or unauthorized' });
        }

        res.json({
            success: true,
            message: 'Weight log deleted'
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
