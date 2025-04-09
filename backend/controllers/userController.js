const User = require('../models/User');
const bcrypt = require('bcryptjs');

// ✅ Get logged-in user's profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error while fetching profile' });
  }
};

// ✅ Update display name and avatar
exports.updateProfile = async (req, res) => {
  try {
    const { username, avatar } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { username, avatar },
      { new: true, runValidators: true }
    ).select('-password');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

// ✅ Change password (requires old password)
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword)
      return res.status(400).json({ error: 'Old and new password required' });

    const user = await User.findById(req.user.id);
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Old password is incorrect' });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Password update failed' });
  }
};
