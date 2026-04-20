const Class = require('../models/Class');

// GET all classes
exports.getAllClasses = async (req, res) => {
    try {
        const classes = await Class.find()
            .populate({
                path: 'trainer',
                populate: { path: 'userId', select: 'firstName lastName email' }
            })
            .lean()
            .sort({ createdAt: -1 });

        // Calculate dynamic enrolled count based on bookings
        const Booking = require('../models/Booking');

        for (let gymClass of classes) {
            const enrolledCount = await Booking.countDocuments({
                class: gymClass._id,
                status: 'confirmed'
            });
            gymClass.enrolled = enrolledCount;
        }

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
                populate: { path: 'userId', select: 'firstName lastName email' }
            })
            .lean();
        if (!gymClass) return res.status(404).json({ error: 'Class not found' });

        // Fetch enrolled members from Bookings
        const Booking = require('../models/Booking');
        const bookings = await Booking.find({ class: req.params.id, status: { $in: ['confirmed', 'attended'] } })
            .populate('user', 'firstName lastName createdAt photoUrl');

        gymClass.enrolledMembers = bookings.map(b => b.user).filter(Boolean);
        gymClass.enrolled = bookings.length;

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

// POST book class
exports.bookClass = async (req, res) => {
    try {
        const { classId, userId, classDate } = req.body;
        if (!classDate) return res.status(400).json({ error: 'classDate is required' });

        const Booking = require('../models/Booking');

        // Check if already booked for THIS specific date
        // (Allows multiple bookings for the same class on different weeks)
        const existing = await Booking.findOne({
            user: userId,
            class: classId,
            classDate: new Date(classDate),
            status: 'confirmed'
        });
        if (existing) return res.status(400).json({ error: 'Already booked for this specific time' });

        const gymClass = await Class.findById(classId);
        if (!gymClass) return res.status(404).json({ error: 'Class not found' });

        const currentEnrolled = await Booking.countDocuments({
            class: classId,
            classDate: new Date(classDate),
            status: 'confirmed'
        });

        if (currentEnrolled >= gymClass.capacity) {
            return res.status(400).json({ error: 'Class is full' });
        }

        if (gymClass.price > 0) {
            return res.status(400).json({ error: 'This class requires payment. Please use the payment checkout flow.' });
        }

        const booking = await Booking.create({
            user: userId,
            class: classId,
            classDate: new Date(classDate),
            status: 'confirmed',
            paymentStatus: 'free'
        });

        res.status(201).json(booking);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// DELETE booking
exports.deleteBooking = async (req, res) => {
    try {
        const Booking = require('../models/Booking');
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        // Only allow user to cancel their own booking (or admin)
        // Note: auth middleware should provide req.user
        if (req.user && req.user.role !== 'admin' && booking.user.toString() !== req.user.id.toString()) {
            return res.status(403).json({ error: 'Not authorized to cancel this booking' });
        }

        await Booking.findByIdAndDelete(req.params.id);
        res.json({ message: 'Booking cancelled successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
