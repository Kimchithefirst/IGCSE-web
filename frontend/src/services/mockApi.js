// Mock API service for testing when backend is unavailable
export const mockApi = {
  // Health check
  health: () => Promise.resolve({
    status: 'success',
    message: 'Mock API is running',
    timestamp: new Date().toISOString()
  }),

  // Authentication
  login: (credentials) => {
    const { username, password } = credentials;
    
    if (username === 'student' && password === 'password123') {
      return Promise.resolve({
        success: true,
        message: 'Login successful',
        user: {
          id: 1,
          username: 'student',
          role: 'student'
        }
      });
    } else {
      return Promise.reject({
        success: false,
        message: 'Invalid credentials'
      });
    }
  },

  // IGCSE Quiz data
  getIGCSEQuizzes: () => Promise.resolve({
    success: true,
    data: [
      {
        paperCode: 'PHYSICS_JUNE_2020_P1',
        examSession: 'June 2020',
        paperType: 'Paper 1',
        subject: 'Physics',
        questions: [
          {
            id: 1,
            questionText: 'What is the SI unit of force?',
            options: ['Newton', 'Joule', 'Watt', 'Pascal'],
            correctAnswer: 'Newton'
          },
          {
            id: 2,
            questionText: 'What is the speed of light in vacuum?',
            options: ['3 × 10^8 m/s', '3 × 10^6 m/s', '3 × 10^9 m/s', '3 × 10^7 m/s'],
            correctAnswer: '3 × 10^8 m/s'
          },
          {
            id: 3,
            questionText: 'Which of the following is a vector quantity?',
            options: ['Speed', 'Distance', 'Velocity', 'Time'],
            correctAnswer: 'Velocity'
          },
          {
            id: 4,
            questionText: 'What is the acceleration due to gravity on Earth?',
            options: ['9.8 m/s²', '10 m/s²', '8.9 m/s²', '11 m/s²'],
            correctAnswer: '9.8 m/s²'
          },
          {
            id: 5,
            questionText: 'Which law states that for every action there is an equal and opposite reaction?',
            options: ['First Law of Motion', 'Second Law of Motion', 'Third Law of Motion', 'Law of Gravitation'],
            correctAnswer: 'Third Law of Motion'
          }
        ]
      },
      {
        paperCode: 'PHYSICS_JUNE_2020_P2',
        examSession: 'June 2020',
        paperType: 'Paper 2',
        subject: 'Physics',
        questions: [
          {
            id: 6,
            questionText: 'What is the formula for kinetic energy?',
            options: ['½mv²', 'mgh', 'Fd', 'Pt'],
            correctAnswer: '½mv²'
          },
          {
            id: 7,
            questionText: 'Which type of wave is sound?',
            options: ['Transverse', 'Longitudinal', 'Electromagnetic', 'Standing'],
            correctAnswer: 'Longitudinal'
          }
        ]
      }
    ]
  }),

  // Dashboard data
  getDashboard: () => Promise.resolve({
    success: true,
    message: 'Dashboard data',
    stats: {
      totalQuestions: 128,
      subjects: ['Physics'],
      papers: 16,
      completedQuizzes: 3,
      averageScore: 85
    }
  })
};

// API wrapper that can switch between real API and mock
export const createApiService = (useRealApi = true) => {
  const baseURL = import.meta.env.VITE_API_URL;
  
  // If backend is unavailable or we're in mock mode, use mock data
  if (!useRealApi || baseURL === 'mock' || import.meta.env.VITE_USE_MOCK_DATA === 'true') {
    console.log('🔧 Using Mock API for testing');
    return {
      get: (endpoint) => {
        switch (endpoint) {
          case '/api/health':
            return mockApi.health();
          case '/api/quizzes/igcse':
            return mockApi.getIGCSEQuizzes();
          case '/api/dashboard':
            return mockApi.getDashboard();
          default:
            return Promise.reject({ message: 'Mock endpoint not found' });
        }
      },
      post: (endpoint, data) => {
        switch (endpoint) {
          case '/api/auth/login':
            return mockApi.login(data);
          default:
            return Promise.reject({ message: 'Mock endpoint not found' });
        }
      }
    };
  }

  // Real API calls
  return {
    get: async (endpoint) => {
      const response = await fetch(`${baseURL}${endpoint}`);
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    },
    post: async (endpoint, data) => {
      const response = await fetch(`${baseURL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    }
  };
}; 