const MembershipPlan = require('../models/MembershipPlan');
const Subscription = require('../models/Subscription');

exports.getPlans = async (req, res) => { res.json({ message: 'Get plans' }); };
exports.createPlan = async (req, res) => { res.json({ message: 'Create plan' }); };
exports.getSubscriptions = async (req, res) => { res.json({ message: 'Get subscriptions' }); };
exports.createSubscription = async (req, res) => { res.json({ message: 'Create subscription' }); };
