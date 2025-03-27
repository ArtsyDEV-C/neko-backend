const axios = require('axios');
const fs = require('fs');
const path = require('path');
const ChatHistory = require('../models/ChatHistory');

// Load weatherScenarios.json
const scenariosPath = path.join(__dirname, '../data/weatherScenarios.json');
let scenarios = [];
try {
    const rawData = fs.readFileSync(scenariosPath);
    scenarios = JSON.parse(rawData);
} catch (err) {
    console.error("❌ Failed to load weatherScenarios.json:", err.message);
}

// Utility to match scenario based on request body
function matchScenario({ industry, category, severity, level, weatherType }) {
    return scenarios.find(s =>
        s.industry.toLowerCase() === industry.toLowerCase() &&
        s.category.toLowerCase() === category.toLowerCase() &&
        s.severity.toLowerCase() === severity.toLowerCase() &&
        s.level.toString() === level.toString() &&
        s.weatherType.toLowerCase() === weatherType.toLowerCase()
    );
}

// 🧠 Smart Scenario-Based Response
exports.getScenarioAdvice = (req, res) => {
    const { industry, category, severity, level, weatherType } = req.body;

    if (!industry || !category || !severity || !level || !weatherType) {
        return res.status(400).json({ error: "Missing required fields." });
    }

    const match = matchScenario({ industry, category, severity, level, weatherType });

    if (match) {
        return res.json({
            reply: `📍 *${industry} Alert* (${severity} - ${weatherType})
            
📌 *Scenario:* ${match.scenario}

💡 *Advice:* ${match.advice}

⚠️ Urgency: ${match.responseUrgency}
🧭 Risk Type: ${match.riskType}
👥 Groups: ${match.sensitiveGroups.join(', ')}
📍 Region: ${match.regionType}
✅ Source: ${match.sourceReliability}`
        });
    } else {
        return res.json({ reply: "⚠️ No matching scenario found. Try different inputs." });
    }
};

// 💬 OpenAI Chatbot Response (unchanged)
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

// 🗂️ Chat history endpoints
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
