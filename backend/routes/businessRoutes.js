// filepath: backend/routes/businessRoutes.js
const express = require('express');
const router = express.Router();
const businessController = require('../controllers/businessController');
const passport = require('passport');

// Protect the route with JWT middleware
router.get('/', passport.authenticate('jwt', { session: false }), businessController.getBusinessData);

module.exports = router;