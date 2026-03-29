const mongoose = require('mongoose');

const trainerSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    specializations: [String],
    experienceYears: Number,
    bio: String,
    hourlyRate: { type: Number, default: 0 },
    certifications: [{
        name: String,
        issuer: String,
        issueDate: Date
    }],
    employmentStatus: {
        type: String,
        enum: ['full-time', 'part-time', 'contract'],
        default: 'full-time'
    },
    commissionRate: { type: Number, default: 0 },
    availableHoursPerWeek: { type: Number, default: 40 },
    emergencyContact: {
        name: String,
        relationship: String,
        phone: String
    },
    joinDate: { type: Date, default: Date.now },
    availability: [{
        day: String, // e.g., 'Monday'
        startTime: String, // e.g., '09:00'
        endTime: String // e.g., '17:00'
    }]
}, { timestamps: true });

module.exports = mongoose.model('Trainer', trainerSchema);
