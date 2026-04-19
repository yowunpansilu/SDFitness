const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/auth');
const {
    createStripeSession,
    stripeWebhook,
    getPaymentStatus,
    recordAdminPayment
} = require('../controllers/paymentController');
const Payment = require('../models/Payment');

// @route   GET api/payments
// @desc    Get payments for logged-in user (or all for admin)
router.get('/', protect, async (req, res) => {
    try {
        let query = {};
        if (req.user.role !== 'admin') {
            const Member = require('../models/Member');
            const member = await Member.findOne({ userId: req.user._id || req.user.id });
            if (!member) return res.json([]);
            query = { memberId: member._id };
        }
        const payments = await Payment.find(query).populate({
            path: 'memberId',
            populate: { path: 'userId', select: 'firstName lastName email' }
        }).sort({ createdAt: -1 });
        res.json(payments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @route   POST api/payments/initiate
// @desc    Create a Stripe Checkout Session
router.post('/initiate', protect, createStripeSession);

// @route   POST api/payments/webhook
// @desc    Handle Stripe Webhook (raw body required for signature verification)
router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

// @route   GET api/payments/status/:orderId
// @desc    Get payment status by Payment ID or Stripe Session ID
router.get('/status/:orderId', protect, getPaymentStatus);

// @route   POST api/payments/admin-record
// @desc    Record manual payment by admin
router.post('/admin-record', protect, requireRole('admin'), recordAdminPayment);

module.exports = router;
