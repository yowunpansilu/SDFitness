const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/auth');
const membershipController = require('../controllers/membershipController');

// Plans - public read, protected write
router.get('/plans', membershipController.getPlans);
router.post('/plans', protect, membershipController.createPlan);
router.put('/plans/:id', protect, membershipController.updatePlan);
router.delete('/plans/:id', protect, membershipController.deletePlan);

// Subscriptions - always authenticated
router.get('/subscriptions', protect, membershipController.getSubscriptions);
router.post('/subscriptions', protect, membershipController.createSubscription);
router.put('/subscriptions/:id/status', protect, membershipController.updateSubscriptionStatus);

// Admin Subscription Management
router.get('/admin/upcoming-renewals', protect, requireRole('admin', 'manager'), membershipController.getUpcomingRenewals);
router.post('/admin/cancel-auto-renewal/:memberId', protect, requireRole('admin', 'manager'), membershipController.cancelAutoRenewal);

// Payment Methods
router.get('/payment-methods/:userId', protect, membershipController.getPaymentMethods);
router.post('/payment-methods', protect, membershipController.addPaymentMethod);
router.delete('/payment-methods/:userId/:methodId', protect, membershipController.deletePaymentMethod);
router.put('/payment-methods/:userId/:methodId/default', protect, membershipController.setDefaultPaymentMethod);

module.exports = router;
