# Quiz API Test Report
Generated on: 2025/4/27 18:26:02

## Summary

| Endpoint | Method | Status | Response Time | Result |
|----------|--------|--------|--------------|--------|
| /quizzes?page=1&limit=5 | GET | 200 | 17ms | ✅ Success |

## Get All Quizzes

**URL:** `/quizzes?page=1&limit=5`
**Method:** GET

### Response Details

**Status:** 200 OK
**Time:** 17ms

**Headers:**
```json
{
  "x-powered-by": "Express",
  "vary": "Origin",
  "access-control-allow-credentials": "true",
  "access-control-expose-headers": "Content-Length,X-Requested-With,Authorization",
  "content-type": "application/json; charset=utf-8",
  "content-length": "2051",
  "etag": "W/\"803-U0n7pyJoqgozGHD+HXe8UF0d2qg\"",
  "date": "Sun, 27 Apr 2025 10:26:02 GMT",
  "connection": "keep-alive",
  "keep-alive": "timeout=5"
}
```

**Response Body:**
```json
{
  "success": true,
  "count": 4,
  "total": 4,
  "pages": 1,
  "currentPage": 1,
  "data": [
    {
      "_id": "680dd2f5aeaf7782435fae2a",
      "title": "Introduction to Calculus",
      "subject": "Mathematics",
      "description": "An introduction to limits, derivatives, and basic integration concepts.",
      "duration": 75,
      "difficultyLevel": "advanced",
      "totalPoints": 100,
      "passingPoints": 60,
      "isPublished": true,
      "topicTags": [
        "Calculus",
        "Derivatives",
        "Limits",
        "Integration"
      ],
      "tags": [
        "IGCSE",
        "Math",
        "Advanced",
        "Calculus"
      ],
      "createdAt": "2025-04-27T06:47:17.871Z",
      "updatedAt": "2025-04-27T06:47:17.871Z",
      "__v": 0,
      "difficulty": "advanced",
      "id": "680dd2f5aeaf7782435fae2a"
    },
    {
      "_id": "680dd2f5aeaf7782435fae16",
      "title": "Geometry Essentials",
      "subject": "Mathematics",
      "description": "Test your knowledge of geometric shapes, theorems, and properties.",
      "duration": 60,
      "difficultyLevel": "intermediate",
      "totalPoints": 100,
      "passingPoints": 60,
      "isPublished": true,
      "topicTags": [
        "Geometry",
        "Shapes",
        "Theorems",
        "Measurement"
      ],
      "tags": [
        "IGCSE",
        "Math",
        "Geometry"
      ],
      "createdAt": "2025-04-27T06:47:17.862Z",
      "updatedAt": "2025-04-27T06:47:17.862Z",
      "__v": 0,
      "difficulty": "intermediate",
      "id": "680dd2f5aeaf7782435fae16"
    },
    {
      "_id": "680dd2f5aeaf7782435fae02",
      "title": "Algebra Fundamentals",
      "subject": "Mathematics",
      "description": "Test your understanding of algebraic expressions, equations, and inequalities.",
      "duration": 45,
      "difficultyLevel": "intermediate",
      "totalPoints": 100,
      "passingPoints": 60,
      "isPublished": true,
      "topicTags": [
        "Algebra",
        "Equations",
        "Inequalities",
        "Functions"
      ],
      "tags": [
        "IGCSE",
        "Math",
        "Algebra"
      ],
      "createdAt": "2025-04-27T06:47:17.844Z",
      "updatedAt": "2025-04-27T06:47:17.844Z",
      "__v": 0,
      "difficulty": "intermediate",
      "id": "680dd2f5aeaf7782435fae02"
    },
    {
      "_id": "680dcf7062fff17c706b1c1f",
      "title": "Test Quiz",
      "subject": "Test",
      "description": "This is a test quiz to verify database connectivity",
      "duration": 15,
      "difficultyLevel": "beginner",
      "totalPoints": 0,
      "passingPoints": 0,
      "isPublished": true,
      "topicTags": [],
      "tags": [],
      "createdAt": "2025-04-27T06:32:16.716Z",
      "updatedAt": "2025-04-27T06:32:16.716Z",
      "__v": 0,
      "difficulty": "beginner",
      "id": "680dcf7062fff17c706b1c1f"
    }
  ]
}
```

| /quizzes/680dd2f5aeaf7782435fae2a | GET | 200 | 17ms | ✅ Success |

## Get Quiz by ID

**URL:** `/quizzes/680dd2f5aeaf7782435fae2a`
**Method:** GET

### Response Details

**Status:** 200 OK
**Time:** 17ms

**Headers:**
```json
{
  "x-powered-by": "Express",
  "vary": "Origin",
  "access-control-allow-credentials": "true",
  "access-control-expose-headers": "Content-Length,X-Requested-With,Authorization",
  "content-type": "application/json; charset=utf-8",
  "content-length": "4279",
  "etag": "W/\"10b7-jwggDZq474SNiay6ljumwHhUg44\"",
  "date": "Sun, 27 Apr 2025 10:26:02 GMT",
  "connection": "keep-alive",
  "keep-alive": "timeout=5"
}
```

**Response Body:**
```json
{
  "success": true,
  "data": {
    "quiz": {
      "_id": "680dd2f5aeaf7782435fae2a",
      "title": "Introduction to Calculus",
      "subject": "Mathematics",
      "description": "An introduction to limits, derivatives, and basic integration concepts.",
      "duration": 75,
      "difficultyLevel": "advanced",
      "totalPoints": 100,
      "passingPoints": 60,
      "isPublished": true,
      "topicTags": [
        "Calculus",
        "Derivatives",
        "Limits",
        "Integration"
      ],
      "tags": [
        "IGCSE",
        "Math",
        "Advanced",
        "Calculus"
      ],
      "createdAt": "2025-04-27T06:47:17.871Z",
      "updatedAt": "2025-04-27T06:47:17.871Z",
      "__v": 0,
      "difficulty": "advanced",
      "id": "680dd2f5aeaf7782435fae2a"
    },
    "questions": [
      {
        "_id": "680dd2f5aeaf7782435fae2c",
        "text": "What is the derivative of f(x) = x²?",
        "options": [
          {
            "text": "f'(x) = 2x",
            "isCorrect": true,
            "_id": "680dd2f5aeaf7782435fae2d"
          },
          {
            "text": "f'(x) = x²",
            "isCorrect": false,
            "_id": "680dd2f5aeaf7782435fae2e"
          },
          {
            "text": "f'(x) = 2",
            "isCorrect": false,
            "_id": "680dd2f5aeaf7782435fae2f"
          },
          {
            "text": "f'(x) = x",
            "isCorrect": false,
            "_id": "680dd2f5aeaf7782435fae30"
          }
        ],
        "explanation": "The derivative of x^n is n·x^(n-1). For x², n = 2, so the derivative is 2x^1 = 2x.",
        "quizId": "680dd2f5aeaf7782435fae2a",
        "points": 15,
        "type": "multiple-choice",
        "difficultyLevel": "medium",
        "hasMathFormula": true,
        "acceptableErrorMargin": 0,
        "topic": "Calculus",
        "__v": 0,
        "createdAt": "2025-04-27T06:47:17.876Z",
        "updatedAt": "2025-04-27T06:47:17.876Z",
        "difficulty": "medium",
        "marks": 15,
        "correctAnswer": "f'(x) = 2x",
        "id": "680dd2f5aeaf7782435fae2c"
      },
      {
        "_id": "680dd2f5aeaf7782435fae31",
        "text": "Find the derivative of f(x) = 3x² + 2x - 5",
        "options": [
          {
            "text": "f'(x) = 6x + 2",
            "isCorrect": true,
            "_id": "680dd2f5aeaf7782435fae32"
          },
          {
            "text": "f'(x) = 3x² + 2",
            "isCorrect": false,
            "_id": "680dd2f5aeaf7782435fae33"
          },
          {
            "text": "f'(x) = 6x² + 2x",
            "isCorrect": false,
            "_id": "680dd2f5aeaf7782435fae34"
          },
          {
            "text": "f'(x) = 3x + 2",
            "isCorrect": false,
            "_id": "680dd2f5aeaf7782435fae35"
          }
        ],
        "explanation": "Use the power rule and linearity of differentiation: f'(x) = 3·2x + 2·1 - 0 = 6x + 2.",
        "quizId": "680dd2f5aeaf7782435fae2a",
        "points": 20,
        "type": "multiple-choice",
        "difficultyLevel": "hard",
        "hasMathFormula": true,
        "acceptableErrorMargin": 0,
        "topic": "Calculus",
        "__v": 0,
        "createdAt": "2025-04-27T06:47:17.876Z",
        "updatedAt": "2025-04-27T06:47:17.876Z",
        "difficulty": "hard",
        "marks": 20,
        "correctAnswer": "f'(x) = 6x + 2",
        "id": "680dd2f5aeaf7782435fae31"
      },
      {
        "_id": "680dd2f5aeaf7782435fae36",
        "text": "What is the integral of f(x) = 2x?",
        "options": [
          {
            "text": "F(x) = x² + C",
            "isCorrect": true,
            "_id": "680dd2f5aeaf7782435fae37"
          },
          {
            "text": "F(x) = 2x² + C",
            "isCorrect": false,
            "_id": "680dd2f5aeaf7782435fae38"
          },
          {
            "text": "F(x) = x + C",
            "isCorrect": false,
            "_id": "680dd2f5aeaf7782435fae39"
          },
          {
            "text": "F(x) = 2x + C",
            "isCorrect": false,
            "_id": "680dd2f5aeaf7782435fae3a"
          }
        ],
        "explanation": "The integral of x^n is (x^(n+1))/(n+1) + C. For 2x, we have 2·x^1, so the integral is 2·(x^2)/2 + C = x² + C.",
        "quizId": "680dd2f5aeaf7782435fae2a",
        "points": 20,
        "type": "multiple-choice",
        "difficultyLevel": "hard",
        "hasMathFormula": true,
        "acceptableErrorMargin": 0,
        "topic": "Calculus",
        "__v": 0,
        "createdAt": "2025-04-27T06:47:17.876Z",
        "updatedAt": "2025-04-27T06:47:17.876Z",
        "difficulty": "hard",
        "marks": 20,
        "correctAnswer": "F(x) = x² + C",
        "id": "680dd2f5aeaf7782435fae36"
      },
      {
        "_id": "680dd2f5aeaf7782435fae3b",
        "text": "Evaluate the limit: lim(x→0) (sin(x)/x)",
        "explanation": "This is a fundamental limit in calculus. As x approaches 0, sin(x)/x approaches 1.",
        "quizId": "680dd2f5aeaf7782435fae2a",
        "points": 25,
        "type": "numerical",
        "difficultyLevel": "hard",
        "hasMathFormula": true,
        "correctAnswerForNumerical": "1",
        "acceptableErrorMargin": 0,
        "topic": "Calculus",
        "options": [],
        "__v": 0,
        "createdAt": "2025-04-27T06:47:17.876Z",
        "updatedAt": "2025-04-27T06:47:17.876Z",
        "difficulty": "hard",
        "marks": 25,
        "correctAnswer": "1",
        "id": "680dd2f5aeaf7782435fae3b"
      },
      {
        "_id": "680dd2f5aeaf7782435fae3c",
        "text": "Find f'(2) for f(x) = x³ - 4x² + 5x - 3",
        "explanation": "f'(x) = 3x² - 8x + 5. Substitute x = 2: f'(2) = 3(2)² - 8(2) + 5 = 3(4) - 16 + 5 = 12 - 16 + 5 = 1.",
        "quizId": "680dd2f5aeaf7782435fae2a",
        "points": 20,
        "type": "numerical",
        "difficultyLevel": "hard",
        "hasMathFormula": true,
        "correctAnswerForNumerical": "1",
        "acceptableErrorMargin": 0,
        "topic": "Calculus",
        "options": [],
        "__v": 0,
        "createdAt": "2025-04-27T06:47:17.876Z",
        "updatedAt": "2025-04-27T06:47:17.876Z",
        "difficulty": "hard",
        "marks": 20,
        "correctAnswer": "1",
        "id": "680dd2f5aeaf7782435fae3c"
      }
    ]
  }
}
```

| /quizzes/680dd2f5aeaf7782435fae2a/questions | GET | 200 | 11ms | ✅ Success |

## Get Quiz Questions

**URL:** `/quizzes/680dd2f5aeaf7782435fae2a/questions`
**Method:** GET

### Response Details

**Status:** 200 OK
**Time:** 11ms

**Headers:**
```json
{
  "x-powered-by": "Express",
  "vary": "Origin",
  "access-control-allow-credentials": "true",
  "access-control-expose-headers": "Content-Length,X-Requested-With,Authorization",
  "content-type": "application/json; charset=utf-8",
  "content-length": "3737",
  "etag": "W/\"e99-evK2tEbQnVyaCMYd1uNicvFcyps\"",
  "date": "Sun, 27 Apr 2025 10:26:02 GMT",
  "connection": "keep-alive",
  "keep-alive": "timeout=5"
}
```

**Response Body:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "680dd2f5aeaf7782435fae2c",
      "text": "What is the derivative of f(x) = x²?",
      "options": [
        {
          "text": "f'(x) = 2x",
          "isCorrect": true,
          "_id": "680dd2f5aeaf7782435fae2d"
        },
        {
          "text": "f'(x) = x²",
          "isCorrect": false,
          "_id": "680dd2f5aeaf7782435fae2e"
        },
        {
          "text": "f'(x) = 2",
          "isCorrect": false,
          "_id": "680dd2f5aeaf7782435fae2f"
        },
        {
          "text": "f'(x) = x",
          "isCorrect": false,
          "_id": "680dd2f5aeaf7782435fae30"
        }
      ],
      "explanation": "The derivative of x^n is n·x^(n-1). For x², n = 2, so the derivative is 2x^1 = 2x.",
      "quizId": "680dd2f5aeaf7782435fae2a",
      "points": 15,
      "type": "multiple-choice",
      "difficultyLevel": "medium",
      "hasMathFormula": true,
      "acceptableErrorMargin": 0,
      "topic": "Calculus",
      "__v": 0,
      "createdAt": "2025-04-27T06:47:17.876Z",
      "updatedAt": "2025-04-27T06:47:17.876Z",
      "difficulty": "medium",
      "marks": 15,
      "correctAnswer": "f'(x) = 2x",
      "id": "680dd2f5aeaf7782435fae2c"
    },
    {
      "_id": "680dd2f5aeaf7782435fae31",
      "text": "Find the derivative of f(x) = 3x² + 2x - 5",
      "options": [
        {
          "text": "f'(x) = 6x + 2",
          "isCorrect": true,
          "_id": "680dd2f5aeaf7782435fae32"
        },
        {
          "text": "f'(x) = 3x² + 2",
          "isCorrect": false,
          "_id": "680dd2f5aeaf7782435fae33"
        },
        {
          "text": "f'(x) = 6x² + 2x",
          "isCorrect": false,
          "_id": "680dd2f5aeaf7782435fae34"
        },
        {
          "text": "f'(x) = 3x + 2",
          "isCorrect": false,
          "_id": "680dd2f5aeaf7782435fae35"
        }
      ],
      "explanation": "Use the power rule and linearity of differentiation: f'(x) = 3·2x + 2·1 - 0 = 6x + 2.",
      "quizId": "680dd2f5aeaf7782435fae2a",
      "points": 20,
      "type": "multiple-choice",
      "difficultyLevel": "hard",
      "hasMathFormula": true,
      "acceptableErrorMargin": 0,
      "topic": "Calculus",
      "__v": 0,
      "createdAt": "2025-04-27T06:47:17.876Z",
      "updatedAt": "2025-04-27T06:47:17.876Z",
      "difficulty": "hard",
      "marks": 20,
      "correctAnswer": "f'(x) = 6x + 2",
      "id": "680dd2f5aeaf7782435fae31"
    },
    {
      "_id": "680dd2f5aeaf7782435fae36",
      "text": "What is the integral of f(x) = 2x?",
      "options": [
        {
          "text": "F(x) = x² + C",
          "isCorrect": true,
          "_id": "680dd2f5aeaf7782435fae37"
        },
        {
          "text": "F(x) = 2x² + C",
          "isCorrect": false,
          "_id": "680dd2f5aeaf7782435fae38"
        },
        {
          "text": "F(x) = x + C",
          "isCorrect": false,
          "_id": "680dd2f5aeaf7782435fae39"
        },
        {
          "text": "F(x) = 2x + C",
          "isCorrect": false,
          "_id": "680dd2f5aeaf7782435fae3a"
        }
      ],
      "explanation": "The integral of x^n is (x^(n+1))/(n+1) + C. For 2x, we have 2·x^1, so the integral is 2·(x^2)/2 + C = x² + C.",
      "quizId": "680dd2f5aeaf7782435fae2a",
      "points": 20,
      "type": "multiple-choice",
      "difficultyLevel": "hard",
      "hasMathFormula": true,
      "acceptableErrorMargin": 0,
      "topic": "Calculus",
      "__v": 0,
      "createdAt": "2025-04-27T06:47:17.876Z",
      "updatedAt": "2025-04-27T06:47:17.876Z",
      "difficulty": "hard",
      "marks": 20,
      "correctAnswer": "F(x) = x² + C",
      "id": "680dd2f5aeaf7782435fae36"
    },
    {
      "_id": "680dd2f5aeaf7782435fae3b",
      "text": "Evaluate the limit: lim(x→0) (sin(x)/x)",
      "explanation": "This is a fundamental limit in calculus. As x approaches 0, sin(x)/x approaches 1.",
      "quizId": "680dd2f5aeaf7782435fae2a",
      "points": 25,
      "type": "numerical",
      "difficultyLevel": "hard",
      "hasMathFormula": true,
      "correctAnswerForNumerical": "1",
      "acceptableErrorMargin": 0,
      "topic": "Calculus",
      "options": [],
      "__v": 0,
      "createdAt": "2025-04-27T06:47:17.876Z",
      "updatedAt": "2025-04-27T06:47:17.876Z",
      "difficulty": "hard",
      "marks": 25,
      "correctAnswer": "1",
      "id": "680dd2f5aeaf7782435fae3b"
    },
    {
      "_id": "680dd2f5aeaf7782435fae3c",
      "text": "Find f'(2) for f(x) = x³ - 4x² + 5x - 3",
      "explanation": "f'(x) = 3x² - 8x + 5. Substitute x = 2: f'(2) = 3(2)² - 8(2) + 5 = 3(4) - 16 + 5 = 12 - 16 + 5 = 1.",
      "quizId": "680dd2f5aeaf7782435fae2a",
      "points": 20,
      "type": "numerical",
      "difficultyLevel": "hard",
      "hasMathFormula": true,
      "correctAnswerForNumerical": "1",
      "acceptableErrorMargin": 0,
      "topic": "Calculus",
      "options": [],
      "__v": 0,
      "createdAt": "2025-04-27T06:47:17.876Z",
      "updatedAt": "2025-04-27T06:47:17.876Z",
      "difficulty": "hard",
      "marks": 20,
      "correctAnswer": "1",
      "id": "680dd2f5aeaf7782435fae3c"
    }
  ]
}
```

| http://localhost:3001/api/quizzes | POST | 403 | - | ❌ Failed |

## Create New Quiz (Failed)

**URL:** http://localhost:3001/api/quizzes
**Method:** POST

### Error Details
```json
{
  "success": false,
  "message": "Not authorized to create quizzes"
}
```
| http://localhost:3001/api/quizzes/680dd2f5aeaf7782435fae2a/questions/680dd2f5aeaf7782435fae2c | PUT | 403 | - | ❌ Failed |

## Update Existing Question (Failed)

**URL:** http://localhost:3001/api/quizzes/680dd2f5aeaf7782435fae2a/questions/680dd2f5aeaf7782435fae2c
**Method:** PUT

### Error Details
```json
{
  "success": false,
  "message": "Not authorized to update questions"
}
```

## Test Summary

Tests completed at 2025/4/27 18:26:02

### Environment
- API Base URL: http://localhost:3001/api
- Authentication: Failed or not attempted
