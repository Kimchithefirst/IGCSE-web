const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Simple test route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Test server working' });
});

// Test route with parameter
app.get('/api/questions/:id/similar', (req, res) => {
  const questionId = parseInt(req.params.id);
  res.json({ 
    message: 'Route working', 
    questionId: questionId,
    params: req.params 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`);
});

module.exports = app; 