const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');

// 🌦️ Weather Impact Advice (from weatherScenarios.json)
router.post('/api/scenario-advice', chatbotController.getScenarioAdvice);

// 🤖 OpenAI Chatbot message fetch (for typed chatbot prompt)
router.get('/api/chatbot', chatbotController.getChatbotResponse);

// 💬 Chat message saving (for history logs)
router.post('/api/message', chatbotController.saveChatMessage);

// 📜 Chat history log
router.get('/api/history', chatbotController.getChatHistory);

module.exports = router;
