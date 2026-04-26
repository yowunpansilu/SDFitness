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
        if (req.query.userId) filter.userId = req.query.userId;
        const subs = await Subscription.find(filter)
            .populate('plan')
            .sort({ createdAt: -1 });
        res.json(subs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST create subscription (or change plan)
exports.createSubscription = async (req, res) => {
    try {
        const { user, plan } = req.body;
        
        // If changing plans, find any current active subscription and mark it as cancelled or expired
        if (user) {
            await Subscription.updateMany(
                { user, status: 'active' },
                { status: 'expired' } // Mark old as expired
            );
        }

        // Calculate end date based on plan (defaulting to 30 days)
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 30);

        const sub = await Subscription.create({
            ...req.body,
            endDate,
            status: 'active'
        });

        // Ensure we populate the plan for the response
        const populatedSub = await sub.populate('plan');
        res.status(201).json(populatedSub);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// PUT update subscription status (Freeze/Cancel)
exports.updateSubscriptionStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, endDate } = req.body; // status can be 'cancelled' or 'frozen'
        
        const update = { status };
        if (endDate) update.endDate = new Date(endDate);

        const sub = await Subscription.findByIdAndUpdate(id, update, { new: true }).populate('plan');
        if (!sub) return res.status(404).json({ error: 'Subscription not found' });
        
        res.json(sub);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// ==========================================
// Payment Method Management
// ==========================================
const Member = require('../models/Member');

// GET all payment methods for a member
exports.getPaymentMethods = async (req, res) => {
    try {
        const member = await Member.findOne({ userId: req.query.userId || req.params.userId });
        if (!member) return res.json([]); // Return empty list instead of 404
        res.json(member.paymentMethods || []);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST add payment method
exports.addPaymentMethod = async (req, res) => {
    try {
        const userId = req.body.userId || req.query.userId;
        let member = await Member.findOne({ userId });
        
        // If no member profile exists, create a skeleton one
        if (!member) {
            member = new Member({
                userId,
                // These are required in schema, so we provide defaults/mocks if missing
                // In a real app, we'd ensure the profile is created at registration
                dateOfBirth: new Date(),
                gender: 'other',
                height: { value: 170, unit: 'cm' },
                currentWeight: { value: 70, unit: 'kg' }
            });
        }

        const newMethod = {
            ...req.body,
            isDefault: (member.paymentMethods || []).length === 0 ? true : req.body.isDefault
        };

        if (newMethod.isDefault) {
            (member.paymentMethods || []).forEach(m => m.isDefault = false);
        }

        if (!member.paymentMethods) member.paymentMethods = [];
        member.paymentMethods.push(newMethod);
        await member.save();
        
        // Return the newly added method with its ID
        res.status(201).json(member.paymentMethods[member.paymentMethods.length - 1]);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// DELETE payment method
exports.deletePaymentMethod = async (req, res) => {
    try {
        const { userId, methodId } = req.params;
        const member = await Member.findOne({ userId });
        if (!member) return res.status(404).json({ error: 'Member not found' });

        member.paymentMethods = member.paymentMethods.filter(m => m._id.toString() !== methodId);
        await member.save();
        res.json({ message: 'Payment method deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// PUT set default payment method
exports.setDefaultPaymentMethod = async (req, res) => {
    try {
        const { userId, methodId } = req.params;
        const member = await Member.findOne({ userId });
        if (!member) return res.status(404).json({ error: 'Member not found' });

        member.paymentMethods.forEach(m => {
            m.isDefault = m._id.toString() === methodId;
        });

        await member.save();
        res.json(member.paymentMethods);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
