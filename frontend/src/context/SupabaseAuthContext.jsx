import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, getCurrentUser, onAuthStateChange } from '../lib/supabase';

const SupabaseAuthContext = createContext(null);

export const useSupabaseAuth = () => {
  const context = useContext(SupabaseAuthContext);
  if (!context) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
};

export const SupabaseAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        loadUserProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event, session);
      setSession(session);
      
      if (session?.user) {
        await loadUserProfile(session.user);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  const loadUserProfile = async (authUser) => {
    try {
      setLoading(true);
      
      // Get user profile from profiles table
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
        // If profile doesn't exist, user might need to complete registration
        setUser({
          id: authUser.id,
          email: authUser.email,
          profile: null
        });
      } else {
        setUser({
          id: authUser.id,
          email: authUser.email,
          name: profile.full_name,
          username: profile.username,
          role: profile.role,
          profile: profile
        });
      }
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      // User profile will be loaded by the auth state change listener
      return data.user;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      
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

      if (authError) {
        throw new Error(authError.message);
      }

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
        // Don't throw here, as the user is created, just profile is missing
      }

      return authData.user;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
      }
      // User state will be cleared by the auth state change listener
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateProfile = async (updates) => {
    try {
      if (!user) {
        throw new Error('No user logged in');
      }

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

      if (error) {
        throw new Error(error.message);
      }

      // Update local user state
      setUser(prev => ({
        ...prev,
        name: data.full_name,
        username: data.username,
        profile: data
      }));

      return data;
    } catch (error) {
      throw error;
    }
  };

  // Get current session token for API calls
  const getToken = () => {
    return session?.access_token;
  };

  // For backward compatibility with old role switching (dev only)
  const switchRole = async (role) => {
    if (import.meta.env.DEV && user) {
      try {
        await updateProfile({ 
          fullName: user.name,
          username: user.username,
          bio: user.profile?.bio,
          avatarUrl: user.profile?.avatar_url,
          role: role
        });
        
        // Reload user profile
        const authUser = await supabase.auth.getUser();
        if (authUser.data.user) {
          await loadUserProfile(authUser.data.user);
        }
      } catch (error) {
        console.error('Role switch error:', error);
      }
    }
  };

  const value = {
    user,
    session,
    loading,
    login,
    register,
    logout,
    updateProfile,
    getToken,
    switchRole
  };

  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  );
};