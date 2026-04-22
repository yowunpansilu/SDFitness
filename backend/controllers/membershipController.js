const MembershipPlan = require('../models/MembershipPlan');
const Subscription = require('../models/Subscription');
const Member = require('../models/Member');

// GET all plans
exports.getPlans = async (req, res) => {
    try {
        const plans = await MembershipPlan.find().sort({ price: 1 });
        
        // Calculate member counts for each plan
        const plansWithCounts = await Promise.all(plans.map(async (plan) => {
            const count = await Subscription.countDocuments({ plan: plan._id, status: 'active' });
            
            // Map Mongoose object and ensure defaults for frontend compatibility
            const planObj = plan.toJSON();
            return {
                ...planObj,
                memberCount: count || 0,
                // Handle legacy durationDays mapping if duration is missing
                duration: planObj.duration || (planObj.durationDays ? Math.round(planObj.durationDays / 30) : 1),
                durationType: planObj.durationType || 'months',
                description: planObj.description || `Enjoy our ${planObj.name} features.`,
                color: planObj.color || 'from-slate-400 to-slate-500'
            };
        }));

        res.json({ success: true, data: plansWithCounts });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// POST create plan
exports.createPlan = async (req, res) => {
    try {
        const plan = await MembershipPlan.create(req.body);
        res.status(201).json({ success: true, data: plan });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// PUT update plan
exports.updatePlan = async (req, res) => {
    try {
        const plan = await MembershipPlan.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!plan) return res.status(404).json({ success: false, error: 'Plan not found' });
        res.json({ success: true, data: plan });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// DELETE plan
exports.deletePlan = async (req, res) => {
    try {
        const plan = await MembershipPlan.findByIdAndDelete(req.params.id);
        if (!plan) return res.status(404).json({ success: false, error: 'Plan not found' });
        res.json({ success: true, message: 'Plan deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// GET subscriptions for the logged-in user
exports.getSubscriptions = async (req, res) => {
    try {
        // Find the member record for this user
        const member = await Member.findOne({ userId: req.user._id || req.user.id });
        if (!member) {
            return res.json({ success: true, data: [] });
        }

        const subs = await Subscription.find({ user: member.userId })
            .populate('plan')
            .sort({ createdAt: -1 });
        res.json({ success: true, data: subs });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// POST create subscription (or change plan) - triggers PayHere payment
exports.createSubscription = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const { plan } = req.body;

        // Expire any existing active subscriptions for this user
        await Subscription.updateMany(
            { user: userId, status: 'active' },
            { status: 'expired' }
        );

        // Determine end date from the plan duration
        const planDoc = await MembershipPlan.findById(plan);
        const endDate = new Date();
        if (planDoc) {
            const months = planDoc.durationType === 'months' ? planDoc.duration : 1;
            endDate.setMonth(endDate.getMonth() + months);
        } else {
            endDate.setMonth(endDate.getMonth() + 1);
        }

        const sub = await Subscription.create({
            user: userId,
            plan,
            endDate,
            status: 'active'
        });

        const populatedSub = await sub.populate('plan');
        res.status(201).json({ success: true, data: populatedSub });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
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
        if (!sub) return res.status(404).json({ success: false, error: 'Subscription not found' });
        
        res.json({ success: true, data: sub });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// ==========================================
// Payment Method Management
// ==========================================

// GET all payment methods for a member
exports.getPaymentMethods = async (req, res) => {
    try {
        const member = await Member.findOne({ userId: req.query.userId || req.params.userId });
        if (!member) return res.json({ success: true, data: [] });
        res.json({ success: true, data: member.paymentMethods || [] });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
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
        
        res.status(201).json({ success: true, data: member.paymentMethods[member.paymentMethods.length - 1] });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// DELETE payment method
exports.deletePaymentMethod = async (req, res) => {
    try {
        const { userId, methodId } = req.params;
        const member = await Member.findOne({ userId });
        if (!member) return res.status(404).json({ success: false, error: 'Member not found' });

        member.paymentMethods = member.paymentMethods.filter(m => m._id.toString() !== methodId);
        await member.save();
        res.json({ success: true, message: 'Payment method deleted' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// PUT set default payment method
exports.setDefaultPaymentMethod = async (req, res) => {
    try {
        const { userId, methodId } = req.params;
        const member = await Member.findOne({ userId });
        if (!member) return res.status(404).json({ success: false, error: 'Member not found' });

        member.paymentMethods.forEach(m => {
            m.isDefault = m._id.toString() === methodId;
        });

        await member.save();
        res.json({ success: true, data: member.paymentMethods });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// ==========================================
// Admin Subscription Management
// ==========================================

// GET upcoming renewals (Admin only)
exports.getUpcomingRenewals = async (req, res) => {
    try {
        // Find members who have a saved PayHere token
        const members = await Member.find({ 
            'paymentMethods.payhereCustomerToken': { $exists: true, $ne: null } 
        }).populate('userId', 'firstName lastName email');

        // For each member, find their active subscription
        const renewals = await Promise.all(members.map(async (member) => {
            const subscription = await Subscription.findOne({ 
                user: member.userId._id, 
                status: 'active' 
            }).populate('plan');

            if (!subscription) return null;

            const defaultMethod = member.paymentMethods.find(m => m.isDefault && m.payhereCustomerToken);

            return {
                memberId: member._id,
                memberName: `${member.userId.firstName} ${member.userId.lastName}`,
                email: member.userId.email,
                plan: subscription.plan,
                endDate: subscription.endDate,
                nextChargeAmount: subscription.plan?.price,
                paymentMethod: defaultMethod ? {
                    brand: defaultMethod.brand,
                    last4: defaultMethod.last4
                } : null,
                hasToken: !!defaultMethod
            };
        }));

        // Filter out nulls and sort by date
        const filteredRenewals = renewals.filter(r => r !== null)
            .sort((a, b) => new Date(a.endDate) - new Date(b.endDate));

        res.json({ success: true, data: filteredRenewals });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// POST cancel auto-renewal (Admin only)
exports.cancelAutoRenewal = async (req, res) => {
    try {
        const { memberId } = req.params;
        const member = await Member.findById(memberId);
        if (!member) return res.status(404).json({ success: false, error: 'Member not found' });

        // Remove tokens or set isDefault to false for all methods to stop auto-charging
        member.paymentMethods.forEach(m => {
            m.isDefault = false;
            // Optionally wipe the token to be safe
            m.payhereCustomerToken = null;
        });

        await member.save();
        res.json({ success: true, message: 'Auto-renewal cancelled successfully' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
