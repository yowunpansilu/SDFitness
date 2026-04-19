const Stripe = require('stripe');
const Payment = require('../models/Payment');
const Member = require('../models/Member');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const MembershipPlan = require('../models/MembershipPlan');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Helper to activate subscription for a member
 */
const activateSubscription = async (memberId, planId) => {
    const member = await Member.findById(memberId);
    if (!member) throw new Error('Member not found');
    const userId = member.userId;

    // Expire old active subscriptions
    await Subscription.updateMany(
        { user: userId, status: 'active' },
        { status: 'expired' }
    );

    // Compute end date from plan
    const planDoc = await MembershipPlan.findById(planId);
    const endDate = new Date();
    if (planDoc) {
        if (planDoc.durationType === 'days') {
            endDate.setDate(endDate.getDate() + planDoc.duration);
        } else {
            const months = planDoc.duration || 1;
            endDate.setMonth(endDate.getMonth() + months);
        }
    } else {
        endDate.setMonth(endDate.getMonth() + 1);
    }

    await Subscription.create({
        user: userId,
        plan: planId,
        endDate,
        status: 'active'
    });
    console.log(`✅ Subscription activated for user ${userId}`);
};

/**
 * @desc    Create Stripe Checkout Session
 * @route   POST /api/payments/initiate
 * @access  Private
 */
exports.createStripeSession = async (req, res) => {
    try {
        const { amount, currency, description, planId } = req.body;
        const userId = req.user._id || req.user.id;

        const member = await Member.findOne({ userId }).populate('userId');
        if (!member) {
            return res.status(404).json({ success: false, error: 'Member profile not found. Please complete your profile first.' });
        }

        const user = member.userId;

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

        // Convert amount to smallest currency unit (cents for USD, paise for INR, etc.)
        // Stripe requires integer amounts in the smallest unit
        const unitAmount = Math.round(parseFloat(amount) * 100);
        const curr = (currency || 'usd').toLowerCase();

        // Create a pending payment record first
        const payment = new Payment({
            memberId: member._id,
            amount: parseFloat(amount),
            currency: curr.toUpperCase(),
            method: 'stripe',
            status: 'pending',
            description: description || `Membership Payment${planId ? ` - ${planId}` : ''}`,
            planId
        });

        await payment.save();

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            customer_email: user.email,
            line_items: [
                {
                    price_data: {
                        currency: curr,
                        product_data: {
                            name: 'SD Fitness Membership',
                            description: description || 'Membership Renewal',
                        },
                        unit_amount: unitAmount,
                    },
                    quantity: 1,
                },
            ],
            metadata: {
                paymentId: payment._id.toString(),
                memberId: member._id.toString(),
                planId: planId ? planId.toString() : '',
                userId: userId.toString()
            },
            success_url: `${frontendUrl}/dashboard/payment/success?session_id={CHECKOUT_SESSION_ID}&payment_id=${payment._id}`,
            cancel_url: `${frontendUrl}/dashboard/billing`,
        });

        // Save session ID to payment record
        payment.stripeSessionId = session.id;
        await payment.save();

        console.log(`[STRIPE] Created session ${session.id} for payment ${payment._id}`);

        res.status(200).json({
            success: true,
            checkoutUrl: session.url,
            sessionId: session.id,
            paymentId: payment._id
        });

    } catch (err) {
        console.error('Stripe Session Error:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
};

/**
 * @desc    Handle Stripe Webhook
 * @route   POST /api/payments/webhook
 * @access  Public (called by Stripe)
 */
exports.stripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
        console.error('❌ Stripe Webhook Signature Invalid:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log(`[STRIPE] Webhook event: ${event.type}`);

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;

        try {
            const { paymentId, planId } = session.metadata;

            const payment = await Payment.findById(paymentId);
            if (!payment) {
                console.error(`❌ Payment not found for ID: ${paymentId}`);
                return res.status(200).send('OK'); // Acknowledge to Stripe
            }

            payment.status = 'completed';
            payment.paidAt = new Date();
            payment.stripePaymentIntentId = session.payment_intent;
            payment.transactionId = session.payment_intent;
            await payment.save();

            console.log(`✅ Payment SUCCESS: ${payment._id}`);

            if (planId) {
                try {
                    await activateSubscription(payment.memberId, planId);
                } catch (subErr) {
                    console.error('❌ Subscription activation failed:', subErr.message);
                }
            }
        } catch (err) {
            console.error('❌ Error handling webhook event:', err.message);
        }
    }

    res.status(200).send('OK');
};

/**
 * @desc    Get Payment Status by Payment ID or Session ID
 * @route   GET /api/payments/status/:orderId
 * @access  Private
 */
exports.getPaymentStatus = async (req, res) => {
    try {
        // Support both MongoDB _id and stripeSessionId
        const payment = await Payment.findOne({
            $or: [
                { _id: req.params.orderId.match(/^[0-9a-fA-F]{24}$/) ? req.params.orderId : null },
                { stripeSessionId: req.params.orderId }
            ]
        }).populate({ path: 'memberId', populate: { path: 'userId', select: 'firstName lastName email' } });

        if (!payment) {
            return res.status(404).json({ success: false, error: 'Payment not found' });
        }

        // Self-healing: check Stripe if still pending
        if (payment.status === 'pending' && payment.stripeSessionId) {
            try {
                const session = await stripe.checkout.sessions.retrieve(payment.stripeSessionId);
                if (session.payment_status === 'paid') {
                    payment.status = 'completed';
                    payment.paidAt = new Date();
                    payment.stripePaymentIntentId = session.payment_intent;
                    payment.transactionId = session.payment_intent;
                    await payment.save();

                    if (payment.planId) {
                        await activateSubscription(payment.memberId, payment.planId);
                    }
                }
            } catch (stripeErr) {
                console.warn('⚠️ Could not cross-verify with Stripe:', stripeErr.message);
            }
        }

        res.status(200).json({ success: true, payment });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

/**
 * @desc    Record manual payment (Admin)
 * @route   POST /api/payments/admin-record
 * @access  Private/Admin
 */
exports.recordAdminPayment = async (req, res) => {
    try {
        const { memberId, amount, currency, method, description, planId, transactionId } = req.body;

        const payment = new Payment({
            memberId,
            amount,
            currency: currency || 'LKR',
            method: method || 'cash',
            status: 'completed',
            description,
            planId,
            transactionId: transactionId || `MAN-${Date.now()}`,
            paidAt: new Date()
        });

        await payment.save();

        if (planId) {
            try {
                await activateSubscription(memberId, planId);
            } catch (subErr) {
                console.error('❌ Manual Subscription activation failed:', subErr.message);
                return res.status(200).json({
                    success: true,
                    message: 'Payment recorded, but subscription activation failed.',
                    payment
                });
            }
        }

        res.status(201).json({ success: true, payment });

    } catch (err) {
        console.error('Admin Payment Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};
