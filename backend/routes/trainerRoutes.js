const express = require('express');
const router = express.Router();
const trainerController = require('../controllers/trainerController');

router.get('/', trainerController.getAllTrainers);
router.get('/:id', trainerController.getTrainerById);
router.post('/', trainerController.createTrainer);
router.put('/:id', trainerController.updateTrainer);
router.delete('/:id', trainerController.deleteTrainer);

module.exports = router;
