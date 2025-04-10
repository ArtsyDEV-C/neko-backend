const axios = require('axios');
const ChatHistory = require('../models/ChatHistory');
const { OpenAI_API_KEY, OPENWEATHER_API_KEY } = process.env;
const { validationResult } = require('express-validator');

// 🌍 Convert location string to coordinates
async function getCoordinatesFromLocation(location) {
  try {
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
  } catch (err) {
    console.error("Geocoding error:", err.message);
    throw new Error("Unable to fetch location data. Please check your location and try again.");
  }
}

// ⛅ Get weather data from OpenWeather
async function getWeatherData(lat, lon) {
  try {
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
  } catch (err) {
    console.error("Weather fetch error:", err.message);
    throw new Error("Unable to fetch weather data. Please try again later.");
  }
}

// 🤖 Get GPT response with optional weather context
async function getChatbotResponse(req, res) {
  try {
    const userMessage = req.body.message;
    const user = req.user?._id || null;

    // Input validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let weatherInfo = "";

    // Extract location (flexible regex like "in Chennai", "Chennai weather")
    const locationMatch = userMessage.match(/(?:in|at|from)?\s*([A-Za-z\s]+)\s*(?:weather)?/i);
    if (locationMatch) {
      const location = locationMatch[1].trim();
      const coords = await getCoordinatesFromLocation(location);
      if (coords) {
        weatherInfo = await getWeatherData(coords.lat, coords.lon);
      } else {
        weatherInfo = "Sorry, I couldn't recognize the location. Please try again with a valid city name.";
      }
    }

    // Prepare GPT prompt
    const messages = [
      {
        role: "system",
        content: "You are Neko, a smart, helpful AI assistant specialized in weather guidance. Always respond in a friendly and informative tone. Use weather data when available.",
      },
    ];

    if (weatherInfo) {
      messages.push({ role: "system", content: weatherInfo });
    }

    messages.push({ role: "user", content: userMessage });

    // Call OpenAI Chat API
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

    // Save to DB if user is logged in
    if (user) {
      await ChatHistory.create({ user, role: "user", message: userMessage });
      await ChatHistory.create({ user, role: "bot", message: reply });
    }

    return res.json({ reply });

  } catch (error) {
    console.error("Chatbot error:", error.message);
    return res.status(500).json({ reply: "Sorry, I couldn't process that. Please try again." });
  }
};

// 📜 Get chat history (only for logged-in users)
exports.getChatHistory = async (req, res) => {
  try {
    const messages = await ChatHistory.find({ user: req.user._id })
      .sort({ createdAt: 1 })
      .limit(100);
    return res.json(messages);
  } catch (error) {
    console.error("History fetch error:", error.message);
    return res.status(500).json({ error: "Failed to load chat history." });
  }
};

// 📦 Weather scenario-based advice from large dataset
const fs = require('fs');
const path = require('path');

// POST /api/scenario-advice
exports.getScenarioAdvice = async (req, res) => {
  try {
    const { weatherType, industry, severity, category } = req.body;

    if (!weatherType) {
      return res.status(400).json({ error: "weatherType is required." });
    }

    const filePath = path.join(__dirname, '..', 'data', 'weatherScenarios.json');
    const data = fs.readFileSync(filePath, 'utf-8');
    const scenarios = JSON.parse(data);

    // Filter based on query
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
      results: matches.slice(0, 10) // Return top 10 for performance
    });

  } catch (err) {
    console.error("Scenario advice error:", err.message);
    return res.status(500).json({ error: "Failed to fetch scenario advice." });
  }
};


// ✅ Final export block
module.exports = {
  getChatbotResponse,
  handleChat: getChatbotResponse,
  getChatHistory,
  getScenarioAdvice,
  clearHistory
};


