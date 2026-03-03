const Equipment = require('../models/Equipment');

// GET all equipment
exports.getAllEquipment = async (req, res) => {
    try {
        const equipment = await Equipment.find().sort({ createdAt: -1 });
        res.json(equipment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET equipment by id
exports.getEquipmentById = async (req, res) => {
    try {
        const equipment = await Equipment.findById(req.params.id);
        if (!equipment) return res.status(404).json({ error: 'Equipment not found' });
        res.json(equipment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST create equipment
exports.createEquipment = async (req, res) => {
    try {
        const equipment = await Equipment.create(req.body);
        res.status(201).json(equipment);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// PUT update equipment
exports.updateEquipment = async (req, res) => {
    try {
        const equipment = await Equipment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!equipment) return res.status(404).json({ error: 'Equipment not found' });
        res.json(equipment);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// DELETE equipment
exports.deleteEquipment = async (req, res) => {
    try {
        const equipment = await Equipment.findByIdAndDelete(req.params.id);
        if (!equipment) return res.status(404).json({ error: 'Equipment not found' });
        res.json({ message: 'Equipment deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
