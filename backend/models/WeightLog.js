const mongoose = require('mongoose');

const weightLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    weight: {
        type: Number,
        required: true,
        min: 0
    },
    unit: {
        type: String,
        enum: ['kg', 'lbs'],
        default: 'kg'
    },
    weightKg: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    note: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Index for getting weight history chronologically per user
weightLogSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('WeightLog', weightLogSchema);
