const cron = require('node-cron');
const Subscription = require('../models/Subscription');
const Member = require('../models/Member');
const MembershipPlan = require('../models/MembershipPlan');
const Payment = require('../models/Payment');
const payhereService = require('../services/payhereService');

/**
 * Task to process automated charging for subscriptions expiring soon
 */
const processAutomatedCharging = async () => {
    console.log('⏳ Running Automated Charging Task...');
    
    try {
        // Find subscriptions expiring in the next 3 days that are active
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
        
        const expiringSubs = await Subscription.find({
            status: 'active',
            endDate: { $lte: threeDaysFromNow, $gt: new Date() }
        }).populate('user').populate('plan');

        console.log(`🔍 Found ${expiringSubs.length} subscriptions expiring soon.`);

        for (const sub of expiringSubs) {
            try {
                // Find member profile to get saved payment method
                const member = await Member.findOne({ userId: sub.user._id });
                if (!member || !member.paymentMethods) continue;

                const defaultMethod = member.paymentMethods.find(m => m.isDefault && m.payhereCustomerToken);
                if (!defaultMethod) {
                    console.log(`ℹ️ No saved token for user ${sub.user.email}. Skipping automated charge.`);
                    continue;
                }

                console.log(`💳 Attempting automated charge for ${sub.user.email} (Plan: ${sub.plan.name})`);

                const orderId = `SDF_AUTO_${Date.now()}_${sub.user._id.toString().substring(19)}`;
                
                const chargeData = {
                    customerToken: defaultMethod.payhereCustomerToken,
                    orderId,
                    amount: sub.plan.price,
                    currency: 'LKR',
                    items: `Subscription Renewal - ${sub.plan.name}`
                };

                const result = await payhereService.chargeSubscription(chargeData);

                if (result.status === 1) {
                    console.log(`✅ Automated charge SUCCESS for ${sub.user.email}. Order: ${orderId}`);
                    
                    // Create payment record
                    const payment = new Payment({
                        memberId: member._id,
                        amount: sub.plan.price,
                        currency: 'LKR',
                        method: 'payhere',
                        status: 'completed',
                        orderId,
                        transactionId: result.data.payment_id,
                        description: `Automated Renewal: ${sub.plan.name}`,
                        planId: sub.plan._id,
                        isAutomated: true,
                        paidAt: new Date()
                    });
                    await payment.save();

                    // Extend subscription
                    const newEndDate = new Date(sub.endDate);
                    if (sub.plan.durationType === 'days') {
                        newEndDate.setDate(newEndDate.getDate() + sub.plan.duration);
                    } else {
                        newEndDate.setMonth(newEndDate.getMonth() + (sub.plan.duration || 1));
                    }
                    
                    sub.endDate = newEndDate;
                    await sub.save();
                    
                    console.log(`📅 Subscription extended to ${newEndDate.toDateString()}`);
                } else {
                    console.error(`❌ Automated charge FAILED for ${sub.user.email}:`, result.msg);
                }
            } catch (innerErr) {
                console.error(`❌ Error processing sub ${sub._id}:`, innerErr.message);
            }
        }
    } catch (err) {
        console.error('❌ Automated Charging Task Error:', err.message);
    }
};

// Run daily at 1:00 AM
cron.schedule('0 1 * * *', processAutomatedCharging);

// Export for manual trigger if needed
module.exports = { processAutomatedCharging };
