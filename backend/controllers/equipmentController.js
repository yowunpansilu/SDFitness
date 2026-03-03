const Equipment = require('../models/Equipment');

exports.getAllEquipment = async (req, res) => { res.json({ message: 'Get all equipment' }); };
exports.getEquipmentById = async (req, res) => { res.json({ message: 'Get equipment by id' }); };
exports.createEquipment = async (req, res) => { res.json({ message: 'Create equipment' }); };
exports.updateEquipment = async (req, res) => { res.json({ message: 'Update equipment' }); };
exports.deleteEquipment = async (req, res) => { res.json({ message: 'Delete equipment' }); };
