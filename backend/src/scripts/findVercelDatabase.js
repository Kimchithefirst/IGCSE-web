/**
 * Find Vercel Backend Database
 * 
 * This script attempts to find the database that the Vercel backend is using
 * by testing common MongoDB Atlas connection patterns and local connections.
 */

const mongoose = require('mongoose');

// Common database patterns for IGCSE project
const testConnections = [
    // Atlas patterns
    'mongodb+srv://cluster0.mongodb.net/igcse',
    'mongodb+srv://cluster0.mongodb.net/igcse-mock-test',
    'mongodb+srv://cluster0.mongodb.net/test',
    
    // Local patterns
    'mongodb://localhost:27017/igcse',
    'mongodb://localhost:27017/igcse-mock-test',
    'mongodb://localhost:27017/test',
    
    // Default patterns
    'mongodb://127.0.0.1:27017/igcse',
    'mongodb://127.0.0.1:27017/igcse-mock-test'
];

async function testConnection(uri) {
    try {
        console.log(`Testing: ${uri.replace(/\/\/[^@]+@/, '//***:***@')}`);
        
        await mongoose.connect(uri, { 
            serverSelectionTimeoutMS: 3000,
            connectTimeoutMS: 3000 
        });
        
        // Check what collections exist
        const collections = await mongoose.connection.db.listCollections().toArray();
        const collectionNames = collections.map(c => c.name);
        
        console.log(`✅ Connected successfully!`);
        console.log(`📁 Database: ${mongoose.connection.name}`);
        console.log(`📂 Collections: ${collectionNames.join(', ') || 'None'}`);
        
        // Check for quiz data
        if (collectionNames.includes('quizzes') || collectionNames.includes('igcsequizzes')) {
            const Quiz = mongoose.model('Quiz', new mongoose.Schema({}, { strict: false }));
            const count = await Quiz.countDocuments();
            console.log(`🎯 Found ${count} quizzes in collection`);
        }
        
        await mongoose.disconnect();
        return { success: true, uri, collections: collectionNames };
        
    } catch (error) {
        await mongoose.disconnect();
        console.log(`❌ Failed: ${error.message.split('\n')[0]}`);
        return { success: false, uri, error: error.message };
    }
}

async function findDatabase() {
    console.log('🔍 Searching for Vercel backend database...\n');
    
    const results = [];
    
    for (const uri of testConnections) {
        const result = await testConnection(uri);
        results.push(result);
        console.log(''); // Empty line between tests
        
        if (result.success) {
            console.log('🎉 FOUND WORKING DATABASE!');
            console.log(`📍 Connection: ${result.uri}`);
            console.log(`📊 Collections: ${result.collections.join(', ')}`);
            
            console.log('\n🚀 To deploy IGCSE data, run:');
            console.log(`MONGODB_URI="${result.uri}" node src/scripts/deployToVercelDB.js`);
            break;
        }
    }
    
    const successful = results.filter(r => r.success);
    if (successful.length === 0) {
        console.log('❌ No accessible databases found.');
        console.log('\n💡 Next steps:');
        console.log('1. Check Vercel dashboard environment variables');
        console.log('2. Set up MongoDB Atlas if not exists');
        console.log('3. Configure MONGODB_URI in Vercel project settings');
    }
}

// Run the database finder
findDatabase().catch(console.error); 