// filepath: backend/routes/chatbotRoutes.js
const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');

router.get('/history', chatbotController.getChatHistory);
router.post('/message', chatbotController.saveChatMessage);

module.exports = router;