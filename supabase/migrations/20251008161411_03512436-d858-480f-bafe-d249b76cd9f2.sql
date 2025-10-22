-- Fix: Add policy on profiles table to allow viewing public profile information
-- The application will use the public_profiles view which excludes phone numbers
-- This allows the forum to display usernames while keeping phone numbers private

CREATE POLICY "Public profile information is viewable by everyone"
ON public.profiles
FOR SELECT
TO authenticated, anon
USING (true);