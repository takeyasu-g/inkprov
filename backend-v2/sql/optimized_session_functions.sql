-- Optimized PostgreSQL functions for session queries (FIXED VERSION)
-- These functions handle all logic in a single database call for maximum performance

-- Function to get user's contributable sessions (sessions where user can write now)
CREATE OR REPLACE FUNCTION get_user_contributable_sessions(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  title VARCHAR,
  description TEXT,
  creator_id UUID,
  is_public BOOLEAN,
  max_snippets INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  is_completed BOOLEAN,
  current_contributors_count SMALLINT,
  is_mature_content BOOLEAN,
  total_contributors SMALLINT,
  project_genre TEXT,
  is_locked BOOLEAN,
  locked_by UUID,
  locked_at TIMESTAMPTZ,
  user_profile_name TEXT,
  current_snippets SMALLINT,
  creator_name TEXT,
  creator_auth_id UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.description,
    p.creator_id,
    p.is_public,
    p.max_snippets,
    p.created_at,
    p.updated_at,
    p.is_completed,
    p.current_contributors_count,
    p.is_mature_content,
    p.total_contributors,
    p.project_genre,
    p.is_locked,
    p.locked_by,
    p.locked_at,
    p.user_profile_name,
    p.current_snippets,
    u.user_profile_name as creator_name,
    u.auth_id as creator_auth_id
  FROM projects p
  INNER JOIN project_contributors pc ON p.id = pc.project_id
  INNER JOIN users_ext u ON p.creator_id = u.auth_id
  INNER JOIN users_ext cu ON cu.auth_id = p_user_id
  WHERE p.is_completed = false
    AND pc.user_id = p_user_id
    AND pc.current_writer = false  -- User is not currently writing
    AND pc.user_made_contribution = false  -- User didn't write last snippet
    AND p.is_locked = false  -- Session is not locked
    AND (
      cu.user_profile_mature_enabled = true 
      OR p.is_mature_content = false
    )
  ORDER BY p.updated_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all active sessions (public endpoint)
CREATE OR REPLACE FUNCTION get_all_active_sessions(p_user_id UUID DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  title VARCHAR,
  description TEXT,
  creator_id UUID,
  is_public BOOLEAN,
  max_snippets INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  is_completed BOOLEAN,
  current_contributors_count SMALLINT,
  is_mature_content BOOLEAN,
  total_contributors SMALLINT,
  project_genre TEXT,
  is_locked BOOLEAN,
  locked_by UUID,
  locked_at TIMESTAMPTZ,
  user_profile_name TEXT,
  current_snippets SMALLINT,
  creator_name TEXT,
  creator_auth_id UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.description,
    p.creator_id,
    p.is_public,
    p.max_snippets,
    p.created_at,
    p.updated_at,
    p.is_completed,
    p.current_contributors_count,
    p.is_mature_content,
    p.total_contributors,
    p.project_genre,
    p.is_locked,
    p.locked_by,
    p.locked_at,
    p.user_profile_name,
    p.current_snippets,
    u.user_profile_name as creator_name,
    u.auth_id as creator_auth_id
  FROM projects p
  INNER JOIN users_ext u ON p.creator_id = u.auth_id
  WHERE p.is_completed = false
    AND (
      p_user_id IS NULL 
      OR EXISTS (
        SELECT 1 FROM users_ext cu 
        WHERE cu.auth_id = p_user_id 
        AND (cu.user_profile_mature_enabled = true OR p.is_mature_content = false)
      )
      OR p.is_mature_content = false
    )
  ORDER BY p.updated_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recommended indexes for optimal performance
-- (These should be created in your Supabase database)

-- Index for project_contributors lookups
CREATE INDEX IF NOT EXISTS idx_project_contributors_user_id ON project_contributors(user_id);
CREATE INDEX IF NOT EXISTS idx_project_contributors_project_id ON project_contributors(project_id);
CREATE INDEX IF NOT EXISTS idx_project_contributors_current_writer ON project_contributors(current_writer);
CREATE INDEX IF NOT EXISTS idx_project_contributors_user_made_contribution ON project_contributors(user_made_contribution);

-- Composite index for the main query
CREATE INDEX IF NOT EXISTS idx_project_contributors_efficient ON project_contributors(user_id, current_writer, user_made_contribution);

-- Index for projects queries
CREATE INDEX IF NOT EXISTS idx_projects_is_completed ON projects(is_completed);
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON projects(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_is_locked ON projects(is_locked);
CREATE INDEX IF NOT EXISTS idx_projects_is_mature_content ON projects(is_mature_content);

-- Composite index for the main projects query
CREATE INDEX IF NOT EXISTS idx_projects_efficient ON projects(is_completed, is_locked, is_mature_content, updated_at DESC);