import { Request, Response } from 'express';
import { supabase } from '../lib/supabase';

/**
 * Get all courses
 */
export const getCourses = async (req: Request, res: Response) => {
  try {
    // Fetch courses from Supabase
    const { data: courses, error } = await supabase
      .from('courses')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching courses:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch courses'
      });
    }

    // Get subject count for each course
    const coursesWithCounts = await Promise.all(
      courses.map(async (course) => {
        // Get count of subjects for this course
        const { count: subjectCount } = await supabase
          .from('subjects')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true);

        // Get count of quizzes for this course (via papers/subjects)
        const { count: quizCount } = await supabase
          .from('quizzes')
          .select('*', { count: 'exact', head: true })
          .eq('is_public', true);

        return {
          id: course.id,
          title: course.name,
          description: course.description,
          subject: course.exam_board,
          level: course.level,
          duration: '6 months', // Default duration
          difficulty: 'Intermediate', // Default difficulty
          topicCount: subjectCount || 0,
          quizCount: quizCount || 0
        };
      })
    );

    res.json({
      success: true,
      data: coursesWithCounts,
      count: coursesWithCounts.length
    });

  } catch (error) {
    console.error('Error in getCourses:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch courses' 
    });
  }
};

/**
 * Get course by ID
 */
export const getCourseById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Fetch course by ID
    const { data: course, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error || !course) {
      return res.status(404).json({ 
        success: false,
        error: 'Course not found' 
      });
    }

    // Get related subjects (topics)
    const { data: subjects, error: subjectsError } = await supabase
      .from('subjects')
      .select('id, code, name, description')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (subjectsError) {
      console.error('Error fetching subjects:', subjectsError);
    }

    // Format subjects as topics
    const topics = (subjects || []).map((subject, index) => ({
      id: String(index + 1),
      name: subject.name,
      description: subject.description || `${subject.name} fundamentals and practice`
    }));

    const courseData = {
      id: course.id,
      title: course.name,
      description: course.description,
      subject: course.exam_board,
      level: course.level,
      topics: topics,
      duration: '6 months',
      difficulty: 'Intermediate'
    };

    res.json({
      success: true,
      data: courseData
    });

  } catch (error) {
    console.error('Error in getCourseById:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch course details' 
    });
  }
};

/**
 * Get topics for a course
 */
export const getCourseTopics = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Fetch course to verify it exists
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('name')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (courseError || !course) {
      return res.status(404).json({ 
        success: false,
        error: 'Course not found' 
      });
    }

    // Get all subjects as topics
    const { data: subjects, error: subjectsError } = await supabase
      .from('subjects')
      .select('id, code, name, description')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (subjectsError) {
      console.error('Error fetching subjects:', subjectsError);
      return res.status(500).json({ 
        success: false,
        error: 'Failed to fetch topics' 
      });
    }

    // Format subjects as topics
    const topics = (subjects || []).map((subject, index) => ({
      id: String(index + 1),
      name: subject.name,
      description: subject.description || `${subject.name} fundamentals and practice`
    }));

    res.json({
      success: true,
      data: topics,
      courseTitle: course.name
    });

  } catch (error) {
    console.error('Error in getCourseTopics:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch topics' 
    });
  }
};

/**
 * Create new course (admin/teacher only)
 */
export const createCourse = async (req: Request, res: Response) => {
  try {
    const { title, description, subject, level, examBoard } = req.body;

    if (!title || !description) {
      return res.status(400).json({ 
        success: false,
        error: 'Title and description are required' 
      });
    }

    // Generate unique code from title
    const code = title.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 20);

    // Check if code already exists
    const { data: existingCourse } = await supabase
      .from('courses')
      .select('id')
      .eq('code', code)
      .single();

    let finalCode = code;
    if (existingCourse) {
      finalCode = `${code}-${Date.now()}`;
    }

    // Create new course
    const { data: newCourse, error } = await supabase
      .from('courses')
      .insert({
        code: finalCode,
        name: title,
        description,
        exam_board: examBoard || subject || 'IGCSE',
        level: level || 'IGCSE',
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating course:', error);
      return res.status(400).json({
        success: false,
        error: 'Failed to create course'
      });
    }

    const courseData = {
      id: newCourse.id,
      title: newCourse.name,
      description: newCourse.description,
      subject: newCourse.exam_board,
      level: newCourse.level,
      topics: [] as any[],
      duration: '6 months',
      difficulty: 'Intermediate'
    };

    res.status(201).json({
      success: true,
      data: courseData,
      message: 'Course created successfully'
    });

  } catch (error) {
    console.error('Error in createCourse:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to create course' 
    });
  }
};

/**
 * Get subjects list (for course metadata)
 */
export const getSubjectsList = async (req: Request, res: Response) => {
  try {
    const { data: subjects, error } = await supabase
      .from('subjects')
      .select('name')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching subjects list:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch subjects'
      });
    }

    const subjectNames = subjects.map(subject => subject.name);

    res.json({
      success: true,
      data: subjectNames
    });

  } catch (error) {
    console.error('Error in getSubjectsList:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch subjects list'
    });
  }
};

/**
 * Update course (admin/teacher only)
 */
export const updateCourse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, examBoard, level } = req.body;

    const { data: updatedCourse, error } = await supabase
      .from('courses')
      .update({
        name: title,
        description,
        exam_board: examBoard,
        level,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating course:', error);
      return res.status(400).json({
        success: false,
        error: 'Failed to update course'
      });
    }

    if (!updatedCourse) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    res.status(200).json({
      success: true,
      data: updatedCourse,
      message: 'Course updated successfully'
    });

  } catch (error) {
    console.error('Error in updateCourse:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating course'
    });
  }
};

/**
 * Delete course (admin only)
 */
export const deleteCourse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Soft delete by setting is_active to false
    const { data: deletedCourse, error } = await supabase
      .from('courses')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error deleting course:', error);
      return res.status(400).json({
        success: false,
        error: 'Failed to delete course'
      });
    }

    if (!deletedCourse) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully'
    });

  } catch (error) {
    console.error('Error in deleteCourse:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while deleting course'
    });
  }
};