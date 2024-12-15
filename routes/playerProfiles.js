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
    }
    cb(null, true);
  },
  limits: {
    fileSize: 100 * 1024 * 1024 // Set file size limit to 100MB
  }
});

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
router.put('/profile', authMiddleware, upload.single('profileImage'), async (req, res) => {
  const { name, birthYear, positions, citizenship, experience, profileImage } = req.body;

  try {
    const updatedProfile = await Player.findOneAndUpdate(
      { userId: req.user.id },
      { name, birthYear, positions, citizenship, experience, profileImage },
      { new: true }
    );

    res.status(200).json(updatedProfile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
