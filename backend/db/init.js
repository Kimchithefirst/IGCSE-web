const { createClient } = require('@libsql/client');
const path = require('path');

// Database URL will come from environment variables in production
const TURSO_URL = process.env.TURSO_URL || 'libsql://your-database-name.turso.io';
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN || 'your-auth-token';

// Initialize client
const client = createClient({
  url: TURSO_URL,
  authToken: TURSO_AUTH_TOKEN,
});

// Create users table
const createUsersTable = `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fullName TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('student', 'teacher', 'parent')),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`;

// Create sessions table for managing user sessions
const createSessionsTable = `
  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    token TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    expiresAt DATETIME NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id)
  )
`;

// Initialize tables
async function initializeDatabase() {
  try {
    // Create tables
    await client.execute(createUsersTable);
    await client.execute(createSessionsTable);
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Export database client and initialization function
module.exports = {
  client,
  initializeDatabase
}; 