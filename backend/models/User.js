// filepath: backend/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String  // Optional if using Google OAuth only
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true  // Allows multiple users without Google ID
  },
  avatar: {
    type: String  // Can store base64 string or image URL
  },
  location: {
    type: String,
    default: ""   // Stores user's current detected city
  },
  favorites: [{
    type: String  // List of favorite city names (or IDs if needed)
  }],
  role: {
    type: String,
    default: 'user'  // You can also have 'admin' if needed later
  }
}, {
  timestamps: true  // Automatically adds createdAt and updatedAt
});

module.exports = mongoose.model('User', userSchema);
