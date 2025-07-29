# Root Directory Cleanup & Organization Plan

## 📊 Current Root Directory Analysis

After analyzing the root directory structure, I've identified the following categories of files that need organization:

**📁 CURRENT ROOT DIRECTORY STATUS:**
```
Root Directory: 35+ files/folders (CLUTTERED)
├── Essential Keep: 6 files
├── Scripts to Organize: 8 files  
├── Documentation to Organize: 8 files
├── Config Files to Review: 6 files
├── Backup/Temporary to Clean: 3 files
└── Data/Resources to Relocate: 2 directories
```

## 🎯 File Categorization & Recommendations

### ✅ ESSENTIAL FILES (Keep in Root)
- `package.json` - Main project dependencies
- `package-lock.json` - Lock file for dependencies  
- `.gitignore` - Git ignore rules
- `vercel.json` - Vercel deployment config
- `railway.json` - Railway deployment config
- `README.md` - Main project documentation

### 📂 SCRIPTS TO ORGANIZE
**Target Directory: `scripts/`**
- `convert-all-subjects.js` → `scripts/data-migration/`
- `migrate-to-atlas.js` → `scripts/data-migration/`
- `import-valid-questions.js` → `scripts/data-migration/`
- `analyze-quiz-data.js` → `scripts/analysis/`
- `ai-question-generator.js` → `scripts/ai/`
- `test-server.js` → `scripts/testing/`
- `simple-backend.js` → `scripts/testing/`
- `config.js` → `scripts/config/`

### 📚 DOCUMENTATION TO ORGANIZE
**Target Directory: `docs/`**
- `simplified-prd.md` → `docs/requirements/`
- `prd.md` → `docs/requirements/`
- `project-goals.md` → `docs/planning/`
- `CPO-feedback.md` → `docs/feedback/`
- `README-task-master.md` → `docs/tools/`
- `RECOMMENDATION_API_TESTS.md` → `docs/testing/`
- `428Thoughts-Provoking_1` → `docs/misc/` (unclear file)
- `start.md` → `docs/misc/`

### 🗂️ DATA/RESOURCES TO RELOCATE
- `IGCSE markdown exam bank/` → `data/exam-bank/`
- `reports/` → `data/reports/` (if analysis reports)

### 🧹 CLEANUP/BACKUP FILES
- `server.js.backup` → `backups/` or delete if not needed
- `backend-package.json` → review and merge or delete
- `vite.config.js` → move to `frontend/` if frontend-specific

### ⚙️ CONFIG FILES TO REVIEW
- `render.yaml` → `config/` (if still needed)
- `.windsurfrules` → keep in root (IDE-specific)

## 🎯 High-Level Task Breakdown

### Task 1: Create Organized Directory Structure (15 minutes)
- Create `scripts/` subdirectories: `data-migration/`, `analysis/`, `ai/`, `testing/`, `config/`
- Create `docs/` subdirectories: `requirements/`, `planning/`, `feedback/`, `tools/`, `testing/`, `misc/`
- Create `data/` directory with `exam-bank/` subdirectory
- Create `backups/` directory if backup files are to be kept
- **Success Criteria**: All target directories exist and are empty, ready for file relocation

### Task 2: Move Script Files (10 minutes)
- Move data migration scripts to `scripts/data-migration/`
- Move analysis scripts to `scripts/analysis/`
- Move AI-related scripts to `scripts/ai/`
- Move testing scripts to `scripts/testing/`
- Move config files to `scripts/config/`
- **Success Criteria**: All script files are in appropriate subdirectories, root has no loose .js files

### Task 3: Organize Documentation (10 minutes)
- Move requirement documents to `docs/requirements/`
- Move planning documents to `docs/planning/`
- Move feedback documents to `docs/feedback/`
- Move tool documentation to `docs/tools/`
- Move testing docs to `docs/testing/`
- Move misc files to `docs/misc/`
- **Success Criteria**: All documentation is categorized and organized, root has only essential README.md

### Task 4: Relocate Data Directories (5 minutes)
- Move `IGCSE markdown exam bank/` to `data/exam-bank/`
- Move `reports/` to `data/reports/` (if applicable)
- **Success Criteria**: Large data directories are out of root, properly organized in data/

### Task 5: Handle Backup/Cleanup Files (5 minutes)
- Decide whether to keep `server.js.backup` (move to backups/ or delete)
- Review `backend-package.json` (merge, move, or delete)
- Review `render.yaml` (move to config/ or delete if unused)
- **Success Criteria**: No backup or temporary files cluttering root directory

### Task 6: Update File References (15 minutes)
- Update any scripts that reference moved files with new paths
- Update documentation that references moved files
- Update import statements in code that might reference moved scripts
- Test that any build/deployment scripts still work with new structure
- **Success Criteria**: All file references are updated, no broken links or imports

### Task 7: Update Documentation (10 minutes)
- Update main README.md with new project structure
- Update any setup/build instructions that reference moved files
- Document the new organization scheme for future developers
- **Success Criteria**: Documentation accurately reflects new structure

### Task 8: Final Verification (10 minutes)
- Verify project still builds and runs correctly
- Check that deployment configs still work
- Ensure no critical functionality is broken by file moves
- Confirm root directory is clean and organized
- **Success Criteria**: Project functions identically to before, root directory contains only essential files

## 📋 Expected Final Root Directory Structure

```
/ (Root - Clean & Essential Only)
├── package.json ✅
├── package-lock.json ✅
├── .gitignore ✅
├── vercel.json ✅
├── railway.json ✅
├── README.md ✅
├── LICENSE ✅
├── vite.config.js (if needed for root-level builds)
├── .windsurfrules ✅
├── frontend/ ✅
├── backend/ ✅
├── node_modules/ ✅
├── .git/ ✅
├── .cursor/ ✅
├── .vercel/ ✅
├── scripts/ (NEW - organized)
│   ├── data-migration/
│   ├── analysis/
│   ├── ai/
│   ├── testing/
│   └── config/
├── docs/ (NEW - organized)
│   ├── requirements/
│   ├── planning/
│   ├── feedback/
│   ├── tools/
│   ├── testing/
│   └── misc/
├── data/ (NEW - organized)
│   ├── exam-bank/
│   └── reports/
└── backups/ (NEW - if needed)
```

## 🎯 Success Criteria Summary

**Overall Goal**: Reduce root directory from 35+ files to ~12 essential files

**Metrics**:
- **Before**: 35+ files/folders in root (cluttered)
- **After**: ~12 essential files/folders in root (clean)
- **Organization**: All scripts, docs, and data properly categorized
- **Functionality**: Zero impact on build/deployment/functionality
- **Documentation**: Updated to reflect new structure

**Quality Checks**:
- ✅ Project builds and runs without errors
- ✅ All file references updated correctly
- ✅ Deployment configs still functional
- ✅ Documentation reflects new structure
- ✅ No broken imports or links
- ✅ Easy navigation for developers

**Estimated Total Time**: 1.5 hours (90 minutes)

This systematic organization will significantly improve project maintainability and developer experience by creating a clean, logical structure that's easy to navigate and understand. 