#!/usr/bin/env node

/**
 * IGCSE Data Quality Assessment Script
 * 
 * This script analyzes the IGCSE markdown question bank to assess:
 * - File structure and organization
 * - Data quality and consistency
 * - JSON vs Markdown coverage
 * - Common formatting patterns
 * - Conversion feasibility
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class IGCSEDataAssessment {
    constructor() {
        this.baseDir = 'IGCSE markdown题库';
        this.assessment = {
            subjects: {},
            totals: {
                files: 0,
                jsonFiles: 0,
                markdownFiles: 0,
                questionPapers: 0,
                markSchemes: 0,
                confidentialInstructions: 0
            },
            quality: {
                validJsonFiles: 0,
                malformedJsonFiles: 0,
                emptyJsonFiles: 0,
                incompleteQuestions: 0
            },
            patterns: {
                paperCodes: new Set(),
                examSessions: new Set(),
                years: new Set(),
                paperTypes: new Set()
            }
        };
    }

    async run() {
        console.log('🔍 Starting IGCSE Data Quality Assessment...\n');
        
        try {
            await this.scanDirectory();
            await this.analyzeJsonQuality();
            await this.generateReport();
        } catch (error) {
            console.error('❌ Assessment failed:', error.message);
            process.exit(1);
        }
    }

    async scanDirectory() {
        console.log('📁 Scanning directory structure...');
        
        const subjects = fs.readdirSync(this.baseDir);
        
        for (const subject of subjects) {
            const subjectPath = path.join(this.baseDir, subject);
            if (!fs.statSync(subjectPath).isDirectory()) continue;
            
            console.log(`  📚 Analyzing ${subject}...`);
            
            this.assessment.subjects[subject] = {
                sessions: {},
                totals: {
                    files: 0,
                    jsonFiles: 0,
                    questionPapers: 0,
                    markSchemes: 0,
                    confidentialInstructions: 0
                }
            };
            
            await this.scanSubject(subject, subjectPath);
        }
    }

    async scanSubject(subjectName, subjectPath) {
        const sessions = fs.readdirSync(subjectPath);
        
        for (const session of sessions) {
            const sessionPath = path.join(subjectPath, session);
            if (!fs.statSync(sessionPath).isDirectory()) continue;
            
            // Extract year and session info
            if (session !== 'quizzes') {
                this.patterns.examSessions.add(session);
                const yearMatch = session.match(/\d{4}/);
                if (yearMatch) {
                    this.patterns.years.add(yearMatch[0]);
                }
            }
            
            this.assessment.subjects[subjectName].sessions[session] = {
                files: [],
                counts: {
                    questionPapers: 0,
                    markSchemes: 0,
                    confidentialInstructions: 0,
                    jsonQuizzes: 0
                }
            };
            
            const files = fs.readdirSync(sessionPath);
            
            for (const file of files) {
                const filePath = path.join(sessionPath, file);
                if (!fs.statSync(filePath).isFile()) continue;
                
                this.assessment.totals.files++;
                this.assessment.subjects[subjectName].totals.files++;
                
                const fileInfo = this.analyzeFileName(file);
                this.assessment.subjects[subjectName].sessions[session].files.push({
                    name: file,
                    ...fileInfo
                });
                
                // Update counters
                if (file.endsWith('.json')) {
                    this.assessment.totals.jsonFiles++;
                    this.assessment.subjects[subjectName].totals.jsonFiles++;
                    this.assessment.subjects[subjectName].sessions[session].counts.jsonQuizzes++;
                } else if (file.endsWith('.md')) {
                    this.assessment.totals.markdownFiles++;
                    
                    if (fileInfo.type === 'questionPaper') {
                        this.assessment.totals.questionPapers++;
                        this.assessment.subjects[subjectName].totals.questionPapers++;
                        this.assessment.subjects[subjectName].sessions[session].counts.questionPapers++;
                    } else if (fileInfo.type === 'markScheme') {
                        this.assessment.totals.markSchemes++;
                        this.assessment.subjects[subjectName].totals.markSchemes++;
                        this.assessment.subjects[subjectName].sessions[session].counts.markSchemes++;
                    } else if (fileInfo.type === 'confidentialInstruction') {
                        this.assessment.totals.confidentialInstructions++;
                        this.assessment.subjects[subjectName].totals.confidentialInstructions++;
                        this.assessment.subjects[subjectName].sessions[session].counts.confidentialInstructions++;
                    }
                }
                
                // Collect patterns
                if (fileInfo.paperCode) {
                    this.patterns.paperCodes.add(fileInfo.paperCode);
                }
                if (fileInfo.paperType) {
                    this.patterns.paperTypes.add(fileInfo.paperType);
                }
            }
        }
    }

    analyzeFileName(filename) {
        const info = {
            type: 'unknown',
            paperCode: null,
            session: null,
            year: null,
            paperType: null
        };
        
        // Parse Cambridge paper code format: 0625_s20_qp_11.md
        const codeMatch = filename.match(/(\d{4})_([smw]\d{2})_([a-z]{2})_(\d{2})/);
        if (codeMatch) {
            info.paperCode = codeMatch[0];
            info.session = codeMatch[2];
            info.year = '20' + codeMatch[2].slice(1);
            
            const typeCode = codeMatch[3];
            switch (typeCode) {
                case 'qp':
                    info.type = 'questionPaper';
                    info.paperType = 'Question Paper';
                    break;
                case 'ms':
                    info.type = 'markScheme';
                    info.paperType = 'Mark Scheme';
                    break;
                case 'ci':
                    info.type = 'confidentialInstruction';
                    info.paperType = 'Confidential Instruction';
                    break;
            }
        }
        
        return info;
    }

    async analyzeJsonQuality() {
        console.log('\n🔍 Analyzing JSON file quality...');
        
        const jsonFiles = [];
        this.findJsonFiles(this.baseDir, jsonFiles);
        
        for (const jsonFile of jsonFiles.slice(0, 10)) { // Sample first 10 for detailed analysis
            try {
                const content = fs.readFileSync(jsonFile, 'utf8');
                const data = JSON.parse(content);
                
                this.assessment.quality.validJsonFiles++;
                
                // Analyze quiz structure
                if (data.questions && Array.isArray(data.questions)) {
                    let incompleteQuestions = 0;
                    
                    for (const question of data.questions) {
                        if (!question.questionText || !question.options || !question.correctAnswer) {
                            incompleteQuestions++;
                        }
                    }
                    
                    if (incompleteQuestions > 0) {
                        this.assessment.quality.incompleteQuestions += incompleteQuestions;
                    }
                } else {
                    this.assessment.quality.emptyJsonFiles++;
                }
                
            } catch (error) {
                this.assessment.quality.malformedJsonFiles++;
                console.log(`  ⚠️  Malformed JSON: ${path.basename(jsonFile)}`);
            }
        }
    }

    findJsonFiles(dir, results) {
        const files = fs.readdirSync(dir);
        
        for (const file of files) {
            const fullPath = path.join(dir, file);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                this.findJsonFiles(fullPath, results);
            } else if (file.endsWith('.json')) {
                results.push(fullPath);
            }
        }
    }

    async generateReport() {
        console.log('\n📊 Generating assessment report...');
        
        const report = this.buildReport();
        
        // Ensure reports directory exists
        if (!fs.existsSync('data/reports')) {
            fs.mkdirSync('data/reports');
        }
        
        const reportPath = `data/reports/igcse-data-assessment-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.md`;
        fs.writeFileSync(reportPath, report);
        
        console.log(`\n✅ Assessment complete! Report saved to: ${reportPath}`);
        console.log('\n📋 Summary:');
        console.log(`  📁 Total files: ${this.assessment.totals.files}`);
        console.log(`  📄 JSON files: ${this.assessment.totals.jsonFiles}`);
        console.log(`  📝 Markdown files: ${this.assessment.totals.markdownFiles}`);
        console.log(`  ✅ Valid JSON files: ${this.assessment.quality.validJsonFiles}`);
        console.log(`  ❌ Malformed JSON files: ${this.assessment.quality.malformedJsonFiles}`);
        console.log(`  📚 Subjects: ${Object.keys(this.assessment.subjects).length}`);
        console.log(`  📅 Years covered: ${Array.from(this.patterns.years).sort().join(', ')}`);
        
        return reportPath;
    }

    buildReport() {
        const timestamp = new Date().toISOString();
        
        return `# IGCSE Data Quality Assessment Report

**Generated:** ${timestamp}  
**Assessment Tool:** scripts/assess_igcse_data.js

## Executive Summary

This report analyzes the IGCSE markdown question bank for integration feasibility into the mock test website.

### 📊 Overview Statistics

| Metric | Count |
|--------|-------|
| Total Files | ${this.assessment.totals.files} |
| JSON Quiz Files | ${this.assessment.totals.jsonFiles} |
| Markdown Files | ${this.assessment.totals.markdownFiles} |
| Question Papers | ${this.assessment.totals.questionPapers} |
| Mark Schemes | ${this.assessment.totals.markSchemes} |
| Examiner Comments | ${this.assessment.totals.confidentialInstructions} |

### 🎯 Quality Assessment

| Quality Metric | Count | Percentage |
|----------------|-------|------------|
| Valid JSON Files | ${this.assessment.quality.validJsonFiles} | ${((this.assessment.quality.validJsonFiles / this.assessment.totals.jsonFiles) * 100).toFixed(1)}% |
| Malformed JSON Files | ${this.assessment.quality.malformedJsonFiles} | ${((this.assessment.quality.malformedJsonFiles / this.assessment.totals.jsonFiles) * 100).toFixed(1)}% |
| Empty JSON Files | ${this.assessment.quality.emptyJsonFiles} | ${((this.assessment.quality.emptyJsonFiles / this.assessment.totals.jsonFiles) * 100).toFixed(1)}% |
| Incomplete Questions | ${this.assessment.quality.incompleteQuestions} | - |

## 📚 Subject Breakdown

${Object.entries(this.assessment.subjects).map(([subject, data]) => `
### ${subject}

| Metric | Count |
|--------|-------|
| Total Files | ${data.totals.files} |
| JSON Quiz Files | ${data.totals.jsonFiles} |
| Question Papers | ${data.totals.questionPapers} |
| Mark Schemes | ${data.totals.markSchemes} |
| Examiner Comments | ${data.totals.confidentialInstructions} |

**Sessions:** ${Object.keys(data.sessions).length} (${Object.keys(data.sessions).join(', ')})
`).join('')}

## 📅 Coverage Analysis

### Years Available
${Array.from(this.patterns.years).sort().map(year => `- ${year}`).join('\n')}

### Exam Sessions
${Array.from(this.patterns.examSessions).sort().map(session => `- ${session}`).join('\n')}

### Paper Types Identified
${Array.from(this.patterns.paperTypes).sort().map(type => `- ${type}`).join('\n')}

## 🔧 Integration Recommendations

### ✅ Immediate Integration Ready
- **JSON Quiz Files**: ${this.assessment.quality.validJsonFiles} files ready for direct import
- **Question Papers**: ${this.assessment.totals.questionPapers} authentic Cambridge papers available
- **Mark Schemes**: ${this.assessment.totals.markSchemes} detailed answer keys for feedback

### ⚠️ Requires Processing
- **Malformed JSON**: ${this.assessment.quality.malformedJsonFiles} files need repair or conversion from markdown
- **Incomplete Questions**: ${this.assessment.quality.incompleteQuestions} questions missing essential fields
- **Image References**: Manual review needed for diagram handling

### 🎯 Recommended Approach

1. **Phase 1**: Import ${this.assessment.quality.validJsonFiles} valid JSON quiz files
2. **Phase 2**: Process markdown files to extract additional questions
3. **Phase 3**: Implement mark scheme integration for detailed feedback
4. **Phase 4**: Add examiner comment insights for advanced features

## 📊 Data Quality Score

**Overall Quality Score: ${this.calculateQualityScore()}/10**

This score is based on:
- File completeness (JSON + Markdown coverage)
- Data validity (well-formed JSON files)
- Content richness (questions + answers + comments)
- Coverage breadth (subjects × years × sessions)

---

**Next Steps:** Proceed with Physics subject as proof of concept using the highest quality JSON files.
`;
    }

    calculateQualityScore() {
        const factors = {
            completeness: (this.assessment.totals.jsonFiles / this.assessment.totals.questionPapers) * 3,
            validity: (this.assessment.quality.validJsonFiles / this.assessment.totals.jsonFiles) * 3,
            coverage: Math.min(Object.keys(this.assessment.subjects).length / 5, 1) * 2,
            richness: Math.min((this.assessment.totals.markSchemes + this.assessment.totals.confidentialInstructions) / this.assessment.totals.questionPapers, 1) * 2
        };
        
        const score = Object.values(factors).reduce((sum, factor) => sum + factor, 0);
        return Math.round(score * 10) / 10;
    }
}

// Run the assessment
const assessment = new IGCSEDataAssessment();
assessment.run().catch(console.error); 