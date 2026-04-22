const Feedback = require('../models/Feedback');

// POST submit feedback or bug report
exports.submitFeedback = async (req, res) => {
    try {
        const { message, category, stackTrace, userAgent, errorUrl, appVersion } = req.body;
        const userId = req.user.id;

        if (!message) {
            return res.status(400).json({
                success: false,
                code: 'MESSAGE_REQUIRED',
                message: 'Feedback message is required.'
            });
        }

        const allowedCategories = ['bug', 'suggestion', 'complaint', 'feature_request', 'other'];
        if (!allowedCategories.includes(category)) {
            return res.status(400).json({
                success: false,
                code: 'INVALID_CATEGORY',
                message: 'Invalid feedback category.'
            });
        }

        const feedback = await Feedback.create({
            userId,
            message,
            category,
            stackTrace,
            userAgent,
            errorUrl,
            appVersion
        });

        res.status(201).json({
            success: true,
            data: feedback
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// GET member's own feedback
exports.getMyFeedback = async (req, res) => {
    try {
        const userId = req.user.id;
        const feedbacks = await Feedback.find({ userId }).sort({ createdAt: -1 });

        res.json({
            success: true,
            data: feedbacks
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// --- ADMIN CONTROLLERS ---

// GET all feedback (Admin)
exports.getAllFeedback = async (req, res) => {
    try {
        const { status, category, page = 1, limit = 20 } = req.query;
        let query = {};
        if (status) query.status = status;
        if (category) query.category = category;

        const feedbacks = await Feedback.find(query)
            .populate('userId', 'firstName lastName email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await Feedback.countDocuments(query);

        res.json({
            success: true,
            data: feedbacks,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET feedback by ID (Admin)
exports.getFeedbackById = async (req, res) => {
    try {
        const feedback = await Feedback.findById(req.params.id).populate('userId', 'firstName lastName email');
        if (!feedback) {
            return res.status(404).json({ success: false, message: 'Feedback not found' });
        }
        res.json({
            success: true,
            data: feedback
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// PATCH update feedback status (Admin)
exports.updateFeedbackStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const allowedStatuses = ['pending', 'reviewed', 'resolved'];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const feedback = await Feedback.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!feedback) {
            return res.status(404).json({ success: false, message: 'Feedback not found' });
        }

        res.json({
            success: true,
            data: feedback
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// PATCH add admin notes (Admin)
exports.addAdminNotes = async (req, res) => {
    try {
        const { adminNotes } = req.body;
        const feedback = await Feedback.findByIdAndUpdate(
            req.params.id,
            { adminNotes },
            { new: true }
        );

        if (!feedback) {
            return res.status(404).json({ success: false, message: 'Feedback not found' });
        }

        res.json({
            success: true,
            data: feedback
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
