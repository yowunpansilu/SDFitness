const mongoose = require('mongoose');

const weightLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    weight: {
        value: { type: Number, required: true },
        unit: { type: String, enum: ['kg', 'lbs'], default: 'kg' }
    },
    date: {
        type: Date,
        default: Date.now
    },
    notes: {
        type: String,
        trim: true
    }
}, { timestamps: true });

// Index for getting weight history chronologically per user
weightLogSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('WeightLog', weightLogSchema);
