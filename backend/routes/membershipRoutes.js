const express = require('express');
const router = express.Router();
const membershipController = require('../controllers/membershipController');

router.get('/plans', membershipController.getPlans);
router.post('/plans', membershipController.createPlan);
router.put('/plans/:id', membershipController.updatePlan);
router.delete('/plans/:id', membershipController.deletePlan);
router.get('/subscriptions', membershipController.getSubscriptions);
router.post('/subscriptions', membershipController.createSubscription);

module.exports = router;
