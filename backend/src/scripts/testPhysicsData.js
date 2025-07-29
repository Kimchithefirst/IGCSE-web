/**
 * Test Physics Data Parsing
 * 
 * This script tests the parsing of Physics JSON files without database connection
 */

const fs = require('fs');
const path = require('path');

class PhysicsDataTest {
    constructor() {
        // Navigate from backend/src/scripts to the root IGCSE directory
        this.physicsDir = path.join(__dirname, '../../../IGCSE markdown题库/IG Physics PP/quizzes');
        this.testResults = {
            totalFiles: 0,
            successfulParsing: 0,
            failedParsing: 0,
            parsedQuizzes: [],
            errors: []
        };
    }

    async run() {
        console.log('🧪 Testing Physics JSON Data Parsing...\n');
        
        try {
            await this.testPhysicsFiles();
            await this.generateTestReport();
        } catch (error) {
            console.error('❌ Test failed:', error.message);
            process.exit(1);
        }
    }

    async testPhysicsFiles() {
        console.log('📚 Testing Physics JSON files...');
        
        if (!fs.existsSync(this.physicsDir)) {
            throw new Error(`Physics directory not found: ${this.physicsDir}`);
        }

        const jsonFiles = fs.readdirSync(this.physicsDir)
            .filter(file => file.endsWith('.json'));

        this.testResults.totalFiles = jsonFiles.length;
        console.log(`Found ${jsonFiles.length} JSON files\n`);

        for (const file of jsonFiles) {
            await this.testPhysicsFile(file);
        }
    }

    async testPhysicsFile(filename) {
        console.log(`  📄 Testing ${filename}...`);
        
        try {
            const filePath = path.join(this.physicsDir, filename);
            const content = fs.readFileSync(filePath, 'utf8');
            const data = JSON.parse(content);

            // Parse paper information from filename
            const paperInfo = this.parsePaperCode(filename);
            if (!paperInfo) {
                throw new Error(`Cannot parse paper code from filename: ${filename}`);
            }

            // Transform the data to our enhanced schema
            const quizData = this.transformToIGCSESchema(data, paperInfo, filename);

            this.testResults.successfulParsing++;
            this.testResults.parsedQuizzes.push({
                filename,
                paperCode: quizData.paperCode,
                title: quizData.title,
                questionCount: quizData.questions.length,
                totalMarks: quizData.totalMarks,
                duration: quizData.duration
            });
            
            console.log(`    ✅ Successfully parsed: ${quizData.title}`);
            console.log(`       📊 ${quizData.questions.length} questions, ${quizData.totalMarks} marks, ${quizData.duration} min`);
            
        } catch (error) {
            this.testResults.failedParsing++;
            this.testResults.errors.push({
                file: filename,
                error: error.message
            });
            console.log(`    ❌ Failed to parse ${filename}: ${error.message}`);
        }
    }

    parsePaperCode(filename) {
        // Extract paper code from filename like "0625_s20_qp_11_quiz.json"
        const match = filename.match(/(\d{4}_[smw]\d{2}_[a-z]{2}_\d{2})/);
        if (!match) return null;

        const paperCode = match[1];
        const parts = paperCode.split('_');
        
        return {
            paperCode,
            subjectCode: parts[0],
            session: parts[1],
            paperType: parts[2],
            paperNumber: parseInt(parts[3])
        };
    }

    transformToIGCSESchema(originalData, paperInfo, filename) {
        // Determine exam session in readable format
        const examSession = this.getExamSession(paperInfo.session);
        
        // Determine paper type description
        const paperTypeDesc = this.getPaperTypeDescription(paperInfo.paperType, paperInfo.paperNumber);
        
        // Determine difficulty level based on paper number
        const difficultyLevel = this.getDifficultyLevel(paperInfo.paperNumber);

        // Transform questions
        const questions = originalData.questions.map((q, index) => ({
            questionNumber: index + 1,
            questionText: q.questionText || q.text || `Question ${index + 1}`,
            options: q.options ? {
                A: q.options[0],
                B: q.options[1],
                C: q.options[2],
                D: q.options[3]
            } : undefined,
            correctAnswer: q.correctAnswer || q.answer || 'A',
            marks: q.marks || q.points || 1,
            topic: q.topic || 'General Physics',
            skillLevel: 'AO1' // Default to knowledge recall
        }));

        // Calculate totals
        const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);
        const totalPoints = totalMarks; // Same for IGCSE

        return {
            title: `IGCSE Physics ${examSession} Paper ${paperInfo.paperNumber}`,
            subject: 'Physics',
            description: `Cambridge IGCSE Physics ${examSession} examination paper ${paperInfo.paperNumber}. Authentic past paper with ${questions.length} questions.`,
            duration: this.getDuration(paperInfo.paperNumber),
            difficultyLevel,
            totalPoints,
            passingPoints: Math.floor(totalMarks * 0.4), // Rough estimate for grade C
            isPublished: true,
            topicTags: ['IGCSE Physics', examSession, `Paper ${paperInfo.paperNumber}`],
            
            // IGCSE-specific fields
            examBoard: 'Cambridge IGCSE',
            paperCode: paperInfo.paperCode,
            examSession,
            paperType: paperTypeDesc,
            paperNumber: paperInfo.paperNumber,
            totalMarks,
            
            // Metadata
            originalFormat: 'cambridge_past_paper',
            sourceFile: filename,
            processedDate: new Date(),
            qualityScore: this.assessQualityScore(originalData, questions),
            
            // Questions
            questions
        };
    }

    getExamSession(sessionCode) {
        const year = '20' + sessionCode.slice(1);
        const session = sessionCode.charAt(0);
        
        const sessionMap = {
            's': 'June',
            'm': 'March', 
            'w': 'November'
        };
        
        return `${sessionMap[session] || 'Unknown'} ${year}`;
    }

    getPaperTypeDescription(typeCode, paperNumber) {
        if (typeCode === 'qp') {
            if (paperNumber >= 10 && paperNumber <= 13) {
                return 'Multiple Choice (Core)';
            } else if (paperNumber >= 20 && paperNumber <= 23) {
                return 'Multiple Choice (Extended)';
            } else if (paperNumber >= 30 && paperNumber <= 33) {
                return 'Theory (Core)';
            } else if (paperNumber >= 40 && paperNumber <= 43) {
                return 'Theory (Extended)';
            } else if (paperNumber >= 50 && paperNumber <= 63) {
                return 'Practical';
            }
        }
        return 'Question Paper';
    }

    getDifficultyLevel(paperNumber) {
        if (paperNumber >= 10 && paperNumber <= 13) {
            return 'beginner'; // Core level
        } else if (paperNumber >= 20 && paperNumber <= 23) {
            return 'intermediate'; // Extended level
        } else if (paperNumber >= 30 && paperNumber <= 43) {
            return 'advanced'; // Theory papers
        }
        return 'intermediate';
    }

    getDuration(paperNumber) {
        // Standard IGCSE Physics paper durations
        if (paperNumber >= 10 && paperNumber <= 23) {
            return 45; // Multiple choice papers
        } else if (paperNumber >= 30 && paperNumber <= 43) {
            return 75; // Theory papers
        } else if (paperNumber >= 50 && paperNumber <= 63) {
            return 60; // Practical papers
        }
        return 45;
    }

    assessQualityScore(originalData, questions) {
        let score = 5; // Base score
        
        // Add points for completeness
        if (originalData.questions && originalData.questions.length > 30) score += 1;
        if (questions.every(q => q.questionText && q.correctAnswer)) score += 1;
        if (questions.every(q => q.options)) score += 1;
        
        // Add points for metadata
        if (originalData.title) score += 0.5;
        if (originalData.description) score += 0.5;
        
        return Math.min(10, Math.max(1, score));
    }

    async generateTestReport() {
        console.log('\n📊 Generating test report...');
        
        const report = `# Physics Data Parsing Test Report

**Date:** ${new Date().toISOString()}
**Test Tool:** backend/src/scripts/testPhysicsData.js

## Summary

| Metric | Count |
|--------|-------|
| Total Files Tested | ${this.testResults.totalFiles} |
| Successful Parsing | ${this.testResults.successfulParsing} |
| Failed Parsing | ${this.testResults.failedParsing} |
| Success Rate | ${((this.testResults.successfulParsing / this.testResults.totalFiles) * 100).toFixed(1)}% |

## Parsed Quiz Details

${this.testResults.parsedQuizzes.map(quiz => `
### ${quiz.title}
- **Paper Code:** ${quiz.paperCode}
- **Questions:** ${quiz.questionCount}
- **Total Marks:** ${quiz.totalMarks}
- **Duration:** ${quiz.duration} minutes
- **Source:** ${quiz.filename}
`).join('')}

## Parsing Errors
${this.testResults.failedParsing > 0 ? 
    this.testResults.errors.map(e => `- **${e.file}**: ${e.error}`).join('\n') :
    'No parsing errors! 🎉'
}

## Next Steps

${this.testResults.successfulParsing > 0 ? 
    '✅ **Data parsing successful!** Ready to proceed with database import.' :
    '❌ **Data parsing failed.** Need to fix parsing issues before database import.'
}

---

**Test Status: ${this.testResults.successfulParsing > 0 ? 'SUCCESSFUL' : 'FAILED'}** 
Ready for database import: ${this.testResults.successfulParsing > 0 ? 'YES' : 'NO'}
`;

        // Ensure reports directory exists (relative to backend)
        const reportsDir = path.join(__dirname, '../../../reports');
        if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir);
        }

        const reportPath = path.join(reportsDir, `physics-data-test-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.md`);
        fs.writeFileSync(reportPath, report);

        console.log(`\n✅ Test complete! Report saved to: ${reportPath}`);
        console.log('\n📋 Summary:');
        console.log(`  📁 Files tested: ${this.testResults.totalFiles}`);
        console.log(`  ✅ Successful parsing: ${this.testResults.successfulParsing}`);
        console.log(`  ❌ Failed parsing: ${this.testResults.failedParsing}`);
        console.log(`  📊 Success rate: ${((this.testResults.successfulParsing / this.testResults.totalFiles) * 100).toFixed(1)}%`);
        
        if (this.testResults.successfulParsing > 0) {
            console.log('\n🎯 Next: Proceed with database import!');
        } else {
            console.log('\n⚠️  Fix parsing issues before database import.');
        }
    }
}

// Run the test
const test = new PhysicsDataTest();
test.run().catch(console.error); 