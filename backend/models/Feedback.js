const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        enum: ['bug', 'suggestion', 'complaint', 'feature_request', 'other'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'resolved'],
        default: 'pending'
    },
    adminNotes: {
        type: String,
        trim: true
    },
    // Bug report metadata
    stackTrace: String,
    userAgent: String,
    errorUrl: String,
    appVersion: String
}, {
    timestamps: true
});

module.exports = mongoose.model('Feedback', feedbackSchema);
