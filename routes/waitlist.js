const express = require('express');
const router = express.Router();
const Waitlist = require('../models/Waitlist');

// Add email to waitlist
router.post('/', async (req, res) => {
  try {
    const { email } = req.body;
    const newEntry = new Waitlist({ email });
    await newEntry.save();
    res.status(201).json({ message: 'Email added to waitlist' });
  } catch (err) {
    console.error('Error adding email to waitlist:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
