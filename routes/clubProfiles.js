const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const Club = require('../models/Club');

const router = express.Router();

// Get Saved Players for Club
router.get('/savedPlayers', authMiddleware, async (req, res) => {
  try {
    const club = await Club.findOne({ userId: req.user.id });
    if (!club) return res.status(404).json({ message: 'Club not found' });

    res.status(200).json(club.savedPlayers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Club Profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    let clubProfile = await Club.findOne({ userId: req.user.id });
    if (!clubProfile) {
      // Create empty profile if none exists
      clubProfile = new Club({ userId: req.user.id });
      await clubProfile.save();
    }
    res.status(200).json(clubProfile);
  } catch (err) {
    console.error('Error fetching club profile:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update Club Profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    let clubProfile = await Club.findOne({ userId: req.user.id });
    
    const updateData = {
      clubName: req.body.clubName,
      country: req.body.country,
      internationalRosterSpots: req.body.internationalRosterSpots,
      headCoach: req.body.headCoach,
      sportingDirector: req.body.sportingDirector,
      clubContactName: req.body.clubContactName,
      email: req.body.email,
      whatsapp: req.body.whatsapp
    };

    if (!clubProfile) {
      clubProfile = new Club({
        userId: req.user.id,
        ...updateData
      });
    } else {
      Object.assign(clubProfile, updateData);
    }

    await clubProfile.save();
    res.status(200).json(clubProfile);
  } catch (err) {
    console.error('Error updating club profile:', err);
    res.status(500).json({ error: err.message });
  }
});

// Save/Unsave Players
router.post('/save-player/:playerId', authMiddleware, async (req, res) => {
  try {
    const clubProfile = await Club.findOne({ userId: req.user.id });
    if (!clubProfile) {
      return res.status(404).json({ message: 'Club profile not found' });
    }

    const alreadySaved = clubProfile.savedPlayers.some(
      player => player.playerId.toString() === req.params.playerId
    );

    if (!alreadySaved) {
      clubProfile.savedPlayers.push({ playerId: req.params.playerId });
      await clubProfile.save();
    }

    res.json(clubProfile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/unsave-player/:playerId', authMiddleware, async (req, res) => {
  try {
    const clubProfile = await Club.findOne({ userId: req.user.id });
    if (!clubProfile) {
      return res.status(404).json({ message: 'Club profile not found' });
    }

    clubProfile.savedPlayers = clubProfile.savedPlayers.filter(
      player => player.playerId.toString() !== req.params.playerId
    );
    
    await clubProfile.save();
    res.json(clubProfile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
