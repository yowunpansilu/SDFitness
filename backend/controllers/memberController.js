const Member = require('../models/Member');
const User = require('../models/User');

// GET all members
exports.getAllMembers = async (req, res) => {
    try {
        const members = await Member.find()
            .populate('userId', 'email firstName lastName role isActive lastLogin')
            .populate('assignedTrainerId')
            .sort({ createdAt: -1 });
        res.json(members);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET member by id
exports.getMemberById = async (req, res) => {
    try {
        const member = await Member.findById(req.params.id)
            .populate('userId', 'email firstName lastName role isActive lastLogin')
            .populate('assignedTrainerId');
        if (!member) return res.status(404).json({ error: 'Member not found' });
        res.json(member);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST create member
exports.createMember = async (req, res) => {
    try {
        const member = await Member.create(req.body);
        res.status(201).json(member);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// PUT update member
exports.updateMember = async (req, res) => {
    try {
        const member = await Member.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
            .populate('userId', 'email firstName lastName role isActive lastLogin');
        if (!member) return res.status(404).json({ error: 'Member not found' });
        res.json(member);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// DELETE member
exports.deleteMember = async (req, res) => {
    try {
        const member = await Member.findByIdAndDelete(req.params.id);
        if (!member) return res.status(404).json({ error: 'Member not found' });
        res.json({ message: 'Member deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET member bookings
exports.getMemberBookings = async (req, res) => {
    try {
        const Booking = require('../models/Booking');
        const bookings = await Booking.find({ user: req.params.id, status: 'confirmed' })
            .populate({
                path: 'class',
                populate: {
                    path: 'trainer',
                    populate: { path: 'userId', select: 'firstName lastName email' }
                }
            })
            .sort({ createdAt: -1 });

        // Map to frontend expected format
        const formatted = bookings.map(b => ({
            id: b._id,
            classId: b.class?._id,
            userId: b.user,
            status: b.status,
            bookingDate: b.bookingDate,
            gymClass: {
                id: b.class?._id,
                name: b.class?.name || 'Unknown Class',
                description: b.class?.description || '',
                trainerName: b.class?.trainer?.userId ? `${b.class.trainer.userId.firstName} ${b.class.trainer.userId.lastName}` : 'Unknown Trainer',
                startTime: b.classDate || b.class?.startTime || new Date().toISOString(), // Use booking specific date
                duration: b.class?.duration || 60,
                capacity: b.class?.capacity || 20,
                bookedCount: b.class?.enrolled || 0,
                type: b.class?.type || 'Strength',
                location: b.class?.location || 'Main Gym'
            }
        }));

        res.json(formatted);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
