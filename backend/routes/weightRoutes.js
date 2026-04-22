const express = require('express');
const router = express.Router();
const {
    addWeightLog,
    getWeightHistory,
    deleteWeightLog,
    setWeightGoal,
    getActiveGoal
} = require('../controllers/weightController');
const { protect } = require('../middleware/auth');

router.use(protect); // All weight routes require auth

router.post('/', addWeightLog);
router.get('/history', getWeightHistory);
router.delete('/:id', deleteWeightLog);
router.post('/goal', setWeightGoal);
router.get('/goal/active', getActiveGoal);

module.exports = router;
