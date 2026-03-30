const mongoose = require('mongoose');

const membershipPlanSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true },
    duration: { type: Number, required: true, default: 1 },
    durationType: { type: String, enum: ['days', 'months'], default: 'months' },
    durationDays: { type: Number }, // Keep for legacy
    features: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
    color: { type: String, default: 'from-slate-400 to-slate-500' }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for id to match frontend
membershipPlanSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

module.exports = mongoose.model('MembershipPlan', membershipPlanSchema);
