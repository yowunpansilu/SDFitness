const express = require('express');
const router = express.Router();
const commController = require('../controllers/communicationController');

router.get('/conversations', commController.getConversations);
router.get('/messages', commController.getMessages);
router.post('/messages', commController.sendMessage);
router.get('/notifications', commController.getNotifications);
router.put('/notifications/:id/read', commController.markNotificationRead);

module.exports = router;
