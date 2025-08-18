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
    let mounted = true;
    console.log('SupabaseAuthProvider mounted');

    // Add a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (mounted && loading) {
        console.log('Loading timeout reached, forcing loading to false');
        setLoading(false);
        // If we have a session but no user, create a basic user object
        if (session?.user && !user) {
          console.log('Creating fallback user object');
          setUser({
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.full_name || 'User',
            username: `user_${session.user.id.substring(0, 8)}`,
            role: 'student',
            profile: null
          });
        }
      }
    }, 2000); // Reduced to 2 second timeout

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      
      console.log('Initial session:', session);
      setSession(session);
      if (session?.user) {
        loadUserProfile(session.user);
      } else {
        console.log('No session, setting loading to false');
        setLoading(false);
      }
    }).catch((error) => {
      console.error('Error getting initial session:', error);
      if (mounted) {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      console.log('Auth event:', event, session);
      setSession(session);
      
      if (session?.user) {
        await loadUserProfile(session.user);
      } else {
        console.log('No user in session, clearing user and setting loading to false');
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      subscription?.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (authUser) => {
    try {
      console.log('Loading user profile for:', authUser.id);
      setLoading(true);
      
      // Add timeout to the profile query
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile query timeout')), 2000)
      );

      // Race between profile query and timeout
      const { data: profile, error } = await Promise.race([profilePromise, timeoutPromise]);

      console.log('Profile query result:', { profile, error });

      if (error) {
        console.error('Error loading profile:', error);
        // If profile doesn't exist, create a default student profile
        const defaultProfile = {
          id: authUser.id,
          username: `user_${authUser.id.substring(0, 8)}`,
          full_name: authUser.user_metadata?.full_name || 'User',
          role: 'student',
          bio: null,
          avatar_url: null
        };
        
        // Insert the default profile
        const { error: insertError } = await supabase
          .from('profiles')
          .insert(defaultProfile);
          
        if (insertError) {
          console.error('Error creating default profile:', insertError);
        }
        
        setUser({
          id: authUser.id,
          email: authUser.email,
          name: defaultProfile.full_name,
          username: defaultProfile.username,
          role: defaultProfile.role,
          profile: defaultProfile
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
      // Even if there's an error, create a basic user object with student role
      setUser({
        id: authUser.id,
        email: authUser.email,
        name: authUser.user_metadata?.full_name || 'User',
        username: `user_${authUser.id.substring(0, 8)}`,
        role: 'student',
        profile: null
      });
    } finally {
      console.log('Setting loading to false');
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
            username: username,
            role: role || 'student'
          }
        }
      });

      if (authError) {
        console.error('Auth error details:', authError);
        // Provide more specific error messages
        if (authError.message.includes('email')) {
          throw new Error('This email is already registered. Please use a different email or try signing in.');
        } else if (authError.message.includes('password')) {
          throw new Error('Password must be at least 8 characters long.');
        } else if (authError.message.includes('username')) {
          throw new Error('Username is already taken. Please choose a different username.');
        } else {
          throw new Error(authError.message);
        }
      }

      if (!authData.user) {
        throw new Error('User creation failed');
      }

      // Profile is automatically created by the database trigger
      // No need to manually insert it here

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

      const updateData = {
        full_name: updates.fullName,
        username: updates.username,
        bio: updates.bio,
        avatar_url: updates.avatarUrl,
        updated_at: new Date().toISOString()
      };

      // Add role if provided
      if (updates.role) {
        updateData.role = updates.role;
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
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
        role: data.role,
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
        console.log('Switching role to:', role);
        
        // If user has no profile, create one first
        if (!user.profile) {
          console.log('Creating profile for role switch');
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              username: user.username || `user_${user.id.substring(0, 8)}`,
              full_name: user.name || 'User',
              role: role
            });
          
          if (insertError) {
            console.error('Error creating profile:', insertError);
            return;
          }
        }
        
        // Update the profile with new role
        await updateProfile({ 
          fullName: user.name,
          username: user.username,
          bio: user.profile?.bio,
          avatarUrl: user.profile?.avatar_url,
          role: role
        });
        
        console.log('Role switched successfully to:', role);
        
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