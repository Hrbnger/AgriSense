-- Add foreign key relationship from forum_posts to auth.users if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'forum_posts_user_id_fkey'
        AND table_name = 'forum_posts'
    ) THEN
        ALTER TABLE public.forum_posts
        ADD CONSTRAINT forum_posts_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;