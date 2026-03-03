const Class = require('../models/Class');

exports.getAllClasses = async (req, res) => { res.json({ message: 'Get all classes' }); };
exports.getClassById = async (req, res) => { res.json({ message: 'Get class by id' }); };
exports.createClass = async (req, res) => { res.json({ message: 'Create class' }); };
exports.updateClass = async (req, res) => { res.json({ message: 'Update class' }); };
exports.deleteClass = async (req, res) => { res.json({ message: 'Delete class' }); };
