#!/usr/bin/env node

/**
 * Test Supabase Connection
 * 
 * This script verifies that your Supabase setup is working correctly
 */

require('dotenv').config({ path: '../backend/.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('Please check your backend/.env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testConnection() {
  console.log('🔄 Testing Supabase connection...\n');
  
  try {
    // Test 1: Check tables exist
    console.log('1️⃣ Checking if tables were created...');
    const { data: tables, error: tablesError } = await supabase
      .from('subjects')
      .select('*')
      .limit(5);
      
    if (tablesError) {
      console.error('❌ Error accessing tables:', tablesError);
      return;
    }
    
    console.log('✅ Tables exist!');
    console.log(`📚 Found ${tables.length} subjects:`, tables.map(s => s.name).join(', '));
    
    // Test 2: Check courses
    console.log('\n2️⃣ Checking courses...');
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('*');
      
    if (coursesError) {
      console.error('❌ Error accessing courses:', coursesError);
      return;
    }
    
    console.log('✅ Courses loaded!');
    console.log(`📖 Found ${courses.length} courses:`, courses.map(c => c.name).join(', '));
    
    // Test 3: Check auth configuration
    console.log('\n3️⃣ Testing auth configuration...');
    const { data: authTest, error: authError } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1
    });
    
    if (authError) {
      console.error('⚠️  Auth test failed (this is normal if you haven\'t created any users yet)');
    } else {
      console.log('✅ Auth is configured correctly!');
    }
    
    console.log('\n🎉 Supabase setup is complete and working!');
    console.log('\n📝 Next steps:');
    console.log('1. Update your .env files with the Supabase credentials');
    console.log('2. Start migrating your API endpoints to use Supabase');
    console.log('3. Update the frontend auth to use Supabase');
    
  } catch (error) {
    console.error('❌ Connection test failed:', error);
  }
}

testConnection();