const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const rateLimit = require("express-rate-limit");
const chatbotController = require("../controllers/chatbotController");
const authMiddleware = require("../middleware/authenticate");

// 🛡️ Rate limiter to prevent abuse
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: "Too many requests. Please slow down.",
});

// 🤖 Chat route
router.post(
  "/chat",
  authMiddleware.optional,
  chatLimiter,
  body("message").notEmpty().withMessage("Message is required"),
  chatbotController.handleChat
);

// 🌤️ Scenario-based advice
router.get("/advice", chatbotController.getScenarioAdvice);

// 🧾 Full chat history
router.get("/history", authMiddleware.protect, chatbotController.getChatHistory);

// 🔥 Clear chat history
router.delete("/history", authMiddleware.protect, chatbotController.clearHistory);

module.exports = router;

