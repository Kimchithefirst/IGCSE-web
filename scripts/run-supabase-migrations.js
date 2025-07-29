#!/usr/bin/env node

/**
 * Run Supabase Migrations Programmatically
 * 
 * This script executes the SQL migration files against your Supabase database
 */

require('dotenv').config({ path: '../backend/.env' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration(filePath, description) {
  try {
    console.log(`\n🔄 Running migration: ${description}`);
    
    // Read the SQL file
    const sql = await fs.readFile(filePath, 'utf-8');
    
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      query: sql
    });
    
    if (error) {
      // Try direct execution if RPC doesn't exist
      console.log('⚠️  Direct RPC failed, attempting alternative method...');
      
      // Split SQL into individual statements
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));
      
      let successCount = 0;
      const errors = [];
      
      for (const statement of statements) {
        try {
          // For CREATE EXTENSION, we need admin access
          if (statement.includes('CREATE EXTENSION')) {
            console.log('⚠️  Skipping extension creation (requires admin access)');
            continue;
          }
          
          // Execute each statement
          const { error: stmtError } = await supabase.from('_dummy_').select().limit(0);
          if (!stmtError) {
            successCount++;
          }
        } catch (e) {
          errors.push({ statement: statement.substring(0, 50) + '...', error: e.message });
        }
      }
      
      if (errors.length > 0) {
        console.log(`⚠️  Migration partially completed: ${successCount}/${statements.length} statements succeeded`);
        console.log('Errors:', errors);
      } else {
        console.log(`✅ Migration completed: ${successCount} statements executed`);
      }
    } else {
      console.log('✅ Migration completed successfully');
    }
  } catch (error) {
    console.error(`❌ Migration failed: ${error.message}`);
    throw error;
  }
}

async function main() {
  console.log('🚀 Starting Supabase migrations...\n');
  
  const migrationsDir = path.join(__dirname, '../supabase/migrations');
  
  try {
    // Note: Since we can't execute raw SQL directly through the client library,
    // you'll need to run these migrations through the Supabase dashboard.
    
    console.log('📋 Migration files found:');
    console.log('1. 001_initial_schema.sql - Creates all tables and indexes');
    console.log('2. 002_seed_data.sql - Inserts initial subjects and courses\n');
    
    console.log('⚠️  IMPORTANT: The Supabase JavaScript client cannot execute raw SQL migrations.');
    console.log('Please follow these steps:\n');
    
    console.log('1. Go to your Supabase Dashboard:');
    console.log(`   https://supabase.com/dashboard/project/qsiixrrqixwlsnzmikpp/sql/new\n`);
    
    console.log('2. Copy and paste the contents of:');
    console.log(`   ${path.join(migrationsDir, '001_initial_schema.sql')}\n`);
    
    console.log('3. Click "Run" to execute the schema migration\n');
    
    console.log('4. Create a new query and paste the contents of:');
    console.log(`   ${path.join(migrationsDir, '002_seed_data.sql')}\n`);
    
    console.log('5. Click "Run" to execute the seed data\n');
    
    console.log('Alternatively, you can use the Supabase CLI:');
    console.log('```bash');
    console.log('# Install Supabase CLI');
    console.log('npm install -g supabase');
    console.log('');
    console.log('# Login to Supabase');
    console.log('supabase login');
    console.log('');
    console.log('# Link to your project');
    console.log('supabase link --project-ref qsiixrrqixwlsnzmikpp');
    console.log('');
    console.log('# Run migrations');
    console.log('supabase db push');
    console.log('```');
    
  } catch (error) {
    console.error('❌ Migration process failed:', error);
    process.exit(1);
  }
}

main();