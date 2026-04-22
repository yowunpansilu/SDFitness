const mongoose = require('mongoose');

const dailyProgressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    workoutCompleted: {
        type: Boolean,
        required: true,
        default: false
    },
    dietFollowed: {
        type: Boolean,
        required: true,
        default: false
    },
    notes: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Compound unique index to prevent duplicate entries for the same user on the same date
dailyProgressSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DailyProgress', dailyProgressSchema);
