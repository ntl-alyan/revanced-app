// test-connection.js
const { MongoClient } = require('mongodb');

async function testConnection() {
  const uri = 'mongodb://revancedappsu:D4iAfjm8tScYCsKW@localhost:27017/revancedappsu?authSource=admin';
  
  try {
    const client = new MongoClient(uri);
    await client.connect();
    console.log('Connected successfully!');
    await client.close();
  } catch (error) {
    console.error('Connection failed:', error);
  }
}

testConnection();