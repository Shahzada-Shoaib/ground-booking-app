import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import mongoose from 'mongoose';

// Test MongoDB Connection
export async function GET(request: NextRequest) {
  try {
    console.log('🔌 Testing MongoDB connection...');
    
    await connectDB();
    
    const connectionState = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    const db = mongoose.connection.db;
    const dbName = db?.databaseName || 'Unknown';
    const collections = await db?.listCollections().toArray() || [];
    
    return NextResponse.json({
      success: true,
      connection: {
        status: states[connectionState as keyof typeof states] || 'unknown',
        readyState: connectionState,
        database: dbName,
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        collectionsCount: collections.length,
        collections: collections.map(c => c.name),
      },
      message: 'MongoDB connection successful! ✅',
    });
  } catch (error: any) {
    console.error('❌ MongoDB connection error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to connect to MongoDB',
        connection: {
          status: 'failed',
          readyState: mongoose.connection.readyState,
        },
      },
      { status: 500 }
    );
  }
}

