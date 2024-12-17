const express = require('express');
const multer = require('multer');
const path = require('path');
const authMiddleware = require('../middleware/authMiddleware');
const Player = require('../models/Player');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "profileImage") {
      if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
        return cb(new Error('Only jpg, jpeg, and png files are allowed for profile pictures!'), false);
      }
    } else if (file.fieldname === "playerCV") {
      if (!file.originalname.match(/\.(pdf)$/)) {
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

    // Convert profileImage and playerCV to base64 strings
    if (playerProfile.profileImage && playerProfile.profileImage.data) {
      playerProfile.profileImage = playerProfile.profileImage.data.toString('base64');
    }
    if (playerProfile.playerCV && playerProfile.playerCV.data) {
      playerProfile.playerCV.data = playerProfile.playerCV.data.toString('base64');
    }

    res.status(200).json(playerProfile);
  } catch (err) {
    console.error('Error fetching profile:', err.message, err.stack);
    res.status(500).json({ error: err.message });
  }
});

// Update Player Profile
router.put('/profile', authMiddleware, uploadFields, async (req, res) => {
  const { playerName, birthYear, positions, citizenship, proExperience, highlightVideo, fullMatchVideo, email, whatsapp, agentEmail, availability } = req.body;
  const profileImage = req.files['profileImage'] ? {
    data: req.files['profileImage'][0].buffer,
    contentType: req.files['profileImage'][0].mimetype
  } : undefined;
  const playerCV = req.files['playerCV'] ? {
    data: req.files['playerCV'][0].buffer,
    contentType: req.files['playerCV'][0].mimetype,
    fileName: req.files['playerCV'][0].originalname
  } : undefined;

  try {
    const updatedProfile = await Player.findOneAndUpdate(
      { userId: req.user.id },
      { 
        playerName, 
        birthYear, 
        proExperience, 
        profileImage: profileImage !== undefined ? profileImage : null,
        playerCV: playerCV !== undefined ? playerCV : null,
        positions: positions ? JSON.parse(positions) : [],
        citizenship: citizenship ? JSON.parse(citizenship) : [],
        highlightVideo,
        fullMatchVideo,
        email,
        whatsapp,
        agentEmail,
        availability
      },
      { new: true, upsert: true, runValidators: true }
    );

    if (!updatedProfile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Convert profileImage and playerCV to base64 strings
    if (updatedProfile.profileImage && updatedProfile.profileImage.data) {
      updatedProfile.profileImage = updatedProfile.profileImage.data.toString('base64');
    }
    if (updatedProfile.playerCV && updatedProfile.playerCV.data) {
      updatedProfile.playerCV.data = updatedProfile.playerCV.data.toString('base64');
    }

    console.log('Updated Profile:', updatedProfile); // Log the updated profile for debugging

    res.status(200).json(updatedProfile); // Return updated profile data
  } catch (err) {
    console.error('Error updating profile:', err.message, err.stack);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
