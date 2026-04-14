const express = require('express');
const router = express.Router();
const nutritionController = require('../controllers/nutritionController');

// @route   POST /api/nutrition
// @desc    Log a meal entry
router.post('/', nutritionController.logMeal);

// @route   GET /api/nutrition/member/:memberId/daily
// @desc    Get daily nutrition summary
router.get('/member/:memberId/daily', nutritionController.getDailySummary);

// @route   GET /api/nutrition/member/:memberId/history
// @desc    Get nutrition history
router.get('/member/:memberId/history', nutritionController.getHistory);

module.exports = router;
