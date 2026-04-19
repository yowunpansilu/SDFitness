const express = require('express');
const router = express.Router();
const commController = require('../controllers/communicationController');
const { protect } = require('../middleware/auth');

router.use(protect); // Secure all communication routes

router.get('/available-users', commController.getAvailableUsers);

router.get('/conversations', commController.getConversations);
router.post('/conversations', commController.createConversation);

router.get('/messages', commController.getMessages);
router.post('/messages', commController.sendMessage);

router.get('/notifications', commController.getNotifications);
router.put('/notifications/:id/read', commController.markNotificationRead);
router.delete('/notifications/:id', commController.deleteNotification);

module.exports = router;
