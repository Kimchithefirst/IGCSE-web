const fs = require('fs');
const path = require('path');

// Configuration
const QUIZ_DIR = './data/exam-bank/IGCSE markdown exam bank/IG Physics PP/quizzes';
const OUTPUT_FILE = './data/physics_questions.json';
const REPORTS_DIR = './reports';

// Enhanced question validation
function validateQuestion(question, questionNumber) {
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

// Enhanced topic extraction for better categorization
function extractTopics(questionText) {
    const text = questionText.toLowerCase();
    const topics = [];
    
    // Physics topics detection (enhanced)
    if (text.includes('force') || text.includes('newton') || text.includes('pressure')) topics.push('forces');
    if (text.includes('light') || text.includes('speed') || text.includes('wave') || text.includes('frequency') || text.includes('wavelength')) topics.push('waves');
    if (text.includes('motion') || text.includes('law') || text.includes('acceleration') || text.includes('velocity')) topics.push('mechanics');
    if (text.includes('energy') || text.includes('joule') || text.includes('power') || text.includes('work')) topics.push('energy');
    if (text.includes('electric') || text.includes('voltage') || text.includes('current') || text.includes('resistance')) topics.push('electricity');
    if (text.includes('heat') || text.includes('temperature') || text.includes('thermal') || text.includes('evaporation')) topics.push('thermal');
    if (text.includes('atom') || text.includes('nuclear') || text.includes('radiation') || text.includes('molecule')) topics.push('atomic');
    if (text.includes('magnet') || text.includes('magnetic')) topics.push('magnetism');
    if (text.includes('pressure') || text.includes('density') || text.includes('fluid') || text.includes('liquid')) topics.push('fluids');
    
    return topics.length > 0 ? topics : ['general'];
}

// Determine difficulty level based on question complexity
function determineDifficulty(questionText, options) {
    const text = questionText.toLowerCase();
    const optionTexts = Object.values(options).join(' ').toLowerCase();
    
    // Count complexity indicators
    let complexityScore = 0;
    
    // Mathematical expressions
    if (text.match(/\d+\s*×\s*10\^?\d+/) || optionTexts.match(/\d+\s*×\s*10\^?\d+/)) complexityScore += 2;
    if (text.includes('calculate') || text.includes('formula')) complexityScore += 2;
    
    // Advanced concepts
    if (text.includes('electromagnetic') || text.includes('quantum') || text.includes('nuclear')) complexityScore += 3;
    if (text.includes('acceleration') || text.includes('momentum') || text.includes('kinetic')) complexityScore += 1;
    
    // Question length (longer questions tend to be more complex)
    if (text.length > 200) complexityScore += 1;
    if (Object.keys(options).length > 4) complexityScore += 1;
    
    if (complexityScore >= 5) return 'advanced';
    if (complexityScore >= 2) return 'intermediate';
    return 'beginner';
}

// Convert question to enhanced format
function convertToEnhancedFormat(question, paperCode, questionIndex) {
    const topics = extractTopics(question.questionText);
    const difficulty = determineDifficulty(question.questionText, question.options);
    
    // Convert options to array format expected by frontend
    const optionsArray = Object.entries(question.options).map(([key, value]) => ({
        _id: `${paperCode}_q${question.questionNumber || questionIndex}_opt_${key}`,
        text: value,
        isCorrect: key === question.correctAnswer
    }));
    
    return {
        _id: `${paperCode}_q${question.questionNumber || questionIndex}`,
        id: question.questionNumber || questionIndex,
        text: question.questionText,
        questionText: question.questionText,
        type: 'multiple-choice',
        options: optionsArray,
        correctAnswer: question.correctAnswer,
        explanation: `This question covers: ${topics.join(', ')}`,
        paperCode: paperCode,
        subject: 'Physics',
        topics: topics,
        difficulty: difficulty,
        source: 'Cambridge IGCSE',
        year: 2020,
        session: 'Summer',
        generatedBy: 'Import',
        importedAt: new Date().toISOString()
    };
}

async function importValidQuestions() {
    console.log('🚀 Starting IGCSE Physics Question Import...');
    console.log('📊 Importing only validated questions from analysis report');
    
    // Ensure output directory exists
    if (!fs.existsSync('./data')) {
        fs.mkdirSync('./data', { recursive: true });
    }
    
    const importResults = {
        totalFilesProcessed: 0,
        totalQuestionsProcessed: 0,
        validQuestionsImported: 0,
        invalidQuestionsSkipped: 0,
        quizzes: [],
        importedQuestions: [],
        skippedQuestions: [],
        summary: {},
        metadata: {
            importDate: new Date().toISOString(),
            source: 'Cambridge IGCSE Physics Summer 2020',
            dataQualityThreshold: 'Valid questions only',
            enhancedSchema: true
        }
    };
    
    try {
        // Get all JSON files
        const files = fs.readdirSync(QUIZ_DIR).filter(file => file.endsWith('.json'));
        importResults.totalFilesProcessed = files.length;
        
        console.log(`📂 Processing ${files.length} JSON quiz files...`);
        
        for (const file of files) {
            console.log(`📄 Processing ${file}...`);
            
            const filePath = path.join(QUIZ_DIR, file);
            const fileContent = fs.readFileSync(filePath, 'utf8');
            
            try {
                const quizData = JSON.parse(fileContent);
                const paperCode = file.replace('_quiz.json', '');
                
                const quizInfo = {
                    paperCode: paperCode,
                    title: quizData.title || `IGCSE Physics ${paperCode}`,
                    subject: 'Physics',
                    duration: quizData.duration || 45,
                    difficultyLevel: quizData.difficultyLevel || 'intermediate',
                    totalQuestions: 0,
                    validQuestions: 0,
                    questions: []
                };
                
                // Process questions
                if (quizData.questions && Array.isArray(quizData.questions)) {
                    quizData.questions.forEach((question, index) => {
                        importResults.totalQuestionsProcessed++;
                        quizInfo.totalQuestions++;
                        
                        const validation = validateQuestion(question, index + 1);
                        
                        if (validation.valid) {
                            // Convert to enhanced format
                            const enhancedQuestion = convertToEnhancedFormat(question, paperCode, index + 1);
                            
                            quizInfo.questions.push(enhancedQuestion);
                            importResults.importedQuestions.push(enhancedQuestion);
                            importResults.validQuestionsImported++;
                            quizInfo.validQuestions++;
                            
                            console.log(`  ✅ Imported Q${index + 1}: ${enhancedQuestion.topics.join(', ')} (${enhancedQuestion.difficulty})`);
                        } else {
                            importResults.invalidQuestionsSkipped++;
                            importResults.skippedQuestions.push({
                                file: file,
                                questionNumber: index + 1,
                                issues: validation.issues
                            });
                            console.log(`  ❌ Skipped Q${index + 1}: ${validation.issues.join(', ')}`);
                        }
                    });
                }
                
                // Only include quizzes that have valid questions
                if (quizInfo.validQuestions > 0) {
                    importResults.quizzes.push(quizInfo);
                    console.log(`  📊 ${file}: ${quizInfo.validQuestions}/${quizInfo.totalQuestions} valid questions imported`);
                } else {
                    console.log(`  ⚠️ ${file}: No valid questions found, skipping quiz`);
                }
                
            } catch (parseError) {
                console.error(`❌ Error parsing ${file}:`, parseError.message);
            }
        }
        
        // Generate summary
        importResults.summary = {
            totalQuizzes: importResults.quizzes.length,
            totalValidQuestions: importResults.validQuestionsImported,
            averageQuestionsPerQuiz: (importResults.validQuestionsImported / importResults.quizzes.length).toFixed(1),
            topicDistribution: getTopicDistribution(importResults.importedQuestions),
            difficultyDistribution: getDifficultyDistribution(importResults.importedQuestions),
            dataQualityScore: ((importResults.validQuestionsImported / importResults.totalQuestionsProcessed) * 100).toFixed(1)
        };
        
        // Save the enhanced quiz data in the format expected by server.js
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(importResults.quizzes, null, 2));
        
        // Save detailed import report
        const reportPath = path.join(REPORTS_DIR, 'import-report.json');
        if (!fs.existsSync(REPORTS_DIR)) {
            fs.mkdirSync(REPORTS_DIR, { recursive: true });
        }
        fs.writeFileSync(reportPath, JSON.stringify(importResults, null, 2));
        
        // Display results
        displayImportResults(importResults);
        
        console.log(`\n✅ Import completed successfully!`);
        console.log(`📁 Questions saved to: ${OUTPUT_FILE}`);
        console.log(`📊 Detailed report saved to: ${reportPath}`);
        
        return importResults;
        
    } catch (error) {
        console.error('❌ Import failed:', error);
        throw error;
    }
}

function getTopicDistribution(questions) {
    const distribution = {};
    questions.forEach(q => {
        q.topics.forEach(topic => {
            distribution[topic] = (distribution[topic] || 0) + 1;
        });
    });
    return distribution;
}

function getDifficultyDistribution(questions) {
    const distribution = {};
    questions.forEach(q => {
        distribution[q.difficulty] = (distribution[q.difficulty] || 0) + 1;
    });
    return distribution;
}

function displayImportResults(results) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 IGCSE PHYSICS QUESTION IMPORT RESULTS');
    console.log('='.repeat(60));
    
    console.log(`\n📁 Files Processed: ${results.totalFilesProcessed}`);
    console.log(`📝 Total Questions Processed: ${results.totalQuestionsProcessed}`);
    console.log(`✅ Valid Questions Imported: ${results.validQuestionsImported}`);
    console.log(`❌ Invalid Questions Skipped: ${results.invalidQuestionsSkipped}`);
    console.log(`🎯 Data Quality Score: ${results.summary.dataQualityScore}%`);
    
    console.log(`\n📚 Quizzes Created: ${results.summary.totalQuizzes}`);
    console.log(`📈 Average Questions per Quiz: ${results.summary.averageQuestionsPerQuiz}`);
    
    console.log('\n🏷️ Topic Distribution:');
    Object.entries(results.summary.topicDistribution).forEach(([topic, count]) => {
        console.log(`  ${topic}: ${count} questions`);
    });
    
    console.log('\n📊 Difficulty Distribution:');
    Object.entries(results.summary.difficultyDistribution).forEach(([difficulty, count]) => {
        console.log(`  ${difficulty}: ${count} questions`);
    });
    
    console.log(`\n🚀 Ready for deployment! Your question bank has grown from 3 to ${results.validQuestionsImported} questions!`);
}

// Run the import
importValidQuestions().catch(console.error); 