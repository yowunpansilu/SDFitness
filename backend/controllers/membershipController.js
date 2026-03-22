const MembershipPlan = require('../models/MembershipPlan');
const Subscription = require('../models/Subscription');

// GET all plans
exports.getPlans = async (req, res) => {
    try {
        const plans = await MembershipPlan.find().sort({ price: 1 });
        res.json(plans);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST create plan
exports.createPlan = async (req, res) => {
    try {
        const plan = await MembershipPlan.create(req.body);
        res.status(201).json(plan);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// PUT update plan
exports.updatePlan = async (req, res) => {
    try {
        const plan = await MembershipPlan.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!plan) return res.status(404).json({ error: 'Plan not found' });
        res.json(plan);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// DELETE plan
exports.deletePlan = async (req, res) => {
    try {
        const plan = await MembershipPlan.findByIdAndDelete(req.params.id);
        if (!plan) return res.status(404).json({ error: 'Plan not found' });
        res.json({ message: 'Plan deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET all subscriptions
exports.getSubscriptions = async (req, res) => {
    try {
        const filter = {};
        if (req.query.userId) filter.user = req.query.userId;
        const subs = await Subscription.find(filter)
            .populate('user', 'email firstName lastName')
            .populate('plan')
            .sort({ createdAt: -1 });
        res.json(subs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST create subscription
exports.createSubscription = async (req, res) => {
    try {
        const sub = await Subscription.create(req.body);
        res.status(201).json(sub);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
