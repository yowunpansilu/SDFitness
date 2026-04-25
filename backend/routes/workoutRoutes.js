const express = require('express');
const router = express.Router();
const {
    getWorkoutTemplates,
    logWorkout,
    getWorkoutHistory,
    getWorkoutStats,
    getWorkoutHistory30Days
} = require('../controllers/workoutController');

// Get all workout templates (with optional query filters)
router.get('/templates', getWorkoutTemplates);

// Log a new workout
router.post('/', logWorkout);

// Get 30-day workout history (for progress chart) — must be before /:id
router.get('/member/:id/history30', getWorkoutHistory30Days);

// Get workout history for a member
router.get('/member/:id', getWorkoutHistory);

// Get workout stats for a member
router.get('/member/:id/stats', getWorkoutStats);

module.exports = router;
