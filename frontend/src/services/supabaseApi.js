/**
 * Supabase API service
 * Combines direct Supabase queries with backend API calls where needed
 */

import { supabase } from '../lib/supabase';

// Get base API URL for backend calls
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Helper function to make authenticated requests to backend API
 */
async function apiRequest(endpoint, options = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(session?.access_token && { 
        'Authorization': `Bearer ${session.access_token}` 
      }),
      ...options.headers
    },
    mode: 'cors',
    ...options
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Authentication API
 */
export const authApi = {
  /**
   * Login with email and password
   */
  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw new Error(error.message);
    
    // Get user profile
    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      return {
        user: data.user,
        session: data.session,
        profile
      };
    }

    return data;
  },

  /**
   * Register new user
   */
  async register(userData) {
    const { email, password, fullName, role, username } = userData;

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role || 'student'
        }
      }
    });

    if (authError) throw new Error(authError.message);

    if (!authData.user) {
      throw new Error('User creation failed');
    }

    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        username: username || email.split('@')[0] + Math.random().toString(36).substr(2, 4),
        full_name: fullName,
        role: role || 'student'
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
    }

    return authData;
  },

  /**
   * Logout user
   */
  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  },

  /**
   * Get current user with profile
   */
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) return null;
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
      
    return {
      ...user,
      profile,
    };
  }
};

/**
 * Dashboard API
 */
export const dashboardApi = {
  /**
   * Get dashboard data for current user
   */
  async getDashboardData() {
    return apiRequest('/api/dashboard');
  },

  /**
   * Get user statistics
   */
  async getUserStats() {
    return apiRequest('/api/dashboard/stats');
  },

  /**
   * Get recent activity
   */
  async getRecentActivity() {
    return apiRequest('/api/dashboard/activity');
  }
};

/**
 * Subjects API
 */
export const subjectsApi = {
  /**
   * Get all subjects (public)
   */
  async getSubjects() {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) throw new Error(error.message);
    return { data, success: true };
  },

  /**
   * Get subject by ID or code
   */
  async getSubjectById(id) {
    const { data, error } = await supabase
      .from('subjects')
      .select(`
        *,
        quizzes (
          id,
          title,
          description,
          difficulty_level,
          duration_minutes,
          total_marks
        )
      `)
      .eq('is_active', true)
      .or(`id.eq.${id},code.eq.${id}`)
      .single();

    if (error) throw new Error(error.message);
    return { data, success: true };
  },

  /**
   * Create new subject (teacher/admin only)
   */
  async createSubject(subjectData) {
    return apiRequest('/api/subjects', {
      method: 'POST',
      body: JSON.stringify(subjectData)
    });
  },

  /**
   * Update subject (teacher/admin only)
   */
  async updateSubject(id, updates) {
    return apiRequest(`/api/subjects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  /**
   * Delete subject (admin only)
   */
  async deleteSubject(id) {
    return apiRequest(`/api/subjects/${id}`, {
      method: 'DELETE'
    });
  }
};

/**
 * Courses API
 */
export const coursesApi = {
  /**
   * Get all courses
   */
  async getCourses() {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) throw new Error(error.message);

    // Transform to match frontend expectations
    const transformedData = data.map(course => ({
      id: course.id,
      title: course.name,
      description: course.description,
      subject: course.exam_board,
      level: course.level,
      duration: '6 months',
      difficulty: 'Intermediate'
    }));

    return { 
      data: transformedData, 
      success: true,
      count: transformedData.length 
    };
  },

  /**
   * Get course by ID
   */
  async getCourseById(id) {
    return apiRequest(`/api/courses/${id}`);
  },

  /**
   * Get course topics
   */
  async getCourseTopics(id) {
    return apiRequest(`/api/courses/${id}/topics`);
  },

  /**
   * Get subjects list for course metadata
   */
  async getSubjectsList() {
    const { data, error } = await supabase
      .from('subjects')
      .select('name')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) throw new Error(error.message);
    
    return { 
      data: data.map(subject => subject.name), 
      success: true 
    };
  },

  /**
   * Create new course (teacher/admin only)
   */
  async createCourse(courseData) {
    return apiRequest('/api/courses', {
      method: 'POST',
      body: JSON.stringify(courseData)
    });
  }
};

/**
 * User Profile API
 */
export const profileApi = {
  /**
   * Update user profile
   */
  async updateProfile(updates) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('profiles')
      .update({
        full_name: updates.fullName,
        username: updates.username,
        bio: updates.bio,
        avatar_url: updates.avatarUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { data, success: true };
  },

  /**
   * Get user profile
   */
  async getProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw new Error(error.message);
    return { data, success: true };
  }
};

/**
 * Health check
 */
export const healthApi = {
  async checkHealth() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        mode: 'cors'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      throw new Error(`Health check failed: ${error.message}`);
    }
  }
};

/**
 * Main API object combining all services
 */
export const supabaseApi = {
  auth: authApi,
  dashboard: dashboardApi,
  subjects: subjectsApi,
  courses: coursesApi,
  profile: profileApi,
  health: healthApi
};

export default supabaseApi;