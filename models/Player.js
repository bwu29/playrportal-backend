const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  playerName: { type: String }, // Remove required constraint
  birthYear: { type: Number },
  positions: { type: [String], default: [] },  // Array of strings
  citizenship: { type: [String], default: [] },  
  availability: { type: String },
  proExperience: { type: String }, // Change to string
  profileImage: { type: String }, // Store as Base64 encoded string
  playerCV: { type: String }, // Store as Base64 encoded string
  highlightVideo: { type: String }, // Store as Base64 encoded string
  fullMatchVideo: { type: String }, // Store as Base64 encoded string
  email: { type: String },          // Add this field
  whatsapp: { type: String },       // Add this field
  agentEmail: { type: String }      // Add this field
});

module.exports = mongoose.model('Player', playerSchema);
