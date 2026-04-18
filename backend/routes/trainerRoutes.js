const express = require('express');
const router = express.Router();
const trainerController = require('../controllers/trainerController');
const { protect, requireRole } = require('../middleware/auth');

// Public endpoints
router.get('/', trainerController.getAllTrainers);
router.get('/:id', trainerController.getTrainerById);

// Admin-only management endpoints
router.post('/', protect, requireRole('admin'), trainerController.createTrainer);
router.put('/:id', protect, requireRole('admin'), trainerController.updateTrainer);
router.delete('/:id', protect, requireRole('admin'), trainerController.deleteTrainer);

module.exports = router;
