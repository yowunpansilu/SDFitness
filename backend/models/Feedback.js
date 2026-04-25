const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: String,
        enum: ['bug', 'feature_request', 'general', 'complaint'],
        default: 'general'
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'resolved'],
        default: 'pending'
    },
    adminNotes: {
        type: String,
        trim: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
