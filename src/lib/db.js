import clientPromise from './mongo';

let client, db;

async function init() {
  if (db) return db;
  client = await clientPromise;
  db = client.db(process.env.MONGODB_DB);
  return db;
}

export default init;