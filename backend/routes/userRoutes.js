const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authenticate');
const userController = require('../controllers/userController');

router.get('/profile', protect, userController.getProfile);
router.put('/profile', protect, userController.updateProfile);
router.put('/change-password', protect, userController.changePassword);

module.exports = router;
