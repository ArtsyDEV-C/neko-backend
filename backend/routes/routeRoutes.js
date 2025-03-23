// filepath: backend/routes/routeRoutes.js
const express = require('express');
const router = express.Router();
const routeController = require('../controllers/routeController');
const passport = require('passport');

// Protect the routes with JWT middleware
router.get('/', passport.authenticate('jwt', { session: false }), routeController.getRoutes);
router.post('/route', passport.authenticate('jwt', { session: false }), routeController.getRoute);

module.exports = router;