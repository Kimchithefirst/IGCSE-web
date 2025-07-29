import { Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { AuthRequest } from '../middleware/supabaseAuth';

/**
 * Get dashboard data based on user role
 */
export const getDashboardData = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.profile?.role || 'student';

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    let dashboardData;

    switch (userRole) {
      case 'student':
        dashboardData = await getStudentDashboard(userId);
        break;
      case 'teacher':
        dashboardData = await getTeacherDashboard(userId);
        break;
      case 'parent':
        dashboardData = await getParentDashboard(userId);
        break;
      case 'admin':
        dashboardData = await getAdminDashboard(userId);
        break;
      default:
        dashboardData = await getStudentDashboard(userId);
    }

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
};

/**
 * Get student dashboard data
 */
async function getStudentDashboard(userId: string) {
  // For now return enhanced mock data since quiz_attempts table might not exist yet
  // This will be populated with real data once quiz functionality is implemented
  
  const { data: subjects } = await supabase
    .from('subjects')
    .select('id, name, description')
    .eq('is_active', true)
    .limit(2);

  const recommendedTopics = (subjects || []).map(subject => ({
    id: subject.id,
    name: subject.name,
    description: subject.description || `Practice ${subject.name} fundamentals`
  }));

  return {
    completedTests: 0, // Will be populated from actual quiz attempts
    averageScore: 0,
    studyHours: 0,
    recentTests: [] as any[],
    recommendedTopics
  };
}

/**
 * Get teacher dashboard data
 */
async function getTeacherDashboard(userId: string) {
  return {
    activeStudents: 0,
    testsCreated: 0,
    averageClassScore: 0,
    recentActivity: [] as any[]
  };
}

/**
 * Get parent dashboard data
 */
async function getParentDashboard(userId: string) {
  return {
    childTestsCompleted: 0,
    childAverageScore: 0,
    childStudyHours: 0,
    childRecentTests: [] as any[],
    improvementAreas: [
      { subject: 'Connect with your child\'s account', description: 'Parent-child linking not yet implemented' }
    ]
  };
}

/**
 * Get admin dashboard data
 */
async function getAdminDashboard(userId: string) {
  // Get system-wide statistics
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  const { count: totalSubjects } = await supabase
    .from('subjects')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);

  const { count: totalCourses } = await supabase
    .from('courses')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);

  return {
    totalUsers: totalUsers || 0,
    totalQuizzes: 0, // Will be populated when quiz functionality is added
    totalAttempts: 0,
    totalSubjects: totalSubjects || 0,
    totalCourses: totalCourses || 0,
    systemHealth: 'Operational'
  };
}

/**
 * Get user statistics
 */
export const getUserStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.profile?.role || 'student';

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    let stats;

    switch (userRole) {
      case 'student':
        stats = {
          totalTests: 0,
          completedTests: 0,
          averageScore: 0,
          improvement: '+0%'
        };
        break;
      case 'teacher':
        stats = {
          totalStudents: 0,
          activeStudents: 0,
          testsCreated: 0,
          averageClassScore: 0
        };
        break;
      case 'parent':
        stats = {
          childTests: 0,
          childScore: 0,
          weeklyProgress: '+0%',
          studyTime: '0 hours'
        };
        break;
      default:
        stats = {
          totalTests: 0,
          completedTests: 0,
          averageScore: 0,
          improvement: '+0%'
        };
    }

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics'
    });
  }
};

/**
 * Get recent activity
 */
export const getRecentActivity = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    // For now, return mock activity data
    // This will be replaced with real activity from quiz attempts, profile updates, etc.
    const activities = [
      {
        id: 1,
        type: 'profile_created',
        title: 'Profile Created',
        description: 'Welcome to IGCSE Mock Test Platform!',
        timestamp: new Date().toISOString()
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
}; 