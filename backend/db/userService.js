const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { client } = require('./init');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // In production, use environment variable

const userService = {
  // Create a new user
  createUser: async (userData) => {
    const { fullName, email, password, role } = userData;
    
    try {
      // Check if user already exists
      const existingUserResult = await client.execute({
        sql: 'SELECT * FROM users WHERE email = ?',
        args: [email]
      });
      
      if (existingUserResult.rows.length > 0) {
        throw new Error('User already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert user
      const result = await client.execute({
        sql: `INSERT INTO users (fullName, email, password, role)
              VALUES (?, ?, ?, ?)`,
        args: [fullName, email, hashedPassword, role]
      });
      
      // Get created user (without password)
      const userResult = await client.execute({
        sql: 'SELECT id, fullName, email, role FROM users WHERE rowid = last_insert_rowid()',
        args: []
      });
      
      return userResult.rows[0];
    } catch (error) {
      throw error;
    }
  },

  // Login user
  loginUser: async (email, password) => {
    try {
      // Get user
      const userResult = await client.execute({
        sql: 'SELECT * FROM users WHERE email = ?',
        args: [email]
      });
      
      if (userResult.rows.length === 0) {
        throw new Error('Invalid credentials');
      }

      const user = userResult.rows[0];

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      // Create token
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Store session
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      await client.execute({
        sql: `INSERT INTO sessions (userId, token, expiresAt)
              VALUES (?, ?, ?)`,
        args: [user.id, token, expiresAt.toISOString()]
      });

      // Return user data and token (without password)
      const { password: _, ...userWithoutPassword } = user;
      return {
        user: userWithoutPassword,
        token
      };
    } catch (error) {
      throw error;
    }
  },

  // Verify token
  verifyToken: async (token) => {
    try {
      // Check if token exists in sessions and is not expired
      const sessionResult = await client.execute({
        sql: `SELECT * FROM sessions 
              WHERE token = ? AND expiresAt > datetime('now')`,
        args: [token]
      });

      if (sessionResult.rows.length === 0) {
        throw new Error('Invalid or expired token');
      }

      const decoded = jwt.verify(token, JWT_SECRET);
      
      const userResult = await client.execute({
        sql: 'SELECT id, fullName, email, role FROM users WHERE id = ?',
        args: [decoded.userId]
      });

      if (userResult.rows.length === 0) {
        throw new Error('User not found');
      }

      return userResult.rows[0];
    } catch (error) {
      throw error;
    }
  },

  // Logout user
  logoutUser: async (token) => {
    try {
      await client.execute({
        sql: 'DELETE FROM sessions WHERE token = ?',
        args: [token]
      });
      return true;
    } catch (error) {
      throw error;
    }
  }
};

module.exports = userService; 