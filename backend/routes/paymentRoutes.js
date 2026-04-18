const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');

// @route   GET api/payments
// @desc    Get all payments
router.get('/', async (req, res) => {
    try {
        const payments = await Payment.find().populate({
            path: 'memberId',
            populate: { path: 'userId' }
        }).sort({ paidAt: -1 });
        res.json(payments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @route   POST api/payments
// @desc    Create a payment
router.post('/', async (req, res) => {
    try {
        const payment = new Payment(req.body);
        await payment.save();
        res.status(201).json(payment);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
