// AI Question Generator using OpenRouter.ai
const https = require('https');

// Configuration directly from process.env
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const AI_GENERATION_ENABLED = process.env.AI_GENERATION_ENABLED === 'true';
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'google/gemma-7b-it'; // Default model
const OPENROUTER_MAX_TOKENS = parseInt(process.env.OPENROUTER_MAX_TOKENS, 10) || 1500;
const OPENROUTER_TEMPERATURE = parseFloat(process.env.OPENROUTER_TEMPERATURE) || 0.7;
const OPENROUTER_TIMEOUT = parseInt(process.env.OPENROUTER_TIMEOUT, 10) || 30000;
const AI_GENERATION_CACHE_ENABLED = process.env.AI_GENERATION_CACHE_ENABLED === 'true';
const AI_GENERATION_CACHE_TTL = parseInt(process.env.AI_GENERATION_CACHE_TTL, 10) || 3600000; // 1 hour
const DEFAULT_AI_QUESTION_COUNT = parseInt(process.env.AI_QUESTIONS_TO_GENERATE, 10) || 3;

class AIQuestionGenerator {
  constructor() {
    this.cache = new Map(); // Simple in-memory cache
    this.isEnabled = AI_GENERATION_ENABLED && OPENROUTER_API_KEY;
    
    if (!this.isEnabled) {
      if (!OPENROUTER_API_KEY) {
        console.warn('⚠️ AI Question Generation disabled - OPENROUTER_API_KEY is missing.');
      } else {
        console.warn('⚠️ AI Question Generation disabled (AI_GENERATION_ENABLED is false).');
      }
    } else {
      console.log(`✅ AI Question Generator initialized with model: ${OPENROUTER_MODEL}`);
    }
  }

  /**
   * Generate similar questions using OpenRouter.ai
   * @param {Object} originalQuestion - The source question object. Expected to have id, questionText, topic, keywords, difficultyLevel, and optionally subject.
   * @param {number} [count=DEFAULT_AI_QUESTION_COUNT] - Number of questions to generate. Defaults to DEFAULT_AI_QUESTION_COUNT.
   * @param {string} [subject] - Optional subject to override auto-detection from originalQuestion.subject or text analysis.
   * @returns {Promise<Array>} Array of generated questions
   */
  async generateSimilarQuestions(originalQuestion, count = DEFAULT_AI_QUESTION_COUNT, subject = null) {
    if (!this.isEnabled) {
      console.log('AI generation disabled, returning empty array');
      return [];
    }

    const effectiveCount = count || DEFAULT_AI_QUESTION_COUNT; // Ensure count has a value
    const cacheKey = `${originalQuestion.id}_${effectiveCount}`;
    
    // Check cache first
    if (AI_GENERATION_CACHE_ENABLED && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < AI_GENERATION_CACHE_TTL) {
        console.log(`📦 Returning cached AI questions for question ${originalQuestion.id}`);
        return cached.questions;
      }
      this.cache.delete(cacheKey);
    }

    try {
      console.log(`🤖 Generating ${effectiveCount} AI questions for: "${originalQuestion.questionText.substring(0, 50)}..."`);
      
      // Add subject to originalQuestion if provided
      const questionInput = { ...originalQuestion };
      if (subject) {
        questionInput.subject = subject;
      }

      const prompt = this.buildPrompt(questionInput, effectiveCount);
      const response = await this.callOpenRouter(prompt);
      const questions = this.parseAndValidateResponse(response, questionInput);

      // Cache successful results
      if (AI_GENERATION_CACHE_ENABLED && questions.length > 0) {
        this.cache.set(cacheKey, {
          questions: questions,
          timestamp: Date.now()
        });
      }

      console.log(`✅ Successfully generated ${questions.length} AI questions`);
      return questions;

    } catch (error) {
      console.error('❌ AI question generation failed:', error.message);
      return [];
    }
  }

  /**
   * Build the prompt for AI question generation
   */
  buildPrompt(originalQuestion, count) {
    const subject = originalQuestion.subject || this.detectSubject(originalQuestion.questionText);
    // Use originalQuestion.topic and originalQuestion.keywords if available, otherwise fallback to extractTopics
    const topics = originalQuestion.topic ? [originalQuestion.topic] : this.extractTopics(originalQuestion.questionText);
    const keywords = originalQuestion.keywords || []; // Assuming keywords is an array

    return `Generate ${count} similar multiple-choice ${subject} questions based on this original question:

Original Question: "${originalQuestion.questionText}"
Subject: ${subject}
Topics: ${topics.join(', ') || 'General ' + subject}
Keywords: ${keywords.join(', ') || 'None'}
Difficulty Level: ${originalQuestion.difficultyLevel || 'IGCSE'}

Requirements:
- Generate 'multiple-choice' questions.
- Same subject (${subject}) and similar topics. Emphasize the provided Topics and Keywords.
- 4 multiple choice options each (A, B, C, D)
- Only one correct answer per question
- Different scenarios/contexts but testing similar concepts
- Appropriate difficulty level: ${originalQuestion.difficultyLevel || 'IGCSE students'}
- Scientifically accurate terminology and concepts
- Include brief explanations for correct answers

Format your response as a valid JSON array:
[
  {
    "text": "Question text here?",
    "options": [
      {"text": "Option A text", "isCorrect": false},
      {"text": "Option B text", "isCorrect": true},
      {"text": "Option C text", "isCorrect": false},
      {"text": "Option D text", "isCorrect": false}
    ],
    "correctAnswer": "Option B text",
    "explanation": "Brief explanation of why this answer is correct",
    "generatedBy": "AI",
    "basedOn": "${originalQuestion.id}",
    "subject": "${subject}",
    "topics": [${topics.map(t => `"${t}"`).join(', ')}],
    "keywords": [${keywords.map(k => `"${k}"`).join(', ')}],
    "difficultyLevel": "${originalQuestion.difficultyLevel || 'IGCSE'}"
  }
]

Ensure the JSON is valid and complete.`;
  }

  /**
   * Call OpenRouter.ai API
   */
  async callOpenRouter(prompt) {
    return new Promise((resolve, reject) => {
      const data = JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: OPENROUTER_MAX_TOKENS,
        temperature: OPENROUTER_TEMPERATURE
      });

      console.log(`🔗 Calling OpenRouter API with model: ${OPENROUTER_MODEL}`);
      console.log(`📝 Request payload size: ${data.length} characters`);

      const options = {
        hostname: 'openrouter.ai',
        port: 443,
        path: '/api/v1/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': process.env.HTTP_REFERER || 'https://igcse-web.vercel.app', // Updated to Vercel
          'X-Title': process.env.X_TITLE || 'IGCSE Mock Test Platform', // Added fallback
          'Content-Length': Buffer.byteLength(data)
        },
        timeout: OPENROUTER_TIMEOUT
      };

      const req = https.request(options, (res) => {
        let responseData = '';

        console.log(`📡 OpenRouter response status: ${res.statusCode}`);

        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          try {
            console.log(`📦 Response size: ${responseData.length} characters`);
            const parsed = JSON.parse(responseData);
            if (res.statusCode === 200 && parsed.choices && parsed.choices[0]) {
              console.log(`✅ OpenRouter API call successful`);
              resolve(parsed.choices[0].message.content);
            } else {
              console.error(`❌ OpenRouter API error: ${res.statusCode}`);
              console.error(`Response: ${responseData.substring(0, 500)}...`);
              reject(new Error(`OpenRouter API error: ${res.statusCode} - ${responseData}`));
            }
          } catch (error) {
            console.error(`❌ Failed to parse OpenRouter response: ${error.message}`);
            console.error(`Raw response: ${responseData.substring(0, 500)}...`);
            reject(new Error(`Failed to parse OpenRouter response: ${error.message}`));
          }
        });
      });

      req.on('error', (error) => {
        console.error(`❌ OpenRouter request failed: ${error.message}`);
        reject(new Error(`OpenRouter request failed: ${error.message}`));
      });

      req.on('timeout', () => {
        console.error(`⏰ OpenRouter request timeout after ${OPENROUTER_TIMEOUT}ms`);
        req.destroy();
        reject(new Error('OpenRouter request timeout'));
      });

      req.write(data);
      req.end();
    });
  }

  /**
   * Parse and validate AI response
   */
  parseAndValidateResponse(response, originalQuestion) {
    try {
      // Extract JSON from response (handle markdown code blocks)
      let jsonStr = response.trim();
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/\n?```/g, '');
      } else if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/```\n?/g, '').replace(/\n?```/g, '');
      }

      // Try to fix common JSON issues
      jsonStr = this.fixCommonJsonIssues(jsonStr);

      const questions = JSON.parse(jsonStr);
      
      if (!Array.isArray(questions)) {
        throw new Error('Response is not an array');
      }

      // Validate each question
      const validQuestions = questions.filter(q => this.validateQuestion(q)).map((q, index) => ({
        ...q,
        _id: `AI_${originalQuestion.id}_${index + 1}`,
        id: `ai_${originalQuestion.id}_${index + 1}`,
        type: 'multiple-choice',
        similarity: 0.9, // High similarity for AI-generated questions
        generatedBy: 'AI',
        basedOn: originalQuestion.id,
        generatedAt: new Date().toISOString()
      }));

      return validQuestions;

    } catch (error) {
      console.error('Failed to parse AI response:', error.message);
      console.log('Raw response:', response.substring(0, 1000) + (response.length > 1000 ? '...' : ''));
      return [];
    }
  }

  /**
   * Fix common JSON parsing issues
   */
  fixCommonJsonIssues(jsonStr) {
    // Remove any trailing incomplete objects/arrays
    let fixed = jsonStr;
    
    // Find the last complete closing bracket
    let lastCompleteIndex = -1;
    let bracketCount = 0;
    let inString = false;
    let escapeNext = false;
    
    for (let i = 0; i < fixed.length; i++) {
      const char = fixed[i];
      
      if (escapeNext) {
        escapeNext = false;
        continue;
      }
      
      if (char === '\\') {
        escapeNext = true;
        continue;
      }
      
      if (char === '"' && !escapeNext) {
        inString = !inString;
        continue;
      }
      
      if (!inString) {
        if (char === '[' || char === '{') {
          bracketCount++;
        } else if (char === ']' || char === '}') {
          bracketCount--;
          if (bracketCount === 0) {
            lastCompleteIndex = i;
          }
        }
      }
    }
    
    // If we found a complete structure, truncate there
    if (lastCompleteIndex > -1 && lastCompleteIndex < fixed.length - 1) {
      fixed = fixed.substring(0, lastCompleteIndex + 1);
      console.log('🔧 Truncated incomplete JSON response');
    }
    
    return fixed;
  }

  /**
   * Validate a question object
   */
  validateQuestion(question) {
    if (!question.text || typeof question.text !== 'string') return false;
    if (!Array.isArray(question.options) || question.options.length !== 4) return false;
    if (!question.correctAnswer || typeof question.correctAnswer !== 'string') return false;
    
    // Check that options have required structure
    const validOptions = question.options.every(opt => 
      opt && typeof opt.text === 'string' && typeof opt.isCorrect === 'boolean'
    );
    
    // Check that exactly one option is correct
    const correctCount = question.options.filter(opt => opt.isCorrect).length;
    
    return validOptions && correctCount === 1;
  }

  /**
   * Extract topics from question text
   */
  extractTopics(questionText) {
    const text = questionText.toLowerCase();
    const topics = [];
    
    // Physics topics detection
    if (text.includes('force') || text.includes('newton')) topics.push('forces');
    if (text.includes('light') || text.includes('speed') || text.includes('wave')) topics.push('waves');
    if (text.includes('motion') || text.includes('law') || text.includes('acceleration')) topics.push('mechanics');
    if (text.includes('energy') || text.includes('joule') || text.includes('power')) topics.push('energy');
    if (text.includes('electric') || text.includes('voltage') || text.includes('current')) topics.push('electricity');
    if (text.includes('heat') || text.includes('temperature') || text.includes('thermal')) topics.push('thermal');
    if (text.includes('atom') || text.includes('nuclear') || text.includes('radiation')) topics.push('atomic');
    if (text.includes('magnet') || text.includes('magnetic')) topics.push('magnetism');
    
    return topics;
  }

  /**
   * Detect subject from question text
   */
  detectSubject(questionText) {
    const text = questionText.toLowerCase();
    
    // Physics indicators
    if (text.includes('force') || text.includes('newton') || text.includes('energy') || 
        text.includes('motion') || text.includes('speed') || text.includes('acceleration') ||
        text.includes('electric') || text.includes('voltage') || text.includes('current') ||
        text.includes('light') || text.includes('wave') || text.includes('atom')) {
      return 'Physics';
    }
    
    // Default to Physics for IGCSE system
    return 'Physics';
  }

  /**
   * Clear cache (useful for testing)
   */
  clearCache() {
    this.cache.clear();
    console.log('🗑️ AI question cache cleared');
  }
}

module.exports = AIQuestionGenerator; 