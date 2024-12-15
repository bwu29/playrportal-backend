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
    const existingUser = await User.findOne({ 
      $or: [{ username }, { email }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: existingUser.username === username 
          ? 'Username already exists' 
          : 'Email already registered'
      });
    }

    const user = new User({ 
      username, 
      password, // Will be hashed by pre-save middleware
      email, 
      role: role || 'player' 
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '1h' }
    );

    // Set user in session
    req.session.user = {
      id: user._id,
      username: user.username,
      role: user.role
    };

    // Respond with user data
    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      },
      token
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '1h' }
    );

    req.session.user = {
      id: user._id,
      username: user.username,
      role: user.role
    };

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      },
      token
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
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
