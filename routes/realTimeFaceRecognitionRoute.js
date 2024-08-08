//routes/index.js
const express = require('express');
const realTimeFaceRecognitionController = require('../controllers/realTimeFaceRecognitionController');
const supabase = require('../config/supabase');

const router = express.Router();

// Initialize face-api when your app starts
realTimeFaceRecognitionController.initializeFaceApi();

// Set up routes
router.post('/real-time-recognition', realTimeFaceRecognitionController.faceVerificationHandler(supabase));

module.exports = router
