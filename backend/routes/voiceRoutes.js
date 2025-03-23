const express = require('express');
const multer = require('multer');
const router = express.Router();
const voiceController = require('../controllers/voiceController');
const passport = require('passport');

const upload = multer({ dest: 'uploads/' });

// Protect the route with JWT middleware
router.post('/transcribe', passport.authenticate('jwt', { session: false }), upload.single('audio'), voiceController.transcribeAudio);

module.exports = router;