// backend/models/Favorite.js

const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  country: {
    type: String,
    trim: true,
    default: ''
  },
  lat: {
    type: Number,
    required: false // Optional – can be used to fetch weather faster
  },
  lon: {
    type: Number,
    required: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Favorite', favoriteSchema);
