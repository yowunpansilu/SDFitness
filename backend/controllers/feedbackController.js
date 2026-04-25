const Feedback = require('../models/Feedback');

// POST /api/feedback
exports.submitFeedback = async (req, res) => {
    try {
        const { category, message } = req.body;
        
        if (!req.user || !req.user.id) {
            return res.status(401).json({ success: false, error: 'Not authorized' });
        }

        const newFeedback = await Feedback.create({
            userId: req.user.id,
            category,
            message
        });

        res.status(201).json({ success: true, data: newFeedback });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// GET /api/feedback/my (User only - Fetch personal feedback logs)
exports.getMyFeedback = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ success: false, error: 'Not authorized' });
        }
        
        const feedback = await Feedback.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: feedback.length, data: feedback });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// GET /api/feedback (Admin only)
exports.getAllFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.find().populate('userId', 'name email').sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: feedback.length, data: feedback });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// PUT /api/feedback/:id (Admin only)
exports.updateFeedbackStatus = async (req, res) => {
    try {
        const { status, adminNotes } = req.body;
        
        const feedback = await Feedback.findByIdAndUpdate(
            req.params.id,
            { status, adminNotes },
            { new: true, runValidators: true }
        );

        if (!feedback) {
            return res.status(404).json({ success: false, error: 'Feedback not found' });
        }

        res.status(200).json({ success: true, data: feedback });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
