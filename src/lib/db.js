import clientPromise from './mongo';

let client, db;

async function init() {
  if (db) return db;

  try {
    client = await clientPromise;
    db = client.db(process.env.MONGODB_DB);

    console.log("✅ MongoDB connected:", process.env.MONGODB_DB);
    return db;
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    throw new Error("MongoDB connection failed: " + err.message);
  }
}

export default init;
