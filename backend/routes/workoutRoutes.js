const express = require('express');
const router = express.Router();
const { getTemplates, logWorkout, getMemberHistory, getMemberStats } = require('../controllers/workoutController');

// GET all workout templates
router.get('/templates', getTemplates);

// POST log a workout
router.post('/', logWorkout);

// GET member workout history
router.get('/member/:id', getMemberHistory);

// GET member workout stats
router.get('/member/:id/stats', getMemberStats);

module.exports = router;
