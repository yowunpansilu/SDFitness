const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
    name: { type: String, required: true },
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
    capacity: { type: Number, default: 20 },
    enrolled: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Class', classSchema);
