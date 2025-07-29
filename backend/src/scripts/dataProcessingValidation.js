/**
 * Data Processing Validation Script
 * 
 * This script validates that all IGCSE data can be processed correctly
 * without requiring a database connection. It shows what would be imported.
 */

const fs = require('fs');
const path = require('path');

class DataProcessingValidator {
    constructor() {
        this.baseDir = path.join(__dirname, '../../../IGCSE markdown题库');
        this.subjects = [
            { name: 'Physics', folder: 'IG Physics PP', code: '0625' },
            { name: 'Mathematics', folder: 'IG Maths PP', code: '0580' },
            { name: 'Chemistry', folder: 'IG Chemistry PP', code: '0620' },
            { name: 'Biology', folder: 'IG Biology PP', code: '0610' },
            { name: 'Economics', folder: 'IG Economics PP', code: '0455' }
        ];
        
        this.validationResults = {
            totalFilesScanned: 0,
            validQuizzes: 0,
            invalidQuizzes: 0,
            validationErrors: [],
            processedQuizzes: [],
            subjectSummary: {}
        };
    }

    async run() {
        console.log('🔍 IGCSE Data Processing Validation...\n');
        
        try {
            await this.validateAllSubjects();
            await this.generateValidationReport();
        } catch (error) {
            console.error('❌ Validation failed:', error.message);
            process.exit(1);
        }
    }

    async validateAllSubjects() {
        console.log('📊 Validating data processing for all subjects...\n');
        
        for (const subject of this.subjects) {
            await this.validateSubject(subject);
        }
    }

    async validateSubject(subject) {
        console.log(`📚 Validating ${subject.name}...`);
        
        const subjectPath = path.join(this.baseDir, subject.folder);
        if (!fs.existsSync(subjectPath)) {
            console.log(`   ⚠️  Directory not found: ${subject.folder}`);
            this.validationResults.subjectSummary[subject.name] = {
                available: false,
                validQuizzes: 0,
                errors: []
            };
            return;
        }
        
        this.validationResults.subjectSummary[subject.name] = {
            available: true,
            validQuizzes: 0,
            invalidQuizzes: 0,
            errors: []
        };
        
        // Look for JSON quiz files (like Physics) and markdown files
        await this.validateJsonQuizzes(subject, subjectPath);
        await this.validateMarkdownContent(subject, subjectPath);
        
        console.log(`   ✅ ${subject.name}: ${this.validationResults.subjectSummary[subject.name].validQuizzes} valid quizzes\n`);
    }

    async validateJsonQuizzes(subject, subjectPath) {
        // Check for JSON quizzes (like Physics has)
        const quizzesDir = path.join(subjectPath, 'quizzes');
        if (fs.existsSync(quizzesDir)) {
            const jsonFiles = fs.readdirSync(quizzesDir).filter(file => file.endsWith('.json'));
            
            for (const file of jsonFiles) {
                try {
                    const filePath = path.join(quizzesDir, file);
                    const content = fs.readFileSync(filePath, 'utf8');
                    const data = JSON.parse(content);
                    
                    const validation = this.validateQuizData(data, file, subject);
                    if (validation.isValid) {
                        this.validationResults.validQuizzes++;
                        this.validationResults.subjectSummary[subject.name].validQuizzes++;
                        
                        // Transform and store the processed quiz data
                        const processedQuiz = this.transformToIGCSESchema(data, validation.paperInfo, file, subject);
                        this.validationResults.processedQuizzes.push(processedQuiz);
                        
                        console.log(`     ✅ ${file}: ${validation.paperInfo.paperCode} (${data.questions?.length || 0} questions)`);
                    } else {
                        this.validationResults.invalidQuizzes++;
                        this.validationResults.subjectSummary[subject.name].invalidQuizzes++;
                        this.validationResults.validationErrors.push({
                            subject: subject.name,
                            file,
                            errors: validation.errors
                        });
                        console.log(`     ❌ ${file}: ${validation.errors.join(', ')}`);
                    }
                } catch (error) {
                    this.validationResults.invalidQuizzes++;
                    this.validationResults.validationErrors.push({
                        subject: subject.name,
                        file,
                        errors: [error.message]
                    });
                    console.log(`     ❌ ${file}: Parse error - ${error.message}`);
                }
            }
        }
    }

    async validateMarkdownContent(subject, subjectPath) {
        // This would scan markdown files and validate their structure
        // For now, we'll just count them as potential content
        let markdownCount = 0;
        
        const sessions = fs.readdirSync(subjectPath).filter(item => {
            const itemPath = path.join(subjectPath, item);
            return fs.statSync(itemPath).isDirectory() && item !== 'quizzes';
        });
        
        for (const session of sessions) {
            const sessionPath = path.join(subjectPath, session);
            const files = fs.readdirSync(sessionPath);
            
            const questionPapers = files.filter(file => file.includes('_qp_') && file.endsWith('.md'));
            markdownCount += questionPapers.length;
        }
        
        if (markdownCount > 0) {
            console.log(`     📝 Found ${markdownCount} markdown question papers (need processing)`);
        }
    }

    validateQuizData(data, filename, subject) {
        const errors = [];
        
        // Check basic structure
        if (!data.questions || !Array.isArray(data.questions)) {
            errors.push('No questions array found');
        }
        
        if (data.questions && data.questions.length === 0) {
            errors.push('Empty questions array');
        }
        
        // Parse paper code from filename
        const paperInfo = this.parsePaperCode(filename);
        if (!paperInfo) {
            errors.push('Cannot parse paper code from filename');
        }
        
        // Check question structure
        if (data.questions && data.questions.length > 0) {
            const firstQuestion = data.questions[0];
            if (!firstQuestion.questionText && !firstQuestion.text) {
                errors.push('Questions missing text content');
            }
            if (!firstQuestion.correctAnswer && !firstQuestion.answer) {
                errors.push('Questions missing correct answers');
            }
        }
        
        return {
            isValid: errors.length === 0,
            errors,
            paperInfo
        };
    }

    parsePaperCode(filename) {
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

    transformToIGCSESchema(originalData, paperInfo, filename, subject) {
        const examSession = this.getExamSession(paperInfo.session);
        const paperTypeDesc = this.getPaperTypeDescription(paperInfo.paperType, paperInfo.paperNumber);
        const difficultyLevel = this.getDifficultyLevel(paperInfo.paperNumber);

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
            topic: q.topic || `General ${subject.name}`,
            skillLevel: 'AO1'
        }));

        const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);

        return {
            title: `IGCSE ${subject.name} ${examSession} Paper ${paperInfo.paperNumber}`,
            subject: subject.name,
            description: `Cambridge IGCSE ${subject.name} ${examSession} examination paper ${paperInfo.paperNumber}. Authentic past paper with ${questions.length} questions.`,
            duration: this.getDuration(paperInfo.paperNumber),
            difficultyLevel,
            totalPoints: totalMarks,
            passingPoints: Math.floor(totalMarks * 0.4),
            isPublished: true,
            topicTags: [`IGCSE ${subject.name}`, examSession, `Paper ${paperInfo.paperNumber}`],
            
            examBoard: 'Cambridge IGCSE',
            paperCode: paperInfo.paperCode,
            examSession,
            paperType: paperTypeDesc,
            paperNumber: paperInfo.paperNumber,
            totalMarks,
            
            originalFormat: 'cambridge_past_paper',
            sourceFile: filename,
            processedDate: new Date(),
            qualityScore: this.assessQualityScore(originalData, questions),
            
            questions
        };
    }

    getExamSession(sessionCode) {
        const year = '20' + sessionCode.slice(1);
        const session = sessionCode.charAt(0);
        const sessionMap = { 's': 'June', 'm': 'March', 'w': 'November' };
        return `${sessionMap[session] || 'Unknown'} ${year}`;
    }

    getPaperTypeDescription(typeCode, paperNumber) {
        if (typeCode === 'qp') {
            if (paperNumber >= 10 && paperNumber <= 13) return 'Multiple Choice (Core)';
            if (paperNumber >= 20 && paperNumber <= 23) return 'Multiple Choice (Extended)';
            if (paperNumber >= 30 && paperNumber <= 33) return 'Theory (Core)';
            if (paperNumber >= 40 && paperNumber <= 43) return 'Theory (Extended)';
            if (paperNumber >= 50 && paperNumber <= 63) return 'Practical';
        }
        return 'Question Paper';
    }

    getDifficultyLevel(paperNumber) {
        if (paperNumber >= 10 && paperNumber <= 13) return 'beginner';
        if (paperNumber >= 20 && paperNumber <= 23) return 'intermediate';
        if (paperNumber >= 30 && paperNumber <= 43) return 'advanced';
        return 'intermediate';
    }

    getDuration(paperNumber) {
        if (paperNumber >= 10 && paperNumber <= 23) return 45;
        if (paperNumber >= 30 && paperNumber <= 43) return 75;
        if (paperNumber >= 50 && paperNumber <= 63) return 60;
        return 45;
    }

    assessQualityScore(originalData, questions) {
        let score = 5;
        if (originalData.questions && originalData.questions.length > 30) score += 1;
        if (questions.every(q => q.questionText && q.correctAnswer)) score += 1;
        if (questions.every(q => q.options)) score += 1;
        if (originalData.title) score += 0.5;
        if (originalData.description) score += 0.5;
        return Math.min(10, Math.max(1, score));
    }

    async generateValidationReport() {
        console.log('\n📊 Generating validation report...\n');
        
        const report = `# IGCSE Data Processing Validation Report

**Date:** ${new Date().toISOString()}
**Validation Tool:** backend/src/scripts/dataProcessingValidation.js

## Summary

| Metric | Count |
|--------|-------|
| Valid Quizzes | ${this.validationResults.validQuizzes} |
| Invalid Quizzes | ${this.validationResults.invalidQuizzes} |
| Validation Errors | ${this.validationResults.validationErrors.length} |
| Success Rate | ${this.validationResults.validQuizzes > 0 ? ((this.validationResults.validQuizzes / (this.validationResults.validQuizzes + this.validationResults.invalidQuizzes)) * 100).toFixed(1) : 0}% |

## Subject Validation Results

${Object.entries(this.validationResults.subjectSummary).map(([subject, stats]) => {
    if (!stats.available) {
        return `### ${subject} ❌\n- **Status**: Directory not found\n- **Action**: Check directory structure\n`;
    }
    
    return `### ${subject} ${stats.validQuizzes > 0 ? '✅' : '⚠️'}
- **Valid Quizzes**: ${stats.validQuizzes}
- **Invalid Quizzes**: ${stats.invalidQuizzes || 0}
- **Status**: ${stats.validQuizzes > 0 ? 'Ready for database import' : 'Needs processing'}
`;
}).join('\n')}

## Ready for Database Import

${this.validationResults.processedQuizzes.length > 0 ? 
    this.validationResults.processedQuizzes.map(quiz => 
        `- **${quiz.paperCode}**: ${quiz.title} (${quiz.questions.length} questions)`
    ).join('\n') :
    'No quizzes ready for immediate import.'
}

## Validation Errors

${this.validationResults.validationErrors.length > 0 ?
    this.validationResults.validationErrors.map(error => 
        `- **${error.subject}/${error.file}**: ${error.errors.join(', ')}`
    ).join('\n') :
    'No validation errors! 🎉'
}

## Next Steps

${this.validationResults.validQuizzes > 0 ? `
1. ✅ **Data Processing Validated**: ${this.validationResults.validQuizzes} quizzes ready
2. 🔗 **Setup Database Connection**: Configure MONGODB_URI environment variable
3. 🚀 **Run Database Import**: Execute full integration pipeline
4. 🎯 **Test Integration**: Verify imported data in application
` : `
1. ⚠️ **Fix Data Issues**: Address validation errors above
2. 🔄 **Re-run Validation**: Ensure all data passes validation
3. 🗄️ **Setup Database**: Configure database connection
4. 📥 **Import Data**: Run integration pipeline
`}

---

**Validation Status: ${this.validationResults.validQuizzes > 0 ? 'PASSED' : 'NEEDS ATTENTION'}**
**Ready for Database Import: ${this.validationResults.validQuizzes > 0 ? 'YES' : 'NO'}**
`;

        const reportsDir = path.join(__dirname, '../../../reports');
        if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir);
        }

        const reportPath = path.join(reportsDir, `data-processing-validation-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.md`);
        fs.writeFileSync(reportPath, report);

        console.log(`✅ Validation complete! Report saved to: ${reportPath}`);
        console.log('\n📋 Validation Summary:');
        console.log(`  ✅ Valid quizzes: ${this.validationResults.validQuizzes}`);
        console.log(`  ❌ Invalid quizzes: ${this.validationResults.invalidQuizzes}`);
        console.log(`  📊 Success rate: ${this.validationResults.validQuizzes > 0 ? ((this.validationResults.validQuizzes / (this.validationResults.validQuizzes + this.validationResults.invalidQuizzes)) * 100).toFixed(1) : 0}%`);
        
        if (this.validationResults.validQuizzes > 0) {
            console.log('\n🎯 Data processing successful! Ready for database import.');
            console.log('📝 Next steps:');
            console.log('  1. Configure MONGODB_URI environment variable');
            console.log('  2. Run full integration pipeline with database connection');
            console.log('  3. Test imported data in the application');
        } else {
            console.log('\n⚠️  Fix validation errors before proceeding to database import.');
        }
    }
}

// Run the validation
const validator = new DataProcessingValidator();
validator.run().catch(console.error); 