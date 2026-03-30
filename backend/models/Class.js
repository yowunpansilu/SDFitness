const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, default: 'cardio' },
    level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
    description: String,
    trainer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trainer'
    },
    schedule: {
        dayOfWeek: String, // e.g., 'Monday'
        startTime: String, // e.g., '18:00'
        endTime: String
    },
    duration: { type: Number, default: 60 },
    location: { type: String, default: 'Studio A' },
    capacity: { type: Number, default: 20 },
    enrolled: { type: Number, default: 0 },
    price: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Class', classSchema);
