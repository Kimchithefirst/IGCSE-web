const mongoose = require('mongoose');

// Set proxy environment variables
process.env.https_proxy = 'http://127.0.0.1:7890';
process.env.http_proxy = 'http://127.0.0.1:7890';
process.env.all_proxy = 'socks5://127.0.0.1:7890';

const MONGODB_URI = 'mongodb+srv://igcse-admin:51UwmbZ2KRD1LOfQ@igcse-mock-test.jbrdwgb.mongodb.net/igcse-mock-test?retryWrites=true&w=majority&appName=IGCSE-Mock-Test';

console.log('🔗 Testing MongoDB Atlas Connection with Proxy...');
console.log('📍 Proxy settings configured');
console.log('🚀 Connecting to Atlas...');

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected successfully to MongoDB Atlas!');
    console.log('🎯 Database connection established');
    return mongoose.connection.db.admin().ping();
  })
  .then(() => {
    console.log('✅ Database ping successful');
    process.exit(0);
  })
  .catch(err => {
    console.log('❌ Connection failed:', err.message);
    console.log('🔧 Error details:', err.name);
    process.exit(1);
  }); 