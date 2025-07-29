const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const AIQuestionGenerator = require('./ai-question-generator');

// MongoDB Atlas connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://igcse-admin:51UwmbZ2KRD1LOfQ@igcse-mock-test.jbrdwgb.mongodb.net/igcse-mock-test?retryWrites=true&w=majority&appName=IGCSE-Mock-Test';

// Initialize AI generator
const aiGenerator = new AIQuestionGenerator();

// Question Schema
const questionSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  text: { type: String, required: true },
  options: [{
    text: { type: String, required: true },
    isCorrect: { type: Boolean, required: true }
  }],
  explanation: { type: String },
  topic: { type: String, required: true },
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'intermediate' },
  subject: { type: String, required: true },
  source: { type: String },
  year: { type: Number },
  session: { type: String }
});

// Quiz Schema
const quizSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String },
  subject: { type: String, required: true },
  topic: { type: String, required: true },
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'intermediate' },
  questions: [{ type: Number, ref: 'Question' }],
  metadata: {
    totalQuestions: { type: Number },
    estimatedTime: { type: Number },
    source: { type: String },
    year: { type: Number },
    session: { type: String }
  }
});

const Question = mongoose.model('Question', questionSchema);
const Quiz = mongoose.model('Quiz', quizSchema);

// Subject configurations
const SUBJECTS = {
  'IG Physics PP': {
    name: 'Physics',
    code: 'physics',
    topics: ['General', 'Forces', 'Energy', 'Waves', 'Electricity', 'Magnetism', 'Atomic', 'Thermal', 'Mechanics', 'Fluids']
  },
  'IG Maths PP': {
    name: 'Mathematics',
    code: 'mathematics',
    topics: ['Algebra', 'Geometry', 'Statistics', 'Probability', 'Calculus', 'Trigonometry', 'Functions', 'Number Theory']
  },
  'IG Economics PP': {
    name: 'Economics',
    code: 'economics',
    topics: ['Microeconomics', 'Macroeconomics', 'Market Structures', 'Government Policy', 'International Trade', 'Development']
  },
  'IG Chemstry PP': {
    name: 'Chemistry',
    code: 'chemistry',
    topics: ['Atomic Structure', 'Chemical Bonding', 'Organic Chemistry', 'Inorganic Chemistry', 'Physical Chemistry', 'Analysis']
  },
  'IG Biology PP': {
    name: 'Biology',
    code: 'biology',
    topics: ['Cell Biology', 'Genetics', 'Evolution', 'Ecology', 'Human Biology', 'Plant Biology', 'Biochemistry']
  }
};

// AI-powered question conversion function
async function convertMarkdownToMCQ(markdownContent, subject, year, session) {
  try {
    console.log(`🤖 Converting ${subject} ${year} ${session} to multiple-choice questions...`);
    
    // Extract meaningful content from markdown
    const cleanContent = markdownContent
      .replace(/^#.*$/gm, '') // Remove headers
      .replace(/\*\*.*?\*\*/g, '') // Remove bold text
      .replace(/\n{3,}/g, '\n\n') // Normalize line breaks
      .trim();
    
    if (cleanContent.length < 100) {
      console.log(`⚠️ Content too short, skipping...`);
      return [];
    }
    
    // Create a mock question object for the AI generator
    // We'll use the AI generator's buildPrompt and callOpenRouter methods directly
    const mockQuestion = {
      id: 'conversion_temp',
      questionText: `Convert the following IGCSE ${subject} exam content into 3-5 multiple-choice questions. Each question should have 4 options with only one correct answer.

Content:
${cleanContent.substring(0, 2000)}`,
      subject: subject
    };
    
    // Build custom prompt for conversion
    const prompt = `Convert the following IGCSE ${subject} exam content into 3-5 multiple-choice questions. Each question should have 4 options with only one correct answer.

Requirements:
- Subject: ${subject}
- 4 multiple choice options each (A, B, C, D)
- Only one correct answer per question
- Appropriate difficulty level for IGCSE students
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
    "topic": "Subject topic",
    "subject": "${subject}"
  }
]

Content to convert:
${cleanContent.substring(0, 1500)}

Ensure the JSON is valid and complete.`;

    // Use the AI generator's callOpenRouter method directly
    const response = await aiGenerator.callOpenRouter(prompt);
    const parsedQuestions = aiGenerator.parseAndValidateResponse(response, mockQuestion);
    
    if (parsedQuestions && parsedQuestions.length > 0) {
      return parsedQuestions.map(q => ({
        text: q.text,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        topic: q.topic || 'General',
        subject: subject,
        year: year,
        session: session,
        difficulty: 'intermediate',
        source: `IGCSE ${year} ${session}`
      }));
    }
    
    return [];
  } catch (error) {
    console.error(`❌ Error converting ${subject} ${year} ${session}:`, error.message);
    return [];
  }
}

// Process a single subject directory
async function processSubject(subjectDir, subjectConfig) {
  console.log(`\n📚 Processing ${subjectConfig.name}...`);
  
  const subjectPath = path.join('data/exam-bank/IGCSE markdown exam bank', subjectDir);
  const sessions = fs.readdirSync(subjectPath).filter(item => 
    fs.statSync(path.join(subjectPath, item)).isDirectory()
  );
  
  let allQuestions = [];
  let questionId = await getNextQuestionId();
  
  for (const session of sessions.slice(0, 3)) { // Limit to 3 sessions per subject for initial import
    console.log(`  📁 Processing session: ${session}`);
    
    const sessionPath = path.join(subjectPath, session);
    const files = fs.readdirSync(sessionPath).filter(file => 
      file.endsWith('.md') && file.includes('qp_') // Question papers only
    );
    
    for (const file of files.slice(0, 2)) { // Limit to 2 files per session
      console.log(`    📄 Processing file: ${file}`);
      
      try {
        const filePath = path.join(sessionPath, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Extract year from session name
        const yearMatch = session.match(/(\d{4})/);
        const year = yearMatch ? parseInt(yearMatch[1]) : 2020;
        
        const questions = await convertMarkdownToMCQ(
          content, 
          subjectConfig.name, 
          year, 
          session
        );
        
        // Add IDs and process questions
        for (const question of questions) {
          question.id = questionId++;
          allQuestions.push(question);
        }
        
        console.log(`    ✅ Generated ${questions.length} questions from ${file}`);
        
        // Add delay to avoid overwhelming the AI API
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.error(`    ❌ Error processing ${file}:`, error.message);
      }
    }
  }
  
  console.log(`📊 Total questions generated for ${subjectConfig.name}: ${allQuestions.length}`);
  return allQuestions;
}

// Get the next available question ID
async function getNextQuestionId() {
  try {
    const lastQuestion = await Question.findOne().sort({ id: -1 });
    return lastQuestion ? lastQuestion.id + 1 : 1000; // Start from 1000 for new subjects
  } catch (error) {
    return 1000;
  }
}

// Create quizzes from questions
function createQuizzes(questions, subjectConfig) {
  const quizzes = [];
  const questionsByTopic = {};
  
  // Group questions by topic
  questions.forEach(q => {
    if (!questionsByTopic[q.topic]) {
      questionsByTopic[q.topic] = [];
    }
    questionsByTopic[q.topic].push(q.id);
  });
  
  // Create quizzes for each topic
  Object.entries(questionsByTopic).forEach(([topic, questionIds], index) => {
    if (questionIds.length >= 3) { // Only create quiz if we have at least 3 questions
      quizzes.push({
        id: `${subjectConfig.code}_${topic.toLowerCase().replace(/\s+/g, '_')}_quiz`,
        title: `${subjectConfig.name} - ${topic}`,
        description: `Practice questions for ${topic} in ${subjectConfig.name}`,
        subject: subjectConfig.name,
        topic: topic,
        difficulty: 'intermediate',
        questions: questionIds,
        metadata: {
          totalQuestions: questionIds.length,
          estimatedTime: questionIds.length * 2, // 2 minutes per question
          source: 'IGCSE Past Papers',
          year: 2020,
          session: 'Multiple'
        }
      });
    }
  });
  
  return quizzes;
}

// Main conversion function
async function convertAllSubjects() {
  try {
    console.log('🚀 Starting multi-subject conversion to production database...');
    
    // Connect to MongoDB Atlas
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');
    
    let totalQuestions = 0;
    let totalQuizzes = 0;
    
    // Process each subject (skip Physics as it's already imported)
    for (const [subjectDir, subjectConfig] of Object.entries(SUBJECTS)) {
      if (subjectConfig.code === 'physics') {
        console.log(`⏭️ Skipping ${subjectConfig.name} (already imported)`);
        continue;
      }
      
      try {
        const questions = await processSubject(subjectDir, subjectConfig);
        
        if (questions.length > 0) {
          // Save questions to database
          console.log(`💾 Saving ${questions.length} questions to database...`);
          await Question.insertMany(questions, { ordered: false });
          
          // Create and save quizzes
          const quizzes = createQuizzes(questions, subjectConfig);
          if (quizzes.length > 0) {
            console.log(`💾 Saving ${quizzes.length} quizzes to database...`);
            await Quiz.insertMany(quizzes, { ordered: false });
            totalQuizzes += quizzes.length;
          }
          
          totalQuestions += questions.length;
          console.log(`✅ Successfully imported ${subjectConfig.name}: ${questions.length} questions, ${quizzes.length} quizzes`);
        }
        
      } catch (error) {
        console.error(`❌ Failed to process ${subjectConfig.name}:`, error.message);
      }
    }
    
    // Final summary
    console.log(`\n🎉 CONVERSION COMPLETE!`);
    console.log(`📊 Total new questions imported: ${totalQuestions}`);
    console.log(`📊 Total new quizzes created: ${totalQuizzes}`);
    
    // Get final database stats
    const totalDbQuestions = await Question.countDocuments();
    const totalDbQuizzes = await Quiz.countDocuments();
    console.log(`📊 Total questions in database: ${totalDbQuestions}`);
    console.log(`📊 Total quizzes in database: ${totalDbQuizzes}`);
    
    // Show subject breakdown
    const subjects = await Question.distinct('subject');
    console.log(`\n📚 Subjects in database:`);
    for (const subject of subjects) {
      const count = await Question.countDocuments({ subject });
      console.log(`  - ${subject}: ${count} questions`);
    }
    
  } catch (error) {
    console.error('❌ Conversion failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB Atlas');
  }
}

// Run the conversion
if (require.main === module) {
  convertAllSubjects();
}

module.exports = { convertAllSubjects }; 