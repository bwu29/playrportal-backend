const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session?.user) {
    return next();
  }
  // Return 401 without logging an error
  return res.status(401).json({ 
    message: 'Session expired or user not authenticated',
    isAuthenticated: false 
  });
};

// Register User (Player or Club)
router.post('/register', async (req, res) => {
  const { username, password, email, role } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword, email, role });

    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login User
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    // Set session data
    req.session.user = {
      id: user._id,
      username: user.username,
      role: user.role
    };
    
    res.json({ 
      user: req.session.user,
      isAuthenticated: true 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user details
router.get('/user', isAuthenticated, (req, res) => {
  res.json(req.session.user);
});

router.post('/logout', (req, res) => {
  req.session.destroy();
  res.clearCookie('connect.sid');
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
