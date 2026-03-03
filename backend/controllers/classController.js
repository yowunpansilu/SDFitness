const Class = require('../models/Class');

// GET all classes
exports.getAllClasses = async (req, res) => {
    try {
        const classes = await Class.find()
            .populate({
                path: 'trainer',
                populate: { path: 'user', select: 'firstName lastName email' }
            })
            .sort({ createdAt: -1 });
        res.json(classes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET class by id
exports.getClassById = async (req, res) => {
    try {
        const gymClass = await Class.findById(req.params.id)
            .populate({
                path: 'trainer',
                populate: { path: 'user', select: 'firstName lastName email' }
            })
            .lean();
        if (!gymClass) return res.status(404).json({ error: 'Class not found' });

        // Fetch enrolled members from Bookings
        const Booking = require('../models/Booking');
        const bookings = await Booking.find({ class: req.params.id, status: { $in: ['confirmed', 'attended'] } })
            .populate('user', 'firstName lastName createdAt');

        gymClass.enrolledMembers = bookings.map(b => b.user).filter(Boolean);

        res.json(gymClass);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST create class
exports.createClass = async (req, res) => {
    try {
        const gymClass = await Class.create(req.body);
        res.status(201).json(gymClass);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// PUT update class
exports.updateClass = async (req, res) => {
    try {
        const gymClass = await Class.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
            .populate('trainer');
        if (!gymClass) return res.status(404).json({ error: 'Class not found' });
        res.json(gymClass);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// DELETE class
exports.deleteClass = async (req, res) => {
    try {
        const gymClass = await Class.findByIdAndDelete(req.params.id);
        if (!gymClass) return res.status(404).json({ error: 'Class not found' });
        res.json({ message: 'Class deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
