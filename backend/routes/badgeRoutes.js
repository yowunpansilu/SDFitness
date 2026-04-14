const express = require('express');
const router = express.Router();
const badgeController = require('../controllers/badgeController');

// @route   GET /api/badges
// @desc    Get all available badges
router.get('/', badgeController.getAvailableBadges);

// @route   GET /api/badges/member/:memberId
// @desc    Get earned badges for a member
router.get('/member/:memberId', badgeController.getMemberBadges);

// @route   POST /api/badges/seed
// @desc    Seed initial badges
router.post('/seed', badgeController.seedBadges);

module.exports = router;
