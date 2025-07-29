#!/usr/bin/env node

/**
 * Execute Supabase Migration using pg client
 */

require('dotenv').config({ path: '../backend/.env' });
const fs = require('fs').promises;
const path = require('path');

// We'll use the supabase client to execute SQL via the REST API
const { createClient } = require('@supabase/supabase-js');

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

async function executeMigration() {
  try {
    console.log('🚀 Executing Supabase migrations...\n');
    
    // First, let's try to execute some basic SQL to test our connection
    console.log('1️⃣ Testing database connection...');
    
    // Test with a simple query
    const { data: testData, error: testError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .limit(5);
    
    if (testError) {
      console.error('❌ Database connection test failed:', testError);
      return;
    }
    
    console.log('✅ Database connection successful');
    console.log('📋 Existing tables:', testData?.map(t => t.table_name) || []);
    
    console.log('\n2️⃣ Checking if our tables already exist...');
    
    // Check if subjects table exists
    const { data: subjectsTest, error: subjectsError } = await supabase
      .from('subjects')
      .select('*')
      .limit(1);
    
    if (!subjectsError) {
      console.log('✅ Tables already exist! Migration may have been run already.');
      const { count } = await supabase
        .from('subjects')
        .select('*', { count: 'exact', head: true });
      console.log(`📚 Found ${count} subjects in database`);
      return;
    }
    
    console.log('📋 Tables don\'t exist yet, migration needed');
    
    // Since we can't execute raw SQL directly, let's provide instructions
    console.log('\n🔧 Migration Instructions:');
    console.log('==========================================');
    console.log('The Supabase JavaScript client cannot execute raw SQL DDL statements.');
    console.log('Please follow these steps:\n');
    
    console.log('1. 🌐 Open your Supabase Dashboard:');
    console.log(`   https://supabase.com/dashboard/project/qsiixrrqixwlsnzmikpp/sql/new\n`);
    
    console.log('2. 📄 Copy the migration SQL from:');
    console.log(`   ${path.resolve(__dirname, 'combined-migration.sql')}\n`);
    
    console.log('3. ▶️  Paste and click "Run"\n');
    
    console.log('4. 🔍 Verify by running this test again\n');
    
    // Alternative: Try using supabase CLI if available
    console.log('💡 Alternative: Use Supabase CLI');
    console.log('=================================');
    console.log('If you have the Supabase CLI installed and logged in:');
    console.log('');
    console.log('supabase projects list');
    console.log('supabase link --project-ref qsiixrrqixwlsnzmikpp');
    console.log(`supabase db reset --linked`);
    
  } catch (error) {
    console.error('❌ Migration execution failed:', error);
  }
}

executeMigration();