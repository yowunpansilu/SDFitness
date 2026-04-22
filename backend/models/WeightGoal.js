const mongoose = require('mongoose');

const weightGoalSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    startWeight: {
        type: Number,
        required: true
    },
    targetWeight: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ['lose', 'gain'],
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'abandoned'],
        default: 'active'
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    targetDate: {
        type: Date
    },
    completedDate: {
        type: Date
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('WeightGoal', weightGoalSchema);
