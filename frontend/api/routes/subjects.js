const express = require('express');
const router = express.Router();

// Simple subjects endpoint that returns basic subject data
router.get('/', (req, res) => {
  try {
    // For now, return static data to get the deployment working
    // This can be enhanced later with real database queries
    const subjects = [
      {
        id: 'physics',
        name: 'Physics',
        questionCount: 95,
        description: 'Practice Physics with 95 authentic IGCSE questions',
        sampleQuestions: [
          {
            id: 'sample1',
            text: 'What is the SI unit of force?'
          },
          {
            id: 'sample2', 
            text: 'What is the speed of light in vacuum?'
          },
          {
            id: 'sample3',
            text: 'What is Newton\'s first law of motion?'
          }
        ]
      }
    ];

    res.status(200).json({
      success: true,
      data: subjects,
      metadata: {
        totalSubjects: subjects.length,
        totalQuestions: subjects.reduce((sum, subj) => sum + subj.questionCount, 0)
      }
    });

  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching subjects'
    });
  }
});

module.exports = router;