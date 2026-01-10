// Script to fix the phoneNumber index in MongoDB
// Run this once to update the existing index

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const fixIndex = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Drop the existing phoneNumber index
    try {
      await User.collection.dropIndex('phoneNumber_1');
      console.log('✅ Dropped existing phoneNumber index');
    } catch (error) {
      if (error.code === 27) {
        console.log('ℹ️  Index does not exist, will create new one');
      } else {
        throw error;
      }
    }

    // Create new sparse unique index
    await User.collection.createIndex(
      { phoneNumber: 1 },
      { 
        unique: true, 
        sparse: true,
        name: 'phoneNumber_1'
      }
    );
    console.log('✅ Created new sparse unique index on phoneNumber');

    console.log('✅ Index fix completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing index:', error);
    process.exit(1);
  }
};

fixIndex();

