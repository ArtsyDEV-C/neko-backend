const axios = require('axios');
const ChatHistory = require('../models/ChatHistory');
const { OpenAI_API_KEY, OPENWEATHER_API_KEY } = process.env;
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');

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
    return data ? { lat: data.lat, lon: data.lon } : null;
  } catch (err) {
    console.error("Geocoding error:", err.message);
    throw new Error("Unable to fetch location data.");
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
exports.getChatbotResponse = async (req, res) => {
  try {
    const userMessage = req.body.message;
    const user = req.user?._id || null;

    // Validate user message
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let weatherInfo = "";

    // Try extracting location from message (e.g., "in Chennai")
    const locationMatch = userMessage.match(/in ([a-zA-Z\s]+)/i);
    if (locationMatch) {
      const location = locationMatch[1].trim();
      const coords = await getCoordinatesFromLocation(location);
      if (coords) {
        weatherInfo = await getWeatherData(coords.lat, coords.lon);
      } else {
        weatherInfo = "Sorry, I couldn't recognize the location. Please try again with a valid city name.";
      }
    }

    // Build GPT prompt
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

    // Call OpenAI Chat Completion API
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

    // Save to DB only if user is logged in
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

// 📜 Get chat history (logged-in users only)
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

// Rate limiting middleware for API calls
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});

app.use("/api/", limiter);
