const mongoose = require('mongoose');

const bodyMeasurementSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    chest: {
        type: Number,
        min: 0,
        required: true
    },
    waist: {
        type: Number,
        min: 0,
        required: true
    },
    hips: {
        type: Number,
        min: 0,
        required: true
    },
    notes: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('BodyMeasurement', bodyMeasurementSchema);
