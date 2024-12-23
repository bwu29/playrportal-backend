const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const Club = require('../models/Club');

const router = express.Router();

// Get Saved Players for Club
router.get('/savedPlayers', authMiddleware, async (req, res) => {
  try {
    console.log('Fetching saved players for user:', req.user.id); // Debug log
    const club = await Club.findOne({ userId: req.user.id }).populate('savedPlayers.playerId');
    if (!club) {
      console.log('Club not found for user:', req.user.id); // Debug log
      return res.status(404).json({ message: 'Club not found' });
    }

    console.log('Saved players:', club.savedPlayers); // Debug log
    res.status(200).json(club.savedPlayers.map(savedPlayer => savedPlayer.playerId));
  } catch (err) {
    console.error('Error fetching saved players:', err); // Debug log
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

// Save Player
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

// Unsave Player
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
