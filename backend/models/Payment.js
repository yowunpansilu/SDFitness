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
        default: 'USD'
    },
    method: {
        type: String,
        enum: ['cash', 'card', 'bank_transfer', 'online', 'stripe'],
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
    // Stripe-specific fields
    stripeSessionId: {
        type: String,
        unique: true,
        sparse: true
    },
    stripePaymentIntentId: {
        type: String,
        sparse: true
    },

    // Plan reference for subscription activation after payment
    planId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MembershipPlan',
        sparse: true
    },
    // Class booking references
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        sparse: true
    },
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        sparse: true
    },
    type: {
        type: String,
        enum: ['membership', 'class_booking'],
        default: 'membership'
    },
    description: String,
    paidAt: {
        type: Date
    },
    // Manual Bank/Slip Payment Fields
    bankSlipUrl: {
        type: String,
        sparse: true
    },
    referenceId: {
        type: String,
        sparse: true
    },
    notes: {
        type: String,
        sparse: true
    },
    paymentDate: {
        type: Date,
        sparse: true
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        sparse: true
    },
    reviewedAt: {
        type: Date,
        sparse: true
    },
    adminRemarks: {
        type: String,
        sparse: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);
