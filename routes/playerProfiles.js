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

    res.status(200).json(playerProfile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Player Profile
router.put('/profile', authMiddleware, uploadFields, async (req, res) => {
  const { name, birthYear, positions, citizenship, experience } = req.body;
  const profileImage = req.files['profileImage'] ? req.files['profileImage'][0].buffer.toString('base64') : undefined;
  const playerCV = req.files['playerCV'] ? req.files['playerCV'][0].buffer.toString('base64') : undefined;

  try {
    const updatedProfile = await Player.findOneAndUpdate(
      { userId: req.user.id },
      { 
        name, 
        birthYear, 
        experience, 
        profileImage: profileImage || undefined,
        playerCV: playerCV || undefined,
        positions: positions ? JSON.parse(positions) : [],
        citizenship: citizenship ? JSON.parse(citizenship) : []
      },
      { new: true }
    );

    res.status(200).json(updatedProfile); // Return updated profile data
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
