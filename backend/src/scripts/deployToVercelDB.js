/**
 * Deploy IGCSE Data to Vercel Backend Database
 * 
 * This script imports the 6 validated Physics papers to the same database
 * that the Vercel backend is using. It reads from our import-ready files
 * and inserts them into the production database.
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Use the same database configuration as the Vercel backend
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/igcse';

// Define the IGCSEQuiz schema (matching our enhanced schema)
const IGCSEQuizSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  subject: { type: String, required: true, enum: ['Physics', 'Mathematics', 'Chemistry', 'Biology', 'Economics'] },
  description: { type: String, trim: true, default: '' },
  duration: { type: Number, required: true, min: 1 },
  difficultyLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
  totalPoints: { type: Number, default: 0 },
  passingPoints: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: true },
  topicTags: [{ type: String, trim: true }],
  
  // IGCSE-specific fields
  examBoard: { type: String, default: 'Cambridge IGCSE' },
  paperCode: { type: String, unique: true, sparse: true },
  examSession: { type: String },
  paperType: { type: String },
  paperNumber: { type: Number },
  totalMarks: { type: Number },
  
  // Metadata
  originalFormat: { type: String },
  sourceFile: { type: String },
  processedDate: { type: Date, default: Date.now },
  qualityScore: { type: Number, min: 1, max: 10 },
  
  // Questions array
  questions: [{
    questionNumber: { type: Number, required: true },
    questionText: { type: String, required: true },
    options: {
      A: String,
      B: String,
      C: String,
      D: String
    },
    correctAnswer: { type: String, required: true },
    marks: { type: Number, default: 1 },
    topic: { type: String, default: 'General Physics' },
    skillLevel: { type: String, default: 'AO1' }
  }]
}, {
  timestamps: true
});

const IGCSEQuiz = mongoose.model('IGCSEQuiz', IGCSEQuizSchema);

class VercelDBDeployer {
    constructor() {
        this.importReadyDir = path.join(__dirname, '../../../database-ready');
        this.bulkDataFile = path.join(this.importReadyDir, 'bulk-import', 'all-physics-quizzes.json');
        this.stats = {
            totalQuizzes: 0,
            successful: 0,
            skipped: 0,
            errors: []
        };
    }

    async connect() {
        console.log('🔗 Connecting to Vercel backend database...');
        console.log(`📍 Database URI: ${this.maskConnectionString(MONGODB_URI)}`);
        
        try {
            await mongoose.connect(MONGODB_URI);
            console.log('✅ Connected to database successfully!\n');
        } catch (error) {
            console.error('❌ Database connection failed:', error.message);
            throw error;
        }
    }

    async checkExistingData() {
        console.log('🔍 Checking existing quiz data...');
        
        try {
            const existingQuizzes = await IGCSEQuiz.find({});
            const igcseQuizzes = await IGCSEQuiz.find({ examBoard: 'Cambridge IGCSE' });
            
            console.log(`📊 Found ${existingQuizzes.length} total quizzes in database`);
            console.log(`🎯 Found ${igcseQuizzes.length} existing IGCSE quizzes`);
            
            if (igcseQuizzes.length > 0) {
                console.log('📋 Existing IGCSE papers:');
                igcseQuizzes.forEach(quiz => {
                    console.log(`  - ${quiz.paperCode}: ${quiz.title}`);
                });
            }
            console.log('');
            
            return { total: existingQuizzes.length, igcse: igcseQuizzes.length };
        } catch (error) {
            console.error('❌ Error checking existing data:', error.message);
            return { total: 0, igcse: 0 };
        }
    }

    async loadImportData() {
        console.log('📂 Loading import-ready data...');
        
        if (!fs.existsSync(this.bulkDataFile)) {
            throw new Error(`Import data file not found: ${this.bulkDataFile}`);
        }
        
        const content = fs.readFileSync(this.bulkDataFile, 'utf8');
        const quizzes = JSON.parse(content);
        
        this.stats.totalQuizzes = quizzes.length;
        console.log(`✅ Loaded ${quizzes.length} IGCSE Physics papers for import\n`);
        
        return quizzes;
    }

    async importQuizzes(quizzes) {
        console.log('🚀 Starting quiz import process...\n');
        
        for (const quizData of quizzes) {
            await this.importSingleQuiz(quizData);
        }
    }

    async importSingleQuiz(quizData) {
        const paperCode = quizData.paperCode;
        console.log(`📄 Processing ${paperCode}...`);
        
        try {
            // Check if quiz already exists
            const existing = await IGCSEQuiz.findOne({ paperCode });
            if (existing) {
                console.log(`  ⏩ Skipped: Already exists in database`);
                this.stats.skipped++;
                return;
            }
            
            // Create new quiz
            const newQuiz = new IGCSEQuiz(quizData);
            await newQuiz.save();
            
            console.log(`  ✅ Imported: ${quizData.title}`);
            console.log(`     📊 ${quizData.questions.length} questions, ${quizData.totalMarks} marks, ${quizData.duration} min`);
            this.stats.successful++;
            
        } catch (error) {
            console.log(`  ❌ Failed: ${error.message}`);
            this.stats.errors.push({
                paperCode,
                error: error.message
            });
        }
    }

    async verifyImport() {
        console.log('\n🔍 Verifying import results...');
        
        try {
            const igcseQuizzes = await IGCSEQuiz.find({ examBoard: 'Cambridge IGCSE' }).sort({ paperCode: 1 });
            
            console.log(`✅ Total IGCSE quizzes in database: ${igcseQuizzes.length}\n`);
            
            if (igcseQuizzes.length > 0) {
                console.log('📋 Available IGCSE papers:');
                igcseQuizzes.forEach((quiz, index) => {
                    console.log(`  ${index + 1}. ${quiz.paperCode}: ${quiz.title}`);
                    console.log(`     📊 ${quiz.questions.length} questions | ${quiz.difficultyLevel} | ${quiz.duration} min`);
                });
            }
            
        } catch (error) {
            console.error('❌ Verification failed:', error.message);
        }
    }

    generateSummary() {
        console.log('\n📊 DEPLOYMENT SUMMARY');
        console.log('=' .repeat(50));
        console.log(`📁 Total quizzes to import: ${this.stats.totalQuizzes}`);
        console.log(`✅ Successfully imported: ${this.stats.successful}`);
        console.log(`⏩ Already existed (skipped): ${this.stats.skipped}`);
        console.log(`❌ Errors: ${this.stats.errors.length}`);
        
        if (this.stats.errors.length > 0) {
            console.log('\n❌ Import errors:');
            this.stats.errors.forEach(error => {
                console.log(`  - ${error.paperCode}: ${error.error}`);
            });
        }
        
        const successRate = ((this.stats.successful / this.stats.totalQuizzes) * 100).toFixed(1);
        console.log(`\n🎯 Success rate: ${successRate}%`);
        
        if (this.stats.successful > 0) {
            console.log('\n🎉 DEPLOYMENT SUCCESSFUL!');
            console.log('✅ IGCSE Physics papers are now available in your backend database');
            console.log('🚀 Ready for frontend integration!');
            
            console.log('\n📖 Next steps:');
            console.log('  1. Test API endpoints: GET /api/quizzes');
            console.log('  2. Update frontend to display IGCSE papers');
            console.log('  3. Test user experience with authentic content');
        }
    }

    maskConnectionString(uri) {
        if (uri.includes('@')) {
            return uri.replace(/\/\/[^@]+@/, '//***:***@');
        }
        return uri;
    }

    async run() {
        try {
            console.log('🎯 IGCSE Data Deployment to Vercel Backend Database');
            console.log('=' .repeat(60));
            
            await this.connect();
            await this.checkExistingData();
            
            const quizzes = await this.loadImportData();
            await this.importQuizzes(quizzes);
            await this.verifyImport();
            
            this.generateSummary();
            
        } catch (error) {
            console.error('\n💥 Deployment failed:', error.message);
            console.error('\n🔧 Troubleshooting:');
            console.error('  1. Check MONGODB_URI environment variable');
            console.error('  2. Ensure database is accessible');
            console.error('  3. Verify import-ready data files exist');
            process.exit(1);
        } finally {
            await mongoose.disconnect();
            console.log('\n🔌 Database connection closed');
        }
    }
}

// Run the deployment
if (require.main === module) {
    const deployer = new VercelDBDeployer();
    deployer.run().catch(console.error);
}

module.exports = VercelDBDeployer; 