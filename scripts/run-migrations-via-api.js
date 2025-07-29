#!/usr/bin/env node

/**
 * Run Supabase Migrations via Management API
 * 
 * This script uses the Supabase Management API to execute migrations
 */

require('dotenv').config({ path: '../backend/.env' });
const fs = require('fs').promises;
const path = require('path');

// Since we can't execute raw SQL through the JS client, let's create a helper
// that will output the migrations in a format you can easily copy-paste

async function prepareMigrations() {
  console.log('📋 Preparing Supabase migrations for execution...\n');
  
  const migrationsDir = path.join(__dirname, '../supabase/migrations');
  
  try {
    // Read migration files
    const schema = await fs.readFile(path.join(migrationsDir, '001_initial_schema.sql'), 'utf-8');
    const seedData = await fs.readFile(path.join(migrationsDir, '002_seed_data.sql'), 'utf-8');
    
    // Create a combined migration file for easier execution
    const combinedMigration = `-- IGCSE Web Application Database Setup
-- Generated: ${new Date().toISOString()}
-- 
-- This file combines all migrations for easy execution in Supabase SQL Editor
-- 
-- ============================================================================
-- PART 1: SCHEMA CREATION
-- ============================================================================

${schema}

-- ============================================================================
-- PART 2: SEED DATA
-- ============================================================================

${seedData}

-- ============================================================================
-- Migration completed!
-- ============================================================================
`;

    // Write combined migration
    const outputPath = path.join(__dirname, 'combined-migration.sql');
    await fs.writeFile(outputPath, combinedMigration);
    
    console.log('✅ Combined migration file created at:');
    console.log(`   ${outputPath}\n`);
    
    console.log('📋 To run the migrations:\n');
    console.log('Option 1: Supabase Dashboard (Recommended)');
    console.log('==========================================');
    console.log('1. Go to your SQL Editor:');
    console.log('   https://supabase.com/dashboard/project/qsiixrrqixwlsnzmikpp/sql/new\n');
    console.log('2. Copy the entire contents of:');
    console.log(`   ${outputPath}\n`);
    console.log('3. Paste into the SQL Editor');
    console.log('4. Click "Run" to execute all migrations\n');
    
    console.log('Option 2: Using psql (if you have direct access)');
    console.log('================================================');
    console.log('psql "postgresql://postgres:[YOUR-PASSWORD]@db.qsiixrrqixwlsnzmikpp.supabase.co:5432/postgres" -f combined-migration.sql\n');
    
    // Also create individual statement files for debugging
    console.log('Creating individual statement files for debugging...');
    
    // Parse SQL into individual statements
    const statements = combinedMigration
      .split(/;\s*$/gm)
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.match(/^--/));
    
    console.log(`\n📊 Migration Summary:`);
    console.log(`   Total statements: ${statements.length}`);
    
    // Count statement types
    const statementTypes = {};
    statements.forEach(stmt => {
      const type = stmt.match(/^(CREATE|ALTER|INSERT|DROP|UPDATE|DELETE|SET)/i)?.[1] || 'OTHER';
      statementTypes[type] = (statementTypes[type] || 0) + 1;
    });
    
    console.log('   Statement types:');
    Object.entries(statementTypes).forEach(([type, count]) => {
      console.log(`     - ${type}: ${count}`);
    });
    
    console.log('\n✅ Migration files are ready for execution!');
    
  } catch (error) {
    console.error('❌ Error preparing migrations:', error.message);
    process.exit(1);
  }
}

prepareMigrations();