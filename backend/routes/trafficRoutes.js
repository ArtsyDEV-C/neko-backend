const express = require('express');
const router = express.Router();
const trafficController = require('../controllers/trafficController');
const passport = require('passport');

// Protect the route with JWT middleware
router.get('/', passport.authenticate('jwt', { session: false }), trafficController.getTrafficData);

module.exports = router;