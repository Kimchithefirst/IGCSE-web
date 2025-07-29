# IGCSE Mock Test Website - Simplified PRD

## 1. Overview
A minimalist web platform that allows students to take IGCSE mock tests in a simulated exam environment. The focus is exclusively on providing realistic test experiences with immediate feedback.

## 2. Core Features

### 2.1 Mock Test System
- Subject-specific mock exams with timing constraints
- Multiple question types (multiple choice, short answer, essay)
- Realistic exam format and difficulty level
- Timer with automatic submission when time expires

### 2.2 Immediate Feedback
- Automatic scoring for objective questions
- Detailed answer explanations
- Identification of knowledge gaps
- Simple progress tracking

### 2.3 User Management
- Basic account creation and login
- Test history storage
- Simple profile management

## 3. Technical Architecture

### 3.1 Frontend
- Next.js for frontend development
- Tailwind CSS for styling
- Responsive design (mobile and desktop)

### 3.2 Backend
- Node.js/Express for API endpoints
- MongoDB for data storage
- JWT for basic authentication

### 3.3 Data Models
- User: basic profile and authentication info
- Tests: question banks and exam configurations
- Attempts: user test submissions and scores

## 4. User Journey

### 4.1 Student Flow
1. Register/Login
2. Select subject for testing
3. Take timed mock exam
4. Receive immediate results and explanations
5. Review test history

## 5. Implementation Priorities

### Phase 1: MVP
1. Set up project structure (Next.js frontend, Express backend)
2. Implement basic user authentication
3. Create mock test engine with timer
4. Develop basic feedback system
5. Build simple user dashboard

## 6. Technical Requirements

- Clean, minimalist UI with focus on readability
- Fast loading times (<2s)
- Mobile-responsive design
- Secure authentication
- Reliable test timing system

## 7. Success Metrics
- Test completion rate >80%
- Page load time <2 seconds
- User return rate >50%
- Test scoring accuracy 100% 