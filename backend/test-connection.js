import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const testMongoDBConnection = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    console.log('Attempting to connect to MongoDB...');
    console.log(`Connection string (masked): ${mongoUri.replace(/password.*@/, 'password:****@')}`);
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log('✓ MongoDB connection successful!');
    console.log('✓ Backend is ready to use');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('✗ MongoDB connection failed!');
    console.error('Error:', error.message);
    console.error('\nSetup Instructions:');
    console.error('1. For MongoDB Atlas:');
    console.error('   - Create account at https://www.mongodb.com/cloud/atlas');
    console.error('   - Get connection string from your cluster');
    console.error('   - Update MONGODB_URI in .env file');
    console.error('\n2. For Local MongoDB:');
    console.error('   - Install MongoDB from https://www.mongodb.com/try/download/community');
    console.error('   - Start MongoDB service');
    console.error('   - Ensure connection string is: mongodb://localhost:27017/family-fund-ledger');
    process.exit(1);
  }
};

testMongoDBConnection();
