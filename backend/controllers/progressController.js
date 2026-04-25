const WeightLog = require('../models/WeightLog');
const Member = require('../models/Member');

// POST /api/progress/weight
exports.addWeightLog = async (req, res) => {
    try {
        const { weightValue, weightUnit, notes } = req.body;
        
        if (!req.user || !req.user.id) {
            return res.status(401).json({ success: false, error: 'Not authorized' });
        }

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        // Find if a log already exists for today to prevent duplicates
        let log = await WeightLog.findOne({
            userId: req.user.id,
            date: { $gte: todayStart, $lte: todayEnd }
        });

        if (log) {
            log.weight = { value: weightValue, unit: weightUnit || 'kg' };
            log.notes = notes;
            await log.save();
        } else {
            log = await WeightLog.create({
                userId: req.user.id,
                weight: { value: weightValue, unit: weightUnit || 'kg' },
                notes
            });
        }

        const member = await Member.findOne({ userId: req.user.id });
        if (member) {
            member.currentWeight = { value: weightValue, unit: weightUnit || 'kg' };
            await member.save(); // triggers BMI/BMR/TDEE update
        }

        res.status(200).json({ success: true, data: log });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// GET /api/progress/weight
exports.getWeightLogs = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ success: false, error: 'Not authorized' });
        }

        const logs = await WeightLog.find({ userId: req.user.id }).sort({ date: -1 });
        res.status(200).json({ success: true, count: logs.length, data: logs });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// PUT /api/progress/weight/:id
exports.updateWeightLog = async (req, res) => {
    try {
        const { weightValue, weightUnit, notes } = req.body;
        let log = await WeightLog.findById(req.params.id);

        if (!log || log.userId.toString() !== req.user.id) {
            return res.status(404).json({ success: false, error: 'Log not found or unauthorized' });
        }

        log.weight = { value: weightValue, unit: weightUnit || 'kg' };
        if (notes) log.notes = notes;
        
        await log.save();

        res.status(200).json({ success: true, data: log });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// DELETE /api/progress/weight/:id
exports.deleteWeightLog = async (req, res) => {
    try {
        const log = await WeightLog.findById(req.params.id);
        
        if (!log || log.userId.toString() !== req.user.id) {
            return res.status(404).json({ success: false, error: 'Log not found or unauthorized' });
        }

        await WeightLog.findByIdAndDelete(req.params.id);

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
