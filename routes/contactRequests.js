const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const ContactRequest = require('../models/ContactRequest');
const Club = require('../models/Club');
const Player = require('../models/Player');

const router = express.Router();

// Create a new contact request
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { playerId } = req.body;
    const clubId = req.user.id;

    const club = await Club.findOne({ userId: clubId });
    const player = await Player.findById(playerId);

    if (!club || !player) {
      return res.status(404).json({ message: 'Club or Player not found' });
    }

    const newContactRequest = new ContactRequest({
      clubId,
      clubEmail: club.email,
      clubName: club.clubName,
      playerId,
      playerEmail: player.email,
      playerName: player.playerName
    });

    await newContactRequest.save();

    res.status(201).json({ message: 'Contact request submitted successfully' });
  } catch (err) {
    console.error('Error creating contact request:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;