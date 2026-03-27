import { User } from '../models/user-model.js';
import CollaborationRequest from '../models/CollaborationRequest.js';
import bcrypt from 'bcryptjs';

// @desc    Get all users (with optional filtering by role)
// @route   GET /api/users
// @access  Private
// Add this helper at the top or in a utils file
const checkOnlineStatus = (lastActive) => {
  if (!lastActive) return false;
  const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
  return lastActive > twoMinutesAgo;
};

export const getUsers = async (req, res) => {
  try {
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    
    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    
    // Map through users to inject the real-time online boolean
    const usersWithStatus = users.map(user => {
      const userObj = user.toObject();
      return {
        ...userObj,
        isOnline: checkOnlineStatus(user.lastActive)
      };
    });
    
    res.json(usersWithStatus);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching users', error: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    // Safely catch the ID whether your middleware uses ._id or .id
    const userId = req.user._id || req.user.id; 
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // FIX: Check for undefined instead of using '||' so users can clear fields!
    if (req.body.name !== undefined) user.name = req.body.name;
    if (req.body.email !== undefined) user.email = req.body.email;
    if (req.body.location !== undefined) user.location = req.body.location;
    if (req.body.bio !== undefined) user.bio = req.body.bio;
    if (req.body.avatarUrl !== undefined) user.avatarUrl = req.body.avatarUrl;

    const updatedUser = await user.save();
    
    // Return user without password
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      location: updatedUser.location,
      bio: updatedUser.bio,
      avatarUrl: updatedUser.avatarUrl
    });
    
  } catch (error) {
    console.error("Profile Update Error:", error);
    res.status(500).json({ message: 'Server error updating profile', error: error.message });
  }
};


// @desc    Update user password
// @route   PUT /api/users/password
// @access  Private
export const updatePassword = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    // CRITICAL: We add .select('+password') just in case your User model hides it by default
    const user = await User.findById(userId).select('+password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { currentPassword, newPassword } = req.body;

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }

    // Set the plain text password. The pre('save') hook in user-model.js will hash it!
    user.password = newPassword;
    await user.save();
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error("Password Update Error:", error);
    res.status(500).json({ message: 'Server error updating password', error: error.message });
  }
};


// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
export const getUserById = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const user = await User.findById(targetUserId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentUserId = req.user._id || req.user.id;

    // REAL-TIME TRACKING: Only count as a view if looking at someone ELSE's profile
    if (currentUserId && currentUserId.toString() !== targetUserId.toString()) {
      user.profileViews = (user.profileViews || 0) + 1;
      await user.save();
    }

    res.json(user);
  } catch (error) {
    console.error("Get User By ID Error:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// @desc    Get dashboard statistics for the logged-in user
// @route   GET /api/users/me/stats
// @access  Private
export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Count accepted collaboration requests as "Upcoming Meetings" 
    const upcomingMeetings = await CollaborationRequest.countDocuments({
      $or: [{ entrepreneurId: userId }, { investorId: userId }],
      status: 'accepted'
    });

    res.json({
      profileViews: user.profileViews || 0,
      upcomingMeetings: upcomingMeetings
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({ message: 'Server error fetching stats', error: error.message });
  }
};


export const updateUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.lastActive = Date.now();
      user.isOnline = true; // Force to true when they ping
      await user.save();
    }
    res.sendStatus(200);
  } catch (error) {
    res.status(500).json({ message: 'Status update failed' });
  }
};