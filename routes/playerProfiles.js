const express = require('express');
const multer = require('multer');
const path = require('path');
const authMiddleware = require('../middleware/authMiddleware');
const Player = require('../models/Player');
const { POSITIONS, AVAILABILITY, PRO_EXPERIENCE } = require('../constants/dropdownOptions');

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
        return cb(new Error('Only PDF files are allowed for CV!'), false);
      }
    }
    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

const router = express.Router();

// Debug route to test if the router is working
router.get('/test', (req, res) => {
  res.json({ message: 'Player profiles route is working' });
});

// Get Player Profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    let playerProfile = await Player.findOne({ userId: req.user.id });
    if (!playerProfile) {
      // Create empty profile if none exists
      playerProfile = new Player({ userId: req.user.id });
      await playerProfile.save();
    }
    res.status(200).json(playerProfile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get All Players (for club search)
router.get('/all', authMiddleware, async (req, res) => {
  console.log('Accessing /all route, user:', req.user);
  try {
    // Check if user is a club
    if (!req.user || req.user.role !== 'club') {
      return res.status(403).json({ 
        message: 'Access denied. Only clubs can view all players.',
        userRole: req.user?.role 
      });
    }

    const players = await Player.find({})
      .select('-__v -updatedAt')
      .populate('userId', 'username');

    console.log(`Found ${players.length} players`);
    
    res.status(200).json(players);
  } catch (err) {
    console.error('Error in /all route:', err);
    res.status(500).json({ 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// Update Player Profile
router.put('/profile', authMiddleware, upload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'playerCV', maxCount: 1 }
]), async (req, res) => {
  try {
    console.log('Update request received:', {
      files: req.files ? Object.keys(req.files) : 'no files'
    });

    let playerProfile = await Player.findOne({ userId: req.user.id });
    if (!playerProfile) {
      playerProfile = new Player({ userId: req.user.id });
    }

    // Handle file removal
    if (req.body.action === 'remove') {
      if (req.body.fileType === 'profileImage') {
        playerProfile.profileImage = null;
      } else if (req.body.fileType === 'playerCV') {
        playerProfile.playerCV = null;
      }
    } else {
      // Handle file updates
      if (req.files?.profileImage?.[0]) {
        playerProfile.profileImage = {
          data: req.files.profileImage[0].buffer,
          contentType: req.files.profileImage[0].mimetype,
          fileName: req.files.profileImage[0].originalname
        };
      }

      if (req.files?.playerCV?.[0]) {
        playerProfile.playerCV = {
          data: req.files.playerCV[0].buffer,
          contentType: req.files.playerCV[0].mimetype,
          fileName: req.files.playerCV[0].originalname
        };
      }
    }

    // Only update text fields if they are present
    if (Object.keys(req.body).length > 0) {
      const updateData = {
        playerName: req.body.playerName || playerProfile.playerName,
        birthYear: req.body.birthYear || playerProfile.birthYear,
        positions: req.body.positions ? JSON.parse(req.body.positions) : playerProfile.positions,
        citizenship: req.body.citizenship ? JSON.parse(req.body.citizenship) : playerProfile.citizenship,
        availability: req.body.availability || playerProfile.availability,
        proExperience: req.body.proExperience || playerProfile.proExperience,
        highlightVideo: req.body.highlightVideo || playerProfile.highlightVideo,
        fullMatchVideo: req.body.fullMatchVideo || playerProfile.fullMatchVideo,
        email: req.body.email || playerProfile.email,
        whatsapp: req.body.whatsapp || playerProfile.whatsapp,
        agentEmail: req.body.agentEmail || playerProfile.agentEmail
      };
      Object.assign(playerProfile, updateData);
    }

    await playerProfile.save();
    
    // Clean sensitive data from response
    const responseProfile = playerProfile.toObject();
    if (responseProfile.profileImage?.data) {
      delete responseProfile.profileImage.data;
    }
    if (responseProfile.playerCV?.data) {
      delete responseProfile.playerCV.data;
    }

    res.status(200).json(responseProfile);
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Add route to get profile image
router.get('/profile/image/:id', async (req, res) => {
  try {
    console.log('Fetching image for player:', req.params.id);
    const player = await Player.findById(req.params.id);
    
    if (!player?.profileImage?.data) {
      console.log('No image found for player:', req.params.id);
      return res.status(404).sendFile(path.join(__dirname, '../public/profilepic.jpg'));
    }

    res.set('Content-Type', player.profileImage.contentType);
    res.send(player.profileImage.data);
  } catch (err) {
    console.error('Error serving image:', err);
    res.status(500).json({ error: 'Error serving image' });
  }
});

// Add route to get CV
router.get('/profile/cv/:id', async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player?.playerCV?.data) {
      return res.status(404).send('No CV found');
    }
    res.set('Content-Type', player.playerCV.contentType);
    res.set('Content-Disposition', `attachment; filename="${player.playerCV.fileName}"`);
    res.send(player.playerCV.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
