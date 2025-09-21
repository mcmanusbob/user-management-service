const mongoose = require('mongoose');
const User = require('../src/models/userModel');
const Profile = require('../src/models/profileModel');
const userService = require('../src/services/userService');
const db = require('../src/config/db');

describe('User Service', () => {
  let testUser;
  let userId;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await db.connect();
  });

  afterAll(async () => {
    await db.disconnect();
  });

  beforeEach(async () => {
    await db.clearDatabase();
    
    // Create test user
    testUser = new User({
      email: 'test@example.com',
      password: 'TestPass123!',
      firstName: 'Test',
      lastName: 'User'
    });
    
    await testUser.save();
    userId = testUser._id;
  });

  describe('getUserById', () => {
    it('should get user by ID', async () => {
      const user = await userService.getUserById(userId);
      
      expect(user).toBeDefined();
      expect(user.email).toBe(testUser.email);
      expect(user._id.toString()).toBe(userId.toString());
    });

    it('should throw error for non-existent user', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      await expect(userService.getUserById(nonExistentId))
        .rejects.toThrow('User not found');
    });
  });

  describe('getUserByEmail', () => {
    it('should get user by email', async () => {
      const user = await userService.getUserByEmail(testUser.email);
      
      expect(user).toBeDefined();
      expect(user.email).toBe(testUser.email);
    });

    it('should throw error for non-existent email', async () => {
      await expect(userService.getUserByEmail('nonexistent@example.com'))
        .rejects.toThrow('User not found');
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name'
      };
      
      const updatedUser = await userService.updateUser(userId, updateData);
      
      expect(updatedUser.firstName).toBe(updateData.firstName);
      expect(updatedUser.lastName).toBe(updateData.lastName);
    });

    it('should not update protected fields', async () => {
      const updateData = {
        email: 'newemail@example.com',
        password: 'newpassword'
      };
      
      await expect(userService.updateUser(userId, updateData))
        .rejects.toThrow('No valid fields to update');
    });
  });

  describe('createOrUpdateProfile', () => {
    it('should create new profile', async () => {
      const profileData = {
        bio: 'Test bio',
        skills: [{ name: 'JavaScript', level: 'intermediate' }]
      };
      
      const profile = await userService.createOrUpdateProfile(userId, profileData);
      
      expect(profile).toBeDefined();
      expect(profile.bio).toBe(profileData.bio);
      expect(profile.skills).toHaveLength(1);
    });

    it('should update existing profile', async () => {
      // Create profile first
      await userService.createOrUpdateProfile(userId, { bio: 'Original bio' });
      
      // Update profile
      const updatedProfile = await userService.createOrUpdateProfile(userId, { 
        bio: 'Updated bio' 
      });
      
      expect(updatedProfile.bio).toBe('Updated bio');
    });
  });

  describe('getUserStats', () => {
    it('should get user statistics', async () => {
      const stats = await userService.getUserStats(userId);
      
      expect(stats).toBeDefined();
      expect(stats.joinDate).toBeDefined();
      expect(stats.profileCompleteness).toBe(0);
      expect(stats.skillsCount).toBe(0);
    });
  });
});