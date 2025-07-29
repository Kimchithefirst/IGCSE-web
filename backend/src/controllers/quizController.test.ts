import { getSimilarQuestions } from './quizController'; // Adjust path as necessary
import { Question } from '../models/Question';
import AIQuestionGenerator from '../../../scripts/ai/ai-question-generator.js';
import mongoose from 'mongoose';

// Mock an ObjectId
const mockObjectId = (idString: string) => new mongoose.Types.ObjectId(idString);

// Mock Question model
jest.mock('../models/Question', () => ({
  Question: {
    findById: jest.fn(),
    find: jest.fn(),
  }
}));

// Mock AIQuestionGenerator
jest.mock('../../../scripts/ai/ai-question-generator.js', () => {
  return jest.fn().mockImplementation(() => {
    return {
      generateSimilarQuestions: jest.fn(),
    };
  });
});

// Mock mongoose ObjectId validation
jest.mock('mongoose', () => {
  const actualMongoose = jest.requireActual('mongoose');
  return {
    ...actualMongoose,
    Types: {
      ...actualMongoose.Types,
      ObjectId: {
        ...actualMongoose.Types.ObjectId,
        isValid: jest.fn(), // Mock isValid specifically
      },
    },
  };
});


describe('Quiz Controller - getSimilarQuestions', () => {
  let mockRequest: any;
  let mockResponse: any;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Reset mocks for each test
    jest.clearAllMocks();

    mockRequest = {
      params: {},
      query: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    // Backup original process.env
    originalEnv = { ...process.env };

    // Default Mongoose isValid to true for valid IDs passed to it in tests
    (mongoose.Types.ObjectId.isValid as jest.Mock).mockImplementation((id) => {
        // Simple check: if it's a string of 24 hex characters, it's considered valid for testing purposes
        // or if it's an actual ObjectId instance.
        if (typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id)) {
            return true;
        }
        if (id instanceof mongoose.Types.ObjectId) {
            return true;
        }
        // Specific IDs used in tests that should be valid
        if (['60f1b0b3e6b3c2a4e8f0b6a1', '60f1b0b3e6b3c2a4e8f0b6b2', '60f1b0b3e6b3c2a4e8f0b6b3'].includes(id)) return true;

        return false; // Default to false for anything else like 'invalid-id'
    });
  });

  afterEach(() => {
    // Restore original process.env
    process.env = originalEnv;
  });

  // --- Test Scenarios ---

  // Scenario 1: Sufficient questions from DB
  it('should return only DB questions if sufficient and not call AI generator', async () => {
    process.env.DESIRED_SIMILAR_QUESTIONS = '5';
    process.env.AI_GENERATION_ENABLED = 'true'; // AI is enabled but shouldn't be called

    const mockOriginalQuestion = {
      _id: mockObjectId('60f1b0b3e6b3c2a4e8f0b6a1'),
      questionText: 'Original question text?',
      topic: 'Physics',
      keywords: ['gravity', 'force'],
      difficultyLevel: 'Medium',
      subject: 'Physics',
    };

    const mockDbQuestions = Array(5).fill(null).map((_, i) => ({
      _id: mockObjectId(`60f1b0b3e6b3c2a4e8f0b6b${i+2}`), // ensure valid objectId like strings
      questionText: `DB Question ${i + 1}`,
      topic: 'Physics',
    }));

    (Question.findById as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockOriginalQuestion)
    });
    (Question.find as jest.Mock).mockReturnValue({
        limit: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockDbQuestions)
    });

    mockRequest.params.originalQuestionId = '60f1b0b3e6b3c2a4e8f0b6a1';

    await getSimilarQuestions(mockRequest, mockResponse);

    expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith('60f1b0b3e6b3c2a4e8f0b6a1');
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      count: 5,
      data: mockDbQuestions,
    }));
    expect(AIQuestionGenerator.prototype.generateSimilarQuestions).not.toHaveBeenCalled();
  });

  // Scenario 2: Insufficient questions from DB, AI enabled, AI success
  it('should return combined DB and AI questions when DB is insufficient and AI succeeds', async () => {
    process.env.DESIRED_SIMILAR_QUESTIONS = '5';
    process.env.AI_QUESTIONS_TO_GENERATE = '3';
    process.env.AI_GENERATION_ENABLED = 'true';

    const mockOriginalQuestion = {
      _id: mockObjectId('60f1b0b3e6b3c2a4e8f0b6a1'),
      questionText: 'Original question text?',
      topic: 'Physics',
      keywords: ['gravity', 'force'],
      difficultyLevel: 'Medium',
      subject: 'Physics',
    };

    const mockDbQuestions = [
      { _id: mockObjectId('60f1b0b3e6b3c2a4e8f0b6b2'), questionText: 'DB Q1' },
      { _id: mockObjectId('60f1b0b3e6b3c2a4e8f0b6b3'), questionText: 'DB Q2' },
    ];

    const mockAiQuestions = [
      { _id: 'ai_q1', questionText: 'AI Q1', generatedBy: 'AI' },
      { _id: 'ai_q2', questionText: 'AI Q2', generatedBy: 'AI' },
      { _id: 'ai_q3', questionText: 'AI Q3', generatedBy: 'AI' },
    ];

    (Question.findById as jest.Mock).mockReturnValue({ exec: jest.fn().mockResolvedValue(mockOriginalQuestion) });
    (Question.find as jest.Mock).mockReturnValue({
        limit: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockDbQuestions)
    });
    (AIQuestionGenerator.prototype.generateSimilarQuestions as jest.Mock).mockResolvedValue(mockAiQuestions);

    mockRequest.params.originalQuestionId = '60f1b0b3e6b3c2a4e8f0b6a1';
    await getSimilarQuestions(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      count: 5, // 2 DB + 3 AI
      data: [...mockDbQuestions, ...mockAiQuestions], // AI questions are sliced to fit DESIRED_SIMILAR_QUESTIONS
    }));
    expect(AIQuestionGenerator.prototype.generateSimilarQuestions).toHaveBeenCalledTimes(1);

    const questionsNeededFromAI = parseInt(process.env.DESIRED_SIMILAR_QUESTIONS) - mockDbQuestions.length;
    const actualAiRequestCount = Math.min(questionsNeededFromAI, parseInt(process.env.AI_QUESTIONS_TO_GENERATE));
    expect(AIQuestionGenerator.prototype.generateSimilarQuestions).toHaveBeenCalledWith(
      expect.any(Object),
      actualAiRequestCount,
      mockOriginalQuestion.subject
    );
  });

  // Scenario 3: Insufficient questions from DB, AI disabled
  it('should return only DB questions if AI is disabled', async () => {
    process.env.DESIRED_SIMILAR_QUESTIONS = '5';
    process.env.AI_GENERATION_ENABLED = 'false'; // AI is disabled

    const mockOriginalQuestion = {
      _id: mockObjectId('60f1b0b3e6b3c2a4e8f0b6a1'),
      questionText: 'Original question text?',
      topic: 'Physics',
      subject: 'Physics',
    };
    const mockDbQuestions = [
      { _id: mockObjectId('60f1b0b3c2a4e8f0b6b2'), questionText: 'DB Q1' },
    ];

    (Question.findById as jest.Mock).mockReturnValue({ exec: jest.fn().mockResolvedValue(mockOriginalQuestion) });
    (Question.find as jest.Mock).mockReturnValue({
        limit: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockDbQuestions)
    });

    mockRequest.params.originalQuestionId = '60f1b0b3e6b3c2a4e8f0b6a1';
    await getSimilarQuestions(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      count: mockDbQuestions.length,
      data: mockDbQuestions,
    }));
    expect(AIQuestionGenerator.prototype.generateSimilarQuestions).not.toHaveBeenCalled();
  });

  // Scenario 4: Insufficient questions from DB, AI enabled, AI returns empty/fails
  it('should return only DB questions if AI fails or returns empty', async () => {
    process.env.DESIRED_SIMILAR_QUESTIONS = '5';
    process.env.AI_QUESTIONS_TO_GENERATE = '3';
    process.env.AI_GENERATION_ENABLED = 'true';

    const mockOriginalQuestion = {
      _id: mockObjectId('60f1b0b3e6b3c2a4e8f0b6a1'),
      questionText: 'Original question text?',
      topic: 'Physics',
      subject: 'Physics',
    };
    const mockDbQuestions = [
      { _id: mockObjectId('60f1b0b3e6b3c2a4e8f0b6b2'), questionText: 'DB Q1' },
    ];

    (Question.findById as jest.Mock).mockReturnValue({ exec: jest.fn().mockResolvedValue(mockOriginalQuestion) });
    (Question.find as jest.Mock).mockReturnValue({
        limit: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockDbQuestions)
    });
    // Simulate AI failure (returns empty array)
    (AIQuestionGenerator.prototype.generateSimilarQuestions as jest.Mock).mockResolvedValue([]);

    mockRequest.params.originalQuestionId = '60f1b0b3e6b3c2a4e8f0b6a1';
    await getSimilarQuestions(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      count: mockDbQuestions.length,
      data: mockDbQuestions,
    }));
    expect(AIQuestionGenerator.prototype.generateSimilarQuestions).toHaveBeenCalledTimes(1);

    // Test AI throwing an error
    (AIQuestionGenerator.prototype.generateSimilarQuestions as jest.Mock).mockRejectedValue(new Error("AI Error"));
    // Clear console.error mock for this specific sub-test if needed, or use spyOn(console, 'error').mockImplementation(() => {});
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});


    await getSimilarQuestions(mockRequest, mockResponse);
    expect(mockResponse.status).toHaveBeenCalledWith(200); // Should still succeed with DB questions
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      count: mockDbQuestions.length,
      data: mockDbQuestions,
    }));
    // Called once for the empty return, once for the error = 2 total calls in this "it" block
    expect(AIQuestionGenerator.prototype.generateSimilarQuestions).toHaveBeenCalledTimes(2);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error generating AI questions:', expect.any(Error));
    consoleErrorSpy.mockRestore();
  });

  // Scenario 5: Original question not found
  it('should return 404 if original question is not found', async () => {
    (Question.findById as jest.Mock).mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
    mockRequest.params.originalQuestionId = '60f1b0b3e6b3c2a4e8f0b6a1';

    await getSimilarQuestions(mockRequest, mockResponse);

    expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith('60f1b0b3e6b3c2a4e8f0b6a1');
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: 'Original question not found',
    });
  });

  // Scenario 6: Invalid originalQuestionId
  it('should return 400 if originalQuestionId is invalid', async () => {
    mockRequest.params.originalQuestionId = 'invalid-id';
    // mongoose.Types.ObjectId.isValid will be called by the controller and return false based on beforeEach setup

    await getSimilarQuestions(mockRequest, mockResponse);

    expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith('invalid-id');
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: 'Invalid original question ID format',
    });
  });

  // Scenario 7: Correct data mapping to AI generator
  it('should pass correctly mapped data to AIQuestionGenerator', async () => {
    process.env.DESIRED_SIMILAR_QUESTIONS = '5';
    process.env.AI_QUESTIONS_TO_GENERATE = '3';
    process.env.AI_GENERATION_ENABLED = 'true';

    const originalQuestionIdStr = '60f1b0b3e6b3c2a4e8f0b6a1';
    const mockOriginalQuestionData = {
      _id: mockObjectId(originalQuestionIdStr),
      questionText: 'What is inertia?',
      topic: 'Newton Laws',
      keywords: ['inertia', 'mass', 'motion'],
      difficultyLevel: 'Easy',
      subject: 'Physics',
    };

    (Question.findById as jest.Mock).mockReturnValue({ exec: jest.fn().mockResolvedValue(mockOriginalQuestionData) });
    (Question.find as jest.Mock).mockReturnValue({
        limit: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([])
    });
    (AIQuestionGenerator.prototype.generateSimilarQuestions as jest.Mock).mockResolvedValue([]);

    mockRequest.params.originalQuestionId = originalQuestionIdStr;
    await getSimilarQuestions(mockRequest, mockResponse);

    expect(AIQuestionGenerator.prototype.generateSimilarQuestions).toHaveBeenCalledTimes(1);

    const expectedAiGeneratorInput = {
      id: originalQuestionIdStr,
      questionText: mockOriginalQuestionData.questionText,
      topic: mockOriginalQuestionData.topic,
      keywords: mockOriginalQuestionData.keywords,
      difficultyLevel: mockOriginalQuestionData.difficultyLevel,
      subject: mockOriginalQuestionData.subject,
    };
    const questionsToRequestFromAI = Math.min(
        parseInt(process.env.DESIRED_SIMILAR_QUESTIONS), // 5
        parseInt(process.env.AI_QUESTIONS_TO_GENERATE)   // 3
    ); // So, 3 questions will be requested

    expect(AIQuestionGenerator.prototype.generateSimilarQuestions).toHaveBeenCalledWith(
      expectedAiGeneratorInput,
      questionsToRequestFromAI, // This should be 3 based on the env settings for this test
      mockOriginalQuestionData.subject
    );
  });
});
