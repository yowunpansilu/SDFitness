const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/auth');
const {
    createStripeSession,
    createClassPaymentSession,
    stripeWebhook,
    getPaymentStatus,
    recordAdminPayment
} = require('../controllers/paymentController');
const Payment = require('../models/Payment');
const Member = require('../models/Member');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads', 'bankslips');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
        // use req.user.id or _id securely
        const userId = req.user ? (req.user._id || req.user.id) : 'unknown';
        cb(null, `slip_${userId}_${Date.now()}${path.extname(file.originalname)}`);
    }
});
const upload = multer({ storage });

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

        if (req.query.status && req.query.status !== 'all') {
            query.status = req.query.status;
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

// @route   POST api/payments/class-booking
// @desc    Create a Stripe Checkout Session for class booking
router.post('/class-booking', protect, createClassPaymentSession);

// @route   POST api/payments/admin-record
// @desc    Record manual payment by admin
router.post('/admin-record', protect, requireRole('admin'), recordAdminPayment);

// @route   POST api/payments/bank-slip
// @desc    Upload a bank slip for payment
router.post('/bank-slip', protect, upload.single('bankSlip'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'Bank slip file is required' });
        }

        const { amount, paymentDate, referenceId, notes, type, description } = req.body;

        // Find memberId for current user
        const member = await Member.findOne({ userId: req.user._id || req.user.id });
        if (!member) {
            return res.status(404).json({ success: false, error: 'Member profile not found' });
        }

        const payment = new Payment({
            memberId: member._id,
            amount: Number(amount) || 0,
            currency: req.body.currency || 'LKR',
            method: 'bank_transfer',
            status: 'pending',
            bankSlipUrl: `/uploads/bankslips/${req.file.filename}`,
            referenceId,
            notes,
            paymentDate: paymentDate || new Date(),
            type: type || 'membership',
            description: description || 'Bank Slip Payment'
        });

        await payment.save();
        res.status(201).json({ success: true, message: 'Bank slip submitted for review', payment });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// @route   PUT api/payments/bank-slip/:id
// @desc    Update a bank slip for a pending payment (member only)
router.put('/bank-slip/:id', protect, upload.single('bankSlip'), async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id);
        if (!payment) {
            return res.status(404).json({ success: false, error: 'Payment not found' });
        }

        // Verify ownership
        const member = await Member.findOne({ userId: req.user._id || req.user.id });
        if (!member || payment.memberId.toString() !== member._id.toString()) {
            return res.status(403).json({ success: false, error: 'Not authorized to edit this payment' });
        }

        if (payment.status !== 'pending') {
            return res.status(400).json({ success: false, error: 'Cannot edit a payment that has been approved or rejected' });
        }

        const { amount, paymentDate, referenceId, notes } = req.body;

        if (amount !== undefined) payment.amount = Number(amount);
        if (paymentDate) payment.paymentDate = paymentDate;
        if (referenceId !== undefined) payment.referenceId = referenceId;
        if (notes !== undefined) payment.notes = notes;

        // If a new bank slip is uploaded, replace the old one
        if (req.file) {
            if (payment.bankSlipUrl) {
                const oldPath = path.join(__dirname, '..', payment.bankSlipUrl);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            payment.bankSlipUrl = `/uploads/bankslips/${req.file.filename}`;
        }

        await payment.save();
        res.json({ success: true, message: 'Payment updated successfully', payment });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// @route   PATCH api/payments/:id/approve
// @desc    Approve a pending payment (admin only)
router.patch('/:id/approve', protect, requireRole('admin'), async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id);

        if (!payment) {
            return res.status(404).json({ success: false, error: 'Payment not found' });
        }

        if (payment.status !== 'pending') {
            return res.status(400).json({
                success: false,
                error: `Payment is already ${payment.status}`
            });
        }

        payment.status = 'completed';
        payment.reviewedBy = req.user._id || req.user.id;
        payment.reviewedAt = new Date();
        payment.adminRemarks = req.body.remarks || '';

        await payment.save();

        res.json({
            success: true,
            message: 'Payment approved successfully',
            data: payment
        });
    } catch (error) {
        console.error('❌ Approve error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// @route   PATCH api/payments/:id/reject
// @desc    Reject a pending payment (admin only)
router.patch('/:id/reject', protect, requireRole('admin'), async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id);

        if (!payment) {
            return res.status(404).json({ success: false, error: 'Payment not found' });
        }

        if (payment.status !== 'pending') {
            return res.status(400).json({
                success: false,
                error: `Payment is already ${payment.status}`
            });
        }

        payment.status = 'failed';
        payment.reviewedBy = req.user._id || req.user.id;
        payment.reviewedAt = new Date();
        payment.adminRemarks = req.body.remarks || '';

        await payment.save();

        res.json({
            success: true,
            message: 'Payment rejected',
            data: payment
        });
    } catch (error) {
        console.error('❌ Reject error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
