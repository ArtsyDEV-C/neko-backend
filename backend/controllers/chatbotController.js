// filepath: backend/controllers/chatbotController.js
const axios = require('axios');
const ChatHistory = require('../models/ChatHistory');

exports.getChatHistory = async (req, res) => {
    try {
        const history = await ChatHistory.find().limit(100).sort({ createdAt: -1 });
        res.json(history);
    } catch (error) {
        console.error("Chat history fetch error:", error.message);
        res.status(500).json({ error: 'Failed to fetch chat history' });
    }
};

exports.saveChatMessage = async (req, res) => {
    const { message, user } = req.body;
    if (!message || !user) {
        return res.status(400).json({ error: "Message and user are required." });
    }

    try {
        const newMessage = new ChatHistory({ message, user });
        await newMessage.save();
        res.status(201).json({ message: 'Message saved successfully' });
    } catch (error) {
        console.error("Chat save error:", error.message);
        res.status(500).json({ error: 'Failed to save message' });
    }
};

exports.getChatbotResponse = async (req, res) => {
    const { message } = req.query;
    if (!message) {
        return res.status(400).json({ error: "Prompt message is required." });
    }

    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: message }],
            max_tokens: 150
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            }
        });

        res.json({ response: response.data.choices[0].message.content });
    } catch (error) {
        console.error("OpenAI Chatbot error:", error.message);
        res.status(500).json({ error: 'Failed to get chatbot response' });
    }
};