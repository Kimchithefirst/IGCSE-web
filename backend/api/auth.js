const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();

// Demo users - in production this would be in MongoDB
const demoUsers = [
  {
    id: '1',
    fullName: 'John Student',
    email: 'student@igcse.com',
    password: '$2a$10$demo.hash.for.password123', // password123
    role: 'student'
  },
  {
    id: '2', 
    fullName: 'Jane Teacher',
    email: 'teacher@igcse.com',
    password: '$2a$10$demo.hash.for.password123', // password123
    role: 'teacher'
  },
  {
    id: '3',
    fullName: 'Bob Parent',
    email: 'parent@igcse.com', 
    password: '$2a$10$demo.hash.for.password123', // password123
    role: 'parent'
  }
];

const JWT_SECRET = process.env.JWT_SECRET || 'demo-secret-key-change-in-production';

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;
    
    // Validate input
    if (!fullName || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user exists (in demo, just check email)
    const existingUser = demoUsers.find(user => user.email === email);
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user (in demo, just add to memory)
    const newUser = {
      id: String(demoUsers.length + 1),
      fullName,
      email,
      password: hashedPassword,
      role
    };
    
    demoUsers.push(newUser);
    
    // Generate token
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;
    
    res.status(201).json({ 
      user: userWithoutPassword,
      token,
      message: 'User registered successfully'
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = demoUsers.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // For demo purposes, accept 'password123' for all demo users
    const isValidPassword = password === 'password123' || await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    
    res.status(200).json({ 
      user: userWithoutPassword,
      token,
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout endpoint
router.post('/logout', async (req, res) => {
  try {
    // In a real app, you might blacklist the token
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify token endpoint
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Find user
    const user = demoUsers.find(u => u.id === decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    
    res.status(200).json({ 
      user: userWithoutPassword,
      valid: true
    });
  } catch (error) {
    console.error('Verify error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Get demo users endpoint (for development/testing)
router.get('/demo-users', (req, res) => {
  res.json({
    message: 'Demo users for testing',
    users: [
      { email: 'student@igcse.com', password: 'password123', role: 'student' },
      { email: 'teacher@igcse.com', password: 'password123', role: 'teacher' },
      { email: 'parent@igcse.com', password: 'password123', role: 'parent' }
    ]
  });
});

module.exports = router; 