const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/auth');
const { 
    initiatePayherePayment, 
    payhereNotify, 
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
            // Find the member record for this user
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
// @desc    Initiate a PayHere payment
router.post('/initiate', protect, initiatePayherePayment);

// @route   POST api/payments/notify
// @desc    Handle PayHere notification (Server Callback)
// Note: PayHere sends data as application/x-www-form-urlencoded
router.post('/notify', express.urlencoded({ extended: true }), payhereNotify);

// @route   GET api/payments/status/:orderId
// @desc    Get payment status by Order ID
router.get('/status/:orderId', protect, getPaymentStatus);

// @route   POST api/payments/admin-record
// @desc    Record manual payment by admin
router.post('/admin-record', protect, requireRole('admin'), recordAdminPayment);

module.exports = router;
