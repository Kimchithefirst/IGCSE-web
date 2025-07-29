import mongoose from 'mongoose';
import { Statistics } from '../models/Statistics';
import { Attempt } from '../models/Attempt';
import { Quiz } from '../models/Quiz';

/**
 * Interface for dashboard data summary
 */
interface IEnrolledCourse {
  id: string;
  title: string;
  progress: number;
  nextLesson: string;
  badge: string;
}

interface IUpcomingExam {
  id: string;
  title: string;
  date: string;
  time: string;
}

interface IRecentActivityItem {
  id: string;
  title: string;
  time: string;
  score: string;
}

interface IDashboardData {
  totalTestsCompleted: number;
  totalTimeTaken: number;
  averageScore: number;
  recentAttempts: Array<{
    quizId: string;
    quizTitle: string;
    score: number;
    date: Date;
  }>;
  enrolledCourses: IEnrolledCourse[];
  upcomingExams: IUpcomingExam[];
  recentActivity: IRecentActivityItem[];
  totalEnrolledCourses: number;
  subjectPerformance: Record<string, {
    quizzesTaken: number;
    averageScore: number;
    totalPoints?: number;
    maxPossiblePoints?: number;
    strengths?: string[];
    weaknesses?: string[];
    lastTestDate?: Date;
  }>;
  topicPerformance: Record<string, {
    subject?: string;
    correctAnswers?: number;
    totalQuestions?: number;
    lastUpdated?: Date;
    averageScore: number;
    attempts: number;
  }>;
  strengths: Array<{ topic: string; score: number; subject: string }>;
  weaknesses: Array<{ topic: string; score: number; subject: string }>;
  recommendedQuizzes: Array<{
    id: string;
    title: string;
    subject: string;
    difficulty: string;
  }>;
  streak: {
    current: number;
    longest: number;
    lastActive: Date;
  };
  inProgressQuizzes?: Array<{
    attemptId: string;
    quizId: string;
    quizTitle: string;
    subject: string;
    startTime: Date;
    topicTags?: string[];
  }>;
}

/**
 * Get dashboard data for a student
 * @param userId The user ID to get dashboard data for
 */
export async function getDashboardData(userId: string): Promise<IDashboardData> {
  // Validate userId format
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('Invalid user ID format');
  }

  try {
    // Get user statistics
    const userStats = await Statistics.findOne({ userId });

    // If no statistics exist yet, return default dashboard
    if (!userStats) {
      return createDefaultDashboardData();
    }

    // Get recent quiz attempts
    const recentAttempts = await Attempt.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('quizId', 'title subject difficulty');

    // Process subject performance data
    const subjectPerformance: Record<string, {
      quizzesTaken: number;
      averageScore: number;
      totalPoints?: number;
      maxPossiblePoints?: number;
      strengths?: string[];
      weaknesses?: string[];
      lastTestDate?: Date;
    }> = {};

    // Convert subjectStats array to an object indexed by subject
    if (userStats.subjectStats && Array.isArray(userStats.subjectStats)) {
      userStats.subjectStats.forEach(stat => {
        if (stat.subject) {
          subjectPerformance[stat.subject] = {
            quizzesTaken: stat.quizzesTaken || 0,
            averageScore: stat.averageScore || 0,
            totalPoints: stat.totalPoints,
            maxPossiblePoints: stat.maxPossiblePoints,
            strengths: stat.strengths,
            weaknesses: stat.weaknesses,
            lastTestDate: stat.lastTestDate
          };
        }
      });
    }

    // Process topic performance data
    const topicPerformance: Record<string, {
      subject?: string;
      correctAnswers?: number;
      totalQuestions?: number;
      lastUpdated?: Date;
      averageScore: number;
      attempts: number;
    }> = {};

    // Convert topicPerformance array to an object indexed by topic
    if (userStats.topicPerformance && Array.isArray(userStats.topicPerformance)) {
      userStats.topicPerformance.forEach(perf => {
        if (perf.topic) {
          topicPerformance[perf.topic] = {
            subject: perf.subject,
            correctAnswers: perf.correctAnswers,
            totalQuestions: perf.totalQuestions,
            lastUpdated: perf.lastUpdated,
            averageScore: perf.averageScore || 0,
            attempts: perf.attempts || 0
          };
        }
      });
    }

    // Extract strengths and weaknesses
    const strengths: Array<{ topic: string; score: number; subject: string }> = [];
    const weaknesses: Array<{ topic: string; score: number; subject: string }> = [];

    Object.entries(topicPerformance).forEach(([topic, data]) => {
      if (data.subject && data.totalQuestions && data.totalQuestions >= 3) {
        const score = data.correctAnswers && data.totalQuestions 
          ? (data.correctAnswers / data.totalQuestions) * 100 
          : 0;
          
        if (score >= 80) {
          strengths.push({ topic, score, subject: data.subject });
        } else if (score <= 50) {
          weaknesses.push({ topic, score, subject: data.subject });
        }
      }
    });

    // Sort strengths and weaknesses
    strengths.sort((a, b) => b.score - a.score);
    weaknesses.sort((a, b) => a.score - b.score);

    // Map recent attempts to dashboard format
    const mappedRecentAttempts = recentAttempts.map(attempt => {
      const quiz = attempt.quizId as any;
      return {
        quizId: attempt.quizId?.toString() || '',
        quizTitle: quiz?.title || 'Unknown Quiz',
        score: attempt.percentageScore || 0,
        date: attempt.createdAt || new Date()
      };
    });

    // Create recent activity entries
    const newRecentActivity = mappedRecentAttempts.map(attempt => ({
      id: attempt.quizId,
      title: `Completed: ${attempt.quizTitle}`,
      time: attempt.date.toISOString(),
      score: `${attempt.score}%`
    }));

    // TODO: Implement actual upcoming exams logic
    const upcomingExams: IUpcomingExam[] = [
      { id: 'exam1', title: 'Sample Mock Exam', date: 'To be Scheduled', time: 'N/A' }
    ];

    const enrolledCourses: IEnrolledCourse[] = (userStats.subjectStats || []).map(stat => ({
      id: stat.subject, // Using subject name as a temporary ID
      title: stat.subject,
      progress: stat.averageScore || 0,
      nextLesson: "Review key concepts", // Placeholder
      badge: "" // Placeholder
    }));

    const totalEnrolledCourses = enrolledCourses.length;

    // Find recommended quizzes based on weaknesses
    const recommendedQuizzes: Array<{
      id: string;
      title: string;
      subject: string;
      difficulty: string;
    }> = [];

    if (weaknesses.length > 0) {
      // Get topics from weaknesses
      const weakTopics = weaknesses.map(w => w.topic);
      
      // Find quizzes related to weak topics
      // This is a simplified example - in a real app, you might need a more sophisticated recommendation algorithm
      const potentialQuizzes = await Quiz.find({ 
        isPublished: true,
        $or: [
          { 'topicTags': { $in: weakTopics } },
          { 'subject': { $in: weaknesses.map(w => w.subject) } }
        ]
      })
      .select('_id title subject difficulty')
      .limit(5);

      potentialQuizzes.forEach(quiz => {
        // Ensure all required properties exist and convert _id to string
        if (quiz._id && quiz.title && quiz.subject) {
          recommendedQuizzes.push({
            id: quiz._id.toString(),
            title: quiz.title,
            subject: quiz.subject,
            // Provide a default value if difficulty is undefined
            difficulty: quiz.difficulty || quiz.difficultyLevel || 'intermediate'
          });
        }
      });
    }

    // Calculate the average score across all subjects
    const averageScore = calculateAverageScore(subjectPerformance);

    // Fetch in-progress attempts
    const inProgressAttempts = await Attempt.find({ userId, status: 'in-progress' })
      .sort({ startTime: -1 }) // Show most recent first
      .populate({
        path: 'quizId',
        select: 'title subject topicTags', // Ensure topicTags is selected from Quiz model
      });

    const mappedInProgressQuizzes = inProgressAttempts.map(attempt => {
      const quiz = attempt.quizId as any; // Cast to any to access populated fields
      return {
        attemptId: attempt._id.toString(),
        quizId: quiz?._id.toString() || '',
        quizTitle: quiz?.title || 'Unknown Quiz',
        subject: quiz?.subject || 'Unknown Subject',
        startTime: attempt.startTime,
        topicTags: quiz?.topicTags || [], // Include topicTags
      };
    }).filter(quiz => quiz.quizId); // Ensure quizId is valid

    // Combine all data into the dashboard response
    return {
      totalTestsCompleted: userStats.testsCompleted || 0,
      totalTimeTaken: userStats.totalTimeSpent || 0,
      averageScore,
      recentAttempts: mappedRecentAttempts,
      enrolledCourses,
      upcomingExams,
      recentActivity: newRecentActivity,
      totalEnrolledCourses,
      subjectPerformance,
      topicPerformance,
      strengths: strengths.slice(0, 5), // Top 5 strengths
      weaknesses: weaknesses.slice(0, 5), // Top 5 weaknesses
      recommendedQuizzes,
      streak: {
        current: userStats.streak?.current || 0,
        longest: userStats.streak?.longest || 0,
        lastActive: userStats.streak?.lastActive || new Date()
      },
      inProgressQuizzes: mappedInProgressQuizzes
    };
  } catch (error) {
    console.error('Error generating dashboard data:', error);
    throw error;
  }
}

/**
 * Calculate the overall average score across all subjects
 */
const calculateAverageScore = (subjectPerformance: Record<string, any>): number => {
  const subjects = Object.values(subjectPerformance);
  
  if (subjects.length === 0) return 0;
  
  const totalScore = subjects.reduce((sum, subject) => sum + (subject.averageScore || 0), 0);
  return totalScore / subjects.length;
};

/**
 * Create default dashboard data for new users
 */
const createDefaultDashboardData = (): IDashboardData => {
  return {
    totalTestsCompleted: 0,
    totalTimeTaken: 0,
    averageScore: 0,
    recentAttempts: [],
    enrolledCourses: [],
    upcomingExams: [],
    recentActivity: [],
    totalEnrolledCourses: 0,
    subjectPerformance: {},
    topicPerformance: {},
    strengths: [],
    weaknesses: [],
    recommendedQuizzes: [],
    streak: {
      current: 0,
      longest: 0,
      lastActive: new Date()
    },
    inProgressQuizzes: []
  };
}; 