# API Documentation for IGCSE Web Platform

This document provides details about the available API endpoints, their purpose, request/response formats, and authentication requirements.

## Base URL

All API endpoints are prefixed with `/api`. The default base URL in development is:

```
http://localhost:3001/api
```

## Available Endpoints

### Health Check

- **Endpoint**: `/api/health`
- **Method**: `GET`
- **Description**: Simple health check endpoint to verify the API is running
- **Authentication**: None
- **Response**: `200 OK` with status information

### Debug

- **Endpoint**: `/api/debug`
- **Method**: `GET`
- **Description**: Returns debug information about the server environment
- **Authentication**: None
- **Response**: Server configuration and environment information

### Mock Tests

- **Base Endpoint**: `/api/mock-tests`
- **Available Methods**:
  - `GET /api/mock-tests`: Retrieve all mock tests
  - `GET /api/mock-tests/:id`: Retrieve a specific mock test by ID
  - `POST /api/mock-tests`: Create a new mock test (admin only)
  - `PUT /api/mock-tests/:id`: Update an existing mock test (admin only)
  - `DELETE /api/mock-tests/:id`: Delete a mock test (admin only)
  - `GET /api/mock-tests/sample`: Retrieve sample mock test data (for demonstration)
- **Authentication**: Required for POST, PUT, DELETE operations
- **Response Format**:
  ```json
  {
    "success": true,
    "count": 1,
    "data": [
      {
        "id": "mock-test-id",
        "title": "Mock Test Title",
        "subject": "Mathematics",
        "duration": 60,
        "questions": [
          {
            "id": "question-id",
            "text": "Question text",
            "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
            "correctAnswer": "Option 2",
            "explanation": "Explanation for the correct answer"
          }
        ]
      }
    ]
  }
  ```

### Quizzes

- **Base Endpoint**: `/api/quizzes`
- **Available Methods**:
  - `GET /api/quizzes`: Retrieve all quizzes
  - `GET /api/quizzes/:id`: Retrieve a specific quiz by ID
  - `POST /api/quizzes`: Create a new quiz
  - `PUT /api/quizzes/:id`: Update an existing quiz
  - `DELETE /api/quizzes/:id`: Delete a quiz
- **Authentication**: Required for POST, PUT, DELETE operations
- **Response Format**: Similar to mock tests but with quiz-specific fields

### Quiz Attempts

- **Base Endpoint**: `/api/attempts`
- **Available Methods**:
  - `GET /api/attempts`: Retrieve all attempts for the authenticated user
  - `GET /api/attempts/:id`: Retrieve a specific attempt by ID
  - `POST /api/attempts`: Create a new attempt
  - `PUT /api/attempts/:id`: Update an attempt (e.g., submit answers)
  - `DELETE /api/attempts/:id`: Delete an attempt
- **Authentication**: Required for all operations
- **Response Format**:
  ```json
  {
    "success": true,
    "data": {
      "id": "attempt-id",
      "userId": "user-id",
      "quizId": "quiz-id",
      "startTime": "2023-06-01T10:00:00Z",
      "endTime": "2023-06-01T11:00:00Z",
      "answers": [
        {
          "questionId": "question-id",
          "selectedAnswer": "Selected answer",
          "isCorrect": true
        }
      ],
      "score": 85,
      "status": "completed"
    }
  }
  ```

### Authentication

- **Base Endpoint**: `/api/auth`
- **Available Methods**:
  - `POST /api/auth/register`: Register a new user
  - `POST /api/auth/login`: Login with email and password
  - `GET /api/auth/me`: Get the current user's profile
  - `POST /api/auth/logout`: Logout current user
  - `POST /api/auth/refresh-token`: Refresh JWT token
- **Authentication**: Required for `/me` and `/logout` endpoints
- **Request Format for Register**:
  ```json
  {
    "name": "Student Name",
    "email": "student@example.com",
    "password": "secure_password",
    "role": "student"
  }
  ```
- **Response Format for Login**:
  ```json
  {
    "success": true,
    "token": "JWT_TOKEN",
    "user": {
      "id": "user-id",
      "name": "Student Name",
      "email": "student@example.com",
      "role": "student"
    }
  }
  ```

### Statistics

- **Base Endpoint**: `/api/statistics`
- **Available Methods**:
  - `GET /api/statistics/user`: Get statistics for the current user
  - `GET /api/statistics/quiz/:id`: Get statistics for a specific quiz
- **Authentication**: Required
- **Response Format**:
  ```json
  {
    "success": true,
    "data": {
      "totalAttempts": 10,
      "averageScore": 75.5,
      "highestScore": 95,
      "recentAttempts": [
        {
          "id": "attempt-id",
          "quizId": "quiz-id",
          "quizTitle": "Quiz Title",
          "date": "2023-06-01T10:00:00Z",
          "score": 85
        }
      ],
      "subjectPerformance": {
        "Mathematics": 80,
        "Physics": 75,
        "Chemistry": 90
      }
    }
  }
  ```

### Dashboard

- **Base Endpoint**: `/api/dashboard`
- **Available Methods**:
  - `GET /api/dashboard`: Get dashboard data for the current user
- **Authentication**: Required
- **Response Format**:
  ```json
  {
    "success": true,
    "data": {
      "recentActivity": [],
      "upcomingTests": [],
      "progressSummary": {},
      "recommendedQuizzes": []
    }
  }
  ```

### Question Results

- **Base Endpoint**: `/api/question-results`
- **Available Methods**:
  - `GET /api/question-results`: Get results for all questions attempted by the user
  - `GET /api/question-results/:id`: Get results for a specific question
- **Authentication**: Required
- **Response Format**:
  ```json
  {
    "success": true,
    "data": {
      "correctCount": 5,
      "incorrectCount": 2,
      "questionDetails": []
    }
  }
  ```

### Data Seeding

- **Base Endpoint**: `/api/seed`
- **Available Methods**:
  - `POST /api/seed/quizzes`: Seed quiz data
  - `POST /api/seed/users`: Seed user data
- **Authentication**: Admin only
- **Response Format**:
  ```json
  {
    "success": true,
    "message": "Data seeded successfully"
  }
  ```

## Error Handling

All API endpoints follow a consistent error response format:

```json
{
  "success": false,
  "error": "Error message",
  "stack": "Stack trace (development only)"
}
```

Common HTTP status codes:
- `200 OK`: Request succeeded
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Authentication required or failed
- `403 Forbidden`: Permission denied
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server-side error

## Authentication

The API uses JWT (JSON Web Token) for authentication. To authenticate requests:

1. Obtain a token by calling the `/api/auth/login` endpoint
2. Include the token in the Authorization header of subsequent requests:
   ```
   Authorization: Bearer YOUR_JWT_TOKEN
   ```

## Rate Limiting

The API implements rate limiting to prevent abuse:
- 100 requests per IP address per 15-minute window
- 5 failed login attempts per IP address per hour

## API Versioning

The current API version is v1 (implicit in the path). Future versions may be specified as `/api/v2/`, etc. 