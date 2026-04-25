const mongoose = require('mongoose');

const dailyProgressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: String, // Storing as 'YYYY-MM-DD' for easy querying
        required: true
    },
    workout: {
        type: Boolean,
        default: false
    },
    diet: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Ensure one entry per user per day
dailyProgressSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DailyProgress', dailyProgressSchema);
