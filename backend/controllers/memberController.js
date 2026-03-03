const Member = require('../models/Member');

exports.getAllMembers = async (req, res) => { res.json({ message: 'Get all members' }); };
exports.getMemberById = async (req, res) => { res.json({ message: 'Get member by id' }); };
exports.createMember = async (req, res) => { res.json({ message: 'Create member' }); };
exports.updateMember = async (req, res) => { res.json({ message: 'Update member' }); };
exports.deleteMember = async (req, res) => { res.json({ message: 'Delete member' }); };
