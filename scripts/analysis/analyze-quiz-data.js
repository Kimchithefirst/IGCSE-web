const fs = require('fs');
const path = require('path');

// Configuration
const QUIZ_DIR = './data/exam-bank/IGCSE markdown exam bank/IG Physics PP/quizzes';
const OUTPUT_FILE = './reports/physics-question-inventory.json';

async function analyzeQuizData() {
    console.log('🔍 Starting Physics Question Bank Analysis...');
    
    // Ensure reports directory exists
    if (!fs.existsSync('./reports')) {
        fs.mkdirSync('./reports', { recursive: true });
    }
    
    const results = {
        totalFiles: 0,
        totalQuestions: 0,
        validQuestions: 0,
        invalidQuestions: 0,
        filesAnalyzed: [],
        dataQualityIssues: [],
        paperCodeAnalysis: {},
        topicDistribution: {},
        summary: {},
        recommendations: []
    };
    
    try {
        // Get all JSON files
        const files = fs.readdirSync(QUIZ_DIR).filter(file => file.endsWith('.json'));
        results.totalFiles = files.length;
        
        console.log(`📂 Found ${files.length} JSON quiz files`);
        
        for (const file of files) {
            console.log(`📄 Analyzing ${file}...`);
            
            const filePath = path.join(QUIZ_DIR, file);
            const fileContent = fs.readFileSync(filePath, 'utf8');
            
            try {
                const quizData = JSON.parse(fileContent);
                
                const fileAnalysis = {
                    filename: file,
                    paperCode: extractPaperCode(file),
                    title: quizData.title || 'Unknown',
                    subject: quizData.subject || 'Unknown',
                    duration: quizData.duration || 0,
                    difficultyLevel: quizData.difficultyLevel || 'Unknown',
                    totalQuestions: quizData.questions ? quizData.questions.length : 0,
                    validQuestions: 0,
                    invalidQuestions: 0,
                    issues: []
                };
                
                // Analyze questions
                if (quizData.questions && Array.isArray(quizData.questions)) {
                    quizData.questions.forEach((question, index) => {
                        const questionAnalysis = analyzeQuestion(question, index + 1);
                        
                        if (questionAnalysis.valid) {
                            fileAnalysis.validQuestions++;
                            results.validQuestions++;
                        } else {
                            fileAnalysis.invalidQuestions++;
                            results.invalidQuestions++;
                            fileAnalysis.issues.push(questionAnalysis.issues);
                            results.dataQualityIssues.push({
                                file: file,
                                questionNumber: index + 1,
                                issues: questionAnalysis.issues
                            });
                        }
                        
                        results.totalQuestions++;
                    });
                } else {
                    fileAnalysis.issues.push('No questions array found');
                }
                
                // Track paper code analysis
                const paperCode = fileAnalysis.paperCode;
                if (!results.paperCodeAnalysis[paperCode]) {
                    results.paperCodeAnalysis[paperCode] = {
                        count: 0,
                        totalQuestions: 0,
                        validQuestions: 0
                    };
                }
                results.paperCodeAnalysis[paperCode].count++;
                results.paperCodeAnalysis[paperCode].totalQuestions += fileAnalysis.totalQuestions;
                results.paperCodeAnalysis[paperCode].validQuestions += fileAnalysis.validQuestions;
                
                results.filesAnalyzed.push(fileAnalysis);
                
            } catch (parseError) {
                console.error(`❌ Error parsing ${file}:`, parseError.message);
                results.dataQualityIssues.push({
                    file: file,
                    issues: [`JSON parsing error: ${parseError.message}`]
                });
            }
        }
        
        // Generate summary
        results.summary = {
            dataQualityScore: ((results.validQuestions / results.totalQuestions) * 100).toFixed(1),
            importReadyQuestions: results.validQuestions,
            questionsNeedingCleaning: results.invalidQuestions,
            averageQuestionsPerFile: (results.totalQuestions / results.totalFiles).toFixed(1),
            paperTypes: Object.keys(results.paperCodeAnalysis).length
        };
        
        // Generate recommendations
        generateRecommendations(results);
        
        // Save results
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
        
        // Display summary
        displaySummary(results);
        
        console.log(`\n📊 Complete analysis saved to: ${OUTPUT_FILE}`);
        
    } catch (error) {
        console.error('❌ Analysis failed:', error);
        throw error;
    }
}

function extractPaperCode(filename) {
    // Extract paper code from filename like "0625_s20_qp_11_quiz.json"
    const match = filename.match(/(\d+_[sm]\d+_qp_\d+)/);
    return match ? match[1] : 'unknown';
}

function analyzeQuestion(question, questionNumber) {
    const issues = [];
    let valid = true;
    
    // Check if question has text
    if (!question.questionText || question.questionText.trim() === '') {
        issues.push('Missing question text');
        valid = false;
    }
    
    // Check if question has options
    if (!question.options || typeof question.options !== 'object') {
        issues.push('Missing or invalid options');
        valid = false;
    } else {
        const optionKeys = Object.keys(question.options);
        if (optionKeys.length < 2) {
            issues.push('Insufficient options (less than 2)');
            valid = false;
        }
        
        // Check for empty options
        for (const key of optionKeys) {
            if (!question.options[key] || question.options[key].trim() === '') {
                issues.push(`Empty option: ${key}`);
                valid = false;
            }
        }
    }
    
    // Check if question has correct answer
    if (!question.correctAnswer || question.correctAnswer.trim() === '') {
        issues.push('Missing correct answer');
        valid = false;
    }
    
    // Check if correct answer matches available options
    if (question.options && question.correctAnswer) {
        const availableOptions = Object.keys(question.options);
        if (!availableOptions.includes(question.correctAnswer)) {
            issues.push(`Correct answer '${question.correctAnswer}' not in available options`);
            valid = false;
        }
    }
    
    return {
        valid,
        issues: issues.length > 0 ? issues : null
    };
}

function generateRecommendations(results) {
    const recommendations = [];
    
    if (results.summary.dataQualityScore >= 90) {
        recommendations.push('✅ Excellent data quality - proceed with immediate import');
    } else if (results.summary.dataQualityScore >= 75) {
        recommendations.push('⚠️ Good data quality - minor cleaning required before import');
    } else {
        recommendations.push('🔧 Significant data cleaning required before import');
    }
    
    if (results.validQuestions >= 200) {
        recommendations.push('🎯 Sufficient questions for immediate platform upgrade');
    } else {
        recommendations.push('📈 Consider importing all available questions for maximum impact');
    }
    
    if (Object.keys(results.paperCodeAnalysis).length >= 10) {
        recommendations.push('🎓 Excellent variety - multiple paper types for comprehensive practice');
    }
    
    recommendations.push('🚀 Recommend Phase 1.2: Database Schema Enhancement');
    recommendations.push('📊 Recommend Phase 1.3: Bulk Import Process Development');
    
    results.recommendations = recommendations;
}

function displaySummary(results) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 PHYSICS QUESTION BANK ANALYSIS SUMMARY');
    console.log('='.repeat(60));
    
    console.log(`\n📁 Files Analyzed: ${results.totalFiles}`);
    console.log(`📝 Total Questions: ${results.totalQuestions}`);
    console.log(`✅ Valid Questions: ${results.validQuestions}`);
    console.log(`❌ Invalid Questions: ${results.invalidQuestions}`);
    console.log(`🎯 Data Quality Score: ${results.summary.dataQualityScore}%`);
    console.log(`📈 Import Ready: ${results.summary.importReadyQuestions} questions`);
    
    console.log(`\n📋 Paper Types Available: ${results.summary.paperTypes}`);
    console.log('Paper Code Breakdown:');
    Object.entries(results.paperCodeAnalysis).forEach(([code, data]) => {
        console.log(`  ${code}: ${data.validQuestions}/${data.totalQuestions} valid questions`);
    });
    
    console.log('\n🎯 Recommendations:');
    results.recommendations.forEach(rec => console.log(`  ${rec}`));
    
    if (results.dataQualityIssues.length > 0) {
        console.log(`\n⚠️ Found ${results.dataQualityIssues.length} data quality issues`);
        console.log('(See detailed report for complete issue list)');
    }
}

// Run the analysis
analyzeQuizData().catch(console.error); 