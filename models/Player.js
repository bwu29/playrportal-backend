const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  playerName: { type: String, required: true }, 
  birthYear: { type: Number },
  positions: { type: [String], default: [] },  // Array of strings
  citizenship: { type: [String], default: [] },  
  availability: { type: String },
  proExperience: { type: Number },
  profileImage: { data: Buffer, contentType: String }, // Store as Buffer with contentType
  playerCV: { data: Buffer, contentType: String, fileName: String }, // Store as Buffer with contentType and fileName
  highlightVideo: { type: String }, // Add this field
  fullMatchVideo: { type: String }, // Add this field
  email: { type: String },          // Add this field
  whatsapp: { type: String },       // Add this field
  agentEmail: { type: String }      // Add this field
});

module.exports = mongoose.model('Player', playerSchema);
