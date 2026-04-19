const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const Notification = require('../models/Notification');
const User = require('../models/User');

// GET available users for starting a new chat
exports.getAvailableUsers = async (req, res) => {
    try {
        let query = {};
        if (req.user.role !== 'admin') {
            // Members and trainers can only message admins
            query.role = 'admin';
        } else {
            // Admins can message anyone, but exclude themselves
            query._id = { $ne: req.user._id };
        }

        const users = await User.find(query).select('firstName lastName email avatar role');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST create a conversation
exports.createConversation = async (req, res) => {
    try {
        const { targetUserId } = req.body;
        if (!targetUserId) {
            return res.status(400).json({ error: 'targetUserId is required' });
        }

        const targetUser = await User.findById(targetUserId);
        if (!targetUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Restrict usage: member/trainer can only message admin
        if (req.user.role !== 'admin' && targetUser.role !== 'admin') {
            return res.status(403).json({ error: 'You can only message admins' });
        }

        // Check if a conversation already exists between the two
        let conversation = await Conversation.findOne({
            participants: { $all: [req.user._id, targetUserId] }
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [req.user._id, targetUserId]
            });
        }

        const populated = await conversation.populate('participants', 'email firstName lastName avatar role');
        res.status(201).json(populated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// GET messages (by conversationId query param)
exports.getMessages = async (req, res) => {
    try {
        if (!req.query.conversationId) {
            return res.status(400).json({ error: 'conversationId is required' });
        }

        // Optional: Ensure user is a participant of the conversation
        const conversation = await Conversation.findById(req.query.conversationId);
        if (!conversation || !conversation.participants.includes(req.user._id)) {
            return res.status(403).json({ error: 'Not authorized for this conversation' });
        }

        const messages = await Message.find({ conversation: req.query.conversationId })
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
        const { conversationId, text } = req.body;
        if (!conversationId || !text) {
            return res.status(400).json({ error: 'conversationId and text are required' });
        }

        const conversation = await Conversation.findById(conversationId);
        if (!conversation || !conversation.participants.includes(req.user._id)) {
            return res.status(403).json({ error: 'Not authorized for this conversation' });
        }

        const message = await Message.create({
            conversation: conversationId,
            sender: req.user._id,
            text
        });

        // Update last message on conversation
        await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: message._id
        });

        const populated = await message.populate('sender', 'email firstName lastName avatar role');

        // Emit socket event for real-time update
        const io = req.app.get('io');
        if (io) {
            io.to(conversationId.toString()).emit('new_message', {
                id: populated._id,
                conversationId: populated.conversation,
                senderId: populated.sender._id,
                content: populated.text,
                timestamp: populated.createdAt,
                read: populated.isRead,
                type: 'text'
            });
        }

        res.status(201).json(populated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// GET conversations (for a user)
exports.getConversations = async (req, res) => {
    try {
        // Enforce fetching only the conversations the current user is part of
        const conversations = await Conversation.find({ participants: req.user._id })
            .populate('participants', 'email firstName lastName avatar role')
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
