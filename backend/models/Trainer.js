const mongoose = require('mongoose');

const trainerSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    specialization: [String],
    experienceYears: Number,
    bio: String,
    availability: [{
        day: String, // e.g., 'Monday'
        startTime: String, // e.g., '09:00'
        endTime: String // e.g., '17:00'
    }]
}, { timestamps: true });

module.exports = mongoose.model('Trainer', trainerSchema);
