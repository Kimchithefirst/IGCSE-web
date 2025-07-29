#!/usr/bin/env node

/**
 * MongoDB to Supabase Migration Script
 * 
 * This script migrates data from MongoDB to Supabase PostgreSQL
 * 
 * Usage: node mongodb-to-supabase.js --mongodb-uri <uri> --supabase-url <url> --supabase-key <key>
 */

const { MongoClient } = require('mongodb');
const { createClient } = require('@supabase/supabase-js');

// Parse command line arguments
const args = process.argv.reduce((acc, arg, i, arr) => {
  if (arg.startsWith('--')) {
    acc[arg.substring(2)] = arr[i + 1];
  }
  return acc;
}, {});

if (!args['mongodb-uri'] || !args['supabase-url'] || !args['supabase-key']) {
  console.error('Usage: node mongodb-to-supabase.js --mongodb-uri <uri> --supabase-url <url> --supabase-key <key>');
  process.exit(1);
}

const MONGODB_URI = args['mongodb-uri'];
const SUPABASE_URL = args['supabase-url'];
const SUPABASE_ANON_KEY = args['supabase-key'];

// Initialize clients
const mongoClient = new MongoClient(MONGODB_URI);
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function migrateUsers(db) {
  console.log('🔄 Migrating users...');
  const users = await db.collection('users').find({}).toArray();
  
  for (const user of users) {
    try {
      // Create Supabase auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password, // Note: In production, you'd need to handle password migration differently
        email_confirm: true,
        user_metadata: {
          full_name: user.fullName,
          role: user.role
        }
      });

      if (authError) {
        console.error(`Failed to create auth user for ${user.email}:`, authError);
        continue;
      }

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          username: user.username,
          full_name: user.fullName,
          role: user.role,
          created_at: user.createdAt,
          updated_at: user.updatedAt
        });

      if (profileError) {
        console.error(`Failed to create profile for ${user.email}:`, profileError);
      } else {
        console.log(`✅ Migrated user: ${user.email}`);
      }
    } catch (error) {
      console.error(`Error migrating user ${user.email}:`, error);
    }
  }
}

async function migrateQuizzes(db) {
  console.log('🔄 Migrating quizzes...');
  const quizzes = await db.collection('quizzes').find({}).toArray();
  
  // Create a mapping of MongoDB IDs to PostgreSQL UUIDs
  const quizIdMap = new Map();
  
  for (const quiz of quizzes) {
    try {
      // Find subject by code
      const { data: subject } = await supabase
        .from('subjects')
        .select('id')
        .eq('code', quiz.subjectCode)
        .single();

      // Find paper if exists
      let paperId = null;
      if (quiz.paperCode) {
        const { data: paper } = await supabase
          .from('papers')
          .select('id')
          .eq('paper_code', quiz.paperCode)
          .single();
        paperId = paper?.id;
      }

      // Insert quiz
      const { data: newQuiz, error: quizError } = await supabase
        .from('quizzes')
        .insert({
          title: quiz.title,
          description: quiz.description,
          subject_id: subject?.id,
          paper_id: paperId,
          status: quiz.status || 'published',
          difficulty_level: quiz.difficulty,
          duration_minutes: quiz.duration,
          total_marks: quiz.totalMarks,
          pass_percentage: quiz.passingScore,
          instructions: quiz.instructions,
          is_public: true,
          metadata: {
            examBoard: quiz.examBoard,
            level: quiz.level,
            year: quiz.year,
            session: quiz.session,
            variant: quiz.variant
          },
          created_at: quiz.createdAt,
          updated_at: quiz.updatedAt
        })
        .select()
        .single();

      if (quizError) {
        console.error(`Failed to create quiz ${quiz.title}:`, quizError);
        continue;
      }

      quizIdMap.set(quiz._id.toString(), newQuiz.id);
      console.log(`✅ Migrated quiz: ${quiz.title}`);

      // Migrate questions for this quiz
      await migrateQuestions(db, quiz._id, newQuiz.id);
    } catch (error) {
      console.error(`Error migrating quiz ${quiz.title}:`, error);
    }
  }
  
  return quizIdMap;
}

async function migrateQuestions(db, mongoQuizId, postgresQuizId) {
  const questions = await db.collection('questions').find({ quizId: mongoQuizId }).toArray();
  
  for (const [index, question] of questions.entries()) {
    try {
      // Insert question
      const { data: newQuestion, error: questionError } = await supabase
        .from('questions')
        .insert({
          quiz_id: postgresQuizId,
          question_text: question.questionText,
          question_type: mapQuestionType(question.type),
          marks: question.marks,
          difficulty_level: question.difficulty,
          explanation: question.explanation,
          hint: question.hint,
          order_index: index + 1,
          is_required: true,
          metadata: {
            imageUrl: question.imageUrl,
            tags: question.tags
          }
        })
        .select()
        .single();

      if (questionError) {
        console.error(`Failed to create question:`, questionError);
        continue;
      }

      // Insert options for multiple choice questions
      if (question.type === 'multipleChoice' && question.options) {
        const optionsToInsert = question.options.map((option, idx) => ({
          question_id: newQuestion.id,
          option_text: option.text,
          is_correct: option.isCorrect,
          feedback: option.feedback,
          order_index: idx + 1
        }));

        const { error: optionsError } = await supabase
          .from('question_options')
          .insert(optionsToInsert);

        if (optionsError) {
          console.error(`Failed to create options:`, optionsError);
        }
      }
    } catch (error) {
      console.error(`Error migrating question:`, error);
    }
  }
}

async function migrateAttempts(db, quizIdMap) {
  console.log('🔄 Migrating quiz attempts...');
  const attempts = await db.collection('quizattempts').find({}).toArray();
  
  for (const attempt of attempts) {
    try {
      // Get user profile ID from email
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', attempt.userId)
        .single();

      if (!profile) {
        console.warn(`User not found for attempt: ${attempt.userId}`);
        continue;
      }

      const postgresQuizId = quizIdMap.get(attempt.quizId.toString());
      if (!postgresQuizId) {
        console.warn(`Quiz not found for attempt: ${attempt.quizId}`);
        continue;
      }

      // Insert attempt
      const { data: newAttempt, error: attemptError } = await supabase
        .from('quiz_attempts')
        .insert({
          quiz_id: postgresQuizId,
          user_id: profile.id,
          status: attempt.completedAt ? 'completed' : 'in_progress',
          score: attempt.score,
          percentage: attempt.percentage,
          time_spent_seconds: attempt.timeSpent,
          started_at: attempt.startedAt,
          completed_at: attempt.completedAt,
          metadata: {
            answers: attempt.answers
          }
        })
        .select()
        .single();

      if (attemptError) {
        console.error(`Failed to create attempt:`, attemptError);
      } else {
        console.log(`✅ Migrated attempt for user: ${attempt.userId}`);
      }
    } catch (error) {
      console.error(`Error migrating attempt:`, error);
    }
  }
}

async function updateStatistics() {
  console.log('🔄 Calculating user statistics...');
  
  // This would be better as a PostgreSQL function
  const { data: users } = await supabase
    .from('profiles')
    .select('id');

  for (const user of users || []) {
    const { data: attempts } = await supabase
      .from('quiz_attempts')
      .select('*, quizzes!inner(subject_id)')
      .eq('user_id', user.id)
      .eq('status', 'completed');

    // Group by subject
    const subjectStats = {};
    
    for (const attempt of attempts || []) {
      const subjectId = attempt.quizzes.subject_id;
      if (!subjectStats[subjectId]) {
        subjectStats[subjectId] = {
          total_quizzes_attempted: 0,
          total_quizzes_completed: 0,
          scores: [],
          total_time_minutes: 0
        };
      }
      
      subjectStats[subjectId].total_quizzes_attempted++;
      if (attempt.status === 'completed') {
        subjectStats[subjectId].total_quizzes_completed++;
        subjectStats[subjectId].scores.push(attempt.percentage || 0);
        subjectStats[subjectId].total_time_minutes += Math.floor((attempt.time_spent_seconds || 0) / 60);
      }
    }

    // Insert/update statistics
    for (const [subjectId, stats] of Object.entries(subjectStats)) {
      const avgScore = stats.scores.length > 0 
        ? stats.scores.reduce((a, b) => a + b, 0) / stats.scores.length 
        : 0;
      const highestScore = stats.scores.length > 0 
        ? Math.max(...stats.scores) 
        : 0;

      await supabase
        .from('user_statistics')
        .upsert({
          user_id: user.id,
          subject_id: subjectId,
          total_quizzes_attempted: stats.total_quizzes_attempted,
          total_quizzes_completed: stats.total_quizzes_completed,
          average_score: avgScore,
          highest_score: highestScore,
          total_time_spent_minutes: stats.total_time_minutes
        }, {
          onConflict: 'user_id,subject_id'
        });
    }
  }
  
  console.log('✅ Statistics updated');
}

function mapQuestionType(mongoType) {
  const typeMap = {
    'multipleChoice': 'multiple_choice',
    'shortAnswer': 'short_answer',
    'essay': 'essay',
    'trueFalse': 'true_false'
  };
  return typeMap[mongoType] || 'multiple_choice';
}

async function main() {
  try {
    // Connect to MongoDB
    await mongoClient.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = mongoClient.db(); // Use default database from connection string
    
    // Run migrations
    await migrateUsers(db);
    const quizIdMap = await migrateQuizzes(db);
    await migrateAttempts(db, quizIdMap);
    await updateStatistics();
    
    console.log('🎉 Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoClient.close();
  }
}

// Run the migration
main();