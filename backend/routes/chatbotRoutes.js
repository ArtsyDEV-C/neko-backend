const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');
const authenticate = require('../middleware/authenticate'); // 🔐 Auth protection
const rateLimit = require('express-rate-limit');

// ⏳ Rate limit for chatbot access
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100, // Limit each IP
  message: "Too many requests. Please try again later."
});

// 🌦️ Weather Impact Advice (ensure it's defined in the controller)
router.post('/api/scenario-advice', chatbotController.getScenarioAdvice);

// 🤖 Chatbot message (with rate limit)
router.post('/api/chatbot', limiter, chatbotController.getChatbotResponse);

// 💬 Save user messages to chat log (optional route)
router.post('/api/message', chatbotController.saveChatMessage);

// 📜 Chat history (auth protected)
router.get('/api/history', authenticate, chatbotController.getChatHistory);

module.exports = router;
