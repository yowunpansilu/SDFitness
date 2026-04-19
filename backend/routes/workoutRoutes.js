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

// AI Generation Routes (Admin)
// Ideally these would be protected by admin middleware in a real scenario
const { generateWorkout, getAdminWorkouts, approveWorkout, rejectWorkout, getMemberApprovedWorkouts } = require('../controllers/workoutController');

router.post('/admin/generate', generateWorkout);
router.get('/admin/list', getAdminWorkouts);
router.patch('/admin/:id/approve', approveWorkout);
router.patch('/admin/:id/reject', rejectWorkout);

// Member approved workouts
router.get('/member/:memberId/approved', getMemberApprovedWorkouts);

module.exports = router;
