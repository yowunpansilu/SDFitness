const express = require('express');
const router = express.Router();
const {
    submitFeedback,
    getMyFeedback,
    getAllFeedback,
    getFeedbackById,
    updateFeedbackStatus,
    addAdminNotes
} = require('../controllers/feedbackController');
const { protect, requireRole } = require('../middleware/auth');

router.use(protect); // All feedback routes require auth

// Member routes
router.post('/', submitFeedback);
router.post('/bug', submitFeedback); // Reusing the same for now, or separate if needed
router.get('/mine', getMyFeedback);
router.get('/my', getMyFeedback);

// Admin routes
router.get('/', requireRole('admin'), getAllFeedback);
router.get('/:id', requireRole('admin'), getFeedbackById);
router.patch('/:id/status', requireRole('admin'), updateFeedbackStatus);
router.patch('/:id/notes', requireRole('admin'), addAdminNotes);

module.exports = router;
