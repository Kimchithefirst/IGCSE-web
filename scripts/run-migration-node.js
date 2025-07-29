#!/usr/bin/env node

/**
 * Run Supabase Migration using node-postgres
 */

const fs = require('fs').promises;
const { Client } = require('pg');

async function runMigration() {
  console.log('🚀 Running Supabase migration using Node.js pg client...\n');
  
  // Database connection
  const client = new Client({
    host: 'db.qsiixrrqixwlsnzmikpp.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'Oinky1125!!!',
    ssl: { rejectUnauthorized: false } // Supabase requires SSL
  });
  
  try {
    // Connect to database
    console.log('🔗 Connecting to Supabase database...');
    await client.connect();
    console.log('✅ Connected successfully!\n');
    
    // Read migration file
    console.log('📄 Reading migration file...');
    const migrationSQL = await fs.readFile('combined-migration.sql', 'utf-8');
    console.log(`📊 Migration size: ${Math.round(migrationSQL.length / 1024)}KB\n`);
    
    // Execute migration
    console.log('⚡ Executing migration...');
    const result = await client.query(migrationSQL);
    console.log('✅ Migration executed successfully!\n');
    
    // Test the migration by checking if tables exist
    console.log('🔍 Verifying migration...');
    
    const tablesResult = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename;
    `);
    
    console.log('📋 Created tables:');
    tablesResult.rows.forEach(row => {
      console.log(`   - ${row.tablename}`);
    });
    
    // Check subjects data
    const subjectsResult = await client.query('SELECT COUNT(*) as count FROM subjects;');
    console.log(`\n📚 Subjects loaded: ${subjectsResult.rows[0].count}`);
    
    console.log('\n🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('\n💡 You can try running the migration manually:');
    console.error('1. Go to: https://supabase.com/dashboard/project/qsiixrrqixwlsnzmikpp/sql/new');
    console.error('2. Copy contents of: combined-migration.sql');
    console.error('3. Paste and click "Run"');
  } finally {
    await client.end();
  }
}

runMigration();