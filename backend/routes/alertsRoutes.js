// filepath: backend/routes/alertsRoutes.js
const express = require('express');
const router = express.Router();
const alertsController = require('../controllers/alertsController');

router.post('/send-alert', alertsController.sendAlert);

module.exports = router;