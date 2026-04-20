const express = require('express');
const router = express.Router();
const classController = require('../controllers/classController');
const { protect } = require('../middleware/auth');

router.delete('/:id', protect, classController.deleteBooking);

module.exports = router;
