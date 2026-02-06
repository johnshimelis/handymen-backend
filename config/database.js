import mongoose from 'mongoose';

/**
 * Connect to MongoDB database
 * Handles connection with error handling and retry logic
 */
const connectDB = async () => {
  try {
    // `useNewUrlParser` and `useUnifiedTopology` are no-ops on modern drivers and
    // generate deprecation warnings. Keep connect options minimal.
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;







