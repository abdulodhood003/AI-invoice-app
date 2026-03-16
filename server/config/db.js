import mongoose from 'mongoose';

/**
 * Connects to MongoDB using Mongoose.
 * Exits the process with a failure status if the connection fails.
 */
const connectDB = async () => {
  try {
    // Attempt to establish a connection to the MongoDB database
    // using the URI defined in the environment variables.
    const conn = await mongoose.connect(process.env.MONGO_URI);
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    // Exit the process with failure code 1
    process.exit(1);
  }
};

export default connectDB;
