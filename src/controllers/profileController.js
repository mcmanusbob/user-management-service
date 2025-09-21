const userService = require('../services/userService');
const validator = require('../utils/validator');
const logger = require('../utils/logger');

class ProfileController {
  async getProfile(req, res) {
    try {
      const userId = req.user.userId;
      const profile = await userService.getUserProfile(userId);
      
      if (!profile) {
        return res.status(404).json({
          status: 'error',
          message: 'Profile not found'
        });
      }

      res.status(200).json({
        status: 'success',
        data: { profile }
      });
    } catch (error) {
      logger.error('Get profile controller error:', error);
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  }

  async updateProfile(req, res) {
    try {
      const validationErrors = validator.validateProfileUpdate(req.body);
      if (validationErrors.length > 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: validationErrors
        });
      }

      const userId = req.user.userId;
      const profile = await userService.createOrUpdateProfile(userId, req.body);
      
      res.status(200).json({
        status: 'success',
        message: 'Profile updated successfully',
        data: { profile }
      });
    } catch (error) {
      logger.error('Update profile controller error:', error);
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  }

  async addSkill(req, res) {
    try {
      const validationErrors = validator.validateSkill(req.body);
      if (validationErrors.length > 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: validationErrors
        });
      }

      const userId = req.user.userId;
      const profile = await userService.getUserProfile(userId);
      
      if (!profile) {
        return res.status(404).json({
          status: 'error',
          message: 'Profile not found'
        });
      }

      // Check if skill already exists
      const existingSkill = profile.skills.find(skill => 
        skill.name.toLowerCase() === req.body.name.toLowerCase()
      );

      if (existingSkill) {
        return res.status(400).json({
          status: 'error',
          message: 'Skill already exists'
        });
      }

      profile.skills.push(req.body);
      await profile.save();
      
      res.status(201).json({
        status: 'success',
        message: 'Skill added successfully',
        data: { skill: req.body }
      });
    } catch (error) {
      logger.error('Add skill controller error:', error);
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  }

  async updateSkill(req, res) {
    try {
      const { skillId } = req.params;
      const validationErrors = validator.validateSkill(req.body);
      if (validationErrors.length > 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: validationErrors
        });
      }

      const userId = req.user.userId;
      const profile = await userService.getUserProfile(userId);
      
      if (!profile) {
        return res.status(404).json({
          status: 'error',
          message: 'Profile not found'
        });
      }

      const skill = profile.skills.id(skillId);
      if (!skill) {
        return res.status(404).json({
          status: 'error',
          message: 'Skill not found'
        });
      }

      Object.assign(skill, req.body);
      await profile.save();
      
      res.status(200).json({
        status: 'success',
        message: 'Skill updated successfully',
        data: { skill }
      });
    } catch (error) {
      logger.error('Update skill controller error:', error);
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  }

  async removeSkill(req, res) {
    try {
      const { skillId } = req.params;
      const userId = req.user.userId;
      const profile = await userService.getUserProfile(userId);
      
      if (!profile) {
        return res.status(404).json({
          status: 'error',
          message: 'Profile not found'
        });
      }

      const skill = profile.skills.id(skillId);
      if (!skill) {
        return res.status(404).json({
          status: 'error',
          message: 'Skill not found'
        });
      }

      profile.skills.pull(skillId);
      await profile.save();
      
      res.status(200).json({
        status: 'success',
        message: 'Skill removed successfully'
      });
    } catch (error) {
      logger.error('Remove skill controller error:', error);
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  }

  async addExperience(req, res) {
    try {
      const validationErrors = validator.validateExperience(req.body);
      if (validationErrors.length > 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: validationErrors
        });
      }

      const userId = req.user.userId;
      const profile = await userService.getUserProfile(userId);
      
      if (!profile) {
        return res.status(404).json({
          status: 'error',
          message: 'Profile not found'
        });
      }

      profile.experience.push(req.body);
      await profile.save();
      
      res.status(201).json({
        status: 'success',
        message: 'Experience added successfully',
        data: { experience: profile.experience[profile.experience.length - 1] }
      });
    } catch (error) {
      logger.error('Add experience controller error:', error);
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  }

  async updateExperience(req, res) {
    try {
      const { experienceId } = req.params;
      const validationErrors = validator.validateExperience(req.body);
      if (validationErrors.length > 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: validationErrors
        });
      }

      const userId = req.user.userId;
      const profile = await userService.getUserProfile(userId);
      
      if (!profile) {
        return res.status(404).json({
          status: 'error',
          message: 'Profile not found'
        });
      }

      const experience = profile.experience.id(experienceId);
      if (!experience) {
        return res.status(404).json({
          status: 'error',
          message: 'Experience not found'
        });
      }

      Object.assign(experience, req.body);
      await profile.save();
      
      res.status(200).json({
        status: 'success',
        message: 'Experience updated successfully',
        data: { experience }
      });
    } catch (error) {
      logger.error('Update experience controller error:', error);
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  }

  async removeExperience(req, res) {
    try {
      const { experienceId } = req.params;
      const userId = req.user.userId;
      const profile = await userService.getUserProfile(userId);
      
      if (!profile) {
        return res.status(404).json({
          status: 'error',
          message: 'Profile not found'
        });
      }

      const experience = profile.experience.id(experienceId);
      if (!experience) {
        return res.status(404).json({
          status: 'error',
          message: 'Experience not found'
        });
      }

      profile.experience.pull(experienceId);
      await profile.save();
      
      res.status(200).json({
        status: 'success',
        message: 'Experience removed successfully'
      });
    } catch (error) {
      logger.error('Remove experience controller error:', error);
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  }

  async getUserStats(req, res) {
    try {
      const userId = req.user.userId;
      const stats = await userService.getUserStats(userId);
      
      res.status(200).json({
        status: 'success',
        data: { stats }
      });
    } catch (error) {
      logger.error('Get user stats controller error:', error);
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  }
}

module.exports = new ProfileController();