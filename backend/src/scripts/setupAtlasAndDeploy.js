/**
 * MongoDB Atlas Setup and IGCSE Data Deployment
 * 
 * This script provides instructions for setting up MongoDB Atlas and 
 * automatically deploys IGCSE data once the connection string is provided.
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 IGCSE Database Setup and Deployment Guide');
console.log('=' .repeat(60));

console.log('\n📋 STEP 1: Create MongoDB Atlas Database');
console.log('1. Go to: https://www.mongodb.com/cloud/atlas');
console.log('2. Sign up/Login with your account');
console.log('3. Create a new project (name: "IGCSE-Mock-Test")');
console.log('4. Build a Database → FREE (M0 Sandbox)');
console.log('5. Choose AWS / Region: Any nearby location');
console.log('6. Cluster Name: "igcse-cluster"');
console.log('7. Create Database User:');
console.log('   - Username: igcse-admin');
console.log('   - Password: [Generate strong password]');
console.log('8. Add IP Address: 0.0.0.0/0 (Allow access from anywhere)');
console.log('9. Click "Connect" → "Connect your application"');
console.log('10. Copy the connection string');

console.log('\n📋 STEP 2: Configure Connection String');
console.log('Your connection string will look like:');
console.log('mongodb+srv://igcse-admin:<password>@igcse-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority');
console.log('');
console.log('Replace <password> with your actual password and add database name:');
console.log('mongodb+srv://igcse-admin:<password>@igcse-cluster.xxxxx.mongodb.net/igcse-mock-test?retryWrites=true&w=majority');

console.log('\n📋 STEP 3: Deploy IGCSE Data');
console.log('Once you have the connection string, run:');
console.log('');
console.log('MONGODB_URI="your-connection-string" node src/scripts/deployToVercelDB.js');

console.log('\n📋 STEP 4: Update Vercel Environment');
console.log('1. Go to Vercel Dashboard → Your Project → Settings');
console.log('2. Environment Variables → Add New');
console.log('3. Name: MONGODB_URI');
console.log('4. Value: your-connection-string');
console.log('5. Environments: Production, Preview, Development');
console.log('6. Save');

console.log('\n📋 STEP 5: Redeploy Vercel');
console.log('1. Go to Vercel Dashboard → Your Project → Deployments');
console.log('2. Click "..." on latest deployment → Redeploy');
console.log('3. Or push a new commit to trigger redeploy');

console.log('\n📂 STEP 6: Verify Deployment');
console.log('After setup, you can verify with:');
console.log('1. Test API: curl https://your-backend.vercel.app/api/quizzes');
console.log('2. Check IGCSE papers: curl https://your-backend.vercel.app/api/quizzes?examBoard=Cambridge+IGCSE');

console.log('\n🎯 Quick Setup Commands:');
console.log('');
console.log('# After getting your connection string:');
console.log('export MONGODB_URI="mongodb+srv://igcse-admin:yourpassword@igcse-cluster.xxxxx.mongodb.net/igcse-mock-test?retryWrites=true&w=majority"');
console.log('node src/scripts/deployToVercelDB.js');
console.log('');
console.log('# Verify data:');
console.log('node -e "console.log(\'Data files ready:\'); console.log(require(\'fs\').readdirSync(\'../database-ready/individual-quizzes\'));"');

console.log('\n✅ This will give you:');
console.log('- ☁️  Production MongoDB Atlas database');
console.log('- 📚 6 authentic IGCSE Physics papers (102 questions)');
console.log('- 🔗 Vercel backend connected to database');
console.log('- 🎯 Ready for frontend integration');

console.log('\n⏱️  Estimated time: 10-15 minutes total setup');

// Quick verification that our data files are ready
const dataDir = path.join(__dirname, '../../../database-ready');
if (fs.existsSync(dataDir)) {
    const bulkFile = path.join(dataDir, 'bulk-import', 'all-physics-quizzes.json');
    if (fs.existsSync(bulkFile)) {
        const data = JSON.parse(fs.readFileSync(bulkFile, 'utf8'));
        console.log(`\n📊 Ready to deploy: ${data.length} IGCSE Physics papers`);
        console.log('📁 Total questions:', data.reduce((sum, quiz) => sum + quiz.questions.length, 0));
    }
} else {
    console.log('\n❌ Warning: database-ready directory not found');
    console.log('🔧 Run this first: node src/scripts/generateImportReadyData.js');
} 