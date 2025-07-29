/**
 * IGCSE Content Scanner
 * 
 * This script scans all IGCSE subjects to understand the scope and structure
 * of available content without requiring database connection.
 */

const fs = require('fs');
const path = require('path');

class IGCSEContentScanner {
    constructor() {
        this.baseDir = path.join(__dirname, '../../../IGCSE markdown题库');
        this.subjects = [
            { name: 'Physics', folder: 'IG Physics PP', code: '0625' },
            { name: 'Mathematics', folder: 'IG Maths PP', code: '0580' },
            { name: 'Chemistry', folder: 'IG Chemistry PP', code: '0620' },
            { name: 'Biology', folder: 'IG Biology PP', code: '0610' },
            { name: 'Economics', folder: 'IG Economics PP', code: '0455' }
        ];
        
        this.scanResults = {
            totalFiles: 0,
            totalSubjects: 0,
            availableSubjects: [],
            subjectDetails: {}
        };
    }

    async run() {
        console.log('🔍 Scanning IGCSE Content Repository...\n');
        
        try {
            await this.scanAllSubjects();
            await this.analyzeAvailableContent();
            await this.generateScanReport();
        } catch (error) {
            console.error('❌ Scan failed:', error.message);
            process.exit(1);
        }
    }

    async scanAllSubjects() {
        console.log('📊 Scanning all subjects for available content...\n');
        
        for (const subject of this.subjects) {
            console.log(`📚 Scanning ${subject.name}...`);
            
            const subjectPath = path.join(this.baseDir, subject.folder);
            if (!fs.existsSync(subjectPath)) {
                console.log(`   ⚠️  Directory not found: ${subject.folder}`);
                this.scanResults.subjectDetails[subject.name] = {
                    available: false,
                    reason: 'Directory not found'
                };
                continue;
            }
            
            this.scanResults.totalSubjects++;
            this.scanResults.availableSubjects.push(subject.name);
            
            this.scanResults.subjectDetails[subject.name] = {
                available: true,
                sessions: 0,
                years: new Set(),
                questionPapers: 0,
                markSchemes: 0,
                examinerComments: 0,
                jsonQuizzes: 0,
                sessionDetails: {},
                fileTypes: {
                    md: 0,
                    json: 0,
                    other: 0
                }
            };
            
            const sessions = fs.readdirSync(subjectPath);
            for (const session of sessions) {
                const sessionPath = path.join(subjectPath, session);
                if (!fs.statSync(sessionPath).isDirectory()) continue;
                
                this.scanResults.subjectDetails[subject.name].sessions++;
                this.scanResults.subjectDetails[subject.name].sessionDetails[session] = {
                    files: 0,
                    questionPapers: 0,
                    markSchemes: 0,
                    examinerComments: 0,
                    jsonQuizzes: 0,
                    paperCodes: []
                };
                
                // Extract year from session name
                const yearMatch = session.match(/(\d{4})/);
                if (yearMatch) {
                    this.scanResults.subjectDetails[subject.name].years.add(yearMatch[1]);
                }
                
                const files = fs.readdirSync(sessionPath);
                
                for (const file of files) {
                    this.scanResults.totalFiles++;
                    this.scanResults.subjectDetails[subject.name].sessionDetails[session].files++;
                    
                    // Count by file type
                    if (file.endsWith('.md')) {
                        this.scanResults.subjectDetails[subject.name].fileTypes.md++;
                    } else if (file.endsWith('.json')) {
                        this.scanResults.subjectDetails[subject.name].fileTypes.json++;
                    } else {
                        this.scanResults.subjectDetails[subject.name].fileTypes.other++;
                    }
                    
                    // Extract paper code
                    const paperCode = this.extractPaperCode(file);
                    if (paperCode) {
                        this.scanResults.subjectDetails[subject.name].sessionDetails[session].paperCodes.push(paperCode);
                    }
                    
                    // Categorize files
                    if (file.endsWith('.json') && file.includes('quiz')) {
                        this.scanResults.subjectDetails[subject.name].jsonQuizzes++;
                        this.scanResults.subjectDetails[subject.name].sessionDetails[session].jsonQuizzes++;
                    } else if (file.includes('_qp_')) {
                        this.scanResults.subjectDetails[subject.name].questionPapers++;
                        this.scanResults.subjectDetails[subject.name].sessionDetails[session].questionPapers++;
                    } else if (file.includes('_ms_')) {
                        this.scanResults.subjectDetails[subject.name].markSchemes++;
                        this.scanResults.subjectDetails[subject.name].sessionDetails[session].markSchemes++;
                    } else if (file.includes('_ci_')) {
                        this.scanResults.subjectDetails[subject.name].examinerComments++;
                        this.scanResults.subjectDetails[subject.name].sessionDetails[session].examinerComments++;
                    }
                }
                
                // Remove duplicates from paper codes
                this.scanResults.subjectDetails[subject.name].sessionDetails[session].paperCodes = 
                    [...new Set(this.scanResults.subjectDetails[subject.name].sessionDetails[session].paperCodes)];
            }
            
            // Convert Set to Array for reporting
            this.scanResults.subjectDetails[subject.name].years = 
                Array.from(this.scanResults.subjectDetails[subject.name].years).sort();
            
            const details = this.scanResults.subjectDetails[subject.name];
            console.log(`   📄 ${details.questionPapers} question papers`);
            console.log(`   ✅ ${details.markSchemes} mark schemes`);
            console.log(`   💬 ${details.examinerComments} examiner comments`);
            console.log(`   🎯 ${details.jsonQuizzes} JSON quizzes`);
            console.log(`   📅 Years: ${details.years.join(', ')}`);
        }
        
        console.log(`\\n📊 Total: ${this.scanResults.totalFiles} files across ${this.scanResults.totalSubjects} subjects\\n`);
    }

    async analyzeAvailableContent() {
        console.log('🔬 Analyzing content readiness...\n');
        
        for (const subjectName of this.scanResults.availableSubjects) {
            const subject = this.scanResults.subjectDetails[subjectName];
            
            console.log(`📈 ${subjectName} Analysis:`);
            console.log(`   🎯 JSON Ready: ${subject.jsonQuizzes > 0 ? '✅ YES' : '❌ NO'} (${subject.jsonQuizzes} files)`);
            console.log(`   📝 Markdown Content: ${subject.questionPapers > 0 ? '✅ YES' : '❌ NO'} (${subject.questionPapers} papers)`);
            console.log(`   📊 Mark Schemes: ${subject.markSchemes > 0 ? '✅ YES' : '❌ NO'} (${subject.markSchemes} schemes)`);
            console.log(`   💭 Examiner Comments: ${subject.examinerComments > 0 ? '✅ YES' : '❌ NO'} (${subject.examinerComments} comments)`);
            console.log(`   📅 Year Coverage: ${subject.years.length} years (${subject.years.join(', ')})`);
            
            // Calculate readiness score
            let readinessScore = 0;
            if (subject.jsonQuizzes > 0) readinessScore += 40;
            if (subject.questionPapers > 0) readinessScore += 30;
            if (subject.markSchemes > 0) readinessScore += 20;
            if (subject.examinerComments > 0) readinessScore += 10;
            
            console.log(`   🎯 Readiness Score: ${readinessScore}/100`);
            
            if (readinessScore >= 70) {
                console.log(`   ✅ Status: READY FOR INTEGRATION`);
            } else if (readinessScore >= 40) {
                console.log(`   ⚠️  Status: PARTIAL CONTENT AVAILABLE`);
            } else {
                console.log(`   ❌ Status: NEEDS CONTENT PROCESSING`);
            }
            
            console.log('');
        }
    }

    extractPaperCode(filename) {
        const match = filename.match(/(\d{4}_[smw]\d{2}_[a-z]{2}_\d{2})/);
        return match ? match[1] : null;
    }

    async generateScanReport() {
        console.log('📊 Generating comprehensive scan report...\n');
        
        const report = `# IGCSE Content Repository Scan Report

**Date:** ${new Date().toISOString()}
**Scanner:** backend/src/scripts/scanIGCSEContent.js

## Executive Summary

This report provides a comprehensive analysis of the IGCSE question bank repository, 
identifying available subjects, content types, and integration readiness.

### Repository Overview

| Metric | Count |
|--------|-------|
| Total Files | ${this.scanResults.totalFiles} |
| Available Subjects | ${this.scanResults.totalSubjects} |
| Subjects Ready for Integration | ${this.scanResults.availableSubjects.filter(name => {
    const subject = this.scanResults.subjectDetails[name];
    return subject.jsonQuizzes > 0;
}).length} |

### Available Subjects

${this.scanResults.availableSubjects.map(name => `- ✅ ${name}`).join('\n')}

### Missing Subjects

${this.subjects.filter(s => !this.scanResults.availableSubjects.includes(s.name))
    .map(s => `- ❌ ${s.name} (${s.folder})`).join('\n')}

## Subject-by-Subject Analysis

${this.scanResults.availableSubjects.map(subjectName => {
    const subject = this.scanResults.subjectDetails[subjectName];
    
    let readinessScore = 0;
    if (subject.jsonQuizzes > 0) readinessScore += 40;
    if (subject.questionPapers > 0) readinessScore += 30;
    if (subject.markSchemes > 0) readinessScore += 20;
    if (subject.examinerComments > 0) readinessScore += 10;
    
    const status = readinessScore >= 70 ? 'READY' : 
                   readinessScore >= 40 ? 'PARTIAL' : 'NEEDS WORK';
    
    return `
### ${subjectName} ${status === 'READY' ? '✅' : status === 'PARTIAL' ? '⚠️' : '❌'}

| Metric | Count |
|--------|-------|
| Sessions | ${subject.sessions} |
| Question Papers | ${subject.questionPapers} |
| Mark Schemes | ${subject.markSchemes} |
| Examiner Comments | ${subject.examinerComments} |
| JSON Quizzes | ${subject.jsonQuizzes} |
| **Readiness Score** | **${readinessScore}/100** |
| **Status** | **${status}** |

**Years Available:** ${subject.years.join(', ')}

**File Breakdown:**
- Markdown files: ${subject.fileTypes.md}
- JSON files: ${subject.fileTypes.json}
- Other files: ${subject.fileTypes.other}

**Session Details:**
${Object.entries(subject.sessionDetails).map(([session, details]) => 
    `- **${session}**: ${details.files} files (${details.questionPapers} QP, ${details.markSchemes} MS, ${details.examinerComments} CI, ${details.jsonQuizzes} JSON)`
).join('\n')}
`;
}).join('')}

## Integration Recommendations

### Immediate Integration (Ready Now)

${this.scanResults.availableSubjects.filter(name => {
    const subject = this.scanResults.subjectDetails[name];
    return subject.jsonQuizzes > 0;
}).map(name => {
    const subject = this.scanResults.subjectDetails[name];
    return `- **${name}**: ${subject.jsonQuizzes} JSON quizzes ready for direct import`;
}).join('\n') || 'No subjects have JSON quizzes ready for immediate integration.'}

### Markdown Processing Required

${this.scanResults.availableSubjects.filter(name => {
    const subject = this.scanResults.subjectDetails[name];
    return subject.jsonQuizzes === 0 && subject.questionPapers > 0;
}).map(name => {
    const subject = this.scanResults.subjectDetails[name];
    return `- **${name}**: ${subject.questionPapers} question papers need markdown processing`;
}).join('\n') || 'All available subjects have JSON conversions or no content.'}

### Enhanced Integration (With Mark Schemes)

${this.scanResults.availableSubjects.filter(name => {
    const subject = this.scanResults.subjectDetails[name];
    return subject.markSchemes > 0;
}).map(name => {
    const subject = this.scanResults.subjectDetails[name];
    return `- **${name}**: ${subject.markSchemes} mark schemes available for enhanced feedback`;
}).join('\n') || 'No mark schemes available for enhanced integration.'}

## Implementation Priority

### Phase 1: Immediate Integration
**Target:** JSON-ready subjects
${this.scanResults.availableSubjects.filter(name => {
    const subject = this.scanResults.subjectDetails[name];
    return subject.jsonQuizzes > 0;
}).map((name, index) => `${index + 1}. ${name} (${this.scanResults.subjectDetails[name].jsonQuizzes} quizzes)`).join('\n') || 'No subjects ready for immediate integration.'}

### Phase 2: Markdown Processing
**Target:** Subjects with question papers but no JSON
${this.scanResults.availableSubjects.filter(name => {
    const subject = this.scanResults.subjectDetails[name];
    return subject.jsonQuizzes === 0 && subject.questionPapers > 0;
}).map((name, index) => `${index + 1}. ${name} (${this.scanResults.subjectDetails[name].questionPapers} papers)`).join('\n') || 'All subjects have JSON conversions or no content.'}

### Phase 3: Enhanced Features
**Target:** Mark scheme and examiner comment integration
- Implement advanced feedback systems
- Add grade threshold calculations
- Provide examiner insights

## Next Steps

1. **Immediate Action**: Run integration pipeline for JSON-ready subjects
2. **Development**: Build markdown processing for remaining subjects  
3. **Enhancement**: Integrate mark schemes and examiner comments
4. **Frontend**: Update UI to support multi-subject IGCSE content
5. **Testing**: Validate all authentic papers before production

---

**Scan Status: COMPLETE** ✅  
**Ready for Integration Pipeline: ${this.scanResults.availableSubjects.filter(name => 
    this.scanResults.subjectDetails[name].jsonQuizzes > 0
).length > 0 ? 'YES' : 'NO'}**

*Repository contains ${this.scanResults.totalFiles} files across ${this.scanResults.totalSubjects} subjects with varying levels of processing readiness.*
`;

        // Ensure reports directory exists
        const reportsDir = path.join(__dirname, '../../../reports');
        if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir);
        }

        const reportPath = path.join(reportsDir, `igcse-content-scan-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.md`);
        fs.writeFileSync(reportPath, report);

        console.log(`✅ Scan complete! Report saved to: ${reportPath}`);
        console.log('\n📋 Scan Summary:');
        console.log(`  📁 Total files: ${this.scanResults.totalFiles}`);
        console.log(`  📚 Available subjects: ${this.scanResults.totalSubjects}`);
        console.log(`  🎯 JSON-ready subjects: ${this.scanResults.availableSubjects.filter(name => 
            this.scanResults.subjectDetails[name].jsonQuizzes > 0
        ).length}`);
        
        const readySubjects = this.scanResults.availableSubjects.filter(name => 
            this.scanResults.subjectDetails[name].jsonQuizzes > 0
        );
        
        if (readySubjects.length > 0) {
            console.log('\n🚀 Ready for immediate integration:');
            readySubjects.forEach(name => {
                const jsonCount = this.scanResults.subjectDetails[name].jsonQuizzes;
                console.log(`  - ${name}: ${jsonCount} JSON quiz files`);
            });
            console.log('\n🎯 Next: Run full integration pipeline for these subjects!');
        } else {
            console.log('\n⚠️  No subjects have JSON files ready for immediate integration.');
            console.log('  Consider implementing markdown processing first.');
        }
    }
}

// Run the content scanner
const scanner = new IGCSEContentScanner();
scanner.run().catch(console.error); 