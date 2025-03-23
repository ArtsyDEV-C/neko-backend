const express = require('express');
const router = express.Router();
const weatherController = require('../controllers/weatherController');
const passport = require('passport');

// Protect the route with JWT middleware
router.get('/', passport.authenticate('jwt', { session: false }), weatherController.getWeather);

module.exports = router;