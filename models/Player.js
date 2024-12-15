const mongoose = require('mongoose');
const { POSITIONS, AVAILABILITY } = require('../constants/dropdownOptions');

const playerSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true
  },
  playerName: { type: String, default: '' },
  birthYear: { type: String, default: '' },
  positions: {
    type: [String],
    default: [],
    validate: {
      validator: function(v) {
        return !v.length || v.every(pos => POSITIONS.includes(pos));
      },
      message: 'Invalid position'
    }
  },
  citizenship: {
    type: [String],
    default: []
  },
  availability: {
    type: String,
    enum: [...AVAILABILITY, ''],
    default: ''
  },
  proExperience: { type: String, default: '' },
  highlightVideo: { type: String, default: '' },
  fullMatchVideo: { type: String, default: '' },
  email: { type: String, default: '' },
  whatsapp: { type: String, default: '' },
  agentEmail: { type: String, default: '' },
  profileImage: {
    data: Buffer,
    contentType: String,
    fileName: String
  },
  playerCV: {
    data: Buffer,
    contentType: String,
    fileName: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Player', playerSchema);
