const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: String,
  birthYear: Number,
  positions: Array,
  citizenship: String,
  currentAvailability: String,
  experience: Number,
  profileImage: String
});

module.exports = mongoose.model('Player', playerSchema);
