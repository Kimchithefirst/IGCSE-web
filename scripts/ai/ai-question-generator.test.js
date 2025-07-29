const AIQuestionGenerator = require('./ai-question-generator');
const https = require('https');

jest.mock('https');

describe('AIQuestionGenerator', () => {
  let originalEnv;
  let mockRequest;
  let mockResponse;

  beforeEach(() => {
    originalEnv = { ...process.env }; // Backup environment variables
    jest.clearAllMocks(); // Clear all mocks

    // Mock https.request
    mockResponse = {
      on: jest.fn((event, callback) => {
        if (event === 'data') {
          // Simulate receiving data chunks
          callback(JSON.stringify({ choices: [{ message: { content: '[]' } }] }));
        }
        if (event === 'end') {
          callback(); // Simulate end of response
        }
      }),
      statusCode: 200,
      headers: {},
    };
    mockRequest = {
      on: jest.fn((event, callback) => {
         if (event === 'error') {
            // Store the error callback to be called manually if needed
            mockRequest.errorCallback = callback;
         }
         if (event === 'timeout') {
            mockRequest.timeoutCallback = callback;
         }
      }),
      write: jest.fn(),
      end: jest.fn(),
      destroy: jest.fn(), // Mock destroy for timeout simulation
    };
    https.request.mockImplementation((options, callback) => {
      // Allow tests to access the callback to simulate response
      if (callback) {
        callback(mockResponse);
      }
      return mockRequest;
    });
  });

  afterEach(() => {
    process.env = originalEnv; // Restore environment variables
  });

  describe('Constructor & Initialization', () => {
    it('should enable AI generation if API key exists and AI_GENERATION_ENABLED is true', () => {
      process.env.OPENROUTER_API_KEY = 'test-key';
      process.env.AI_GENERATION_ENABLED = 'true';
      const generator = new AIQuestionGenerator();
      expect(generator.isEnabled).toBe(true);
    });

    it('should disable AI generation if API key is missing', () => {
      delete process.env.OPENROUTER_API_KEY;
      process.env.AI_GENERATION_ENABLED = 'true';
      const generator = new AIQuestionGenerator();
      expect(generator.isEnabled).toBe(false);
    });

    it('should disable AI generation if AI_GENERATION_ENABLED is false', () => {
      process.env.OPENROUTER_API_KEY = 'test-key';
      process.env.AI_GENERATION_ENABLED = 'false';
      const generator = new AIQuestionGenerator();
      expect(generator.isEnabled).toBe(false);
    });

    it('should use default config values if environment variables are not set', () => {
        // Ensure critical ones for constructor logic are tested if they affect isEnabled
        // Other defaults are tested implicitly in other method tests where they are used.
        const generator = new AIQuestionGenerator(); // No env vars set here beyond defaults
        expect(generator.isEnabled).toBe(!!(process.env.OPENROUTER_API_KEY && process.env.AI_GENERATION_ENABLED === 'true'));
        // This test mainly ensures constructor doesn't crash with missing envs.
        // The actual default values are defined globally in the module,
        // so we'd be testing Node.js behavior for undefined process.env access if we went deeper here.
    });
  });

  describe('generateSimilarQuestions', () => {
    const originalQuestion = {
      id: 'q1',
      questionText: 'What is photosynthesis?',
      topic: 'Biology',
      keywords: ['plants', 'energy'],
      difficultyLevel: 'Easy',
      subject: 'Biology',
    };

    beforeEach(() => {
        // Default to AI being enabled for these tests unless specified
        process.env.OPENROUTER_API_KEY = 'test-key';
        process.env.AI_GENERATION_ENABLED = 'true';
        process.env.AI_GENERATION_CACHE_ENABLED = 'false'; // Default cache to off for most tests
        process.env.AI_QUESTIONS_TO_GENERATE = '2';
    });

    it('should return empty array if AI is disabled', async () => {
      process.env.AI_GENERATION_ENABLED = 'false';
      const generator = new AIQuestionGenerator(); // Re-init to pick up new env
      const questions = await generator.generateSimilarQuestions(originalQuestion);
      expect(questions).toEqual([]);
      expect(https.request).not.toHaveBeenCalled();
    });

    it('should return cached questions if cache is enabled and valid entry exists', async () => {
      process.env.AI_GENERATION_CACHE_ENABLED = 'true';
      process.env.AI_GENERATION_CACHE_TTL = '3600000'; // 1 hour
      const generator = new AIQuestionGenerator();
      const cachedData = [{ text: 'Cached Q1' }];
      generator.cache.set(`${originalQuestion.id}_2`, { questions: cachedData, timestamp: Date.now() });

      const questions = await generator.generateSimilarQuestions(originalQuestion, 2);
      expect(questions).toEqual(cachedData);
      expect(https.request).not.toHaveBeenCalled();
    });

    it('should call OpenRouter API if cache is disabled or no valid entry', async () => {
      process.env.AI_GENERATION_CACHE_ENABLED = 'false';
      const generator = new AIQuestionGenerator();
      // Mock successful API response for this test
      mockResponse.on = jest.fn((event, callback) => {
        if (event === 'data') callback(Buffer.from(JSON.stringify({ choices: [{ message: { content: JSON.stringify([{ text: 'New Q1' }]) } }] })));
        if (event === 'end') callback();
      });

      await generator.generateSimilarQuestions(originalQuestion, 1);
      expect(https.request).toHaveBeenCalledTimes(1);
    });

    it('should return questions and cache them on successful API response (cache enabled)', async () => {
        process.env.AI_GENERATION_CACHE_ENABLED = 'true';
        process.env.AI_GENERATION_CACHE_TTL = '3600000';
        const generator = new AIQuestionGenerator();
        const mockApiResponse = [{ text: 'Successful API Q1', options: [{text:"A",isCorrect:true},{text:"B",isCorrect:false},{text:"C",isCorrect:false},{text:"D",isCorrect:false}], correctAnswer: "A" }];

        mockResponse.on = jest.fn((event, callback) => {
            if (event === 'data') callback(Buffer.from(JSON.stringify({ choices: [{ message: { content: JSON.stringify(mockApiResponse) } }] })));
            if (event === 'end') callback();
        });

        const questions = await generator.generateSimilarQuestions(originalQuestion, 1);
        expect(questions.length).toBe(1);
        expect(questions[0].text).toBe('Successful API Q1');
        expect(generator.cache.has(`${originalQuestion.id}_1`)).toBe(true);
    });

    it('should return empty array and log error if API call fails (e.g. non-200 status)', async () => {
        const generator = new AIQuestionGenerator();
        mockResponse.statusCode = 500; // Simulate server error
        mockResponse.on = jest.fn((event, callback) => { // Simulate error response
            if (event === 'data') callback(Buffer.from(JSON.stringify({ error: "Server Error" })));
            if (event === 'end') callback();
        });
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        const questions = await generator.generateSimilarQuestions(originalQuestion, 1);
        expect(questions).toEqual([]);
        expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('OpenRouter API error: 500'));
        consoleErrorSpy.mockRestore();
    });

    it('should return empty array and log error on https.request `error` event', async () => {
        const generator = new AIQuestionGenerator();
        https.request.mockImplementation((options, callback) => {
            const req = {
                on: (event, cb) => { if(event === 'error') req.errorCallback = cb; }, // Store error callback
                write: jest.fn(),
                end: jest.fn(),
            };
            // Simulate the error event being emitted
            setImmediate(() => req.errorCallback(new Error("Network Error")));
            return req;
        });

        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        const questions = await generator.generateSimilarQuestions(originalQuestion, 1);

        expect(questions).toEqual([]);
        expect(consoleErrorSpy).toHaveBeenCalledWith('❌ AI question generation failed:', 'OpenRouter request failed: Network Error');
        consoleErrorSpy.mockRestore();
    });

    it('should return empty array and log error on https.request `timeout` event', async () => {
        const generator = new AIQuestionGenerator();
         https.request.mockImplementation((options, callback) => {
            const req = {
                on: (event, cb) => { if(event === 'timeout') req.timeoutCallback = cb; }, // Store timeout callback
                write: jest.fn(),
                end: jest.fn(),
                destroy: jest.fn()
            };
            setImmediate(() => req.timeoutCallback()); // Simulate timeout
            return req;
        });
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        const questions = await generator.generateSimilarQuestions(originalQuestion, 1);
        expect(questions).toEqual([]);
        expect(consoleErrorSpy).toHaveBeenCalledWith('❌ AI question generation failed:', 'OpenRouter request timeout');
        consoleErrorSpy.mockRestore();
    });


    it('should return empty array if API response is invalid JSON', async () => {
        const generator = new AIQuestionGenerator();
        mockResponse.on = jest.fn((event, callback) => {
            if (event === 'data') callback(Buffer.from("This is not JSON"));
            if (event === 'end') callback();
        });
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        const questions = await generator.generateSimilarQuestions(originalQuestion, 1);
        expect(questions).toEqual([]);
        expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Failed to parse OpenRouter response:'));
        consoleErrorSpy.mockRestore();
    });

    it('should correctly use count parameter or default from env', async () => {
        process.env.AI_QUESTIONS_TO_GENERATE = '3'; // Default count
        const generator = new AIQuestionGenerator();
        const buildPromptSpy = jest.spyOn(generator, 'buildPrompt');
        mockResponse.on = jest.fn((event, callback) => { // Mock successful response
            if (event === 'data') callback(Buffer.from(JSON.stringify({ choices: [{ message: { content: '[]' } }] })));
            if (event === 'end') callback();
        });

        // Test with default count
        await generator.generateSimilarQuestions(originalQuestion);
        expect(buildPromptSpy).toHaveBeenCalledWith(expect.any(Object), 3);

        // Test with specific count parameter
        await generator.generateSimilarQuestions(originalQuestion, 5);
        expect(buildPromptSpy).toHaveBeenCalledWith(expect.any(Object), 5);
        buildPromptSpy.mockRestore();
    });

    it('should not use cached items after CACHE_TTL has passed', async () => {
        process.env.AI_GENERATION_CACHE_ENABLED = 'true';
        process.env.AI_GENERATION_CACHE_TTL = '1'; // 1 ms TTL for quick expiry
        const generator = new AIQuestionGenerator();
        const cachedData = [{ text: 'Cached Q1' }];
        generator.cache.set(`${originalQuestion.id}_1`, { questions: cachedData, timestamp: Date.now() - 100 }); // Expired

        mockResponse.on = jest.fn((event, callback) => { // Mock successful API response
            if (event === 'data') callback(Buffer.from(JSON.stringify({ choices: [{ message: { content: JSON.stringify([{ text: 'New Q1' }]) } }] })));
            if (event === 'end') callback();
        });

        await generator.generateSimilarQuestions(originalQuestion, 1);
        expect(https.request).toHaveBeenCalledTimes(1); // API should be called as cache is expired
        expect(generator.cache.get(`${originalQuestion.id}_1`).questions[0].text).toBe('New Q1'); // Cache updated
    });

  });

  describe('buildPrompt', () => {
    let generator;
    beforeEach(() => {
        generator = new AIQuestionGenerator();
    });

    it('should include difficultyLevel, subject, topic, and keywords in the prompt', () => {
      const q = {
        questionText: 'What is X?',
        difficultyLevel: 'Hard',
        subject: 'Advanced Science',
        topic: 'Quantum Mechanics',
        keywords: ['quantum', 'physics'],
        id: 'q2'
      };
      const prompt = generator.buildPrompt(q, 1);
      expect(prompt).toContain('Difficulty Level: Hard');
      expect(prompt).toContain('Subject: Advanced Science');
      expect(prompt).toContain('Topics: Quantum Mechanics');
      expect(prompt).toContain('Keywords: quantum, physics');
      expect(prompt).toContain('Generate 1 similar multiple-choice Advanced Science questions');
      expect(prompt).toContain('Format your response as a valid JSON array:');
      expect(prompt).toContain('"basedOn": "q2"');
    });

    it('should use fallback for subject if not provided in originalQuestion', () => {
        const q = { questionText: 'Explain force.', id: 'q3', keywords: ['force'] }; // No subject
        const prompt = generator.buildPrompt(q, 1);
        // The fallback subject is 'Physics' based on keywords like 'force'
        expect(prompt).toContain('Subject: Physics');
    });

    it('should handle missing optional fields gracefully', () => {
        const q = { questionText: 'A question.', id: 'q4' }; // Minimal data
        const prompt = generator.buildPrompt(q,1);
        expect(prompt).toContain('Difficulty Level: IGCSE'); // Default difficulty
        expect(prompt).toContain('Keywords: None');
        // Fallback subject detection will run
    });
  });

  describe('parseAndValidateResponse', () => {
    let generator;
    const originalQuestion = { id: 'q-orig' };
    beforeEach(() => {
        generator = new AIQuestionGenerator();
    });

    it('should parse valid JSON array of questions', () => {
      const response = JSON.stringify([
        { text: 'Q1?', options: [{text:'A',isCorrect:true},{text:'B',isCorrect:false},{text:'C',isCorrect:false},{text:'D',isCorrect:false}], correctAnswer: 'A' },
        { text: 'Q2?', options: [{text:'A',isCorrect:false},{text:'B',isCorrect:true},{text:'C',isCorrect:false},{text:'D',isCorrect:false}], correctAnswer: 'B' },
      ]);
      const questions = generator.parseAndValidateResponse(response, originalQuestion);
      expect(questions.length).toBe(2);
      expect(questions[0].text).toBe('Q1?');
      expect(questions[1].basedOn).toBe('q-orig');
    });

    it('should filter out invalid questions from a valid JSON array', () => {
      const response = JSON.stringify([
        { text: 'Valid Q', options: [{text:'A',isCorrect:true},{text:'B',isCorrect:false},{text:'C',isCorrect:false},{text:'D',isCorrect:false}], correctAnswer: 'A' },
        { text: 'Invalid Q - no options' },
      ]);
      const questions = generator.parseAndValidateResponse(response, originalQuestion);
      expect(questions.length).toBe(1);
      expect(questions[0].text).toBe('Valid Q');
    });

    it('should return empty array if JSON is not an array', () => {
      const response = JSON.stringify({ text: 'Not an array' });
      const questions = generator.parseAndValidateResponse(response, originalQuestion);
      expect(questions).toEqual([]);
    });

    it('should handle JSON wrapped in markdown backticks', () => {
        const jsonContent = JSON.stringify([{ text: 'Q1', options: [{text:'A',isCorrect:true},{text:'B',isCorrect:false},{text:'C',isCorrect:false},{text:'D',isCorrect:false}], correctAnswer: 'A' }]);
        const response = "```json\n" + jsonContent + "\n```";
        const questions = generator.parseAndValidateResponse(response, originalQuestion);
        expect(questions.length).toBe(1);
        expect(questions[0].text).toBe('Q1');
    });

    it('should return empty array for empty JSON array', () => {
        const response = "[]";
        const questions = generator.parseAndValidateResponse(response, originalQuestion);
        expect(questions).toEqual([]);
    });

    it('should correctly add AI-specific fields like id, generatedBy, basedOn', () => {
        const apiQuestion = { text: 'Test Q', options: [{text:'A',isCorrect:true},{text:'B',isCorrect:false},{text:'C',isCorrect:false},{text:'D',isCorrect:false}], correctAnswer: 'A' };
        const response = JSON.stringify([apiQuestion]);
        const questions = generator.parseAndValidateResponse(response, originalQuestion);
        expect(questions.length).toBe(1);
        expect(questions[0].id).toBe(`ai_${originalQuestion.id}_1`);
        expect(questions[0].generatedBy).toBe('AI');
        expect(questions[0].basedOn).toBe(originalQuestion.id);
        expect(questions[0].type).toBe('multiple-choice');
    });
  });
});
