const mongoose = require('mongoose');
const config = require('../src/config/env');
const User = require('../src/models/userModel');
const authService = require('../src/services/authService');

async function testAuth() {
  console.log('🔐 Testing Authentication System...\n');
  
  try {
    await mongoose.connect(config.database.uri, config.database.options);
    console.log('✅ Connected to MongoDB');
    
    // Test registration
    console.log('\n📝 Testing Registration...');
    const registerData = {
      email: 'testauth@example.com',
      password: 'TestAuth123!',
      firstName: 'Test',
      lastName: 'Auth'
    };
    
    const registerResult = await authService.register(registerData);
    console.log('✅ Registration successful');
    console.log('📋 User ID:', registerResult.user._id);
    console.log('📋 Access Token:', registerResult.tokens.accessToken ? 'Generated' : 'Failed');
    
    // Test login
    console.log('\n🔑 Testing Login...');
    const loginResult = await authService.login('testauth@example.com', 'TestAuth123!');
    console.log('✅ Login successful');
    console.log('📋 Access Token:', loginResult.tokens.accessToken ? 'Generated' : 'Failed');
    
    // Test token refresh
    console.log('\n🔄 Testing Token Refresh...');
    const refreshResult = await authService.refreshToken(loginResult.tokens.refreshToken);
    console.log('✅ Token refresh successful');
    console.log('📋 New Access Token:', refreshResult.accessToken ? 'Generated' : 'Failed');
    
    // Clean up
    await User.deleteOne({ email: 'testauth@example.com' });
    console.log('\n✅ Test cleanup completed');
    
    console.log('\n🎉 All authentication tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔐 Connection closed');
    process.exit(0);
  }
}

testAuth();