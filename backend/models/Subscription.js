const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    plan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MembershipPlan',
        required: true
    },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, required: true },
    status: {
        type: String,
        enum: ['active', 'expired', 'frozen', 'cancelled'],
        default: 'active'
    }
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);
