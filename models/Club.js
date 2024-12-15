const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true,
    unique: true
  },
  clubName: { type: String, default: '' },
  country: { type: String, default: '' },
  internationalRosterSpots: { type: Number, default: 0 },
  headCoach: { type: String, default: '' },
  sportingDirector: { type: String, default: '' },
  clubContactName: { type: String, default: '' },
  email: { type: String, default: '' },
  whatsapp: { type: String, default: '' },
  savedPlayers: [{
    playerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
    savedAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Club', clubSchema);
