#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { fileURLToPath } from 'url';

// Get current file directory (ESM replacement for __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const API_BASE_URL = 'http://localhost:3001/api'; // Update this with your backend URL
const REPORT_DIR = path.join(__dirname, '../reports');
const REPORT_FILE = path.join(REPORT_DIR, `quiz-api-test-${new Date().toISOString().split('T')[0]}.md`);

// Create reports directory if it doesn't exist
if (!fs.existsSync(REPORT_DIR)) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
}

// Initialize report content
let reportContent = `# Quiz API Test Report
Generated on: ${new Date().toLocaleString()}

## Summary

| Endpoint | Method | Status | Response Time | Result |
|----------|--------|--------|--------------|--------|
`;

// Store test auth token
let authToken = null;
let sampleQuizId = null;
let sampleQuestionId = null;

/**
 * Helper to format API responses for the report
 */
const formatResponse = (response, includeData = true) => {
  const { status, statusText, headers, data, config } = response;
  
  let formattedResponse = `### Response Details

**Status:** ${status} ${statusText}
**Time:** ${response.responseTime}ms

**Headers:**
\`\`\`json
${JSON.stringify(headers, null, 2)}
\`\`\`
`;

  if (includeData && data) {
    formattedResponse += `
**Response Body:**
\`\`\`json
${JSON.stringify(data, null, 2)}
\`\`\`
`;
  }
  
  return formattedResponse;
};

/**
 * Helper to handle errors in a standardized way
 */
const handleError = (error, testName) => {
  const errorDetails = {
    endpoint: error.config?.url || 'Unknown endpoint',
    method: error.config?.method?.toUpperCase() || 'Unknown method',
    status: error.response?.status || 'Request failed',
    error: error.message,
    details: error.response?.data || {}
  };
  
  console.error(chalk.red(`❌ ${testName} failed:`), errorDetails);
  
  reportContent += `| ${errorDetails.endpoint} | ${errorDetails.method} | ${errorDetails.status} | - | ❌ Failed |\n`;
  reportContent += `
## ${testName} (Failed)

**URL:** ${errorDetails.endpoint}
**Method:** ${errorDetails.method}

### Error Details
\`\`\`json
${JSON.stringify(errorDetails.details, null, 2)}
\`\`\`
`;
  
  return errorDetails;
};

/**
 * Call API with timing and error handling
 */
const callAPI = async (method, endpoint, data = null, authHeader = null) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {}
  };
  
  if (authHeader) {
    config.headers.Authorization = `Bearer ${authHeader}`;
  }
  
  const startTime = Date.now();
  
  try {
    const response = await axios({ method, url, data, ...config });
    const endTime = Date.now();
    response.responseTime = endTime - startTime;
    return response;
  } catch (error) {
    error.responseTime = Date.now() - startTime;
    throw error;
  }
};

/**
 * Test runner for a specific endpoint
 */
const testEndpoint = async (testName, method, endpoint, data = null, needsAuth = false) => {
  const spinner = ora(`Testing ${testName}...`).start();
  
  try {
    const response = await callAPI(
      method, 
      endpoint, 
      data, 
      needsAuth ? authToken : null
    );
    
    spinner.succeed(`${testName} - Response: ${response.status} ${response.statusText}`);
    
    // Update report content
    reportContent += `| ${endpoint} | ${method.toUpperCase()} | ${response.status} | ${response.responseTime}ms | ✅ Success |\n`;
    reportContent += `
## ${testName}

**URL:** \`${endpoint}\`
**Method:** ${method.toUpperCase()}
${data ? `
**Request Body:**
\`\`\`json
${JSON.stringify(data, null, 2)}
\`\`\`
` : ''}
${formatResponse(response)}
`;
    
    return response.data;
  } catch (error) {
    spinner.fail(`${testName} failed`);
    handleError(error, testName);
    return null;
  }
};

// Main test function
const runTests = async () => {
  console.log(chalk.bold.blue('🧪 Starting Quiz API Tests'));
  
  // First, let's authenticate to get a token
  try {
    const loginResponse = await callAPI('post', '/auth/login', {
      email: 'admin@example.com',
      password: 'adminPassword'
    });
    
    authToken = loginResponse.data.token;
    console.log(chalk.green('✅ Authentication successful'));
  } catch (error) {
    console.log(chalk.yellow('⚠️ Authentication failed, continuing without auth token'));
    console.log(chalk.gray('Some tests requiring authentication will likely fail'));
  }
  
  // 1. Get all quizzes (public)
  await testEndpoint(
    "Get All Quizzes",
    "get",
    "/quizzes?page=1&limit=5"
  ).then(data => {
    if (data && data.data && data.data.length > 0) {
      sampleQuizId = data.data[0]._id;
      console.log(chalk.gray(`Using sample quiz ID: ${sampleQuizId}`));
    }
  });
  
  // 2. Get a specific quiz if we have an ID
  if (sampleQuizId) {
    await testEndpoint(
      "Get Quiz by ID",
      "get",
      `/quizzes/${sampleQuizId}`
    );
    
    // Get questions for this quiz
    await testEndpoint(
      "Get Quiz Questions",
      "get",
      `/quizzes/${sampleQuizId}/questions`
    ).then(data => {
      if (data && data.data && data.data.length > 0) {
        sampleQuestionId = data.data[0]._id;
        console.log(chalk.gray(`Using sample question ID: ${sampleQuestionId}`));
      }
    });
  }
  
  // 3. Create a new quiz (requires auth)
  const newQuizData = {
    title: "Test Quiz Created by API Test",
    description: "This is a test quiz created by the API test script",
    subject: "Test Subject",
    difficultyLevel: "medium",
    timeLimit: 30, // 30 minutes
    totalMarks: 50
  };
  
  const createdQuiz = await testEndpoint(
    "Create New Quiz",
    "post",
    "/quizzes",
    newQuizData,
    true
  );
  
  let newQuizId = createdQuiz?._id || createdQuiz?.data?._id;
  
  if (newQuizId) {
    console.log(chalk.green(`Created quiz with ID: ${newQuizId}`));
    
    // 4. Add a question to the new quiz
    const newQuestionData = {
      text: "What is the capital of France?",
      type: "multiple-choice",
      options: [
        "London", 
        "Paris", 
        "Berlin", 
        "Madrid"
      ],
      correctAnswer: 1, // Paris (index 1)
      explanation: "Paris is the capital of France",
      marks: 5
    };
    
    const createdQuestion = await testEndpoint(
      "Add Question to Quiz",
      "post",
      `/quizzes/${newQuizId}/questions`,
      newQuestionData,
      true
    );
    
    const newQuestionId = createdQuestion?._id || createdQuestion?.data?._id;
    
    if (newQuestionId) {
      // 5. Update the question
      await testEndpoint(
        "Update Question",
        "put",
        `/quizzes/${newQuizId}/questions/${newQuestionId}`,
        {
          ...newQuestionData,
          explanation: "Paris is the capital and largest city of France"
        },
        true
      );
      
      // 6. Delete the question
      await testEndpoint(
        "Delete Question",
        "delete",
        `/quizzes/${newQuizId}/questions/${newQuestionId}`,
        null,
        true
      );
    }
    
    // 7. Update the quiz
    await testEndpoint(
      "Update Quiz",
      "put",
      `/quizzes/${newQuizId}`,
      {
        ...newQuizData,
        title: "Updated Test Quiz",
        description: "This quiz was updated by the API test script"
      },
      true
    );
    
    // 8. Delete the quiz
    await testEndpoint(
      "Delete Quiz",
      "delete",
      `/quizzes/${newQuizId}`,
      null,
      true
    );
  }
  
  // 9. Handle the case if we have a sample question from existing data
  if (sampleQuizId && sampleQuestionId) {
    // Test update question endpoint with existing data
    await testEndpoint(
      "Update Existing Question",
      "put",
      `/quizzes/${sampleQuizId}/questions/${sampleQuestionId}`,
      {
        explanation: "Updated explanation for testing purposes (will be restored)"
      },
      true
    );
  }
  
  // Finalize report
  reportContent += `
## Test Summary

Tests completed at ${new Date().toLocaleString()}

### Environment
- API Base URL: ${API_BASE_URL}
- Authentication: ${authToken ? 'Successful' : 'Failed or not attempted'}
`;

  // Write report to file
  fs.writeFileSync(REPORT_FILE, reportContent);
  console.log(chalk.green(`\n✅ Tests completed. Report saved to: ${REPORT_FILE}`));
};

// Run the tests
runTests().catch(err => {
  console.error(chalk.red('Test script failed:'), err);
  process.exit(1);
}); 