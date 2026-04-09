const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    brand: { type: String },
    model: { type: String },
    serialNumber: { type: String, required: true },
    status: {
        type: String,
        enum: ['available', 'in-use', 'maintenance', 'broken'],
        default: 'available'
    },
    location: { type: String, required: true },
    purchaseDate: Date,
    purchasePrice: { type: Number, default: 0 },
    supplierName: { type: String },
    warrantyMonths: { type: Number, default: 0 },
    weightCapacity: { type: String },
    dimensions: { type: String },
    maintenanceFrequency: {
        type: String,
        enum: ['weekly', 'monthly', 'quarterly', 'yearly'],
        default: 'monthly'
    },
    lastMaintenanceDate: Date,
    maintenanceNotes: { type: String }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for id to match frontend expectation
equipmentSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

module.exports = mongoose.model('Equipment', equipmentSchema);
