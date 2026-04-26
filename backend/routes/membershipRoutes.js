const express = require('express');
const router = express.Router();
const membershipController = require('../controllers/membershipController');

router.get('/plans', membershipController.getPlans);
router.post('/plans', membershipController.createPlan);
router.put('/plans/:id', membershipController.updatePlan);
router.delete('/plans/:id', membershipController.deletePlan);
router.get('/subscriptions', membershipController.getSubscriptions);
router.post('/subscriptions', membershipController.createSubscription);
router.put('/subscriptions/:id/status', membershipController.updateSubscriptionStatus);

// Payment Methods
router.get('/payment-methods/:userId', membershipController.getPaymentMethods);
router.post('/payment-methods', membershipController.addPaymentMethod);
router.delete('/payment-methods/:userId/:methodId', membershipController.deletePaymentMethod);
router.put('/payment-methods/:userId/:methodId/default', membershipController.setDefaultPaymentMethod);

module.exports = router;
