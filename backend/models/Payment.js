const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    member: {
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
    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'bank_transfer', 'online'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'completed'
    },
    paymentDate: {
        type: Date,
        default: Date.now
    },
    description: {
        type: String
    },
    transactionId: {
        type: String,
        unique: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
