const Class = require('../models/Class');

// GET all classes
exports.getAllClasses = async (req, res) => {
    try {
        const classes = await Class.find()
            .populate('trainer')
            .sort({ createdAt: -1 });
        res.json(classes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET class by id
exports.getClassById = async (req, res) => {
    try {
        const gymClass = await Class.findById(req.params.id)
            .populate('trainer');
        if (!gymClass) return res.status(404).json({ error: 'Class not found' });
        res.json(gymClass);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST create class
exports.createClass = async (req, res) => {
    try {
        const gymClass = await Class.create(req.body);
        res.status(201).json(gymClass);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// PUT update class
exports.updateClass = async (req, res) => {
    try {
        const gymClass = await Class.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
            .populate('trainer');
        if (!gymClass) return res.status(404).json({ error: 'Class not found' });
        res.json(gymClass);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// DELETE class
exports.deleteClass = async (req, res) => {
    try {
        const gymClass = await Class.findByIdAndDelete(req.params.id);
        if (!gymClass) return res.status(404).json({ error: 'Class not found' });
        res.json({ message: 'Class deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
