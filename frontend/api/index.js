// Vercel serverless function that wraps the Express app
const app = require('./app');

// Export the Express app as a serverless function
module.exports = app;