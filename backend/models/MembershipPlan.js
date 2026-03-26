const mongoose = require('mongoose');

const membershipPlanSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    durationDays: { type: Number, required: true },
    features: [String],
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('MembershipPlan', membershipPlanSchema);
