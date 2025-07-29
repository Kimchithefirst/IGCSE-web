#!/usr/bin/env node

import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

async function testAuth() {
  console.log('🔐 Testing Authentication...');
  
  try {
    // 1. Login to get a token
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@example.com',
      password: 'adminPassword'
    });
    
    console.log('✅ Login successful!');
    console.log('Token:', loginResponse.data.token);
    
    const token = loginResponse.data.token;
    
    // 2. Use token to create a quiz
    const quizResponse = await axios.post(
      `${API_BASE_URL}/quizzes`,
      {
        title: "Test Quiz via Script",
        subject: "Computer Science",
        description: "A test quiz created via the auth test script",
        difficultyLevel: "beginner",
        duration: 15,
        isPublished: true
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Quiz created successfully!');
    console.log('Quiz ID:', quizResponse.data.data._id);
    console.log('Quiz Details:', JSON.stringify(quizResponse.data, null, 2));
    
    // Return quiz ID for further operations
    return quizResponse.data.data._id;
    
  } catch (error) {
    console.error('❌ Error:', error.response ? error.response.data : error.message);
    return null;
  }
}

// Run the test
testAuth().catch(err => console.error('Unhandled error:', err)); 