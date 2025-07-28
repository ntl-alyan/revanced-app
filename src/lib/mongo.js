import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {
  authMechanism: 'SCRAM-SHA-256',
  connectTimeoutMS: 5000,
  serverSelectionTimeoutMS: 5000
};

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable to preserve the connection
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, create a new connection
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;