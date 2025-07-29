// Import the server instance itself, not the http module directly for the main listener
// server.js exports the http.Server instance
const serverInstance = require('./server');
const http = require('http'); // Required for type hints or specific mocks if needed
const mongoose = require('mongoose');

// Mock mongoose to prevent actual DB operations
jest.mock('mongoose', () => ({
  connect: jest.fn().mockResolvedValue(true), // Mock connect to resolve successfully
  disconnect: jest.fn().mockResolvedValue(true),
  model: jest.fn().mockImplementation((name, schema) => {
    // Return a mock model with mock static and instance methods
    const mockModel = {
      findOne: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      find: jest.fn().mockReturnThis(), // for chaining like .find().select()
      select: jest.fn().mockReturnThis(),
      // Add other methods as needed by server.js during the requests
    };
    // Mock schema methods if any are directly called on User instances, e.g. user.getSignedJwtToken
    if (name === 'User') {
        mockModel.schema = {
            methods: {
                getSignedJwtToken: jest.fn().mockReturnValue('mock-test-token'),
                matchPassword: jest.fn().mockResolvedValue(true),
            }
        };
        // Mock the instance methods by returning a mock user object
        const mockUserInstance = {
            _id: new mongoose.Types.ObjectId().toString(), // Use actual ObjectId then convert
            name: 'Test User',
            email: 'test@example.com',
            role: 'student',
            isEmailVerified: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            getSignedJwtToken: jest.fn().mockReturnValue('mock-test-token-instance'),
            matchPassword: jest.fn().mockResolvedValue(true),
        };
        mockModel.findOne.mockResolvedValue(mockUserInstance);
        mockModel.create.mockResolvedValue(mockUserInstance);
        mockModel.findById.mockResolvedValue(mockUserInstance);

    } else if (name === 'Question' || name === 'Quiz') {
        mockModel.find.mockResolvedValue([]); // Default to empty array for Question/Quiz
    }
    return mockModel;
  }),
  Schema: jest.fn().mockImplementation(function(schemaDefinition, options) {
    // Mock pre and methods for schema if necessary, e.g. User password hashing
    this.pre = jest.fn();
    this.methods = {}; // Store methods defined on schema
    return this;
  }),
  Types: { // Mock mongoose.Types.ObjectId if needed for ID generation/validation in tests
      ObjectId: jest.fn((id) => ({ // Simple mock for ObjectId
        toString: () => id || new Date().getTime().toString(), // return input or a new pseudo-id
        equals: (other) => other && other.toString() === (id || '').toString(),
    }))
  }
}));


// Mock ai-question-generator as it's imported in server.js
jest.mock('./ai-question-generator', () => ({
    generateSimilarQuestions: jest.fn().mockResolvedValue([]),
}));


describe('Root Server CORS Configuration Tests', () => {
  let mockRequest;
  let mockResponse;
  let requestListener;
  let originalConsoleLog;
  let originalConsoleError;

  beforeAll(async () => {
    // Suppress console output from the server during these tests
    originalConsoleLog = console.log;
    originalConsoleError = console.error;
    console.log = jest.fn();
    console.error = jest.fn();

    // Get the request listener from the server instance
    // serverInstance is the http.Server instance from server.js
    // Wait for the server to potentially complete its async setup (like startServer in server.js)
    // However, server.js calls startServer() which calls server.listen().
    // We need the listener before listen() or after it's set up.
    // For testing, it's better if server.js exports the handler or the app instance before listen.
    // Given the current structure, we assume serverInstance already has the listener attached
    // by the time tests run (Node.js module system caches the instance).

    // Wait a bit for server.js's async startServer to run if it hasn't already.
    // This is a workaround. Ideal solution is to export the request handler from server.js
    await new Promise(resolve => setTimeout(resolve, 100)); // Small delay

    const listeners = serverInstance.listeners('request');
    if (listeners && listeners.length > 0) {
      requestListener = listeners[0];
    } else {
      // This might happen if the tests run before server.js fully executes its async startServer.
      // Or if server.listen() was not called in a way that immediately attaches the listener.
      throw new Error("Could not get request listener from server instance. Ensure server.js attaches its listener synchronously or exports the handler.");
    }
  });

  afterAll(async () => {
    // Restore console output
    console.log = originalConsoleLog;
    console.error = originalConsoleError;

    // Close the server (if it was started) and mongoose connection
    await mongoose.disconnect();
    return new Promise(resolve => {
        if (serverInstance.listening) {
            serverInstance.close(resolve);
        } else {
            resolve();
        }
    });
  });

  beforeEach(() => {
    // Reset mocks for each test
    mockRequest = {
      method: '',
      url: '',
      headers: {},
      on: jest.fn((event, callback) => {
        if (event === 'data' && mockRequest.bodyData) {
          callback(Buffer.from(mockRequest.bodyData));
        } else if (event === 'end') {
          callback();
        }
        return mockRequest; // for chaining
      }),
    };
    mockResponse = {
      setHeader: jest.fn(), // setHeader is not used by the root server.js, it uses writeHead directly
      writeHead: jest.fn(),
      end: jest.fn(),
    };

    // Reset mongoose mocks that might have specific return values per test
    // (mongoose.model().findOne as jest.Mock).mockClear().mockResolvedValue(null); // Default to not found
    // (mongoose.model().create as jest.Mock).mockClear();
  });

  describe('Preflight OPTIONS Request', () => {
    it('should handle OPTIONS request correctly and return 204 with CORS headers', async () => {
      mockRequest.method = 'OPTIONS';
      mockRequest.url = '/api/auth/login'; // Example path

      await requestListener(mockRequest, mockResponse);

      expect(mockResponse.writeHead).toHaveBeenCalledWith(204, {
        'Access-Control-Allow-Origin': 'https://igcse-web.vercel.app',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, Origin, X-Requested-With',
        'Access-Control-Allow-Credentials': 'true',
      });
      expect(mockResponse.end).toHaveBeenCalled();
    });
  });

  describe('Actual GET Request (e.g., /api/health)', () => {
    it('should set appropriate CORS headers for a GET request', async () => {
      mockRequest.method = 'GET';
      mockRequest.url = '/api/health';

      await requestListener(mockRequest, mockResponse);

      // sendJSON is used by /api/health
      expect(mockResponse.writeHead).toHaveBeenCalledWith(200, expect.objectContaining({
        'Access-Control-Allow-Origin': 'https://igcse-web.vercel.app',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', // from sendJSON
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, Origin, X-Requested-With', // from sendJSON
        'Content-Type': 'application/json',
      }));
      expect(mockResponse.end).toHaveBeenCalledWith(expect.stringContaining('"success":true'));
    });
  });

  describe('Actual POST Request (e.g., /api/auth/login)', () => {
    it('should set appropriate CORS headers for a POST request using sendTokenResponse', async () => {
      mockRequest.method = 'POST';
      mockRequest.url = '/api/auth/login';
      mockRequest.headers = { 'content-type': 'application/json' };
      mockRequest.bodyData = JSON.stringify({ username: 'testuser', password: 'password123' });

      // Mock User.findOne to return a user that can be processed by sendTokenResponse
      const mockUser = {
        _id: new mongoose.Types.ObjectId().toString(),
        name: 'Test User',
        email: 'test@example.com',
        role: 'student',
        isEmailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        getSignedJwtToken: jest.fn().mockReturnValue('mock-jwt-for-login'),
        matchPassword: jest.fn().mockResolvedValue(true), // Password matches
      };
      (mongoose.model('User').findOne as jest.Mock).mockReturnValue({
          select: jest.fn().mockResolvedValue(mockUser) // Simulate .select('+password').resolves(mockUser)
      });


      await requestListener(mockRequest, mockResponse);

      // sendTokenResponse is used by /api/auth/login on success
      expect(mockResponse.writeHead).toHaveBeenCalledWith(200, expect.objectContaining({
        'Access-Control-Allow-Origin': 'https://igcse-web.vercel.app',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, Origin, X-Requested-With',
        'Content-Type': 'application/json',
        'Set-Cookie': expect.stringContaining('token=mock-jwt-for-login;'),
      }));
      expect(mockResponse.end).toHaveBeenCalledWith(expect.stringContaining('"success":true'));
    });
  });

  describe('Logout Route GET Request', () => {
    it('should set appropriate CORS headers for /api/auth/logout', async () => {
        mockRequest.method = 'GET';
        mockRequest.url = '/api/auth/logout';

        await requestListener(mockRequest, mockResponse);

        expect(mockResponse.writeHead).toHaveBeenCalledWith(200, expect.objectContaining({
            'Access-Control-Allow-Origin': 'https://igcse-web.vercel.app',
            'Access-Control-Allow-Credentials': 'true',
            'Content-Type': 'application/json',
            'Set-Cookie': expect.stringContaining('token=; expires=Thu, 01 Jan 1970 00:00:00 GMT'),
        }));
        expect(mockResponse.end).toHaveBeenCalledWith(expect.stringContaining('"success":true'));
    });
  });
});
