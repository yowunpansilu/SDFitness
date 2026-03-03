const Trainer = require('../models/Trainer');

exports.getAllTrainers = async (req, res) => { res.json({ message: 'Get all trainers' }); };
exports.getTrainerById = async (req, res) => { res.json({ message: 'Get trainer by id' }); };
exports.createTrainer = async (req, res) => { res.json({ message: 'Create trainer' }); };
exports.updateTrainer = async (req, res) => { res.json({ message: 'Update trainer' }); };
exports.deleteTrainer = async (req, res) => { res.json({ message: 'Delete trainer' }); };
