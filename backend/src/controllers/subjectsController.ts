import { Request, Response } from 'express';
import { supabase } from '../lib/supabase';

/**
 * Get all subjects
 */
export const getSubjects = async (req: Request, res: Response) => {
  try {
    // Fetch subjects from Supabase
    const { data: subjects, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching subjects:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch subjects'
      });
    }

    // Get quiz count for each subject (if quizzes table exists)
    const subjectsWithQuizCounts = await Promise.all(
      subjects.map(async (subject) => {
        const { count: quizCount } = await supabase
          .from('quizzes')
          .select('*', { count: 'exact', head: true })
          .eq('subject_id', subject.id)
          .eq('is_public', true);

        return {
          id: subject.id,
          code: subject.code,
          name: subject.name,
          description: subject.description,
          icon: subject.icon,
          color: subject.color,
          questionCount: quizCount || 0,
          sampleQuestions: [] as any[] // This would be populated from actual quiz questions
        };
      })
    );

    res.status(200).json({
      success: true,
      data: subjectsWithQuizCounts,
      metadata: {
        totalSubjects: subjects.length,
        totalQuestions: subjectsWithQuizCounts.reduce((sum, subj) => sum + subj.questionCount, 0)
      }
    });

  } catch (error) {
    console.error('Error in getSubjects:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching subjects'
    });
  }
};

/**
 * Get subject by ID or code
 */
export const getSubjectById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Try to find by UUID first, then by code
    let query = supabase
      .from('subjects')
      .select('*')
      .eq('is_active', true);

    // Check if ID is a UUID format or a subject code
    if (id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      query = query.eq('id', id);
    } else {
      query = query.eq('code', id);
    }

    const { data: subject, error } = await query.single();

    if (error || !subject) {
      return res.status(404).json({
        success: false,
        error: 'Subject not found'
      });
    }

    // Get related quizzes
    const { data: quizzes, error: quizzesError } = await supabase
      .from('quizzes')
      .select('id, title, description, difficulty_level, duration_minutes, total_marks')
      .eq('subject_id', subject.id)
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (quizzesError) {
      console.error('Error fetching quizzes:', quizzesError);
    }

    res.status(200).json({
      success: true,
      data: {
        ...subject,
        quizzes: quizzes || []
      }
    });

  } catch (error) {
    console.error('Error in getSubjectById:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching subject'
    });
  }
};

/**
 * Create new subject (admin/teacher only)
 */
export const createSubject = async (req: Request, res: Response) => {
  try {
    const { code, name, description, icon, color } = req.body;

    // Validate required fields
    if (!code || !name) {
      return res.status(400).json({
        success: false,
        error: 'Subject code and name are required'
      });
    }

    // Check if subject code already exists
    const { data: existingSubject } = await supabase
      .from('subjects')
      .select('id')
      .eq('code', code)
      .single();

    if (existingSubject) {
      return res.status(409).json({
        success: false,
        error: 'Subject with this code already exists'
      });
    }

    // Create new subject
    const { data: newSubject, error } = await supabase
      .from('subjects')
      .insert({
        code,
        name,
        description,
        icon,
        color,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating subject:', error);
      return res.status(400).json({
        success: false,
        error: 'Failed to create subject'
      });
    }

    res.status(201).json({
      success: true,
      data: newSubject,
      message: 'Subject created successfully'
    });

  } catch (error) {
    console.error('Error in createSubject:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while creating subject'
    });
  }
};

/**
 * Update subject (admin/teacher only)
 */
export const updateSubject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, icon, color, is_active } = req.body;

    // Update subject
    const { data: updatedSubject, error } = await supabase
      .from('subjects')
      .update({
        name,
        description,
        icon,
        color,
        is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating subject:', error);
      return res.status(400).json({
        success: false,
        error: 'Failed to update subject'
      });
    }

    if (!updatedSubject) {
      return res.status(404).json({
        success: false,
        error: 'Subject not found'
      });
    }

    res.status(200).json({
      success: true,
      data: updatedSubject,
      message: 'Subject updated successfully'
    });

  } catch (error) {
    console.error('Error in updateSubject:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating subject'
    });
  }
};

/**
 * Delete subject (admin only)
 */
export const deleteSubject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Soft delete by setting is_active to false
    const { data: deletedSubject, error } = await supabase
      .from('subjects')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error deleting subject:', error);
      return res.status(400).json({
        success: false,
        error: 'Failed to delete subject'
      });
    }

    if (!deletedSubject) {
      return res.status(404).json({
        success: false,
        error: 'Subject not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Subject deleted successfully'
    });

  } catch (error) {
    console.error('Error in deleteSubject:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while deleting subject'
    });
  }
};