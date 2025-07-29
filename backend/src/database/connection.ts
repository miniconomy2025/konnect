import { MongoClient, Db } from 'mongodb';
import { getLogger } from '@logtape/logtape';

const logger = getLogger('database');

let client: MongoClient;
let db: Db;

export async function connectToDatabase(): Promise<Db> {
  if (db) return db;
  
  const url = process.env.DATABASE_URL || 'mongodb://localhost:27017/insta-clone';
  
  try {
    client = new MongoClient(url);
    await client.connect();
    db = client.db();
    
    // Create indexes
    await createIndexes();
    
    logger.info('Connected to MongoDB');
    return db;
  } catch (error) {
    //logger.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

async function createIndexes() {
  const users = db.collection('users');
  await users.createIndex({ username: 1 }, { unique: true });
  await users.createIndex({ googleId: 1 }, { unique: true });
  await users.createIndex({ email: 1 }, { unique: true });
  await users.createIndex({ actorId: 1 }, { unique: true });
}

export function getDatabase(): Db {
  if (!db) {
    throw new Error('Database not connected. Call connectToDatabase() first.');
  }
  return db;
}