const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const { protect, requireRole } = require('../middleware/auth');

// ── Multer config for bank slip uploads ─────────────────────────
const uploadsDir = path.join(__dirname, '..', 'uploads', 'bankslips');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
        const uniqueName = `slip_${req.user._id}_${Date.now()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const fileFilter = (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.pdf'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Only JPG, PNG and PDF files are allowed'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5 MB
});

// ─────────────────────────────────────────────────────────────────
// POST /api/payments — Submit a bank slip payment (member)
// ─────────────────────────────────────────────────────────────────
router.post('/', protect, upload.single('bankSlip'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'Bank slip file is required' });
        }

        const { amount, paymentDate, referenceId, notes } = req.body;

        if (!amount || isNaN(amount) || Number(amount) <= 0) {
            return res.status(400).json({ success: false, error: 'Valid amount is required' });
        }

        const payment = await Payment.create({
            memberId: req.user._id,
            memberName: `${req.user.firstName} ${req.user.lastName}`,
            amount: Number(amount),
            paymentDate: paymentDate || new Date(),
            bankSlipUrl: `/uploads/bankslips/${req.file.filename}`,
            referenceId: referenceId || '',
            notes: notes || '',
            status: 'pending'
        });

        console.log(`✅ Payment submitted: ${payment._id} by ${req.user.email}`);

        res.status(201).json({
            success: true,
            message: 'Payment submitted for review',
            data: payment
        });
    } catch (error) {
        console.error('❌ Payment submit error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ─────────────────────────────────────────────────────────────────
// GET /api/payments/my — Get own payment history (member)
// ─────────────────────────────────────────────────────────────────
router.get('/my', protect, async (req, res) => {
    try {
        const payments = await Payment.find({ memberId: req.user._id })
            .sort({ createdAt: -1 });

        res.json({ success: true, data: payments });
    } catch (error) {
        console.error('❌ Fetch payments error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ─────────────────────────────────────────────────────────────────
// GET /api/payments — Get ALL payments (admin only)
// ─────────────────────────────────────────────────────────────────
router.get('/', protect, requireRole('admin'), async (req, res) => {
    try {
        const { status, search } = req.query;
        const filter = {};

        if (status && status !== 'all') {
            filter.status = status;
        }

        if (search) {
            filter.$or = [
                { memberName: { $regex: search, $options: 'i' } },
                { referenceId: { $regex: search, $options: 'i' } }
            ];
        }

        const payments = await Payment.find(filter)
            .sort({ createdAt: -1 })
            .populate('reviewedBy', 'firstName lastName');

        res.json({ success: true, data: payments });
    } catch (error) {
        console.error('❌ Admin fetch payments error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ─────────────────────────────────────────────────────────────────
// GET /api/payments/:id — Get single payment detail
// ─────────────────────────────────────────────────────────────────
router.get('/:id', protect, async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id)
            .populate('reviewedBy', 'firstName lastName');

        if (!payment) {
            return res.status(404).json({ success: false, error: 'Payment not found' });
        }

        // Members can only view their own payments
        if (req.user.role !== 'admin' && payment.memberId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        res.json({ success: true, data: payment });
    } catch (error) {
        console.error('❌ Fetch payment error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ─────────────────────────────────────────────────────────────────
// PUT /api/payments/:id — Edit pending payment (member only)
// ─────────────────────────────────────────────────────────────────
router.put('/:id', protect, upload.single('bankSlip'), async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id);

        if (!payment) {
            return res.status(404).json({ success: false, error: 'Payment not found' });
        }

        // Only the owner can edit
        if (payment.memberId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        // Can only edit pending payments
        if (payment.status !== 'pending') {
            return res.status(400).json({
                success: false,
                error: 'Cannot edit payment that has been approved or rejected'
            });
        }

        const { amount, paymentDate, referenceId, notes } = req.body;

        if (amount) {
            if (isNaN(amount) || Number(amount) <= 0) {
                return res.status(400).json({ success: false, error: 'Valid amount is required' });
            }
            payment.amount = Number(amount);
        }
        if (paymentDate) payment.paymentDate = paymentDate;
        if (referenceId !== undefined) payment.referenceId = referenceId;
        if (notes !== undefined) payment.notes = notes;

        // If a new bank slip is uploaded, replace the old one
        if (req.file) {
            // Delete old file
            const oldPath = path.join(__dirname, '..', payment.bankSlipUrl);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
            payment.bankSlipUrl = `/uploads/bankslips/${req.file.filename}`;
        }

        await payment.save();

        console.log(`✅ Payment updated: ${payment._id}`);

        res.json({
            success: true,
            message: 'Payment updated successfully',
            data: payment
        });
    } catch (error) {
        console.error('❌ Payment update error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ─────────────────────────────────────────────────────────────────
// DELETE /api/payments/:id — Delete pending payment (member only)
// ─────────────────────────────────────────────────────────────────
router.delete('/:id', protect, async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id);

        if (!payment) {
            return res.status(404).json({ success: false, error: 'Payment not found' });
        }

        // Only the owner can delete
        if (payment.memberId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        // Can only delete pending payments
        if (payment.status !== 'pending') {
            return res.status(400).json({
                success: false,
                error: 'Cannot delete payment that has been approved or rejected'
            });
        }

        // Delete the bank slip file
        const filePath = path.join(__dirname, '..', payment.bankSlipUrl);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await Payment.findByIdAndDelete(req.params.id);

        console.log(`✅ Payment deleted: ${req.params.id}`);

        res.json({ success: true, message: 'Payment deleted successfully' });
    } catch (error) {
        console.error('❌ Payment delete error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ─────────────────────────────────────────────────────────────────
// PATCH /api/payments/:id/approve — Approve payment (admin only)
// ─────────────────────────────────────────────────────────────────
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

        payment.status = 'approved';
        payment.reviewedBy = req.user._id;
        payment.reviewedAt = new Date();
        payment.adminRemarks = req.body.remarks || '';

        await payment.save();

        // Create notification for user
        await Notification.create({
            user: payment.memberId,
            title: 'Payment Approved',
            message: `Your payment of LKR ${payment.amount.toLocaleString()} has been approved.`,
            type: 'success',
            relatedId: payment._id
        });

        console.log(`✅ Payment approved: ${payment._id} by admin ${req.user.email}`);

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

// ─────────────────────────────────────────────────────────────────
// PATCH /api/payments/:id/reject — Reject payment (admin only)
// ─────────────────────────────────────────────────────────────────
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

        if (!req.body.remarks) {
            return res.status(400).json({
                success: false,
                error: 'Rejection remarks are required'
            });
        }

        payment.status = 'rejected';
        payment.reviewedBy = req.user._id;
        payment.reviewedAt = new Date();
        payment.adminRemarks = req.body.remarks;

        await payment.save();

        // Create notification for user
        await Notification.create({
            user: payment.memberId,
            title: 'Payment Rejected',
            message: `Your payment of LKR ${payment.amount.toLocaleString()} was rejected: ${payment.adminRemarks}`,
            type: 'error',
            relatedId: payment._id
        });

        console.log(`❌ Payment rejected: ${payment._id} by admin ${req.user.email}`);

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
