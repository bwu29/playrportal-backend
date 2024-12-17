const express = require('express');
const multer = require('multer');
const authMiddleware = require('../middleware/authMiddleware');
const Player = require('../models/Player');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "profileImage") {
      const ext = file.originalname.toLowerCase().match(/\.(jpg|jpeg|png)$/);

      if (!ext) {
        console.error('Invalid file type for profile picture:', file.originalname);
        return cb(new Error('Only jpg, jpeg, and png files are allowed for profile pictures!'), false);
      }
    } else if (file.fieldname === "playerCV") {
      if (!file.originalname.toLowerCase().endsWith('.pdf')) {
        console.error('Invalid file type for CV:', file.originalname);
        return cb(new Error('Only pdf files are allowed for CV!'), false);
      }
    }
    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // Set file size limit to 5MB
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

    let profileImageBase64;
    let profileImageName;
    let playerCVBase64;
    let playerCVName;

    if (req.files && req.files['profileImage']) {
      const profileImageBuffer = req.files['profileImage'][0].buffer;
      profileImageBase64 = profileImageBuffer.toString('base64');
      profileImageName = req.files['profileImage'][0].originalname;
    }

    if (req.files && req.files['playerCV']) {
      const playerCVBuffer = req.files['playerCV'][0].buffer;
      playerCVBase64 = playerCVBuffer.toString('base64');
      playerCVName = req.files['playerCV'][0].originalname;
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

    if (profileImageBase64) {
      updateData.profileImage = profileImageBase64;
      updateData.profileImageName = profileImageName;
    }
    if (playerCVBase64) {
      updateData.playerCV = playerCVBase64;
      updateData.playerCVName = playerCVName;
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

module.exports = router;
