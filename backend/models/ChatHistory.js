// filepath: backend/models/ChatHistory.js
const mongoose = require('mongoose');

const ChatHistorySchema = new mongoose.Schema({
    message: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    role: {
        type: String,
        enum: ["user", "bot"],
        default: "user"
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('ChatHistory', ChatHistorySchema);