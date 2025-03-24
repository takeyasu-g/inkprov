-- Attempt to replicate "seeds and migrations" on Supabase to populate the database with reactions
-- currently not working as expected

-- Create the reactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    reaction_cool BOOLEAN DEFAULT FALSE,
    reaction_funny BOOLEAN DEFAULT FALSE,
    reaction_sad BOOLEAN DEFAULT FALSE, 
    reaction_heartwarming BOOLEAN DEFAULT FALSE,
    reaction_interesting BOOLEAN DEFAULT FALSE,
    reaction_scary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, user_id)
);

-- Add comment to the table
COMMENT ON TABLE public.reactions IS 'Stores user reactions to completed projects';

-- Enable Row Level Security
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;

-- Create policies for reactions table

-- Policy to allow users to view all reactions (anyone can view reactions)
CREATE POLICY "Anyone can view project reactions"
    ON public.reactions 
    FOR SELECT 
    USING (true);

-- Policy to allow authenticated users to add their own reactions
CREATE POLICY "Authenticated users can add their own reactions"
    ON public.reactions 
    FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to update their own reactions
CREATE POLICY "Users can update their own reactions"
    ON public.reactions 
    FOR UPDATE 
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to delete their own reactions
CREATE POLICY "Users can delete their own reactions"
    ON public.reactions 
    FOR DELETE 
    TO authenticated
    USING (auth.uid() = user_id);

-- Add an additional check to ensure reactions are only added to completed projects
CREATE POLICY "Only allow reactions to completed projects"
    ON public.reactions 
    FOR INSERT 
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE id = project_id 
            AND is_completed = true
        )
    );

-- Add locking fields to projects table
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS locked_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS locked_at TIMESTAMP WITH TIME ZONE;

-- Add comment to explain the locking fields
COMMENT ON COLUMN public.projects.is_locked IS 'Indicates if the project is currently locked for writing';
COMMENT ON COLUMN public.projects.locked_by IS 'References the user who currently has the project locked';
COMMENT ON COLUMN public.projects.locked_at IS 'Timestamp when the project was locked'; 