const mongoose = require('mongoose');
const config = require('../src/config/env');

async function testConnection() {
  console.log('🔍 Testing MongoDB Connection...\n');
  
  console.log('Connection Details:');
  console.log(`- Host: ${config.mongo.host}`);
  console.log(`- Port: ${config.mongo.port}`);
  console.log(`- Database: ${config.mongo.database}`);
  console.log(`- Username: ${config.mongo.username}\n`);

  try {
    console.log('⏳ Connecting to MongoDB...');
    
    const startTime = Date.now();
    await mongoose.connect(config.database.uri, config.database.options);
    const connectionTime = Date.now() - startTime;
    
    console.log(`✅ Connected successfully in ${connectionTime}ms`);
    
    console.log('\n🔧 Testing basic database operations...');
    
    await mongoose.connection.db.admin().ping();
    console.log('✅ Database ping successful');
    
    const testCollection = mongoose.connection.db.collection('connection_test');
    const testDoc = { test: true, timestamp: new Date() };
    await testCollection.insertOne(testDoc);
    console.log('✅ Write operation successful');
    
    const foundDoc = await testCollection.findOne({ test: true });
    if (foundDoc) {
      console.log('✅ Read operation successful');
    }
    
    await testCollection.deleteOne({ test: true });
    console.log('✅ Cleanup successful');
    
    console.log('\n📊 Connection Information:');
    console.log(`- Connection State: ${mongoose.connection.readyState}`);
    console.log(`- Database Name: ${mongoose.connection.name}`);
    console.log(`- Host: ${mongoose.connection.host}`);
    console.log(`- Port: ${mongoose.connection.port}`);
    
    console.log('\n🎉 All tests passed! MongoDB connection is working correctly.');
    
  } catch (error) {
    console.error('\n❌ Connection failed:', error.message);
    
    if (error.name === 'MongoNetworkError') {
      console.error('\n💡 Troubleshooting:');
      console.error('- Check if the MongoDB server is running');
      console.error('- Verify the host and port are correct');
      console.error('- Check your network connectivity');
    } else if (error.name === 'MongoAuthenticationError') {
      console.error('\n💡 Troubleshooting:');
      console.error('- Verify your username and password');
      console.error('- Check if the user has proper permissions');
    }
    
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔐 Connection closed');
    process.exit(0);
  }
}

testConnection();