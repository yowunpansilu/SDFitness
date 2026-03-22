const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

router.get('/', attendanceController.getRecords);
router.post('/checkin', attendanceController.checkIn);
router.post('/checkout', attendanceController.checkOut);

module.exports = router;
