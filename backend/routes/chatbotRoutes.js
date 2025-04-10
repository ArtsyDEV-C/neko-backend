const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const rateLimit = require("express-rate-limit");
const { handleChat, getScenarioAdvice, getChatHistory, clearHistory } = require("../controllers/chatbotController");
const authMiddleware = require("../middleware/authenticate");

// 🛡️ Rate limiter to prevent abuse
const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: "Too many requests. Please slow down.",
});

// 🤖 Main Chat Route (with optional auth and validation)
router.post(
  "/chat",
  authMiddleware.optional,
  chatLimiter,
  body("message").notEmpty().withMessage("Message is required"),
  handleChat // ✅ clean and direct
);

// 🌤️ Scenario-based advice (e.g., weather, alerts, risk)
router.get("/advice", getScenarioAdvice);

// 🧾 Get full chat history (requires login)
router.get("/history", authMiddleware.protect, getChatHistory);

// 🔥 Clear chat history
router.delete("/history", authMiddleware.protect, clearHistory);

module.exports = router;

