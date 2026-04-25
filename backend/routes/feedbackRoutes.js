const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const { protect, requireRole } = require('../middleware/auth');

router.use(protect);

router.post('/', feedbackController.submitFeedback);
router.get('/my', feedbackController.getMyFeedback);

// Admin only routes
router.use(requireRole('admin'));
router.get('/', feedbackController.getAllFeedback);
router.put('/:id', feedbackController.updateFeedbackStatus);

module.exports = router;
