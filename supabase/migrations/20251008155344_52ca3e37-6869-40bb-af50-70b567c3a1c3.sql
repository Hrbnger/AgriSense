-- Fix profiles table security: restrict SELECT to user's own profile only
-- This prevents public access to sensitive personal information

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create a new restricted policy: users can only view their own profile
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = user_id);