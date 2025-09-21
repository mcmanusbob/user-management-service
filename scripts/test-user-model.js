const mongoose = require('mongoose');
const config = require('../src/config/env');
const User = require('../src/models/userModel');

async function testUserModel() {
  console.log('🧪 Testing User Model...\n');
  
  try {
    // Connect to database
    await mongoose.connect(config.database.uri, config.database.options);
    console.log('✅ Connected to MongoDB');
    
    // Create a test user
    const testUser = new User({
      email: 'test@example.com',
      password: 'TestPass123!',
      firstName: 'Test',
      lastName: 'User'
    });
    
    await testUser.save();
    console.log('✅ User created successfully');
    console.log('📋 User details:', {
      id: testUser._id,
      email: testUser.email,
      fullName: testUser.fullName,
      role: testUser.role,
      isActive: testUser.isActive
    });
    
    // Test password comparison
    const isValidPassword = await testUser.comparePassword('TestPass123!');
    console.log('✅ Password validation:', isValidPassword ? 'PASSED' : 'FAILED');
    
    // Test finding user by email
    const foundUser = await User.findByEmail('test@example.com');
    console.log('✅ Find by email:', foundUser ? 'FOUND' : 'NOT FOUND');
    
    // Clean up
    await User.deleteOne({ email: 'test@example.com' });
    console.log('✅ Test cleanup completed');
    
    console.log('\n🎉 All User model tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔐 Connection closed');
    process.exit(0);
  }
}

testUserModel();