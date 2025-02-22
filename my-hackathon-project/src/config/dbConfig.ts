// src/config/dbConfig.ts

import mongoose from 'mongoose';

/**
 * Connects to MongoDB using the connection string provided in the environment variable MONGO_URI.
 * This function uses async/await to handle the asynchronous connection process.
 */
export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGO_URI;
    
    if (!mongoURI) {
      throw new Error('MONGO_URI not defined in environment variables.');
    }

    // Connect to MongoDB with the given URI and options.
    await mongoose.connect(mongoURI);

    console.log('MongoDB connected successfully');
  } catch (error: any) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1); // Exit the process with failure
  }
};
