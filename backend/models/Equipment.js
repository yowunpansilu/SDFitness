const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    status: {
        type: String,
        enum: ['active', 'maintenance', 'retired'],
        default: 'active'
    },
    purchaseDate: Date,
    lastMaintenance: Date,
    nextMaintenance: Date
}, { timestamps: true });

module.exports = mongoose.model('Equipment', equipmentSchema);
