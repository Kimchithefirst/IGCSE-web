#!/usr/bin/env node

/**
 * Execute migration via Supabase REST API
 */

require('dotenv').config({ path: '../backend/.env' });
const fs = require('fs').promises;

async function executeSQLViaAPI(sql) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  console.log('🔄 Executing SQL via Supabase API...');
  
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        'apikey': serviceKey
      },
      body: JSON.stringify({
        query: sql
      })
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    return result;
    
  } catch (error) {
    console.error('❌ API execution failed:', error.message);
    throw error;
  }
}

async function runMigrationViaAPI() {
  console.log('🚀 Running migration via Supabase API...\n');
  
  try {
    // Read migration file
    const migrationSQL = await fs.readFile('combined-migration.sql', 'utf-8');
    
    // Split into individual statements and execute them
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`📊 Found ${statements.length} SQL statements to execute\n`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < Math.min(statements.length, 5); i++) {
      const statement = statements[i];
      console.log(`⚡ Executing statement ${i + 1}/${statements.length}:`);
      console.log(`   ${statement.substring(0, 60)}...`);
      
      try {
        await executeSQLViaAPI(statement);
        successCount++;
        console.log('   ✅ Success\n');
      } catch (error) {
        errorCount++;
        console.log(`   ❌ Failed: ${error.message}\n`);
      }
    }
    
    console.log(`📈 Results: ${successCount} successful, ${errorCount} failed`);
    
    if (successCount === 0) {
      throw new Error('No statements executed successfully');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.log('\n💡 Please run the migration manually in Supabase Dashboard');
  }
}

runMigrationViaAPI();