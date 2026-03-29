const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const Notification = require('../models/Notification');

// GET messages (by conversationId query param)
exports.getMessages = async (req, res) => {
    try {
        const filter = {};
        if (req.query.conversationId) filter.conversation = req.query.conversationId;
        const messages = await Message.find(filter)
            .populate('sender', 'email firstName lastName')
            .sort({ createdAt: 1 })
            .limit(200);
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST send message
exports.sendMessage = async (req, res) => {
    try {
        const message = await Message.create({
            conversation: req.body.conversationId,
            sender: req.body.senderId,
            text: req.body.text
        });

        // Update last message on conversation
        await Conversation.findByIdAndUpdate(req.body.conversationId, {
            lastMessage: message._id
        });

        const populated = await message.populate('sender', 'email firstName lastName');
        res.status(201).json(populated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// GET conversations (for a user)
exports.getConversations = async (req, res) => {
    try {
        const filter = {};
        if (req.query.userId) filter.participants = req.query.userId;
        const conversations = await Conversation.find(filter)
            .populate('participants', 'email firstName lastName')
            .populate('lastMessage')
            .sort({ updatedAt: -1 });
        res.json(conversations);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET notifications (for a user)
exports.getNotifications = async (req, res) => {
    try {
        const filter = {};
        if (req.query.userId) filter.user = req.query.userId;
        const notifications = await Notification.find(filter)
            .sort({ createdAt: -1 })
            .limit(50);
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// PUT mark notification as read
exports.markNotificationRead = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { isRead: true },
            { new: true }
        );
        if (!notification) return res.status(404).json({ error: 'Notification not found' });
        res.json(notification);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// DELETE a notification by ID
exports.deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndDelete(req.params.id);
        if (!notification) return res.status(404).json({ error: 'Notification not found' });
        res.json({ message: 'Notification deleted successfully' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
