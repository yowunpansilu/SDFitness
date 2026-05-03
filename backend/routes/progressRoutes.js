const express = require('express');
const router = express.Router();
const {
    submitDailyProgress,
    getDailyProgress,
    toggleDailyProgress,
    getWeeklyProgress,
    addBodyMeasurement,
    getBodyMeasurements
} = require('../controllers/progressController');
const { protect } = require('../middleware/auth');

router.use(protect); // All progress routes require auth

router.post('/daily', submitDailyProgress);
router.post('/daily/toggle', toggleDailyProgress);
router.get('/daily/:date', getDailyProgress);
router.get('/daily', getDailyProgress);
router.get('/weekly', getWeeklyProgress);
router.post('/measurement', addBodyMeasurement);
router.get('/measurements', getBodyMeasurements);

module.exports = router;
