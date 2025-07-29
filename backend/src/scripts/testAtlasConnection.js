/**
 * Test MongoDB Atlas Connection
 * 
 * This script tests the MongoDB Atlas connection and creates the database
 * structure needed for IGCSE data.
 */

const mongoose = require('mongoose');

// You'll paste your connection string here
const MONGODB_URI = process.env.MONGODB_URI;

async function testConnection() {
    console.log('🔗 Testing MongoDB Atlas Connection...');
    console.log('=' .repeat(50));
    
    if (!MONGODB_URI) {
        console.log('❌ MONGODB_URI environment variable not set');
        console.log('\n💡 Usage:');
        console.log('MONGODB_URI="your-connection-string" node src/scripts/testAtlasConnection.js');
        console.log('\nYour connection string should look like:');
        console.log('mongodb+srv://igcse-admin:YOUR_PASSWORD@igcse-cluster.xxxxx.mongodb.net/igcse-mock-test?retryWrites=true&w=majority');
        process.exit(1);
    }
    
    try {
        console.log('🚀 Connecting to Atlas...');
        console.log(`📍 URI: ${maskConnectionString(MONGODB_URI)}`);
        
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected successfully!');
        
        // Get database info
        const dbName = mongoose.connection.name;
        console.log(`📁 Database name: ${dbName}`);
        
        // List existing collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log(`📂 Existing collections: ${collections.length > 0 ? collections.map(c => c.name).join(', ') : 'None (new database)'}`);
        
        // Test creating a simple document to verify write permissions
        console.log('\n🧪 Testing database operations...');
        
        const testSchema = new mongoose.Schema({ message: String, timestamp: Date });
        const TestModel = mongoose.model('connectiontest', testSchema);
        
        const testDoc = new TestModel({
            message: 'IGCSE Atlas connection test successful!',
            timestamp: new Date()
        });
        
        await testDoc.save();
        console.log('✅ Write operation successful');
        
        const foundDoc = await TestModel.findOne({ message: 'IGCSE Atlas connection test successful!' });
        console.log('✅ Read operation successful');
        
        // Clean up test document
        await TestModel.deleteOne({ _id: foundDoc._id });
        await mongoose.connection.db.dropCollection('connectiontest');
        console.log('✅ Cleanup successful');
        
        // Check if we already have IGCSE data
        const igcseSchema = new mongoose.Schema({}, { strict: false });
        const IGCSEQuiz = mongoose.model('igcsequiz', igcseSchema);
        
        const existingQuizzes = await IGCSEQuiz.countDocuments();
        console.log(`\n📊 Existing IGCSE quizzes in database: ${existingQuizzes}`);
        
        if (existingQuizzes === 0) {
            console.log('🎯 Database is ready for IGCSE data import!');
            console.log('\n🚀 Next step: Deploy IGCSE data');
            console.log('MONGODB_URI="' + MONGODB_URI + '" node src/scripts/deployToVercelDB.js');
        } else {
            console.log('📚 Database already contains IGCSE quizzes');
        }
        
        console.log('\n🎉 CONNECTION TEST SUCCESSFUL!');
        console.log('✅ MongoDB Atlas is properly configured');
        console.log('✅ Database operations working');
        console.log('✅ Ready for production use');
        
    } catch (error) {
        console.error('\n❌ Connection failed:', error.message);
        
        if (error.message.includes('authentication failed')) {
            console.log('\n🔧 Authentication troubleshooting:');
            console.log('1. Check your password in the connection string');
            console.log('2. Verify database user exists in Atlas dashboard');
            console.log('3. Ensure user has "Read and write" permissions');
        } else if (error.message.includes('getaddrinfo ENOTFOUND')) {
            console.log('\n🔧 Network troubleshooting:');
            console.log('1. Check your internet connection');
            console.log('2. Verify cluster name in connection string');
            console.log('3. Ensure IP 0.0.0.0/0 is whitelisted in Network Access');
        } else {
            console.log('\n🔧 General troubleshooting:');
            console.log('1. Double-check connection string format');
            console.log('2. Ensure cluster is running (not paused)');
            console.log('3. Verify database name is included in URI');
        }
        
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Connection closed');
    }
}

function maskConnectionString(uri) {
    if (uri.includes('@')) {
        return uri.replace(/\/\/[^@]+@/, '//***:***@');
    }
    return uri;
}

// Run the test
testConnection().catch(console.error); 