#!/usr/bin/env node

import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

async function createTestUser() {
  console.log('👤 Creating test admin user...');
  
  try {
    // Register a new admin user
    const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, {
      name: 'Test Admin',
      email: 'admin@test.com',
      password: 'Password123!',
      role: 'admin'
    });
    
    console.log('✅ User registered successfully!');
    console.log('User ID:', registerResponse.data.data._id);
    console.log('Token:', registerResponse.data.token);
    
    const token = registerResponse.data.token;
    
    // Use token to create a quiz
    const quizResponse = await axios.post(
      `${API_BASE_URL}/quizzes`,
      {
        title: "Test Quiz via New User",
        subject: "Computer Science",
        description: "A test quiz created by our new admin user",
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
    
  } catch (error) {
    if (error.response && error.response.status === 400 && error.response.data.message === 'Email already registered') {
      console.log('⚠️ User already exists, trying to login...');
      
      try {
        // Login with existing user
        const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
          email: 'admin@test.com',
          password: 'Password123!'
        });
        
        console.log('✅ Login successful!');
        console.log('Token:', loginResponse.data.token);
        
        const token = loginResponse.data.token;
        
        // Use token to create a quiz
        const quizResponse = await axios.post(
          `${API_BASE_URL}/quizzes`,
          {
            title: "Test Quiz via Existing User",
            subject: "Computer Science",
            description: "A test quiz created by our existing admin user",
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
        
      } catch (loginError) {
        console.error('❌ Login Error:', loginError.response ? loginError.response.data : loginError.message);
      }
    } else {
      console.error('❌ Error:', error.response ? error.response.data : error.message);
    }
  }
}

// Run the function
createTestUser().catch(err => console.error('Unhandled error:', err)); 