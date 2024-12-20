const express = require('express');
const multer = require('multer');
const authMiddleware = require('../middleware/authMiddleware');
const Player = require('../models/Player');
const fs = require('fs');
const path = require('path');

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

// Get All Player Profiles
router.get('/all', authMiddleware, async (req, res) => {
  try {
    const players = await Player.find();
    res.status(200).json(players);
  } catch (err) {
    console.error('Error fetching all player profiles:', err.message, err.stack);
    res.status(500).json({ error: err.message });
  }
});

// Download Player CV
router.get('/profile/downloadCV', authMiddleware, async (req, res) => {
  try {
    const playerProfile = await Player.findOne({ userId: req.user.id });
    if (!playerProfile || !playerProfile.playerCV) {
      return res.status(404).json({ message: 'CV not found' });
    }

    const base64String = playerProfile.playerCV;
    const buffer = Buffer.from(base64String, 'base64');
    const filePath = path.join(__dirname, '../temp', 'playerCV.pdf');

    fs.writeFileSync(filePath, buffer);

    res.download(filePath, 'playerCV.pdf', (err) => {
      if (err) {
        console.error('Error downloading CV:', err);
      }
      fs.unlinkSync(filePath); // Delete the file after sending it to the client
    });
  } catch (err) {
    console.error('Error downloading CV:', err.message, err.stack);
    res.status(500).json({ error: err.message });
  }
});

// Upload Files (Profile Image and CV) and Update Player Profile
router.put('/profile', authMiddleware, uploadFields, async (req, res) => {
  try {
    console.log('req.files:', req.files); // Log req.files to verify it is populated
    console.log('req.body:', req.body); // Log req.body to verify it is populated

    const { playerName, birthYear, positions, citizenship, proExperience, highlightVideo, fullMatchVideo, email, whatsapp, agentEmail, availability } = req.body;

    let profileImageBase64 = null;
    let playerCVBase64 = null;

    if (req.files && req.files['profileImage']) {
      const profileImageBuffer = req.files['profileImage'][0].buffer;
      profileImageBase64 = profileImageBuffer.toString('base64');
    }

    if (req.files && req.files['playerCV']) {
      const playerCVBuffer = req.files['playerCV'][0].buffer;
      playerCVBase64 = playerCVBuffer.toString('base64');
    }

    const updateData = {
      playerName: playerName || "",
      birthYear: birthYear || null,
      proExperience: proExperience || null,
      positions: typeof positions === 'string' ? JSON.parse(positions) : positions || [],
      citizenship: typeof citizenship === 'string' ? JSON.parse(citizenship) : citizenship || [],
      highlightVideo: highlightVideo || "",
      fullMatchVideo: fullMatchVideo || "",
      email: email || "",
      whatsapp: whatsapp || "",
      agentEmail: agentEmail || "",
      availability: availability || "",
      ...(profileImageBase64 && { profileImage: profileImageBase64 }),
      ...(playerCVBase64 && { playerCV: playerCVBase64 })
    };

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
