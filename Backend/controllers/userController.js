const User = require('../models/User');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Update profile picture
exports.updateProfilePic = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      // Delete the uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'Invalid file type. Only JPEG, PNG and GIF are allowed.' });
    }

    // Validate file size (2MB limit)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (req.file.size > maxSize) {
      // Delete the uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'File size too large. Maximum size is 2MB.' });
    }

    // Use either id or _id, whichever is available
    const userId = req.user._id || req.user.id;
    if (!userId) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'User ID not found' });
    }

    const user = await User.findById(userId);
    if (!user) {
      // Delete the uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: 'User not found' });
    }

    // If user already has a profile picture, delete it
    if (user.profilePic) {
      const oldPicPath = path.join(__dirname, '../uploads', user.profilePic);
      if (fs.existsSync(oldPicPath)) {
        fs.unlinkSync(oldPicPath);
      }
    }

    user.profilePic = req.file.filename;
    await user.save();

    // Return the complete user object without the password
    const updatedUser = await User.findById(userId).select('-password');

    res.json({
      success: true,
      message: 'Profile picture updated successfully',
      profilePic: user.profilePic,
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating profile picture:', error);
    // If there's an error, try to delete the uploaded file
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }
    res.status(500).json({ message: error.message });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id || req.user.id;

    if (!userId) {
      return res.status(400).json({ message: 'User ID not found' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Set the new password directly - the pre-save hook will handle hashing
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: error.message });
  }
}; 