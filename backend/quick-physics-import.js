/**
 * Quick Physics Import - Fixed Path Version
 * 
 * This script imports Physics JSON quiz files with the correct directory path
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Set proxy environment variables
process.env.https_proxy = 'http://127.0.0.1:7890';
process.env.http_proxy = 'http://127.0.0.1:7890';
process.env.all_proxy = 'socks5://127.0.0.1:7890';

// Define the IGCSEQuiz schema
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
  originalFormat: { type: String, default: 'cambridge_past_paper' },
  sourceFile: { type: String },
  processedDate: { type: Date, default: Date.now },
  qualityScore: { type: Number, min: 1, max: 10, default: 5 },
  
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
}, { timestamps: true });

const IGCSEQuiz = mongoose.model('IGCSEQuiz', IGCSEQuizSchema);

class QuickPhysicsImport {
    constructor() {
        // Correct path to the Physics quizzes directory
        this.physicsDir = path.join(__dirname, '../IGCSE markdown exam bank/IG Physics PP/quizzes');
        this.stats = {
            totalFiles: 0,
            successful: 0,
            skipped: 0,
            errors: []
        };
    }

    async run() {
        console.log('🚀 Starting Quick Physics Import...\n');
        
        try {
            await this.connectToDatabase();
            await this.checkDirectory();
            await this.processPhysicsFiles();
            await this.generateReport();
        } catch (error) {
            console.error('❌ Import failed:', error.message);
            process.exit(1);
        } finally {
            await mongoose.disconnect();
        }
    }

    async connectToDatabase() {
        console.log('🔌 Connecting to MongoDB Atlas...');
        const mongoUri = process.env.MONGODB_URI;
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB Atlas\n');
    }

    async checkDirectory() {
        console.log('📂 Checking Physics directory...');
        console.log(`📍 Looking for: ${this.physicsDir}`);
        
        if (!fs.existsSync(this.physicsDir)) {
            throw new Error(`Physics directory not found: ${this.physicsDir}`);
        }
        
        const files = fs.readdirSync(this.physicsDir);
        const jsonFiles = files.filter(file => file.endsWith('.json'));
        
        console.log(`✅ Found ${jsonFiles.length} JSON quiz files`);
        console.log('📋 Available files:');
        jsonFiles.forEach(file => console.log(`  - ${file}`));
        console.log('');
        
        this.stats.totalFiles = jsonFiles.length;
    }

    async processPhysicsFiles() {
        console.log('🔄 Processing Physics quiz files...\n');
        
        const files = fs.readdirSync(this.physicsDir);
        const jsonFiles = files.filter(file => file.endsWith('.json'));
        
        for (const filename of jsonFiles) {
            await this.processFile(filename);
        }
    }

    async processFile(filename) {
        console.log(`📄 Processing ${filename}...`);
        
        try {
            const filePath = path.join(this.physicsDir, filename);
            const content = fs.readFileSync(filePath, 'utf8');
            const originalData = JSON.parse(content);
            
            // Extract paper code from filename
            const paperCode = this.extractPaperCode(filename);
            
            // Check if already exists
            const existing = await IGCSEQuiz.findOne({ paperCode });
            if (existing) {
                console.log(`  ⏩ Skipped: Already exists in database`);
                this.stats.skipped++;
                return;
            }
            
            // Transform to IGCSE schema
            const quizData = this.transformToIGCSESchema(originalData, filename);
            
            // Save to database
            const newQuiz = new IGCSEQuiz(quizData);
            await newQuiz.save();
            
            console.log(`  ✅ Imported: ${quizData.title}`);
            console.log(`     📊 ${quizData.questions.length} questions, ${quizData.totalMarks} marks`);
            this.stats.successful++;
            
        } catch (error) {
            console.log(`  ❌ Failed: ${error.message}`);
            this.stats.errors.push({ filename, error: error.message });
        }
    }

    extractPaperCode(filename) {
        // Extract paper code from filename like "0625_s20_qp_11_quiz.json"
        const match = filename.match(/(\d{4}_[smw]\d{2}_[a-z]{2}_\d{2})/);
        return match ? match[1] : filename.replace('.json', '');
    }

    transformToIGCSESchema(originalData, filename) {
        const paperCode = this.extractPaperCode(filename);
        const paperInfo = this.parsePaperCode(paperCode);
        
        // Filter out questions with missing essential data
        const validQuestions = originalData.questions ? originalData.questions.filter(q => {
            // Keep questions that have either questionText or at least options and correctAnswer
            const hasQuestionText = q.questionText && q.questionText.trim() !== '';
            const hasOptions = q.options && Object.keys(q.options).length > 0;
            const hasCorrectAnswer = q.correctAnswer && q.correctAnswer.trim() !== '';
            
            return hasCorrectAnswer && (hasQuestionText || hasOptions);
        }).map((q, index) => ({
            questionNumber: index + 1,
            questionText: q.questionText && q.questionText.trim() !== '' ? q.questionText : `Question ${index + 1}`,
            options: q.options || {},
            correctAnswer: q.correctAnswer || '',
            marks: 1,
            topic: 'General Physics',
            skillLevel: 'AO1'
        })) : [];
        
        return {
            title: `IGCSE Physics ${paperInfo.session} Paper ${paperInfo.paperNumber}`,
            subject: 'Physics',
            description: `Cambridge IGCSE Physics ${paperInfo.session} Paper ${paperInfo.paperNumber}`,
            duration: this.getDuration(paperInfo.paperNumber),
            difficultyLevel: this.getDifficultyLevel(paperInfo.paperNumber),
            totalPoints: validQuestions.length,
            passingPoints: Math.ceil(validQuestions.length * 0.6),
            isPublished: true,
            topicTags: ['Physics', 'IGCSE', paperInfo.session],
            
            // IGCSE-specific fields
            examBoard: 'Cambridge IGCSE',
            paperCode: paperCode,
            examSession: paperInfo.session,
            paperType: this.getPaperTypeDescription(paperInfo.typeCode, paperInfo.paperNumber),
            paperNumber: paperInfo.paperNumber,
            totalMarks: validQuestions.length,
            
            // Metadata
            originalFormat: 'cambridge_past_paper',
            sourceFile: filename,
            processedDate: new Date(),
            qualityScore: 8,
            
            // Questions
            questions: validQuestions
        };
    }

    parsePaperCode(paperCode) {
        const parts = paperCode.split('_');
        return {
            subject: parts[0],
            session: this.getExamSession(parts[1]),
            typeCode: parts[2],
            paperNumber: parseInt(parts[3])
        };
    }

    getExamSession(sessionCode) {
        const year = '20' + sessionCode.slice(1);
        const session = sessionCode[0];
        const sessionMap = { 's': 'June', 'm': 'March', 'w': 'November' };
        return `${sessionMap[session]} ${year}`;
    }

    getPaperTypeDescription(typeCode, paperNumber) {
        if (typeCode === 'qp') {
            if (paperNumber <= 13) return 'Multiple Choice (Core)';
            if (paperNumber <= 23) return 'Multiple Choice (Extended)';
            if (paperNumber <= 43) return 'Theory (Core)';
            if (paperNumber <= 63) return 'Theory (Extended)';
        }
        return 'Question Paper';
    }

    getDifficultyLevel(paperNumber) {
        if (paperNumber <= 13 || (paperNumber >= 31 && paperNumber <= 43)) return 'beginner';
        if (paperNumber <= 23 || (paperNumber >= 41 && paperNumber <= 63)) return 'intermediate';
        return 'advanced';
    }

    getDuration(paperNumber) {
        if (paperNumber <= 23) return 45; // Multiple choice papers
        if (paperNumber <= 43) return 75; // Theory papers (Core)
        if (paperNumber <= 63) return 75; // Theory papers (Extended)
        return 60; // Default
    }

    async generateReport() {
        console.log('\n📊 IMPORT SUMMARY');
        console.log('=' .repeat(50));
        console.log(`📁 Total files found: ${this.stats.totalFiles}`);
        console.log(`✅ Successfully imported: ${this.stats.successful}`);
        console.log(`⏩ Already existed (skipped): ${this.stats.skipped}`);
        console.log(`❌ Errors: ${this.stats.errors.length}`);
        
        if (this.stats.errors.length > 0) {
            console.log('\n❌ Import errors:');
            this.stats.errors.forEach(error => {
                console.log(`  - ${error.filename}: ${error.error}`);
            });
        }
        
        if (this.stats.successful > 0) {
            console.log('\n🎉 IMPORT SUCCESSFUL!');
            console.log('✅ IGCSE Physics papers are now available in your Atlas database');
            console.log('🚀 Ready for frontend integration!');
        }
        
        // Verify what's in the database
        const totalQuizzes = await IGCSEQuiz.countDocuments();
        const physicsQuizzes = await IGCSEQuiz.find({ subject: 'Physics' }).sort({ paperCode: 1 });
        
        console.log(`\n📊 Database Status:`);
        console.log(`  Total quizzes: ${totalQuizzes}`);
        console.log(`  Physics papers: ${physicsQuizzes.length}`);
        
        if (physicsQuizzes.length > 0) {
            console.log('\n📋 Available Physics papers:');
            physicsQuizzes.forEach((quiz, index) => {
                console.log(`  ${index + 1}. ${quiz.paperCode}: ${quiz.title} (${quiz.questions.length} questions)`);
            });
        }
    }
}

// Run the import
if (require.main === module) {
    const importer = new QuickPhysicsImport();
    importer.run().catch(console.error);
} 