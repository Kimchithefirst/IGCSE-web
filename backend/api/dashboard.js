const express = require('express');
const router = express.Router();

// Mock data for demonstration - In production, this would come from MongoDB
const getMockDashboardData = (userRole) => {
  const baseData = {
    student: {
      completedTests: 12,
      averageScore: 78,
      studyHours: 45,
      recentTests: [
        { name: 'Mathematics - Algebra', score: 85, completedAt: '2024-01-15' },
        { name: 'Chemistry - Organic', score: 72, completedAt: '2024-01-14' },
        { name: 'Physics - Mechanics', score: 88, completedAt: '2024-01-13' }
      ],
      recommendedTopics: [
        { id: 1, name: 'Quadratic Equations', description: 'Practice solving quadratic equations' },
        { id: 2, name: 'Chemical Bonding', description: 'Understand ionic and covalent bonds' }
      ]
    },
    teacher: {
      activeStudents: 24,
      testsCreated: 8,
      averageClassScore: 76,
      recentActivity: [
        { id: 1, type: 'Test Completion', description: 'Sarah completed Mathematics Quiz with score 92%' },
        { id: 2, type: 'Test Completion', description: 'John completed Chemistry Test with score 68%' },
        { id: 3, type: 'Test Creation', description: 'New Physics Quiz created' }
      ]
    },
    parent: {
      childTestsCompleted: 8,
      childAverageScore: 82,
      childStudyHours: 28,
      childRecentTests: [
        { subject: 'Mathematics', name: 'Algebra Test', score: 85, completedAt: '2024-01-15' },
        { subject: 'Chemistry', name: 'Periodic Table', score: 79, completedAt: '2024-01-14' }
      ],
      improvementAreas: [
        { subject: 'Physics', description: 'Needs improvement in Physics (Average score: 65%)' }
      ]
    }
  };

  return baseData[userRole] || baseData.student;
};

// Get dashboard data based on user role
router.get('/', async (req, res) => {
  try {
    const userRole = req.user?.role || 'student';
    const dashboardData = getMockDashboardData(userRole);
    
    res.json({
      success: true,
      data: dashboardData,
      userRole: userRole,
      message: 'Dashboard data retrieved successfully'
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch dashboard data' 
    });
  }
});

// Get user statistics
router.get('/stats', async (req, res) => {
  try {
    const userRole = req.user?.role || 'student';
    
    const stats = {
      student: {
        totalTests: 25,
        completedTests: 12,
        averageScore: 78,
        improvement: '+5%'
      },
      teacher: {
        totalStudents: 45,
        activeStudents: 24,
        testsCreated: 8,
        averageClassScore: 76
      },
      parent: {
        childTests: 12,
        childScore: 82,
        weeklyProgress: '+8%',
        studyTime: '28 hours'
      }
    };

    res.json({
      success: true,
      data: stats[userRole] || stats.student
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch statistics' 
    });
  }
});

// Get recent activity
router.get('/activity', async (req, res) => {
  try {
    const activities = [
      {
        id: 1,
        type: 'test_completed',
        title: 'Mathematics Test Completed',
        description: 'Scored 85% on Algebra fundamentals',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() // 2 hours ago
      },
      {
        id: 2,
        type: 'study_session',
        title: 'Study Session',
        description: 'Completed 45 minutes of Chemistry review',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // 1 day ago
      },
      {
        id: 3,
        type: 'achievement',
        title: 'Achievement Unlocked',
        description: 'Completed 10 tests in Mathematics',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() // 2 days ago
      }
    ];

    res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    console.error('Activity error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch activity data' 
    });
  }
});

module.exports = router; 