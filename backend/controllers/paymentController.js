const crypto = require('crypto');
const Payment = require('../models/Payment');
const Member = require('../models/Member');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const MembershipPlan = require('../models/MembershipPlan');
const payhereService = require('../services/payhereService');

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
 * Generate PayHere MD5 Hash
 */
const generatePayhereHash = (merchantId, orderId, amount, currency, merchantSecret) => {
    // 1. MD5 hash of merchantSecret (uppercase)
    const secret = String(merchantSecret).trim();
    const hashedSecret = crypto.createHash('md5').update(secret).digest('hex').toUpperCase();

    // 2. Format amount to 2 decimal places (no commas)
    const amountFormatted = parseFloat(amount).toFixed(2);

    // 3. Concatenate and hash again: merchant_id + order_id + amount + currency + hashedSecret
    const hashString = String(merchantId) + String(orderId) + amountFormatted + String(currency) + hashedSecret;
    const finalHash = crypto.createHash('md5').update(hashString).digest('hex').toUpperCase();

    console.log('[PAYHERE] Hash Components:', {
        merchantId,
        orderId,
        amountFormatted,
        currency,
        secretPreview: secret.substring(0, 3) + '...' + secret.substring(secret.length - 3)
    });
    console.log('[PAYHERE] Final Hash:', finalHash);

    return finalHash;
};

/**
 * Verify PayHere Notify MD5 Signature
 */
const verifyPayhereSig = (body, merchantSecret) => {
    const { merchant_id, order_id, payhere_amount, payhere_currency, status_code, md5sig } = body;

    // Use the literal secret string as provided
    const secret = String(merchantSecret).trim();
    const hashedSecret = crypto.createHash('md5').update(secret).digest('hex').toUpperCase();

    // IMPORTANT: For notification verification, use the raw payhere_amount string as received
    const hashString = String(merchant_id) + String(order_id) + String(payhere_amount) + String(payhere_currency) + String(status_code) + hashedSecret;

    const expectedSig = crypto.createHash('md5').update(hashString).digest('hex').toUpperCase();

    return expectedSig === md5sig;
};

/**
 * @desc    Initiate PayHere Payment
 * @route   POST /api/payments/initiate
 * @access  Private
 */
exports.initiatePayherePayment = async (req, res) => {
    try {
        const { amount, currency, description, planId } = req.body;
        const userId = req.user._id || req.user.id;

        const member = await Member.findOne({ userId }).populate('userId');
        if (!member) {
            return res.status(404).json({ success: false, error: 'Member profile not found. Please complete your profile first.' });
        }

        const user = member.userId;

        const merchantId = process.env.MERCHANT_ID?.trim();
        const merchantSecret = process.env.MERCHANT_SECRET?.trim();
        const isSandbox = process.env.PAYHERE_SANDBOX === 'true';

        const checkoutBaseUrl = isSandbox
            ? 'https://sandbox.payhere.lk'
            : 'https://www.payhere.lk';

        if (!merchantId || !merchantSecret) {
            return res.status(500).json({ success: false, error: 'PayHere credentials not configured' });
        }

        // Use a strictly numeric order ID for maximum compatibility
        const orderId = `${Date.now()}${userId.toString().substring(20)}`;
        const hash = generatePayhereHash(merchantId, orderId, amount, currency || 'LKR', merchantSecret);

        // Create pending payment record
        const payment = new Payment({
            memberId: member._id,
            amount,
            currency: currency || 'LKR',
            method: 'payhere',
            status: 'pending',
            orderId,
            description: description || `Membership Payment${planId ? ` - ${planId}` : ''}`,
            planId
        });

        await payment.save();

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const backendNotifyUrl = process.env.BACKEND_NOTIFY_URL || 'http://localhost:5005';

        // Cleaned up items and removed any special characters/spaces if possible
        const formData = {
            merchant_id: merchantId,
            return_url: `${frontendUrl}/dashboard/payment/success?order_id=${orderId}`,
            cancel_url: `${frontendUrl}/dashboard/payment/cancel`,
            notify_url: `${backendNotifyUrl}/api/payments/notify`,
            first_name: user.firstName || 'Member',
            last_name: user.lastName || 'Customer',
            email: user.email,
            phone: user.phone || '0000000000',
            address: member.address || 'Colombo, Sri Lanka',
            city: member.city || 'Colombo',
            country: 'Sri Lanka',
            order_id: orderId,
            items: 'Membership',
            currency: currency || 'LKR',
            amount: parseFloat(amount).toFixed(2),
            custom_1: 'PAYMENT',
            hash
        };

        res.status(200).json({
            success: true,
            checkoutUrl: `${checkoutBaseUrl}/pay/checkout`,
            orderId,
            formData
        });

    } catch (err) {
        console.error('PayHere Initiation Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

/**
 * @desc    Handle PayHere Webhook (Notify)
 * @route   POST /api/payments/notify
 * @access  Public (called by PayHere servers)
 */
exports.payhereNotify = async (req, res) => {
    try {
        const merchantSecret = process.env.MERCHANT_SECRET;

        // Verify Signature
        if (!verifyPayhereSig(req.body, merchantSecret)) {
            console.error('❌ PayHere Signature Verification Failed');
            return res.status(400).send('Invalid signature');
        }

        const {
            order_id,
            payment_id,
            status_code,
            method,
            md5sig,
            customer_token,
            card_holder_name,
            card_expiry,
            card_number
        } = req.body;

        const payment = await Payment.findOne({ orderId: order_id });
        if (!payment) {
            console.error(`❌ Payment record not found for Order ID: ${order_id}`);
            return res.status(404).send('Payment not found');
        }

        payment.payherePaymentId = payment_id;
        payment.payhereStatusCode = parseInt(status_code);
        payment.payhereMd5Sig = md5sig;
        payment.transactionId = payment_id;

        if (status_code == '2') {
            payment.status = 'completed';
            payment.paidAt = new Date();
            console.log(`✅ Payment SUCCESS for Order: ${order_id}`);

            // Activate subscription if planId is stored on the payment
            if (payment.planId) {
                try {
                    await activateSubscription(payment.memberId, payment.planId);
                } catch (subErr) {
                    console.error('❌ Subscription activation failed:', subErr.message);
                }
            }

            // If a customer token was returned, save it for automated charging
            if (customer_token) {
                try {
                    const member = await Member.findById(payment.memberId);
                    if (member) {
                        // Extract card info if available
                        const last4 = card_number ? card_number.slice(-4) : '****';
                        const [expMonth, expYear] = card_expiry ? card_expiry.split('/') : [null, null];

                        // Add or update payment method
                        const existingMethodIndex = member.paymentMethods.findIndex(m => m.payhereCustomerToken === customer_token);

                        if (existingMethodIndex > -1) {
                            member.paymentMethods[existingMethodIndex].isDefault = true;
                        } else {
                            member.paymentMethods.push({
                                brand: method.toLowerCase().includes('visa') ? 'visa' : (method.toLowerCase().includes('master') ? 'mastercard' : 'visa'),
                                last4,
                                expiryMonth: expMonth ? parseInt(expMonth) : null,
                                expiryYear: expYear ? parseInt(expYear) : null,
                                payhereCustomerToken: customer_token,
                                isDefault: true
                            });
                        }

                        // Set others to not default
                        member.paymentMethods.forEach((m, idx) => {
                            if (m.payhereCustomerToken !== customer_token) m.isDefault = false;
                        });

                        await member.save();
                        console.log(`💳 Saved PayHere Customer Token for member ${payment.memberId}`);
                    }
                } catch (memberErr) {
                    console.error('❌ Failed to save customer token:', memberErr.message);
                }
            }
        } else if (status_code == '0') {
            payment.status = 'pending';
        } else if (status_code == '-1') {
            payment.status = 'cancelled';
        } else {
            payment.status = 'failed';
        }

        await payment.save();
        res.status(200).send('OK');

    } catch (err) {
        console.error('PayHere Notify Error:', err);
        res.status(500).send('Error');
    }
};

/**
 * @desc    Get Payment Status by Order ID
 * @route   GET /api/payments/status/:orderId
 * @access  Private
 */
exports.getPaymentStatus = async (req, res) => {
    try {
        const payment = await Payment.findOne({ orderId: req.params.orderId })
            .populate({
                path: 'memberId',
                populate: { path: 'userId', select: 'firstName lastName email' }
            });

        if (!payment) {
            return res.status(404).json({ success: false, error: 'Payment not found' });
        }

        // Optional: Cross-verify with PayHere Business API for added security
        let remoteStatus = null;
        try {
            remoteStatus = await payhereService.getPaymentDetails(req.params.orderId);
            if (remoteStatus && remoteStatus.status === 'RECEIVED' && payment.status !== 'completed') {
                // Self-heal: If PayHere says it's received but our DB says otherwise (missed webhook)
                payment.status = 'completed';
                payment.paidAt = new Date();
                payment.transactionId = remoteStatus.payment_id;
                await payment.save();

                // Trigger subscription activation if needed
                if (payment.planId) {
                    await activateSubscription(payment.memberId, payment.planId);
                }
            }
        } catch (apiErr) {
            console.warn('⚠️ Could not cross-verify with PayHere API:', apiErr.message);
        }

        res.status(200).json({
            success: true,
            payment,
            remoteStatus // Include for frontend debugging
        });
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
            orderId: `MAN-${Date.now()}-${memberId.toString().substring(0, 5)}`,
            description,
            planId,
            transactionId: transactionId || `TXN-${Date.now()}`,
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

        res.status(201).json({
            success: true,
            payment
        });

    } catch (err) {
        console.error('Admin Payment Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};
