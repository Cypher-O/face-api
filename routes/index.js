//routes/index.js
const express = require('express');
const faceRecognitionController = require('../controllers/faceRecognitionController');
const supabase = require('../config/supabase');

const router = express.Router();

// Initialize face-api when your app starts
faceRecognitionController.initializeFaceApi();

// Set up routes
router.post('/detect', faceRecognitionController.detectFaces(supabase));
router.post('/recognize', faceRecognitionController.recognizeFaces(supabase));
router.post('/match', faceRecognitionController.matchFaces(supabase));

// router.post('/register', faceRecognitionController.register(supabase));
// router.post('/login', faceRecognitionController.login(supabase));

module.exports = router
