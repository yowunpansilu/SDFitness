const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const Notification = require('../models/Notification');

exports.getMessages = async (req, res) => { res.json({ message: 'Get messages' }); };
exports.sendMessage = async (req, res) => { res.json({ message: 'Send message' }); };
exports.getNotifications = async (req, res) => { res.json({ message: 'Get notifications' }); };
exports.markNotificationRead = async (req, res) => { res.json({ message: 'Read notification' }); };
