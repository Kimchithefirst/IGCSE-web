# IGCSE Web Platform Project Structure

This document provides a detailed overview of the project structure, explaining the purpose of key directories and files.

## Root Directory Structure

```
IGCSE-web/
├── .cursor/          # Cursor AI IDE configuration
├── backend/          # Express backend API
├── frontend/         # React frontend application 
├── igcse_mock_test/  # Next.js application
├── scripts/          # Project-wide utility scripts
├── tasks/            # Task management files
├── docs/             # Project documentation
├── .env              # Environment variables for development
├── .env.example      # Example environment variable template
├── .gitignore        # Git ignore specifications
├── package.json      # Root package.json for project-wide scripts
└── README.md         # Project overview and setup instructions
```

## Backend Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   │   ├── database.ts   # MongoDB connection setup
│   │   ├── logger.ts     # Logging configuration
│   │   └── env.ts        # Environment variables handling
│   │
│   ├── controllers/      # Request handlers
│   │   ├── auth.ts       # Authentication controllers
│   │   ├── quizzes.ts    # Quiz management controllers
│   │   ├── attempts.ts   # Quiz attempt controllers
│   │   └── ...           # Other domain controllers
│   │
│   ├── middleware/       # Express middleware
│   │   ├── auth.ts       # Authentication middleware
│   │   ├── error.ts      # Error handling middleware
│   │   ├── logger.ts     # Request logging middleware
│   │   └── validate.ts   # Input validation middleware
│   │
│   ├── models/           # Mongoose schema definitions
│   │   ├── User.ts       # User model
│   │   ├── Quiz.ts       # Quiz model
│   │   ├── Attempt.ts    # Quiz attempt model
│   │   └── ...           # Other data models
│   │
│   ├── routes/           # API route definitions
│   │   ├── auth.ts       # Authentication routes
│   │   ├── quizzes.ts    # Quiz routes
│   │   ├── attempts.ts   # Attempt routes
│   │   └── index.ts      # Route aggregation
│   │
│   ├── scripts/          # Utility scripts
│   │   ├── seed.ts       # Database seeding script
│   │   └── setupDatabase.ts # Database setup helper
│   │
│   ├── services/         # Business logic
│   │   ├── auth.ts       # Authentication services
│   │   ├── quiz.ts       # Quiz management services
│   │   └── ...           # Other domain services
│   │
│   ├── types/            # TypeScript type definitions
│   │   ├── express/      # Express-specific types
│   │   └── models/       # Model type definitions
│   │
│   └── server.ts         # Main server entry point
│
├── dist/                 # Compiled TypeScript (production build)
├── node_modules/         # Node.js dependencies
├── package.json          # Backend dependencies and scripts
└── tsconfig.json         # TypeScript configuration
```

## Frontend Structure

```
frontend/
├── public/               # Static assets
│   ├── favicon.ico       # Site favicon
│   ├── logo.png          # Site logo
│   └── index.html        # HTML template
│
├── src/
│   ├── assets/           # Images and other assets
│   │   ├── images/       # Image files
│   │   └── icons/        # Icon files
│   │
│   ├── components/       # Reusable UI components
│   │   ├── common/       # Shared UI components
│   │   ├── layout/       # Layout components
│   │   ├── quiz/         # Quiz-specific components
│   │   └── ...           # Other feature components
│   │
│   ├── context/          # React context providers
│   │   ├── AuthContext.tsx # Authentication context
│   │   └── ...           # Other contexts
│   │
│   ├── data/             # Mock data and constants
│   │   ├── mockTests.ts  # Sample test data
│   │   └── constants.ts  # Application constants
│   │
│   ├── pages/            # Page components
│   │   ├── Home.tsx      # Home page
│   │   ├── Login.tsx     # Login page
│   │   ├── Dashboard.tsx # User dashboard
│   │   └── ...           # Other pages
│   │
│   ├── utils/            # Utility functions
│   │   ├── api.ts        # API integration utilities
│   │   ├── auth.ts       # Authentication helpers
│   │   └── ...           # Other utilities
│   │
│   ├── App.tsx           # Main application component
│   ├── index.tsx         # Application entry point
│   └── routes.tsx        # Route definitions
│
├── node_modules/         # Node.js dependencies
├── package.json          # Frontend dependencies and scripts
└── tsconfig.json         # TypeScript configuration
```

## Next.js Application Structure

```
igcse_mock_test/
├── public/               # Static assets
│   ├── favicon.ico       # Site favicon
│   └── ...               # Other static files
│
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── api/          # API routes
│   │   │   ├── attempts/ # Attempt API routes
│   │   │   └── quizzes/  # Quiz API routes
│   │   │
│   │   ├── test/         # Test-related routes
│   │   │   └── [subject]/ # Dynamic subject routes
│   │   │       └── result/ # Test results pages
│   │   │
│   │   ├── layout.tsx    # Root layout
│   │   └── page.tsx      # Home page
│   │
│   ├── components/       # Reusable UI components
│   │   ├── ui/           # UI component library
│   │   ├── quiz/         # Quiz-specific components
│   │   └── ...           # Other components
│   │
│   ├── styles/           # Global styles
│   │   ├── globals.css   # Global CSS
│   │   └── ...           # Other stylesheets
│   │
│   ├── types/            # TypeScript type definitions
│   │   ├── quiz.ts       # Quiz-related types
│   │   └── ...           # Other type definitions
│   │
│   └── utils/            # Utility functions
│       ├── api.ts        # API integration utilities
│       └── ...           # Other utilities
│
├── .next/                # Next.js build output
├── node_modules/         # Node.js dependencies
├── package.json          # Dependencies and scripts
└── tsconfig.json         # TypeScript configuration
```

## Key Configuration Files

### Backend Configuration

- **`backend/src/config/database.ts`**: MongoDB connection configuration
  - Establishes connection to the database
  - Handles connection errors with detailed feedback
  - Sets up event listeners for connection events

- **`backend/src/server.ts`**: Express server configuration
  - Configures middleware (CORS, body parsing, logging)
  - Sets up routes
  - Initializes database connection
  - Starts HTTP server

### Frontend Configuration

- **`frontend/src/utils/api.ts`**: API configuration
  - Sets up Axios instances
  - Configures request/response interceptors
  - Handles authentication token management

### Next.js Configuration

- **`igcse_mock_test/next.config.js`**: Next.js configuration
  - Configures environment variables
  - Sets up API rewrites and redirects
  - Configures build optimization

## Application Flow

1. **User Authentication**:
   - User logs in via `/api/auth/login`
   - JWT token stored in browser
   - Authenticated requests include token

2. **Quiz Selection**:
   - Available quizzes fetched from `/api/quizzes`
   - User selects a quiz to attempt

3. **Quiz Attempt**:
   - Attempt created via `/api/attempts`
   - User completes quiz within time limit
   - Answers submitted via `/api/attempts/:id`

4. **Results and Progress**:
   - Results displayed after submission
   - Progress tracked in user dashboard
   - Statistics available via `/api/statistics`

## Development Workflow

1. Run backend and frontend concurrently:
   ```bash
   npm run dev
   ```

2. Backend-only development:
   ```bash
   npm run backend
   ```

3. Frontend-only development:
   ```bash
   npm run frontend
   ```

4. Build for production:
   ```bash
   # In the respective directories
   cd backend && npm run build
   cd frontend && npm run build
   cd igcse_mock_test && npm run build
   ```

## Data Flow Architecture

The application follows a standard three-tier architecture:

1. **Presentation Tier**: Frontend and Next.js applications
2. **Logic Tier**: Express backend API with controllers and services
3. **Data Tier**: MongoDB database accessed via Mongoose

API requests flow as follows:
`Client → Routes → Middleware → Controllers → Services → Models → Database` 