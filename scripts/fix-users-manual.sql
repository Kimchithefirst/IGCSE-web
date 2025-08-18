-- Fix existing users who don't have profiles
-- Run this in your Supabase SQL Editor

-- First, let's see what users exist
SELECT 
  au.id,
  au.email,
  au.raw_user_meta_data,
  CASE WHEN p.id IS NULL THEN 'NO PROFILE' ELSE 'HAS PROFILE' END as profile_status
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
ORDER BY au.created_at DESC;

-- Create profiles for users who don't have them (without relying on user_role enum)
INSERT INTO public.profiles (id, username, full_name, role)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'username', 'user_' || substr(au.id::text, 1, 8)) as username,
  COALESCE(au.raw_user_meta_data->>'full_name', 'New User') as full_name,
  'student' as role  -- Default to student role
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Verify the fix
SELECT 
  au.id,
  au.email,
  p.full_name,
  p.role,
  CASE WHEN p.id IS NULL THEN 'NO PROFILE' ELSE 'HAS PROFILE' END as profile_status
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
ORDER BY au.created_at DESC; 