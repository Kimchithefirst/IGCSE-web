const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// MongoDB Atlas connection string
const MONGODB_URI = 'mongodb+srv://igcse-admin:51UwmbZ2KRD1LOfQ@igcse-mock-test.jbrdwgb.mongodb.net/igcse-mock-test?retryWrites=true&w=majority&appName=IGCSE-Mock-Test';

// Question Schema - Enhanced for multi-subject support
const questionSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  text: { type: String, required: true },
  options: [{
    _id: false, // Disable automatic _id generation for array items
    text: { type: String, required: true },
    isCorrect: { type: Boolean, required: true }
  }],
  correctAnswer: { type: String, required: true },
  subject: { type: String, required: true, default: 'Physics' },
  topics: [{ type: String }],
  difficulty: { type: String, enum: ['easy', 'medium', 'hard', 'beginner', 'intermediate'], default: 'medium' },
  source: {
    paperCode: { type: String }, // e.g., "0625_s20_qp_11"
    examSession: { type: String }, // e.g., "Summer 2020"
    questionNumber: { type: Number },
    originalId: { type: String }
  },
  metadata: {
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    importedFrom: { type: String, default: 'IGCSE-JSON-Bank' },
    version: { type: String, default: '1.0' }
  }
}, {
  timestamps: true
});

const Question = mongoose.model('Question', questionSchema);

// Quiz Schema - Enhanced for multi-subject support  
const quizSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String },
  subject: { type: String, required: true, default: 'Physics' },
  timeLimit: { type: Number, default: 1800 }, // 30 minutes in seconds
  questions: [{ type: Number, ref: 'Question' }], // Store question IDs
  metadata: {
    source: {
      paperCode: { type: String },
      examSession: { type: String },
      totalQuestions: { type: Number }
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    importedFrom: { type: String, default: 'IGCSE-JSON-Bank' },
    version: { type: String, default: '1.0' }
  }
}, {
  timestamps: true
});

const Quiz = mongoose.model('Quiz', quizSchema);

async function connectToMongoDB() {
  try {
    console.log('🔌 Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Successfully connected to MongoDB Atlas!');
    console.log(`🗄️  Database: ${mongoose.connection.name}`);
    console.log(`🌐 Cluster: ${mongoose.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

async function clearExistingData() {
  try {
    console.log('\n🧹 Clearing existing data...');
    
    const questionCount = await Question.countDocuments();
    const quizCount = await Quiz.countDocuments();
    
    if (questionCount > 0 || quizCount > 0) {
      console.log(`📊 Found ${questionCount} existing questions and ${quizCount} existing quizzes`);
      await Question.deleteMany({});
      await Quiz.deleteMany({});
      console.log('✅ Existing data cleared successfully');
    } else {
      console.log('📭 No existing data found - starting with clean database');
    }
  } catch (error) {
    console.error('❌ Error clearing data:', error);
    throw error;
  }
}

async function loadAndMigrateQuestions() {
  try {
    console.log('\n📚 Loading physics questions from local file...');
    
    const questionsPath = './data/physics_questions.json';
    if (!fs.existsSync(questionsPath)) {
      throw new Error(`Questions file not found: ${questionsPath}`);
    }
    
    const questionsData = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));
    console.log(`📖 Loaded ${questionsData.length} quizzes from local file`);
    
    let totalQuestionsImported = 0;
    let totalQuizzesImported = 0;
    let globalQuestionId = 1; // Global counter for unique question IDs
    
    for (const quiz of questionsData) {
      console.log(`\n🔄 Processing quiz: ${quiz.title}`);
      
      // Import questions for this quiz
      const questionIds = [];
      for (const question of quiz.questions) {
        const questionDoc = new Question({
          id: globalQuestionId++, // Use global counter for unique IDs
          text: question.text,
          options: question.options.map(opt => ({
            text: opt.text,
            isCorrect: opt.isCorrect
          })),
          correctAnswer: question.correctAnswer,
          subject: question.subject || 'Physics',
          topics: question.topics || [],
          difficulty: question.difficulty || 'medium',
          source: {
            paperCode: question.paperCode,
            examSession: `${question.session || 'Summer'} ${question.year || 2020}`,
            questionNumber: question.id, // Store original question number
            originalId: question._id
          },
          metadata: {
            importedFrom: 'IGCSE-JSON-Bank',
            version: '1.0'
          }
        });
        
        await questionDoc.save();
        questionIds.push(questionDoc.id);
        totalQuestionsImported++;
      }
      
      // Import quiz metadata
      const quizDoc = new Quiz({
        id: quiz.paperCode, // Use paperCode as the unique ID
        title: quiz.title,
        description: `${quiz.subject} exam paper with ${quiz.totalQuestions} questions (${quiz.validQuestions} valid)`,
        subject: quiz.subject || 'Physics',
        timeLimit: (quiz.duration || 30) * 60, // Convert minutes to seconds
        questions: questionIds,
        metadata: {
          source: {
            paperCode: quiz.paperCode,
            examSession: `${quiz.session || 'Summer'} ${quiz.year || 2020}`,
            totalQuestions: quiz.totalQuestions || quiz.questions.length
          },
          importedFrom: 'IGCSE-JSON-Bank',
          version: '1.0'
        }
      });
      
      await quizDoc.save();
      totalQuizzesImported++;
      
      console.log(`  ✅ Imported ${quiz.questions.length} questions for quiz "${quiz.title}"`);
    }
    
    console.log(`\n🎉 Migration completed successfully!`);
    console.log(`📊 Total imported: ${totalQuestionsImported} questions across ${totalQuizzesImported} quizzes`);
    
    return { totalQuestionsImported, totalQuizzesImported };
    
  } catch (error) {
    console.error('❌ Error migrating questions:', error);
    throw error;
  }
}

async function verifyMigration() {
  try {
    console.log('\n🔍 Verifying migration...');
    
    const questionCount = await Question.countDocuments();
    const quizCount = await Quiz.countDocuments();
    
    console.log(`📊 Verification results:`);
    console.log(`  • Questions in database: ${questionCount}`);
    console.log(`  • Quizzes in database: ${quizCount}`);
    
    // Test topic distribution
    const topicCounts = await Question.aggregate([
      { $unwind: '$topics' },
      { $group: { _id: '$topics', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log(`\n📈 Topic distribution:`);
    topicCounts.forEach(topic => {
      console.log(`  • ${topic._id}: ${topic.count} questions`);
    });
    
    // Test a sample query
    const sampleQuestion = await Question.findOne({ id: 1 });
    if (sampleQuestion) {
      console.log(`\n✅ Sample question retrieved successfully:`);
      console.log(`  • ID: ${sampleQuestion.id}`);
      console.log(`  • Subject: ${sampleQuestion.subject}`);
      console.log(`  • Topics: ${sampleQuestion.topics.join(', ')}`);
      console.log(`  • Text: ${sampleQuestion.text.substring(0, 100)}...`);
    }
    
    return { questionCount, quizCount, topicCounts };
    
  } catch (error) {
    console.error('❌ Error verifying migration:', error);
    throw error;
  }
}

async function main() {
  try {
    console.log('🚀 Starting MongoDB Atlas migration...');
    console.log('=' .repeat(60));
    
    // Connect to MongoDB Atlas
    await connectToMongoDB();
    
    // Clear existing data
    await clearExistingData();
    
    // Load and migrate questions
    const migrationResults = await loadAndMigrateQuestions();
    
    // Verify migration
    const verificationResults = await verifyMigration();
    
    console.log('\n' + '=' .repeat(60));
    console.log('🎯 MIGRATION SUMMARY:');
    console.log(`✅ Successfully migrated ${migrationResults.totalQuestionsImported} questions`);
    console.log(`✅ Successfully migrated ${migrationResults.totalQuizzesImported} quizzes`);
    console.log(`✅ Database verification passed`);
    console.log(`✅ Topic distribution calculated`);
    console.log('🌟 Your IGCSE question bank is now live on MongoDB Atlas!');
    console.log('=' .repeat(60));
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('💡 Please check your connection string and try again.');
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Database connection closed.');
  }
}

// Run migration
if (require.main === module) {
  main();
}

module.exports = { Question, Quiz, connectToMongoDB }; 