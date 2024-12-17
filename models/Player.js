const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  playerName: { type: String, required: true }, // Changed to playerName
  birthYear: { type: Number },
  positions: { type: [String], default: [] },  // An array of strings
  citizenship: { type: [String], default: [] },  // An array of strings
  currentAvailability: { type: String },
  experience: { type: Number },
  profileImage: { type: String },
  playerCV: { type: String }
});

module.exports = mongoose.model('Player', playerSchema);
