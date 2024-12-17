const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const { getGridFSBucket } = require('../db');  // Import the GridFS bucket getter
const authMiddleware = require('../middleware/authMiddleware');
const Player = require('../models/Player');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "profileImage") {
      if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
        console.error('Invalid file type for profile picture:', file.originalname);
        return cb(new Error('Only jpg, jpeg, and png files are allowed for profile pictures!'), false);
      }
    } else if (file.fieldname === "playerCV") {
      if (!file.originalname.match(/\.(pdf)$/)) {
        console.error('Invalid file type for CV:', file.originalname);
        return cb(new Error('Only pdf files are allowed for CV!'), false);
      }
    }
    cb(null, true);
  },
  limits: {
    fileSize: 100 * 1024 * 1024 // Set file size limit to 100MB
  }
});

const uploadFields = upload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'playerCV', maxCount: 1 }
]);

const router = express.Router();

// Get Player Profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const playerProfile = await Player.findOne({ userId: req.user.id });
    if (!playerProfile) return res.status(404).json({ message: 'Profile not found' });

    res.status(200).json(playerProfile);
  } catch (err) {
    console.error('Error fetching profile:', err.message, err.stack);
    res.status(500).json({ error: err.message });
  }
});

// Upload Files (Profile Image and CV) and Update Player Profile
router.put('/profile', authMiddleware, uploadFields, async (req, res) => {
  try {
    const { playerName, birthYear, positions, citizenship, proExperience, highlightVideo, fullMatchVideo, email, whatsapp, agentEmail, availability } = req.body;

    let profileImageId;
    let playerCVId;

    if (req.files && req.files['profileImage']) {
      const profileImageBuffer = req.files['profileImage'][0].buffer;
      const profileImageFilename = req.files['profileImage'][0].originalname;

      // Save the file to GridFS
      profileImageId = await saveFileToGridFS(profileImageBuffer, profileImageFilename);
    }

    if (req.files && req.files['playerCV']) {
      const playerCVBuffer = req.files['playerCV'][0].buffer;
      const playerCVFilename = req.files['playerCV'][0].originalname;

      // Save the file to GridFS
      playerCVId = await saveFileToGridFS(playerCVBuffer, playerCVFilename);
    }

    const updateData = {
      playerName,
      birthYear,
      proExperience,
      positions: positions ? JSON.parse(positions) : [],
      citizenship: citizenship ? JSON.parse(citizenship) : [],
      highlightVideo,
      fullMatchVideo,
      email,
      whatsapp,
      agentEmail,
      availability
    };

    if (profileImageId) {
      updateData.profileImage = profileImageId;
    }
    if (playerCVId) {
      updateData.playerCV = playerCVId;
    }

    const updatedProfile = await Player.findOneAndUpdate(
      { userId: req.user.id },
      updateData,
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json(updatedProfile);
  } catch (err) {
    console.error('Error updating profile:', err.message, err.stack);
    res.status(500).json({ error: err.message });
  }
});

const saveFileToGridFS = async (buffer, filename) => {
  return new Promise((resolve, reject) => {
    try {
      const gridFSBucket = getGridFSBucket();
      const uploadStream = gridFSBucket.openUploadStream(filename);
      uploadStream.end(buffer, (err, file) => {
        if (err) {
          console.error('Error saving file to GridFS:', err);
          reject(err);
        } else {
          console.log('File saved to GridFS:', file);
          if (file && file._id) {
            resolve(file._id);
          } else {
            reject(new Error('File object is invalid'));
          }
        }
      });
    } catch (err) {
      console.error('Error in saveFileToGridFS:', err.message, err.stack);
      reject(err);
    }
  });
};

module.exports = router;
