const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    brand: String,
    model: String,
    serialNumber: String,
    status: {
        type: String,
        enum: ['working', 'maintenance', 'broken', 'retired'],
        default: 'working'
    },
    purchaseDate: Date,
    purchasePrice: Number,
    supplierName: String,
    warrantyMonths: Number,
    location: String,
    weightCapacity: String,
    dimensions: String,
    maintenanceFrequency: String,
    maintenanceNotes: String,
    lastMaintenanceDate: Date,
    nextMaintenance: Date,
    specifications: [{ key: String, value: String }]
}, { timestamps: true });

module.exports = mongoose.model('Equipment', equipmentSchema);
