const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['Citizen', 'GOV'],
    default: 'Citizen',
  },
  profileDetails: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  profilePicture: {
    type: String,   // stored as base64 data-URI or a URL
    default: '',
  },
}, {
  timestamps: true, // auto adds createdAt and updatedAt
});

module.exports = mongoose.model('User', userSchema);
