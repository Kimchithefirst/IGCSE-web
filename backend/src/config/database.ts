import mongoose from 'mongoose';
import dotenv from 'dotenv';

/**
 * Database Configuration Module
 * ============================
 * This module handles all MongoDB connection setup, event listeners,
 * and connection management for the application.
 * 
 * Environment Variables:
 * - MONGODB_URI: Connection string for MongoDB (default: mongodb://localhost:27017/igcse)
 * - NODE_ENV: Current environment (production/development)
 * 
 * Connection Options:
 * - Default connection uses local MongoDB instance
 * - For production, set MONGODB_URI to your Atlas or hosted MongoDB instance
 */

// Load environment variables from .env file
dotenv.config();

// Get MongoDB connection URI from environment or use default local connection
// Format examples:
// - Local: mongodb://localhost:27017/igcse
// - Atlas: mongodb+srv://username:password@cluster.mongodb.net/igcse
// - Docker: mongodb://mongo:27017/igcse
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/igcse';

/**
 * Sanitizes the connection string for logging by hiding credentials
 * This prevents passwords from appearing in logs
 */
const logConnectionString = (uri: string): string => {
  try {
    const sanitizedUri = uri.replace(/mongodb(\+srv)?:\/\/([^:]+):([^@]+)@/, 'mongodb$1://$2:***@');
    return sanitizedUri;
  } catch (error) {
    return 'Could not parse connection string';
  }
};

/**
 * Establishes connection to MongoDB database
 * With detailed error handling and appropriate messaging
 */
export const connectToDatabase = async (): Promise<void> => {
  try {
    console.log(`Attempting to connect to MongoDB at: ${logConnectionString(MONGODB_URI)}`);
    
    // Connect to MongoDB with mongoose
    // For custom connection options, add them as the second parameter:
    // Example: { useNewUrlParser: true, useUnifiedTopology: true }
    await mongoose.connect(MONGODB_URI);
    
    console.log('✅ Connected to MongoDB database successfully');
  } catch (error) {
    console.error('❌ Error connecting to MongoDB database:');
    if (error instanceof Error) {
      console.error(`  - Message: ${error.message}`);
      console.error(`  - Is MongoDB running? Check your connection string: ${logConnectionString(MONGODB_URI)}`);
      
      // Specific error handling with troubleshooting guidance
      if (error.message.includes('ECONNREFUSED')) {
        console.error('  - Connection refused. Is MongoDB running on the correct port?');
        console.error('  - Troubleshooting tips:');
        console.error('    1. Check if MongoDB service is running');
        console.error('    2. Verify firewall settings');
        console.error('    3. Confirm port 27017 is not blocked');
        console.error('    4. Try using MongoDB Atlas instead of local instance');
      } else if (error.message.includes('Authentication failed')) {
        console.error('  - Authentication failed. Check your username and password.');
        console.error('  - Verify that the user exists in your MongoDB deployment');
      } else if (error.message.includes('timed out')) {
        console.error('  - Connection timed out. Check network settings and firewall rules.');
      }
    } else {
      console.error('  - Unknown error:', error);
    }
    
    // Exit with error in production, but allow retries in development
    // This prevents production crashes due to temporary network issues
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

/**
 * Gracefully closes the MongoDB connection
 * Call this function before application shutdown
 */
export const closeDatabase = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
  }
};

// ==============================================
// MongoDB Connection Event Listeners
// These event handlers provide visibility into connection status
// ==============================================

mongoose.connection.on('connected', () => {
  console.log('MongoDB connection established');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB connection disconnected');
});

// ==============================================
// Process Event Handlers for Graceful Shutdown
// Ensures database connections are closed properly on application exit
// ==============================================

process.on('SIGINT', async () => {
  await closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeDatabase();
  process.exit(0);
});

// Export the mongoose instance for use in other modules
export default mongoose;
