#!/bin/bash

# Run Supabase Migration using psql
# This script connects to your Supabase database and runs the migration

echo "🚀 Running Supabase migration using psql..."

# Database connection details
DB_HOST="db.qsiixrrqixwlsnzmikpp.supabase.co"
DB_PORT="5432"
DB_NAME="postgres"
DB_USER="postgres"

# Check if migration file exists
MIGRATION_FILE="combined-migration.sql"
if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Migration file not found: $MIGRATION_FILE"
    echo "Please make sure you're running this from the scripts directory"
    exit 1
fi

echo "📋 Migration file found: $MIGRATION_FILE"
echo "🔗 Connecting to database: $DB_HOST"
echo ""
echo "⚠️  You'll need to enter your Supabase database password when prompted."
echo "   You can find this in your Supabase Dashboard > Settings > Database"
echo ""

# Run the migration
psql "postgresql://$DB_USER@$DB_HOST:$DB_PORT/$DB_NAME" -f "$MIGRATION_FILE"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration completed successfully!"
    echo "🧪 Testing connection..."
    
    # Test the migration by running our test script
    cd ..
    node scripts/test-supabase-connection.js
else
    echo ""
    echo "❌ Migration failed. Please check the error messages above."
    echo ""
    echo "💡 Alternative options:"
    echo "1. Copy the contents of $MIGRATION_FILE"
    echo "2. Paste into Supabase Dashboard SQL Editor"
    echo "3. Run manually: https://supabase.com/dashboard/project/qsiixrrqixwlsnzmikpp/sql/new"
fi