const mongoose = require('mongoose');
const sanitizeHtml = require('sanitize-html'); // Sanitize HTML to prevent XSS attacks

// Define the schema for ChatHistory
const ChatHistorySchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
    maxlength: 1000, // Optional: Limit message length to prevent large texts
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true, // Ensures each chat message is associated with a user
  },
  role: {
    type: String,
    enum: ['user', 'bot'],
    default: 'user', // Default to 'user' for user messages
  },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt fields
});

// Add index for better performance on queries (especially fetching chat history for a user)
ChatHistorySchema.index({ user: 1, createdAt: -1 });

// Pre-save hook to sanitize the message before saving
ChatHistorySchema.pre('save', function(next) {
  // Sanitize the message to avoid storing malicious HTML or script injections
  this.message = sanitizeHtml(this.message, {
    allowedTags: [],  // Allow no HTML tags
    allowedAttributes: {},  // Allow no attributes
  });
  next();
});

// Export the model based on the schema
module.exports = mongoose.model('ChatHistory', ChatHistorySchema);
