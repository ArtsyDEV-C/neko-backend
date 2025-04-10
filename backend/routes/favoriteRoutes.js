// backend/routes/favoriteRoutes.js

const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const { protect } = require('../middleware/authenticate');

// 📥 Add a favorite city
router.post('/add',  protect , favoriteController.addFavoriteCity);

// 📋 Get all favorite cities
router.get('/',  protect , favoriteController.getFavoriteCities);

// ❌ Remove a city by name
router.delete('/:city',  protect , favoriteController.removeFavoriteCity);

// ✅ Optional: Check if city is already favorited
router.get('/check',  protect , favoriteController.checkIfCityIsFavorite);

// 🔄 Reorder cities by drag & drop
router.post('/reorder',  protect , favoriteController.reorderFavorites);

// 📧 Notify user about weather updates for favorite cities
router.post('/notify',  protect , favoriteController.notifyFavoritesWeather);

module.exports = router;
