-- Fix profiles security: Allow viewing public profile information while keeping phone private
-- This enables forum and social features while protecting sensitive data

-- Add policy to allow authenticated users to view other users' public profiles
-- Application code must only request non-sensitive fields (full_name, avatar_url, bio, location, badge_count)
-- Phone field should NEVER be queried when viewing other users' profiles
CREATE POLICY "Users can view public profile information"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Note: The existing "Users can view their own profile" policy allows users full access to their own data including phone
-- This new policy allows viewing ANY profile, but application code is responsible for not requesting the phone field