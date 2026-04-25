const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/weight', progressController.addWeightLog);
router.get('/weight', progressController.getWeightLogs);
router.put('/weight/:id', progressController.updateWeightLog);
router.delete('/weight/:id', progressController.deleteWeightLog);

module.exports = router;
