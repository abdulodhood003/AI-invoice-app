import mongoose from 'mongoose';

/**
 * Connects to MongoDB using Mongoose.
 * Exits the process with a failure status if the connection fails.
 */
let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return; // Use existing database connection in serverless environments
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    isConnected = !!conn.connections[0].readyState;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    // In serverless, throwing an error is better than abruptly killing the container process
    throw error;
  }
};

export default connectDB;
