import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    // Extract database name from connection string for logging
    const dbNameMatch = MONGODB_URI!.match(/\/([^?]+)/);
    const dbName = dbNameMatch ? dbNameMatch[1] : 'Unknown';

    console.log('🔌 Connecting to MongoDB...');
    console.log('📊 Target Database:', dbName);
    console.log('💡 Note: Database will be created automatically on first data save');

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then(async (mongoose) => {
      const actualDbName = mongoose.connection.db?.databaseName || dbName;
      
      console.log('✅ MongoDB Connected Successfully!');
      console.log('📊 Database:', actualDbName);
      console.log('🌐 Host:', mongoose.connection.host || 'Unknown');
      
      // Check if database exists (it will be created on first write if it doesn't)
      try {
        const collections = await mongoose.connection.db?.listCollections().toArray();
        if (collections && collections.length > 0) {
          console.log(`📚 Collections found: ${collections.length}`);
        } else {
          console.log('📝 Database is empty - collections will be created automatically on first data save');
        }
      } catch (err) {
        // Database doesn't exist yet - will be created on first write
        console.log('📝 Database will be created automatically when you save your first data');
      }
      
      return mongoose;
    }).catch((error) => {
      console.error('❌ MongoDB Connection Error:', error.message);
      if (error.message.includes('authentication')) {
        console.error('💡 Tip: Check your username and password in the connection string');
      } else if (error.message.includes('network') || error.message.includes('ENOTFOUND')) {
        console.error('💡 Tip: Check your internet connection and MongoDB Atlas network settings');
      } else if (error.message.includes('timeout')) {
        console.error('💡 Tip: Check if your IP is whitelisted in MongoDB Atlas');
      }
      throw error;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;

