const faceapi = require('face-api.js');
const canvas = require('canvas');
const asyncHandler = require('express-async-handler');

// Initialize face-api.js
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

const initializeFaceApi = async () => {
  await Promise.all([
    faceapi.nets.faceRecognitionNet.loadFromDisk('./models'),
    faceapi.nets.faceLandmark68Net.loadFromDisk('./models'),
    faceapi.nets.ssdMobilenetv1.loadFromDisk('./models')
  ]);
  console.log('Face-api models loaded successfully');
};

const detectFaces = asyncHandler(async (req, res) => {
  const { imageUrl } = req.body;
  if (!imageUrl) {
    return res.status(400).json({ code: 1, status: 'error', message: 'Image URL is required' });
  }

  try {
    const img = await canvas.loadImage(imageUrl);
    const detections = await faceapi.detectAllFaces(img).withFaceLandmarks();
    res.json({
      code: 0,
      status: 'success',
      message: 'Faces detected successfully',
      data: detections
    });
  } catch (error) {
    console.error('Face detection error:', error);
    res.status(500).json({ code: 1, status: 'error', message: 'Face detection failed', error: error.message });
  }
});

const recognizeFaces = asyncHandler(async (req, res) => {
  const { imageUrl } = req.body;
  if (!imageUrl) {
    return res.status(400).json({ code: 1, status: 'error', message: 'Image URL is required' });
  }

  try {
    const img = await canvas.loadImage(imageUrl);
    const fullFaceDescriptions = await faceapi.detectAllFaces(img).withFaceLandmarks().withFaceDescriptors();
    res.json({
      code: 0,
      status: 'success',
      message: 'Faces recognized successfully',
      data: fullFaceDescriptions
    });
  } catch (error) {
    console.error('Face recognition error:', error);
    res.status(500).json({ code: 1, status: 'error', message: 'Face recognition failed', error: error.message });
  }
});

const matchFaces = asyncHandler(async (req, res) => {
  const { imageUrl1, imageUrl2 } = req.body;
  if (!imageUrl1 || !imageUrl2) {
    return res.status(400).json({ code: 1, status: 'error', message: 'Both image URLs are required' });
  }

  try {
    const img1 = await canvas.loadImage(imageUrl1);
    const img2 = await canvas.loadImage(imageUrl2);
    const detection1 = await faceapi.detectSingleFace(img1).withFaceLandmarks().withFaceDescriptor();
    const detection2 = await faceapi.detectSingleFace(img2).withFaceLandmarks().withFaceDescriptor();
    
    if (detection1 && detection2) {
      const distance = faceapi.euclideanDistance(detection1.descriptor, detection2.descriptor);
      res.json({
        code: 0,
        status: 'success',
        message: 'Face matching completed',
        data: { match: distance < 0.6, distance }
      });
    } else {
      res.status(400).json({ code: 1, status: 'error', message: 'Could not detect faces in both images' });
    }
  } catch (error) {
    console.error('Face matching error:', error);
    res.status(500).json({ code: 1, status: 'error', message: 'Face matching failed', error: error.message });
  }
});

module.exports = { initializeFaceApi, detectFaces, recognizeFaces, matchFaces };