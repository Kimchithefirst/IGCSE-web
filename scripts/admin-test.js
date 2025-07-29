#!/usr/bin/env node

import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

async function testQuizApi() {
  try {
    console.log('🔐 Step 1: Registering admin user...');
    
    // Register new admin user
    const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, {
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'Admin123!',
      role: 'admin'  // Important: This needs to be exactly 'admin'
    }).catch(error => {
      console.log('Registration error details:', error.response?.data || error.message);
      
      // Try login if user might already exist
      console.log('⚠️ User might already exist. Trying to login...');
      return axios.post(`${API_BASE_URL}/auth/login`, {
        email: 'admin@example.com',
        password: 'Admin123!'
      });
    });
    
    console.log('Auth response:', registerResponse.data);
    
    const token = registerResponse.data.token;
    if (!token) {
      throw new Error('No token received from authentication');
    }
    
    console.log('🔑 Token obtained:', token);
    
    // Use token for subsequent requests
    const authHeader = { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // Get user profile to verify role
    console.log('\n🧑‍💼 Step 2: Verifying user role...');
    try {
      const profileResponse = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: authHeader
      });
      
      console.log('User profile:', profileResponse.data);
      
      const userRole = profileResponse.data.data.role;
      console.log(`User role: ${userRole}`);
      
      if (userRole !== 'admin' && userRole !== 'teacher') {
        console.log('⚠️ Warning: User does not have admin or teacher role. Quiz creation may fail.');
      }
    } catch (profileError) {
      console.error('Failed to get user profile:', profileError.response?.data || profileError.message);
    }
    
    // Create a quiz
    console.log('\n📝 Step 3: Creating a quiz...');
    const quizData = {
      title: "IGCSE Computer Science Fundamentals",
      subject: "Computer Science",
      description: "Test your knowledge of key CS concepts for IGCSE exams",
      difficultyLevel: "intermediate",
      duration: 45,
      isPublished: true,
      totalPoints: 100,
      passingPoints: 60,
      tags: ["IGCSE", "Computer Science", "Programming"]
    };
    
    console.log('Quiz data:', quizData);
    console.log('Request headers:', authHeader);
    
    try {
      const createQuizResponse = await axios.post(
        `${API_BASE_URL}/quizzes`,
        quizData,
        { headers: authHeader }
      );
      
      console.log('✅ Quiz created successfully!');
      console.log('Quiz response:', createQuizResponse.data);
      
      const quizId = createQuizResponse.data.data._id;
      console.log('Quiz ID:', quizId);
      
      // Add a question to the quiz
      console.log('\n❓ Step 4: Adding a question to the quiz...');
      const questionData = {
        text: "Which of the following is NOT a primitive data type in JavaScript?",
        type: "multiple-choice",
        difficultyLevel: "medium",
        points: 10,
        options: [
          { text: "String", isCorrect: false },
          { text: "Number", isCorrect: false },
          { text: "Boolean", isCorrect: false },
          { text: "Array", isCorrect: true }
        ],
        explanation: "Array is a non-primitive data type in JavaScript. The primitive data types are String, Number, Boolean, Null, Undefined, Symbol, and BigInt."
      };
      
      const addQuestionResponse = await axios.post(
        `${API_BASE_URL}/quizzes/${quizId}/questions`,
        questionData,
        { headers: authHeader }
      );
      
      console.log('✅ Question added successfully!');
      console.log('Question ID:', addQuestionResponse.data.data._id);
    } catch (createError) {
      console.error('Failed to create quiz:', createError.response?.data || createError.message);
      
      // Try to implement a workaround if we're getting unprotected routes
      console.log('\n🛠️ Attempting alternative approach with direct role check...');
      
      // Scan for quizzes instead
      const quizzesResponse = await axios.get(`${API_BASE_URL}/quizzes`, {
        headers: authHeader
      });
      
      console.log(`Found ${quizzesResponse.data.count} existing quizzes.`);
      console.log('Recommend checking route middleware in quizRoutes.ts to ensure proper auth protection.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response ? 
      `${error.response.status} - ${JSON.stringify(error.response.data, null, 2)}` : 
      error.message);
  }
}

// Run the test
testQuizApi(); 