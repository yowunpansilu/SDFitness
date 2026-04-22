const express = require('express');
const router = express.Router();
const {
    submitDailyProgress,
    getDailyProgress,
    getWeeklyProgress,
    addBodyMeasurement,
    getBodyMeasurements
} = require('../controllers/progressController');
const { protect } = require('../middleware/auth');

router.use(protect); // All progress routes require auth

router.post('/daily', submitDailyProgress);
router.get('/daily', getDailyProgress);
router.get('/weekly', getWeeklyProgress);
router.post('/measurement', addBodyMeasurement);
router.get('/measurements', getBodyMeasurements);

module.exports = router;
