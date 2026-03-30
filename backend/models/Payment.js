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
        enum: ['cash', 'card', 'bank_transfer', 'online'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'completed'
    },
    transactionId: {
        type: String,
        unique: true,
        sparse: true
    },
    description: String,
    paidAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);
