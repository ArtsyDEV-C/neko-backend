const axios = require('axios');
const ChatHistory = require('../models/ChatHistory');
const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');

const { OpenAI_API_KEY, OPENWEATHER_API_KEY } = process.env;

// 🌍 Convert location string to coordinates
async function getCoordinatesFromLocation(location) {
  const res = await axios.get("https://nominatim.openstreetmap.org/search", {
    params: {
      q: location,
      format: "json",
      limit: 1,
    },
  });
  const [data] = res.data;
  if (!data) throw new Error("Location not found.");
  return { lat: data.lat, lon: data.lon };
}

// ⛅ Get weather data from OpenWeather
async function getWeatherData(lat, lon) {
  const res = await axios.get("https://api.openweathermap.org/data/2.5/weather", {
    params: {
      lat,
      lon,
      units: "metric",
      appid: OPENWEATHER_API_KEY,
    },
  });

  const w = res.data;
  return `Weather in ${w.name}: ${w.main.temp}°C, ${w.weather[0].description}, Humidity: ${w.main.humidity}%, Wind: ${w.wind.speed} km/h.`;
}

// 🤖 Main chatbot response logic
async function handleChat(req, res) {
  try {
    const userMessage = req.body.message;
    const user = req.user?._id || null;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let weatherInfo = "";
    const locationMatch = userMessage.match(/(?:in|at|from)?\s*([A-Za-z\s]+)\s*(?:weather)?/i);
    if (locationMatch) {
      const location = locationMatch[1].trim();
      const coords = await getCoordinatesFromLocation(location);
      weatherInfo = await getWeatherData(coords.lat, coords.lon);
    }

    const messages = [
      {
        role: "system",
        content: "You are Neko, a helpful AI assistant specialized in weather guidance.",
      },
    ];

    if (weatherInfo) {
      messages.push({ role: "system", content: weatherInfo });
    }

    messages.push({ role: "user", content: userMessage });

    const gptRes = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages,
      },
      {
        headers: {
          Authorization: `Bearer ${OpenAI_API_KEY}`,
        },
      }
    );

    const reply = gptRes.data.choices[0].message.content;

    if (user) {
      await ChatHistory.create({ user, role: "user", message: userMessage });
      await ChatHistory.create({ user, role: "bot", message: reply });
    }

    return res.json({ reply });

  } catch (error) {
    console.error("Chatbot error:", error.message);
    return res.status(500).json({ reply: "Sorry, I couldn't process that." });
  }
}

// 📜 Get chat history
async function getChatHistory(req, res) {
  try {
    const messages = await ChatHistory.find({ user: req.user._id }).sort({ createdAt: 1 }).limit(100);
    return res.json(messages);
  } catch (error) {
    console.error("History fetch error:", error.message);
    return res.status(500).json({ error: "Failed to load chat history." });
  }
}

// 📦 Scenario-based advice
async function getScenarioAdvice(req, res) {
  try {
    const { weatherType, industry, severity, category } = req.body;

    if (!weatherType) {
      return res.status(400).json({ error: "weatherType is required." });
    }

    const filePath = path.join(__dirname, '..', 'data', 'weatherScenarios.json');
    const data = fs.readFileSync(filePath, 'utf-8');
    const scenarios = JSON.parse(data);

    const matches = scenarios.filter(entry =>
      entry.weatherType.toLowerCase() === weatherType.toLowerCase() &&
      (!industry || entry.industry.toLowerCase().includes(industry.toLowerCase())) &&
      (!severity || entry.severity.toLowerCase() === severity.toLowerCase()) &&
      (!category || entry.category.toLowerCase().includes(category.toLowerCase()))
    );

    if (matches.length === 0) {
      return res.status(404).json({ message: "No matching scenario advice found." });
    }

    return res.json({
      count: matches.length,
      results: matches.slice(0, 10)
    });

  } catch (err) {
    console.error("Scenario advice error:", err.message);
    return res.status(500).json({ error: "Failed to fetch scenario advice." });
  }
}

// 🧹 Clear chat history
async function clearHistory(req, res) {
  try {
    await ChatHistory.deleteMany({ user: req.user._id });
    return res.json({ success: true, message: "Chat history cleared." });
  } catch (error) {
    console.error("Clear history error:", error.message);
    return res.status(500).json({ error: "Failed to clear chat history." });
  }
}

module.exports = {
  handleChat,
  getChatHistory,
  getScenarioAdvice,
  clearHistory,
};

console.log("✅ chatbotController loaded");
