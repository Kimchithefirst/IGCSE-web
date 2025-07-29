// Configuration file for IGCSE Backend
const config = {
  // Server settings
  PORT: process.env.PORT || 3001,
  HOST: '0.0.0.0',
  
  // Similar Questions settings
  SIMILAR_QUESTIONS_TARGET_COUNT: 3,
  SIMILAR_QUESTIONS_MAX_DB_SEARCH: 10,
  
  // OpenRouter.ai AI service settings
  OPENROUTER: {
    API_KEY: process.env.OPENROUTER_API_KEY || '',
    MODEL: process.env.OPENROUTER_MODEL || 'anthropic/claude-3-haiku-20240307',
    BASE_URL: 'https://openrouter.ai/api/v1',
    TIMEOUT: 30000, // 30 seconds
    MAX_TOKENS: 2000,
    TEMPERATURE: 0.7
  },
  
  // AI Question Generation settings
  AI_GENERATION: {
    ENABLED: true,
    CACHE_ENABLED: true,
    CACHE_TTL: 3600000, // 1 hour in milliseconds
    MAX_RETRY_ATTEMPTS: 2,
    GENERATION_TIMEOUT: 25000 // 25 seconds
  },
  
  // Logging settings
  LOG_LEVEL: process.env.LOG_LEVEL || 'info'
};

module.exports = config; 