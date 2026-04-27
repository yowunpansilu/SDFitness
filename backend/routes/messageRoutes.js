const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// @desc    Get all conversations for the current user
// @route   GET /api/messages/conversations
// @access  Private
router.get('/conversations', protect, async (req, res) => {
    try {
        let userId = req.user._id;

        // Allow admin to view conversations for a specific user
        if (req.query.userId && req.user.role === 'admin') {
            userId = req.query.userId;
        }

        // Find all unique users the current user has chatted with
        const messages = await Message.find({
            $or: [{ sender: userId }, { receiver: userId }]
        }).sort({ createdAt: -1 });

        const conversationMap = new Map();

        for (const msg of messages) {
            const otherUser = msg.sender.toString() === userId.toString() ? msg.receiver : msg.sender;
            const otherUserId = otherUser.toString();

            if (!conversationMap.has(otherUserId)) {
                conversationMap.set(otherUserId, {
                    otherUserId,
                    lastMessage: msg,
                    unreadCount: (msg.receiver.toString() === userId.toString() && !msg.read) ? 1 : 0
                });
            } else if (msg.receiver.toString() === userId.toString() && !msg.read) {
                conversationMap.get(otherUserId).unreadCount += 1;
            }
        }

        // Fetch user details for each conversation
        const results = await Promise.all(
            Array.from(conversationMap.values()).map(async (conv) => {
                const user = await User.findById(conv.otherUserId).select('firstName lastName role profilePhoto');
                return {
                    ...conv,
                    otherUser: user
                };
            })
        );

        res.json({ success: true, conversations: results });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// @desc    Get messages between current user and another user
// @route   GET /api/messages/:otherUserId
// @access  Private
router.get('/:otherUserId', protect, async (req, res) => {
    try {
        let userId = req.user._id;
        if (req.query.userId && req.user.role === 'admin') {
            userId = req.query.userId;
        }
        const otherUserId = req.params.otherUserId;

        const messages = await Message.find({
            $or: [
                { sender: userId, receiver: otherUserId },
                { sender: otherUserId, receiver: userId }
            ]
        }).sort({ createdAt: 1 });

        // Mark messages as read
        await Message.updateMany(
            { sender: otherUserId, receiver: userId, read: false },
            { $set: { read: true } }
        );

        res.json({ success: true, messages });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { receiverId, content, type = 'text', fileUrl, senderId } = req.body;

        if (!receiverId || !content) {
            return res.status(400).json({ success: false, error: 'Receiver and content are required' });
        }

        let finalSenderId = req.user._id;
        if (senderId && req.user.role === 'admin') {
            finalSenderId = senderId;
        }

        const message = await Message.create({
            sender: finalSenderId,
            receiver: receiverId,
            content,
            type,
            fileUrl
        });

        // Create notification for receiver
        const sender = await User.findById(finalSenderId);
        await Notification.create({
            user: receiverId,
            title: `New message from ${sender ? sender.firstName : 'User'}`,
            message: content.length > 50 ? content.substring(0, 50) + '...' : content,
            type: 'info',
            relatedId: finalSenderId
        });

        res.status(201).json({ success: true, message });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
