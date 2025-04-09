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
    required: false
  },
  lon: {
    type: Number,
    required: false
  },
  order: {
    type: Number,
    default: 0 // Used for sorting/reordering in frontend
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Favorite', favoriteSchema);
