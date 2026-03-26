const AttendanceRecord = require('../models/AttendanceRecord');

// GET attendance records (optionally filter by userId)
exports.getRecords = async (req, res) => {
    try {
        const filter = {};
        if (req.query.userId) filter.user = req.query.userId;
        const records = await AttendanceRecord.find(filter)
            .populate('user', 'email firstName lastName')
            .sort({ checkInTime: -1 })
            .limit(100);
        res.json(records);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST check-in
exports.checkIn = async (req, res) => {
    try {
        const record = await AttendanceRecord.create({
            user: req.body.userId,
            facility: req.body.facility || 'Main Gym',
            checkInTime: new Date()
        });
        res.status(201).json(record);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// POST check-out
exports.checkOut = async (req, res) => {
    try {
        const record = await AttendanceRecord.findOneAndUpdate(
            { user: req.body.userId, checkOutTime: null },
            { checkOutTime: new Date() },
            { new: true, sort: { checkInTime: -1 } }
        );
        if (!record) return res.status(404).json({ error: 'No active check-in found' });
        res.json(record);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
