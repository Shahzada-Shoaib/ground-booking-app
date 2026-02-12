// Quick MongoDB Connection Verification Script
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables');
  console.error('Please create .env.local file with: MONGODB_URI=your_connection_string');
  process.exit(1);
}

console.log('🔌 Testing MongoDB Connection...');
console.log('📍 Connection String:', MONGODB_URI.replace(/:[^:@]+@/, ':****@'));

mongoose.connect(MONGODB_URI, {
  bufferCommands: false,
})
  .then(async () => {
    console.log('\n✅ MongoDB Connected Successfully!');
    console.log('📊 Database:', mongoose.connection.db?.databaseName || 'Unknown');
    console.log('🌐 Host:', mongoose.connection.host || 'Unknown');
    console.log('🔌 Port:', mongoose.connection.port || 'Unknown');
    console.log('📈 Ready State:', mongoose.connection.readyState);
    
    // List collections
    try {
      const collections = await mongoose.connection.db?.listCollections().toArray();
      console.log(`\n📚 Collections (${collections?.length || 0}):`);
      if (collections && collections.length > 0) {
        collections.forEach(col => {
          console.log(`   - ${col.name}`);
        });
      } else {
        console.log('   (No collections found - database is empty)');
      }
    } catch (err) {
      console.log('   (Could not list collections)');
    }
    
    await mongoose.disconnect();
    console.log('\n✅ Connection test completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ MongoDB Connection Failed!');
    console.error('Error Details:', error.message);
    if (error.message.includes('authentication')) {
      console.error('\n💡 Tip: Check your username and password in the connection string');
    } else if (error.message.includes('network')) {
      console.error('\n💡 Tip: Check your internet connection and MongoDB Atlas network settings');
    } else if (error.message.includes('timeout')) {
      console.error('\n💡 Tip: Check if your IP is whitelisted in MongoDB Atlas');
    }
    process.exit(1);
  });

