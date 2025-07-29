// API base URL - will use environment variables in production
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Generic fetch function with error handling
async function fetchFromAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      // Try to parse error message from response
      let errorMessage;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || `API error: ${response.status}`;
      } catch (e) {
        errorMessage = `API error: ${response.status}`;
      }
      throw new Error(errorMessage);
    }

    return await response.json() as T;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// Mock Tests API endpoints
export interface MockTest {
  id: string;
  title: string;
  subject: string;
  description: string;
  duration: number; // in minutes
  questionCount: number;
  difficultyLevel: 'easy' | 'medium' | 'hard';
  createdAt: Date;
}

// Interface for IGCSE Paper (subset of IQuiz)
export interface IgcsePaper {
  _id: string;
  title: string;
  subject: string;
  paperCode?: string;
  examSession?: string;
  // Add other fields if needed for display
}

// Interface for the API response for quizzes
interface QuizzesApiResponse {
  success: boolean;
  count: number;
  total: number;
  pages: number;
  currentPage: number;
  data: IgcsePaper[];
}

// Basic interface for Question (matching IQuestion structure from backend for display)
export interface IQuestionMin {
  _id: string;
  text: string;
  options?: Array<{ _id?: string; text: string; isCorrect: boolean }>; // Retains isCorrect
  type?: string;
  correctAnswer?: string; // For non-MCQ or as a direct field if available
  // Add other fields if needed for display of similar questions
}

interface SimilarQuestionsApiResponse {
  success: boolean;
  count: number;
  data: IQuestionMin[];
}


export const MockTestsAPI = {
  // Get all mock tests
  getAll: () => fetchFromAPI<MockTest[]>('/mock-tests'),
  
  // Get a specific mock test by ID
  getById: (id: string) => fetchFromAPI<MockTest>(`/mock-tests/${id}`),
};

export const QuizzesAPI = {
  // Fetch IGCSE papers, can also take other parameters like subject, examSession
  getIgcsePapers: (params?: Record<string, string | number | boolean>) => {
    const queryParams = new URLSearchParams();
    queryParams.append('isIGCSEPaper', 'true');
    if (params) {
      for (const key in params) {
        if (Object.prototype.hasOwnProperty.call(params, key) && params[key] !== undefined) {
          queryParams.append(key, String(params[key]));
        }
      }
    }
    return fetchFromAPI<QuizzesApiResponse>(`/api/quizzes?${queryParams.toString()}`);
  },
  getSimilarQuestions: (originalQuestionId: string) => {
    // Assuming the token is handled by a global fetch interceptor or default headers
    // If not, Authorization header might be needed here.
    return fetchFromAPI<SimilarQuestionsApiResponse>(`/api/questions/${originalQuestionId}/similar`);
  },
};

// Health check endpoint
export const HealthAPI = {
  check: () => fetchFromAPI<{ status: string }>('/api/health.js'),
};

// Export more API modules as needed
export default {
  MockTests: MockTestsAPI,
  Quizzes: QuizzesAPI,
  Health: HealthAPI,
}; 