const Payment = require('../models/Payment');

exports.getPayments = async (req, res) => {
    try {
        const payments = await Payment.find()
            .populate({
                path: 'member',
                populate: { path: 'userId', select: 'firstName lastName email' }
            })
            .sort({ paymentDate: -1 });
        
        res.json(payments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getPaymentById = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id)
            .populate({
                path: 'member',
                populate: { path: 'userId', select: 'firstName lastName email phone' }
            });
        
        if (!payment) return res.status(404).json({ error: 'Payment not found' });
        res.json(payment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createPayment = async (req, res) => {
    try {
        const { member, amount, currency, paymentMethod, status, description, transactionId } = req.body;
        
        const payment = await Payment.create({
            member,
            amount,
            currency: currency || 'LKR',
            paymentMethod,
            status: status || 'completed',
            description,
            transactionId: transactionId || `TXN-${Math.random().toString(36).slice(2, 11).toUpperCase()}`
        });

        res.status(201).json(payment);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.updatePaymentStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const payment = await Payment.findByIdAndUpdate(
            req.params.id, 
            { status }, 
            { new: true, runValidators: true }
        );
        
        if (!payment) return res.status(404).json({ error: 'Payment not found' });
        res.json(payment);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.deletePayment = async (req, res) => {
    try {
        const payment = await Payment.findByIdAndDelete(req.params.id);
        if (!payment) return res.status(404).json({ error: 'Payment not found' });
        res.json({ message: 'Payment deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
