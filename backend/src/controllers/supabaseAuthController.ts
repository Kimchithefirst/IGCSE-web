import { Request, Response } from 'express';
import { supabase } from '../lib/supabase';

interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  role: 'student' | 'teacher' | 'parent' | 'admin';
  username?: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Register a new user with Supabase Auth
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, fullName, role, username }: RegisterRequest = req.body;

    // Validate input
    if (!email || !password || !fullName || !role) {
      return res.status(400).json({
        error: 'Email, password, full name, and role are required'
      });
    }

    // Validate role
    const validRoles = ['student', 'teacher', 'parent', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        error: 'Invalid role. Must be student, teacher, parent, or admin'
      });
    }

    // Generate username if not provided
    const userUsername = username || email.split('@')[0] + Math.random().toString(36).substr(2, 4);

    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm for now
      user_metadata: {
        full_name: fullName,
        role: role
      }
    });

    if (authError) {
      console.error('Supabase auth error:', authError);
      return res.status(400).json({
        error: authError.message || 'Failed to create user'
      });
    }

    if (!authData.user) {
      return res.status(400).json({
        error: 'Failed to create user'
      });
    }

    // Create profile in our profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        username: userUsername,
        full_name: fullName,
        role: role
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      
      // If profile creation fails, we should delete the auth user
      await supabase.auth.admin.deleteUser(authData.user.id);
      
      return res.status(400).json({
        error: 'Failed to create user profile'
      });
    }

    // Note: We don't generate a signup link here since the user is already created

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        fullName: fullName,
        role: role,
        username: userUsername
      },
      // Note: For security, we don't return the actual session tokens here
      // The frontend should handle login separately
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};

/**
 * Login user with Supabase Auth
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password }: LoginRequest = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    // Sign in with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError || !authData.user) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !profile) {
      console.error('Profile fetch error:', profileError);
      return res.status(500).json({
        error: 'Failed to fetch user profile'
      });
    }

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        fullName: profile.full_name,
        role: profile.role,
        username: profile.username
      },
      session: {
        access_token: authData.session?.access_token,
        refresh_token: authData.session?.refresh_token,
        expires_at: authData.session?.expires_at
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};

/**
 * Logout user
 */
export const logout = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      // Sign out the user session
      const { error } = await supabase.auth.admin.signOut(token);
      
      if (error) {
        console.error('Logout error:', error);
      }
    }

    res.status(200).json({
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};

/**
 * Verify JWT token and return user info
 */
export const verifyToken = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'No token provided'
      });
    }

    const token = authHeader.substring(7);

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        error: 'Invalid token'
      });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return res.status(500).json({
        error: 'Failed to fetch user profile'
      });
    }

    res.status(200).json({
      valid: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: profile.full_name,
        role: profile.role,
        username: profile.username
      }
    });

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({
      error: 'Invalid token'
    });
  }
};

/**
 * Get current user profile
 */
export const getProfile = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'No token provided'
      });
    }

    const token = authHeader.substring(7);

    // Get user from token
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        error: 'Invalid token'
      });
    }

    // Get full profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return res.status(500).json({
        error: 'Failed to fetch user profile'
      });
    }

    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        fullName: profile.full_name,
        role: profile.role,
        username: profile.username,
        avatarUrl: profile.avatar_url,
        bio: profile.bio,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'No token provided'
      });
    }

    const token = authHeader.substring(7);
    const { fullName, username, bio, avatarUrl } = req.body;

    // Get user from token
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        error: 'Invalid token'
      });
    }

    // Update profile
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        username: username,
        bio: bio,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Profile update error:', updateError);
      return res.status(400).json({
        error: 'Failed to update profile'
      });
    }

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: user.email,
        fullName: updatedProfile.full_name,
        role: updatedProfile.role,
        username: updatedProfile.username,
        avatarUrl: updatedProfile.avatar_url,
        bio: updatedProfile.bio,
        updatedAt: updatedProfile.updated_at
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};