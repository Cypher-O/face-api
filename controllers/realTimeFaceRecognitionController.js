// const faceapi = require('face-api.js');
// const canvas = require('canvas');
// const asyncHandler = require('express-async-handler');

// const { Canvas, Image, ImageData } = canvas;

// const initializeFaceApi = async () => {
//     await Promise.all([
//       faceapi.nets.faceRecognitionNet.loadFromDisk('./models'),
//       faceapi.nets.faceLandmark68Net.loadFromDisk('./models'),
//       faceapi.nets.ssdMobilenetv1.loadFromDisk('./models')
//     ]);
//     console.log('Face-api Real time face recognition models loaded successfully');
//   };
  
//   initializeFaceApi();
  
//   const verifyFace = async (imageBytes) => {
//     const img = await canvas.loadImage(Buffer.from(imageBytes, 'base64'));
//     const detection = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
//     return detection;
//   };
  
//   const faceVerificationHandler = (supabase) => asyncHandler(async (req, res) => {
//     const { imageBytes, step } = req.body;
//     if (!imageBytes || step === undefined) {
//       return res.status(400).json({ code: 1, status: 'error', message: 'Image bytes and step are required' });
//     }
  
//     const detection = await verifyFace(imageBytes);
  
//     if (detection) {
//       // Save detection data to Supabase or perform any other necessary operations
//       await supabase
//         .from('face_verification_steps')
//         .insert({ step, descriptor: detection.descriptor, created_at: new Date() });
  
//       res.json({ code: 0, status: 'success', message: 'Face detected', data: detection.descriptor });
//     } else {
//       res.status(400).json({ code: 1, status: 'error', message: 'No face detected' });
//     }
//   });
  
//   module.exports = { initializeFaceApi, faceVerificationHandler };



const faceapi = require('face-api.js');
const canvas = require('canvas');
const asyncHandler = require('express-async-handler');
const { Canvas, Image, ImageData } = canvas;

const initializeFaceApi = async () => {
  await Promise.all([
    faceapi.nets.faceRecognitionNet.loadFromDisk('./models'),
    faceapi.nets.faceLandmark68Net.loadFromDisk('./models'),
    faceapi.nets.ssdMobilenetv1.loadFromDisk('./models')
  ]);
  console.log('Face-api Real-time face recognition models loaded successfully');
};

const verifyApiKey = async (apiKey, supabase) => {
  const { data, error } = await supabase
    .from('api_keys')
    .select('*')
    .eq('key', apiKey)
    .single();

  if (error || !data) {
    return false;
  }
  return true;
};

const verifyFace = async (imageBytes) => {
  const img = await canvas.loadImage(Buffer.from(imageBytes, 'base64'));
  const detection = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
  return detection;
};

const getFacePositionGuidance = (detection) => {
  const { landmarks } = detection;
  const leftEye = landmarks.getLeftEye();
  const rightEye = landmarks.getRightEye();
  const nose = landmarks.getNose();

  let guidance = '';

  // Check if face is centered
  const faceCenter = (leftEye[0].x + rightEye[3].x) / 2;
  const imageCenter = detection.detection.imageWidth / 2;
  if (Math.abs(faceCenter - imageCenter) > detection.detection.imageWidth * 0.1) {
    guidance += faceCenter < imageCenter ? 'Move slightly to the right. ' : 'Move slightly to the left. ';
  }

  // Check if face is too close or too far
  const eyeDistance = Math.abs(leftEye[0].x - rightEye[3].x);
  const idealEyeDistance = detection.detection.imageWidth * 0.25;
  if (eyeDistance < idealEyeDistance * 0.8) {
    guidance += 'Move closer to the camera. ';
  } else if (eyeDistance > idealEyeDistance * 1.2) {
    guidance += 'Move further from the camera. ';
  }

  // Check if face is tilted
  const eyeAngle = Math.atan2(rightEye[3].y - leftEye[0].y, rightEye[3].x - leftEye[0].x);
  if (Math.abs(eyeAngle) > 0.1) {
    guidance += eyeAngle > 0 ? 'Tilt your head slightly to the left. ' : 'Tilt your head slightly to the right. ';
  }

  return guidance || 'Perfect position!';
};

const faceVerificationHandler = (supabase) => asyncHandler(async (req, res) => {
  const apiKey = req.header('X-API-Key');
  if (!apiKey || !(await verifyApiKey(apiKey, supabase))) {
    return res.status(403).json({ code: 2, status: 'error', message: 'Invalid or missing API key' });
  }

  const { imageBytes, step } = req.body;
  if (!imageBytes || step === undefined) {
    return res.status(400).json({ code: 1, status: 'error', message: 'Image bytes and step are required' });
  }

  const detection = await verifyFace(imageBytes);

  if (detection) {
    const guidance = getFacePositionGuidance(detection);
    
    // Save detection data to Supabase
    await supabase
      .from('face_verification_steps')
      .insert({ 
        step, 
        descriptor: detection.descriptor, 
        created_at: new Date(),
        api_key: apiKey
      });

    res.json({ 
      code: 0, 
      status: 'success', 
      message: 'Face detected', 
      data: {
        descriptor: detection.descriptor,
        guidance: guidance
      }
    });
  } else {
    res.status(400).json({ code: 1, status: 'error', message: 'No face detected' });
  }
});

module.exports = { initializeFaceApi, faceVerificationHandler };



// const faceapi = require('face-api.js');
// const canvas = require('canvas');
// const asyncHandler = require('express-async-handler');

// const { Canvas, Image, ImageData } = canvas;

// const initializeFaceApi = async () => {
//   await Promise.all([
//     faceapi.nets.faceRecognitionNet.loadFromDisk('./models'),
//     faceapi.nets.faceLandmark68Net.loadFromDisk('./models'),
//     faceapi.nets.ssdMobilenetv1.loadFromDisk('./models')
//   ]);
//   console.log('Face-api Real time face recognition models loaded successfully');
// };

// initializeFaceApi();

// const verifyApiKey = async (apiKey, supabase) => {
//   const { data, error } = await supabase
//     .from('api_keys')
//     .select('*')
//     .eq('key', apiKey)
//     .single();

//   if (error || !data) {
//     return false;
//   }
//   return true;
// };

// const verifyFace = async (imageBytes) => {
//   const img = await canvas.loadImage(Buffer.from(imageBytes, 'base64'));
//   const detection = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
//   return detection;
// };

// const getFacePositionGuidance = (detection) => {
//   const { landmarks } = detection;
//   const leftEye = landmarks.getLeftEye();
//   const rightEye = landmarks.getRightEye();
//   const nose = landmarks.getNose();

//   let guidance = '';

//   // Check if face is centered
//   const faceCenter = (leftEye[0].x + rightEye[3].x) / 2;
//   const imageCenter = detection.detection.imageWidth / 2;
//   if (Math.abs(faceCenter - imageCenter) > detection.detection.imageWidth * 0.1) {
//     guidance += faceCenter < imageCenter ? 'Move slightly to the right. ' : 'Move slightly to the left. ';
//   }

//   // Check if face is too close or too far
//   const eyeDistance = Math.abs(leftEye[0].x - rightEye[3].x);
//   const idealEyeDistance = detection.detection.imageWidth * 0.25;
//   if (eyeDistance < idealEyeDistance * 0.8) {
//     guidance += 'Move closer to the camera. ';
//   } else if (eyeDistance > idealEyeDistance * 1.2) {
//     guidance += 'Move further from the camera. ';
//   }

//   // Check if face is tilted
//   const eyeAngle = Math.atan2(rightEye[3].y - leftEye[0].y, rightEye[3].x - leftEye[0].x);
//   if (Math.abs(eyeAngle) > 0.1) {
//     guidance += eyeAngle > 0 ? 'Tilt your head slightly to the left. ' : 'Tilt your head slightly to the right. ';
//   }

//   return guidance || 'Perfect position!';
// };

// const faceVerificationHandler = (supabase) => asyncHandler(async (req, res) => {
//   const apiKey = req.header('X-API-Key');
//   if (!apiKey || !(await verifyApiKey(apiKey, supabase))) {
//     return res.status(403).json({ code: 2, status: 'error', message: 'Invalid or missing API key' });
//   }

//   const { imageBytes, step } = req.body;
//   if (!imageBytes || step === undefined) {
//     return res.status(400).json({ code: 1, status: 'error', message: 'Image bytes and step are required' });
//   }

//   const detection = await verifyFace(imageBytes);

//   if (detection) {
//     const guidance = getFacePositionGuidance(detection);
    
//     // Save detection data to Supabase
//     await supabase
//       .from('face_verification_steps')
//       .insert({ 
//         step, 
//         descriptor: detection.descriptor, 
//         created_at: new Date(),
//         api_key: apiKey
//       });

//     res.json({ 
//       code: 0, 
//       status: 'success', 
//       message: 'Face detected', 
//       data: {
//         descriptor: detection.descriptor,
//         guidance: guidance
//       }
//     });
//   } else {
//     res.status(400).json({ code: 1, status: 'error', message: 'No face detected' });
//   }
// });

// module.exports = { initializeFaceApi, faceVerificationHandler };