// backend/controllers/favoriteController.js

const Favorite = require('../models/Favorite');

// ➕ Add a new favorite city
exports.addFavoriteCity = async (req, res) => {
  try {
    const { city, country, lat, lon } = req.body;
    const userId = req.user.id;

    // Check for duplicate
    const existing = await Favorite.findOne({ user: userId, city: city.trim() });
    if (existing) {
      return res.status(400).json({ error: "City already in favorites." });
    }

    const favorite = new Favorite({
      user: userId,
      city: city.trim(),
      country: country?.trim() || '',
      lat,
      lon
    });

    await favorite.save();
    res.status(201).json({ message: "City added to favorites", favorite });
  } catch (error) {
    console.error("Add favorite error:", error.message);
    res.status(500).json({ error: "Failed to add city" });
  }
};

// 📥 Get all favorites for a user
exports.getFavoriteCities = async (req, res) => {
  try {
    const userId = req.user.id;
    const favorites = await Favorite.find({ user: userId }).sort({ createdAt: -1 });
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

// ✅ (Optional) Check if city is already in favorites
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
