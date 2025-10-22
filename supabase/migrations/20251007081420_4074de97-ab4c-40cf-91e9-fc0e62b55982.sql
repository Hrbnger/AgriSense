-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user roles enum
CREATE TYPE public.app_role AS ENUM ('farmer', 'expert', 'admin');

-- Create user_roles table for role management
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role app_role NOT NULL DEFAULT 'farmer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  full_name TEXT,
  phone TEXT,
  location TEXT,
  avatar_url TEXT,
  bio TEXT,
  badge_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create plants table
CREATE TABLE public.plants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  scientific_name TEXT,
  description TEXT,
  care_instructions TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.plants ENABLE ROW LEVEL SECURITY;

-- Create diseases table
CREATE TABLE public.diseases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  symptoms TEXT,
  treatment TEXT,
  prevention TEXT,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high')),
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.diseases ENABLE ROW LEVEL SECURITY;

-- Create plant_identifications table
CREATE TABLE public.plant_identifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  plant_id UUID REFERENCES public.plants(id),
  image_url TEXT NOT NULL,
  confidence DECIMAL(5,2),
  identified_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.plant_identifications ENABLE ROW LEVEL SECURITY;

-- Create disease_diagnoses table
CREATE TABLE public.disease_diagnoses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  disease_id UUID REFERENCES public.diseases(id),
  image_url TEXT NOT NULL,
  confidence DECIMAL(5,2),
  diagnosed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.disease_diagnoses ENABLE ROW LEVEL SECURITY;

-- Create forum_posts table
CREATE TABLE public.forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  is_reported BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;

-- Create forum_comments table
CREATE TABLE public.forum_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;

-- Create post_likes table
CREATE TABLE public.post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for profiles
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for plants
CREATE POLICY "Plants are viewable by everyone"
  ON public.plants FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage plants"
  ON public.plants FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for diseases
CREATE POLICY "Diseases are viewable by everyone"
  ON public.diseases FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage diseases"
  ON public.diseases FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for plant_identifications
CREATE POLICY "Users can view their own identifications"
  ON public.plant_identifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create identifications"
  ON public.plant_identifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for disease_diagnoses
CREATE POLICY "Users can view their own diagnoses"
  ON public.disease_diagnoses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create diagnoses"
  ON public.disease_diagnoses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for forum_posts
CREATE POLICY "Posts are viewable by everyone"
  ON public.forum_posts FOR SELECT
  USING (true);

CREATE POLICY "Users can create posts"
  ON public.forum_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
  ON public.forum_posts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
  ON public.forum_posts FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all posts"
  ON public.forum_posts FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for forum_comments
CREATE POLICY "Comments are viewable by everyone"
  ON public.forum_comments FOR SELECT
  USING (true);

CREATE POLICY "Users can create comments"
  ON public.forum_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON public.forum_comments FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all comments"
  ON public.forum_comments FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for post_likes
CREATE POLICY "Likes are viewable by everyone"
  ON public.post_likes FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own likes"
  ON public.post_likes FOR ALL
  USING (auth.uid() = user_id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  
  -- Assign default farmer role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'farmer');
  
  RETURN NEW;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_forum_posts_updated_at
  BEFORE UPDATE ON public.forum_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();