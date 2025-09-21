const User = require('../models/userModel');
const Profile = require('../models/profileModel');
const Preferences = require('../models/preferencesModel');
const logger = require('../utils/logger');

class UserService {
  async getUserById(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (error) {
      logger.error('Get user by ID error:', error);
      throw error;
    }
  }

  async getUserByEmail(email) {
    try {
      const user = await User.findByEmail(email);
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (error) {
      logger.error('Get user by email error:', error);
      throw error;
    }
  }

  async updateUser(userId, updateData) {
    try {
      const allowedUpdates = ['firstName', 'lastName', 'phone'];
      const filteredUpdates = {};
      
      allowedUpdates.forEach(field => {
        if (updateData[field] !== undefined) {
          filteredUpdates[field] = updateData[field];
        }
      });

      if (Object.keys(filteredUpdates).length === 0) {
        throw new Error('No valid fields to update');
      }

      const user = await User.findByIdAndUpdate(
        userId,
        filteredUpdates,
        { new: true, runValidators: true }
      );

      if (!user) {
        throw new Error('User not found');
      }

      logger.info(`User updated: ${user.email}`);
      return user;
    } catch (error) {
      logger.error('Update user error:', error);
      throw error;
    }
  }

  async deleteUser(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Soft delete - deactivate user instead of removing
      user.isActive = false;
      user.refreshTokens = [];
      await user.save();

      // Also remove associated profile and preferences
      await Profile.findOneAndDelete({ userId });
      await Preferences.findOneAndDelete({ userId });

      logger.info(`User deactivated: ${user.email}`);
      return { message: 'User account deactivated successfully' };
    } catch (error) {
      logger.error('Delete user error:', error);
      throw error;
    }
  }

  async getUserProfile(userId) {
    try {
      const profile = await Profile.findOne({ userId }).populate('userId', 'firstName lastName email');
      return profile;
    } catch (error) {
      logger.error('Get user profile error:', error);
      throw error;
    }
  }

  async createOrUpdateProfile(userId, profileData) {
    try {
      let profile = await Profile.findOne({ userId });
      
      if (profile) {
        Object.assign(profile, profileData);
        await profile.save();
        logger.info(`Profile updated for user: ${userId}`);
      } else {
        profile = new Profile({ userId, ...profileData });
        await profile.save();
        logger.info(`Profile created for user: ${userId}`);
      }

      return profile;
    } catch (error) {
      logger.error('Create/update profile error:', error);
      throw error;
    }
  }

  async getUserPreferences(userId) {
    try {
      let preferences = await Preferences.findOne({ userId });
      
      if (!preferences) {
        // Create default preferences if none exist
        preferences = new Preferences({
          userId,
          ...Preferences.getDefaultPreferences()
        });
        await preferences.save();
        logger.info(`Default preferences created for user: ${userId}`);
      }

      return preferences;
    } catch (error) {
      logger.error('Get user preferences error:', error);
      throw error;
    }
  }

  async updateUserPreferences(userId, preferencesData) {
    try {
      let preferences = await Preferences.findOne({ userId });
      
      if (!preferences) {
        preferences = new Preferences({ userId, ...preferencesData });
      } else {
        Object.assign(preferences, preferencesData);
      }

      await preferences.save();
      logger.info(`Preferences updated for user: ${userId}`);
      return preferences;
    } catch (error) {
      logger.error('Update user preferences error:', error);
      throw error;
    }
  }

  async searchUsers(query, options = {}) {
    try {
      const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = options;
      const skip = (page - 1) * limit;

      const searchRegex = new RegExp(query, 'i');
      const searchQuery = {
        isActive: true,
        $or: [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { email: searchRegex }
        ]
      };

      const users = await User.find(searchQuery)
        .select('firstName lastName email role createdAt')
        .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
        .skip(skip)
        .limit(limit);

      const total = await User.countDocuments(searchQuery);

      return {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Search users error:', error);
      throw error;
    }
  }

  async getUserStats(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const profile = await Profile.findOne({ userId });
      const preferences = await Preferences.findOne({ userId });

      const stats = {
        joinDate: user.createdAt,
        lastLogin: user.lastLogin,
        isEmailVerified: user.isEmailVerified,
        profileCompleteness: profile ? profile.profileCompleteness : 0,
        skillsCount: profile ? profile.skills.length : 0,
        goalsCount: profile ? profile.learningGoals.length : 0,
        experienceCount: profile ? profile.experience.length : 0,
        educationCount: profile ? profile.education.length : 0,
        certificationsCount: profile ? profile.certifications.length : 0
      };

      return stats;
    } catch (error) {
      logger.error('Get user stats error:', error);
      throw error;
    }
  }

  async updateUserRole(userId, newRole) {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { role: newRole },
        { new: true, runValidators: true }
      );

      if (!user) {
        throw new Error('User not found');
      }

      logger.info(`User role updated: ${user.email} -> ${newRole}`);
      return user;
    } catch (error) {
      logger.error('Update user role error:', error);
      throw error;
    }
  }

  async activateUser(userId) {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { isActive: true },
        { new: true }
      );

      if (!user) {
        throw new Error('User not found');
      }

      logger.info(`User activated: ${user.email}`);
      return user;
    } catch (error) {
      logger.error('Activate user error:', error);
      throw error;
    }
  }

  async deactivateUser(userId) {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { isActive: false, refreshTokens: [] },
        { new: true }
      );

      if (!user) {
        throw new Error('User not found');
      }

      logger.info(`User deactivated: ${user.email}`);
      return user;
    } catch (error) {
      logger.error('Deactivate user error:', error);
      throw error;
    }
  }
}

module.exports = new UserService();