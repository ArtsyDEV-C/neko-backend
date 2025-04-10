// backend/controllers/favoriteController.js

const Favorite = require('../models/Favorite');
const axios = require('axios');
const sendEmail = require('../utils/sendEmail');
const User = require('../models/User');

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

// ➕ Add a new favorite city
exports.addFavoriteCity = async (req, res) => {
  try {
    const { city, country, lat, lon } = req.body;
    const userId = req.user.id;

    const existing = await Favorite.findOne({ user: userId, city: city.trim() });
    if (existing) {
      return res.status(400).json({ error: "City already in favorites." });
    }

    const count = await Favorite.countDocuments({ user: userId });

    const favorite = new Favorite({
      user: userId,
      city: city.trim(),
      country: country?.trim() || '',
      lat,
      lon,
      order: count
    });

    await favorite.save();
    res.status(201).json({ message: "City added to favorites", favorite });
  } catch (error) {
    console.error("Add favorite error:", error.message);
    res.status(500).json({ error: "Failed to add city" });
  }
};

// 📥 Get all favorites for a user (ordered)
exports.getFavoriteCities = async (req, res) => {
  try {
    const userId = req.user.id;
    const favorites = await Favorite.find({ user: userId }).sort({ order: 1 });
    res.json(favorites);
  } catch (error) {
    console.error("Get favorites error:", error.message);
    res.status(500).json({ error: "Failed to fetch favorites" });
  }
};

// ❌ Remove city from favorites
exports.removeFavoriteCity = async (req, res) => {
  try {
    const userId = req.user.id;
    const city = req.params.city;

    const removed = await Favorite.findOneAndDelete({ user: userId, city });
    if (!removed) {
      return res.status(404).json({ error: "City not found in favorites" });
    }

    res.json({ message: "City removed", removed });
  } catch (error) {
    console.error("Remove favorite error:", error.message);
    res.status(500).json({ error: "Failed to remove city" });
  }
};

// ✅ Check if city is already in favorites
exports.checkIfCityIsFavorite = async (req, res) => {
  try {
    const { city } = req.query;
    const userId = req.user.id;

    const exists = await Favorite.findOne({ user: userId, city: city.trim() });
    res.json({ isFavorite: !!exists });
  } catch (error) {
    res.status(500).json({ error: "Error checking favorite" });
  }
};

// 🔄 Reorder favorite cities (drag & drop)
exports.reorderFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const { order } = req.body; // array of { city: string, index: number }

    for (const item of order) {
      await Favorite.findOneAndUpdate(
        { user: userId, city: item.city },
        { order: item.index }
      );
    }

    res.json({ message: "Favorites reordered successfully." });
  } catch (error) {
    console.error("Reorder error:", error.message);
    res.status(500).json({ error: "Failed to reorder favorites" });
  }
};

// 📧 Email Weather Alerts for Favorite Cities
exports.notifyFavoritesWeather = async (req, res) => {
  try {
    const user = req.user;
    const favorites = await Favorite.find({ user: user.id });

    if (!favorites || favorites.length === 0) {
      return res.status(400).json({ error: "No favorite cities to notify." });
    }

    const weatherResults = [];

    for (const fav of favorites) {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(fav.city)}&appid=${OPENWEATHER_API_KEY}&units=metric`;
      const response = await axios.get(url);
      const data = response.data;

      weatherResults.push({
        city: fav.city,
        temperature: `${data.main.temp}°C`,
        description: data.weather[0].description
      });
    }

    const weatherText = weatherResults.map(w =>
      `📍 ${w.city}\n🌡️ Temp: ${w.temperature}\n🌥️ ${w.description}`
    ).join('\n\n');

    const subject = `🌤️ Weather Update for Your Favorite Cities`;
    const text = `Hello ${user.username},\n\nHere's your current weather update:\n\n${weatherText}\n\nStay safe!\n- Neko Weather`;

    await sendEmail(user.email, subject, text);

    res.json({ message: "Weather notification sent!" });
  } catch (error) {
    console.error("Notify error:", error.message);
    res.status(500).json({ error: "Failed to send weather notification" });
  }
};

