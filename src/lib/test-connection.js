// test-connection.js
const { MongoClient } = require("mongodb");

async function testConnection() {
  // simple URI without auth
  const uri = "mongodb://localhost:27017";
  const dbName = "revanced"; // from your Compass

  try {
    const client = new MongoClient(uri);
    await client.connect();
    console.log("✅ Connected successfully to MongoDB");

    const db = client.db(dbName);
    console.log("✅ Using DB:", db.databaseName);

    const collections = await db.listCollections().toArray();
    console.log("📂 Collections:", collections.map(c => c.name));

    await client.close();
  } catch (error) {
    console.error("❌ Connection failed:", error.message);
  }
}

testConnection();
