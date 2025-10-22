-- Fix phone number exposure: Create a public view with only non-sensitive fields
-- This ensures phone numbers cannot be accessed when viewing other users' profiles

-- First, drop the overly permissive policy that exposes all columns
DROP POLICY IF EXISTS "Users can view public profile information" ON public.profiles;

-- Create a view that exposes only public profile information (excludes phone)
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  user_id,
  full_name,
  avatar_url,
  bio,
  location,
  badge_count,
  created_at,
  updated_at
FROM public.profiles;

-- Enable RLS on the view
ALTER VIEW public.public_profiles SET (security_invoker = true);

-- Grant access to the view
GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_profiles TO anon;

-- The existing "Users can view their own profile" policy on profiles table 
-- ensures users can still access their own phone numbers via the profiles table