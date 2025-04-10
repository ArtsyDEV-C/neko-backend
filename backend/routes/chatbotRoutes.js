const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const rateLimit = require("express-rate-limit");
const {
  handleChat,
  getScenarioAdvice,
  getChatHistory,
  clearHistory
} = require("../controllers/chatbotController");
const authMiddleware = require("../middleware/authenticate");

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: "Too many requests. Please slow down.",
});

router.post(
  "/chat",
  authMiddleware.optional,
  chatLimiter,
  body("message").notEmpty().withMessage("Message is required"),
  handleChat
);

router.get("/advice", getScenarioAdvice);
router.get("/history", authMiddleware.protect, getChatHistory);
router.delete("/history", authMiddleware.protect, clearHistory);

module.exports = router;
