const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Admin = require('../models/Admin');

const resolveUser = async (id) => {
    if (!id) return null;
    let u = await User.findById(id).select('email firstName lastName avatar role').lean();
    if (!u) {
        u = await Admin.findById(id).select('email firstName lastName avatar role').lean();
    }
    return u || { _id: id, firstName: 'Unknown', lastName: 'User', role: 'unknown' };
};

// GET available users for starting a new chat
exports.getAvailableUsers = async (req, res) => {
    try {
        let query = {};
        let users = [];
        let admins = [];

        if (req.user.role !== 'admin') {
            // Members and trainers can only message admins
            query.role = 'admin';
            users = await User.find(query).select('firstName lastName email avatar role').lean();
            admins = await Admin.find().select('firstName lastName email avatar role').lean();
        } else {
            // Admins can message anyone, but exclude themselves
            query._id = { $ne: req.user._id };
            users = await User.find(query).select('firstName lastName email avatar role').lean();
            admins = await Admin.find(query).select('firstName lastName email avatar role').lean();
        }

        res.json([...users, ...admins]);
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

        const result = conversation.toObject ? conversation.toObject() : conversation;
        result.participants = await Promise.all(
            (result.participants || []).map(async p => await resolveUser(p))
        );
        res.status(201).json(result);
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

        // Ensure user is a participant of the conversation
        const conversation = await Conversation.findById(req.query.conversationId);
        if (!conversation || !conversation.participants.some(p => p.equals(req.user._id))) {
            return res.status(403).json({ error: 'Not authorized for this conversation' });
        }

        const messages = await Message.find({ conversation: req.query.conversationId })
            .sort({ createdAt: 1 })
            .limit(200)
            .lean();

        for (let i = 0; i < messages.length; i++) {
            messages[i].sender = await resolveUser(messages[i].sender);
        }
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
        if (!conversation || !conversation.participants.some(p => p.equals(req.user._id))) {
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

        const msgObj = message.toObject ? message.toObject() : message;
        msgObj.sender = await resolveUser(msgObj.sender);

        // Emit socket event for real-time update
        const io = req.app.get('io');
        if (io) {
            io.to(conversationId.toString()).emit('new_message', {
                id: msgObj._id,
                conversationId: msgObj.conversation,
                senderId: msgObj.sender._id,
                content: msgObj.text,
                timestamp: msgObj.createdAt,
                read: msgObj.isRead,
                type: 'text'
            });
        }

        res.status(201).json(msgObj);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// GET conversations (for a user)
exports.getConversations = async (req, res) => {
    try {
        // Enforce fetching only the conversations the current user is part of
        const conversations = await Conversation.find({ participants: req.user._id })
            .populate('lastMessage')
            .sort({ updatedAt: -1 })
            .lean();

        for (let conv of conversations) {
            conv.participants = await Promise.all(
                (conv.participants || []).map(async p => await resolveUser(p))
            );
            if (conv.lastMessage && conv.lastMessage.sender) {
                conv.lastMessage.sender = await resolveUser(conv.lastMessage.sender);
            }
        }
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
