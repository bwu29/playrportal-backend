const mongoose = require('mongoose');

const contactRequestSchema = new mongoose.Schema({
  clubId: { type: mongoose.Schema.Types.ObjectId, ref: 'Club', required: true },
  clubEmail: { type: String, required: true },
  clubName: { type: String, required: false },
  playerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
  playerEmail: { type: String, required: false }, // Make playerEmail not required
  playerName: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ContactRequest', contactRequestSchema);
