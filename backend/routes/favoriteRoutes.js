// backend/routes/favoriteRoutes.js

const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const authenticate = require('../middleware/authenticate');

// 📥 Add a favorite city
router.post('/add', authenticate, favoriteController.addFavoriteCity);

// 📋 Get all favorite cities
router.get('/', authenticate, favoriteController.getFavoriteCities);

// ❌ Remove a city by name
router.delete('/:city', authenticate, favoriteController.removeFavoriteCity);

// ✅ Optional: Check if city is already favorited
router.get('/check', authenticate, favoriteController.checkIfCityIsFavorite);

module.exports = router;
