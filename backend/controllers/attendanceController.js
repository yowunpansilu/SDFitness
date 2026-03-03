const AttendanceRecord = require('../models/AttendanceRecord');

exports.getRecords = async (req, res) => { res.json({ message: 'Get attendance records' }); };
exports.checkIn = async (req, res) => { res.json({ message: 'Check in' }); };
exports.checkOut = async (req, res) => { res.json({ message: 'Check out' }); };
