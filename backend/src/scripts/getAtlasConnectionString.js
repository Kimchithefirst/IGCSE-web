/**
 * MongoDB Atlas Connection String Helper
 * 
 * This script helps you find your MongoDB Atlas connection string using your API credentials.
 * 
 * Usage:
 * CLIENT_ID="your_client_id" CLIENT_SECRET="your_client_secret" node src/scripts/getAtlasConnectionString.js
 */

const https = require('https');

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

async function findAtlasConnectionString() {
    console.log('🔍 Finding MongoDB Atlas Connection String...');
    console.log('=' .repeat(50));
    
    if (!CLIENT_ID || !CLIENT_SECRET) {
        console.log('❌ Missing MongoDB API credentials');
        console.log('\n💡 Usage:');
        console.log('CLIENT_ID="your_client_id" CLIENT_SECRET="your_client_secret" node src/scripts/getAtlasConnectionString.js');
        process.exit(1);
    }
    
    try {
        // Get authentication token
        console.log('🔐 Getting authentication token...');
        const token = await getAuthToken();
        
        // List projects
        console.log('📁 Finding projects...');
        const projects = await listProjects(token);
        
        if (projects.length === 0) {
            console.log('❌ No MongoDB Atlas projects found');
            console.log('\n💡 Next steps:');
            console.log('1. Go to https://cloud.mongodb.com');
            console.log('2. Create a new project called "IGCSE-Mock-Test"');
            console.log('3. Create a cluster (M0 Sandbox - free tier)');
            console.log('4. Create database user and get connection string');
            return;
        }
        
        console.log(`✅ Found ${projects.length} project(s):`);
        for (const project of projects) {
            console.log(`   - ${project.name} (${project.id})`);
        }
        
        // Use first project or look for IGCSE project
        const igcseProject = projects.find(p => 
            p.name.toLowerCase().includes('igcse') || 
            p.name.toLowerCase().includes('mock') || 
            p.name.toLowerCase().includes('test')
        ) || projects[0];
        
        console.log(`\n🎯 Using project: ${igcseProject.name}`);
        
        // List clusters in the project
        console.log('🖥️  Finding clusters...');
        const clusters = await listClusters(token, igcseProject.id);
        
        if (clusters.length === 0) {
            console.log('❌ No clusters found in this project');
            console.log('\n💡 Next steps:');
            console.log('1. Go to https://cloud.mongodb.com');
            console.log(`2. Select project: ${igcseProject.name}`);
            console.log('3. Click "Build a Database"');
            console.log('4. Choose M0 Sandbox (free tier)');
            console.log('5. Configure cluster and get connection string');
            return;
        }
        
        console.log(`✅ Found ${clusters.length} cluster(s):`);
        for (const cluster of clusters) {
            console.log(`   - ${cluster.name} (${cluster.mongoDBVersion})`);
        }
        
        const cluster = clusters[0];
        
        // Generate connection string template
        console.log('\n🔗 Connection String Information:');
        console.log('═' .repeat(50));
        
        const connectionString = `mongodb+srv://<username>:<password>@${cluster.name.toLowerCase()}.mongodb.net/<database>?retryWrites=true&w=majority`;
        
        console.log('📋 Template Connection String:');
        console.log(`   ${connectionString}`);
        
        console.log('\n🔧 To complete setup:');
        console.log('1. Go to MongoDB Atlas dashboard');
        console.log('2. Click "Database Access" → "Add New Database User"');
        console.log('3. Username: igcse-admin');
        console.log('4. Password: (generate a secure password)');
        console.log('5. Privileges: "Read and write to any database"');
        console.log('6. Click "Network Access" → "Add IP Address" → "Allow Access from Anywhere (0.0.0.0/0)"');
        
        console.log('\n📝 Your MONGODB_URI will be:');
        const finalUri = `mongodb+srv://igcse-admin:<your-password>@${cluster.name.toLowerCase()}.mongodb.net/igcse-mock-test?retryWrites=true&w=majority`;
        console.log(`   ${finalUri}`);
        
        console.log('\n🚀 Test your connection:');
        console.log(`MONGODB_URI="${finalUri}" node src/scripts/testAtlasConnection.js`);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
            console.log('\n🔧 Authentication issue:');
            console.log('1. Verify your Client ID and Secret are correct');
            console.log('2. Check that API access is enabled for your organization');
            console.log('3. Go to Atlas → Access Manager → API Keys to verify');
        } else {
            console.log('\n🔧 Alternative approach:');
            console.log('1. Go to https://cloud.mongodb.com manually');
            console.log('2. Navigate to your cluster');
            console.log('3. Click "Connect" → "Connect your application"');
            console.log('4. Copy the connection string');
        }
    }
}

function getAuthToken() {
    return new Promise((resolve, reject) => {
        const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
        
        const options = {
            hostname: 'cloud.mongodb.com',
            path: '/api/atlas/v1.0/auth/login',
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json'
            }
        };
        
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    const response = JSON.parse(data);
                    resolve(response.access_token);
                } else {
                    reject(new Error(`Authentication failed: ${res.statusCode} ${data}`));
                }
            });
        });
        
        req.on('error', reject);
        req.end();
    });
}

function listProjects(token) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'cloud.mongodb.com',
            path: '/api/atlas/v1.0/groups',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };
        
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    const response = JSON.parse(data);
                    resolve(response.results || []);
                } else {
                    reject(new Error(`Failed to list projects: ${res.statusCode} ${data}`));
                }
            });
        });
        
        req.on('error', reject);
        req.end();
    });
}

function listClusters(token, projectId) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'cloud.mongodb.com',
            path: `/api/atlas/v1.0/groups/${projectId}/clusters`,
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };
        
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    const response = JSON.parse(data);
                    resolve(response.results || []);
                } else {
                    reject(new Error(`Failed to list clusters: ${res.statusCode} ${data}`));
                }
            });
        });
        
        req.on('error', reject);
        req.end();
    });
}

// Run the script
findAtlasConnectionString().catch(console.error); 