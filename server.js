const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');
const multer = require('multer'); // Ensure multer is imported
require('dotenv').config();

const authRoutes = require('./routes/auth');
const playerProfiles = require('./routes/playerProfiles');
const clubProfiles = require('./routes/clubProfiles');

const app = express();

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN.split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Handle preflight requests
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.status(200).send();
});

app.use(express.json()); // JSON parsing middleware

// Add session middleware and cookie-parser
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://brawu3:B%21%40XW3@playrportal.nmiuc.mongodb.net/playrportal?retryWrites=true&w=majority&appName=playrportal";
console.log("MONGO_URI:", MONGO_URI);

mongoose
    .connect(MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("MongoDB connected successfully"))
    .catch((error) => {
        console.error("MongoDB connection error:", error);
        process.exit(1); // Exit if the connection fails
    });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/playerProfiles', playerProfiles);
app.use('/api/clubProfiles', clubProfiles);

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'build')));

// The "catchall" handler: for any request that doesn't match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Add error handling middleware at the end
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err instanceof multer.MulterError) {
    // Handle Multer errors
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File size too large. Maximum size is 100MB.' });
    }
    return res.status(400).json({ message: err.message });
  }
  res.status(500).json({ message: 'Something went wrong!' });
});

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('CORS enabled for:', process.env.CORS_ORIGIN);
});


