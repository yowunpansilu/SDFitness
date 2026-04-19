const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'LKR'
    },
    method: {
        type: String,
        enum: ['cash', 'card', 'bank_transfer', 'online', 'payhere'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded', 'cancelled'],
        default: 'pending'
    },
    transactionId: {
        type: String,
        unique: true,
        sparse: true
    },
    // PayHere Specific Fields
    orderId: {
        type: String,
        unique: true,
        sparse: true
    },
    payherePaymentId: String,
    payhereStatusCode: Number,
    payhereMd5Sig: String,
    isAutomated: {
        type: Boolean,
        default: false
    },
    
    // Plan reference for subscription activation after payment
    planId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MembershipPlan',
        sparse: true
    },
    description: String,
    paidAt: {
        type: Date
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);
