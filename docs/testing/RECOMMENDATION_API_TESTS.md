# Test Cases for Similar Questions API Endpoint

This document outlines test cases for the `GET /api/questions/:originalQuestionId/similar` endpoint, which is responsible for fetching questions similar to a given original question based on topic and keywords.

## 1. Prerequisites

Before running these test cases, ensure the following prerequisites are met:

*   **Running Backend Server**: The backend application server must be running and accessible.
*   **Populated Database**: The MongoDB database should be populated with `questions` data. This data should include:
    *   Several questions with various topics.
    *   Some questions should have a populated `keywords` array.
    *   Some questions should share topics and/or keywords.
    *   At least one question with a unique topic and no shared keywords to test empty results.
    *   Known valid `_id` values for existing questions (for `originalQuestionId`).
*   **Authentication Tokens**:
    *   Valid JWT authentication tokens for testing authenticated access.
    *   An example of an invalid or expired token for testing auth failure.
*   **API Testing Tool**: A tool capable of making HTTP GET requests and inspecting headers and response bodies (e.g., Postman, Insomnia, curl).

## 2. Test Cases

---

### Test Case ID: SIM-001
**Description**: Successful retrieval of similar questions when the original question has keywords and matching questions (by topic & some keywords) exist.
**HTTP Method**: GET
**Endpoint**: `/api/questions/:originalQuestionId/similar`
**Parameters**:
  - `originalQuestionId`: Replace with a valid `_id` of a question that has a populated `keywords` array and a known `topic`. Ensure other questions exist with the same `topic` and at least one matching keyword.
**Headers**:
  - `Authorization: Bearer <valid_token>`
**Expected Status Code**: 200
**Expected Response Body (Structure/Key Fields)**:
```json
{
  "success": true,
  "count": "number (integer, 0 to 5)",
  "data": [
    {
      "_id": "string (different from originalQuestionId)",
      "text": "string",
      "topic": "string (same as original question's topic)",
      "keywords": ["string", "..."],
      "options": [ { "text": "string", "isCorrect": "boolean", "_id": "string" }, "..." ], // Optional
      "type": "string",
      // Other relevant question fields, excluding 'answers' and 'explanation'
    },
    // ... up to 5 question objects
  ]
}
```
- The `data` array should contain question objects.
- Each question object's `_id` must not be the `originalQuestionId`.
- Each question object should ideally share the `topic` and at least one keyword with the original question.
- The array length should be between 0 and 5.

---

### Test Case ID: SIM-002
**Description**: Successful retrieval of similar questions based on topic match only, when the original question has no keywords or its keywords don't match any other questions.
**HTTP Method**: GET
**Endpoint**: `/api/questions/:originalQuestionId/similar`
**Parameters**:
  - `originalQuestionId`: Replace with a valid `_id` of a question that has an empty `keywords` array (or no `keywords` field) but shares its `topic` with other questions.
**Headers**:
  - `Authorization: Bearer <valid_token>`
**Expected Status Code**: 200
**Expected Response Body (Structure/Key Fields)**:
Similar to SIM-001.
- The `data` array should contain question objects matching the `topic` of the original question.
- `keywords` field in the query to MongoDB would not have been used for filtering.

---

### Test Case ID: SIM-003
**Description**: Successful retrieval with an empty array when no similar questions are found (e.g., original question has a unique topic or no other questions match the criteria).
**HTTP Method**: GET
**Endpoint**: `/api/questions/:originalQuestionId/similar`
**Parameters**:
  - `originalQuestionId`: Replace with a valid `_id` of a question whose `topic` and `keywords` (if any) do not match any other questions in the database (excluding itself).
**Headers**:
  - `Authorization: Bearer <valid_token>`
**Expected Status Code**: 200
**Expected Response Body (Structure/Key Fields)**:
```json
{
  "success": true,
  "count": 0,
  "data": []
}
```

---

### Test Case ID: SIM-004
**Description**: Error handling for an invalid `originalQuestionId` format (not a valid MongoDB ObjectId).
**HTTP Method**: GET
**Endpoint**: `/api/questions/invalid_id_format/similar`
**Parameters**:
  - `originalQuestionId`: `invalid_id_format` (a string that is not a valid ObjectId).
**Headers**:
  - `Authorization: Bearer <valid_token>`
**Expected Status Code**: 400
**Expected Response Body (Structure/Key Fields)**:
```json
{
  "success": false,
  "message": "Invalid original question ID format"
}
```

---

### Test Case ID: SIM-005
**Description**: Error handling when `originalQuestionId` is a valid ObjectId format but does not exist in the database.
**HTTP Method**: GET
**Endpoint**: `/api/questions/:originalQuestionId/similar`
**Parameters**:
  - `originalQuestionId`: Replace with a syntactically valid MongoDB ObjectId (e.g., `60d5f1f77238c09876543210`) that is known not to exist in the `questions` collection.
**Headers**:
  - `Authorization: Bearer <valid_token>`
**Expected Status Code**: 404
**Expected Response Body (Structure/Key Fields)**:
```json
{
  "success": false,
  "message": "Original question not found"
}
```

---

### Test Case ID: SIM-006
**Description**: Error handling for authentication failure when no token is provided.
**HTTP Method**: GET
**Endpoint**: `/api/questions/valid_question_id_placeholder/similar`
**Parameters**:
  - `originalQuestionId`: A valid question ID.
**Headers**:
  - (No `Authorization` header)
**Expected Status Code**: 401
**Expected Response Body (Structure/Key Fields)**:
```json
{
  "success": false,
  "message": "Not authorized, no token" // Or similar message from the 'protect' middleware
}
```

---

### Test Case ID: SIM-007
**Description**: Error handling for authentication failure when an invalid or expired token is provided.
**HTTP Method**: GET
**Endpoint**: `/api/questions/valid_question_id_placeholder/similar`
**Parameters**:
  - `originalQuestionId`: A valid question ID.
**Headers**:
  - `Authorization: Bearer <invalid_or_expired_token>`
**Expected Status Code**: 401
**Expected Response Body (Structure/Key Fields)**:
```json
{
  "success": false,
  "message": "Not authorized, token failed" // Or similar message from the 'protect' middleware
}
```

---

### Test Case ID: SIM-008 (Optional)
**Description**: Server error during database query.
**HTTP Method**: GET
**Endpoint**: `/api/questions/:originalQuestionId/similar`
**Parameters**:
  - `originalQuestionId`: A valid question ID.
**Headers**:
  - `Authorization: Bearer <valid_token>`
**Expected Status Code**: 500
**Expected Response Body (Structure/Key Fields)**:
```json
{
  "success": false,
  "message": "Server error while fetching similar questions",
  "error": "Description of the error if available in non-production environments"
}
```
**Note**: This test case might be difficult to reproduce reliably without specific mechanisms to simulate database failures (e.g., temporarily stopping the DB service during the test, or using fault injection if the backend supports it). The goal is to ensure the API handles unexpected database errors gracefully.

---
