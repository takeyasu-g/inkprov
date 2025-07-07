-- Optimized PostgreSQL functions for project queries
-- These functions handle all logic in a single database call for maximum performance

-- Function to get popular/recent completed projects with most reactions
CREATE OR REPLACE FUNCTION get_popular_projects(p_user_id UUID DEFAULT NULL, p_limit INTEGER DEFAULT 10)
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
  reaction_count BIGINT,
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
    COUNT(r.reaction_id)::BIGINT as reaction_count,
    u.user_profile_name as creator_name,
    u.auth_id as creator_auth_id
  FROM projects p
  INNER JOIN users_ext u ON p.creator_id = u.auth_id
  LEFT JOIN reactions r ON p.id = r.project_id
  WHERE p.is_completed = true
    AND p.is_public = true
    AND (
      p_user_id IS NULL 
      OR EXISTS (
        SELECT 1 FROM users_ext cu 
        WHERE cu.auth_id = p_user_id 
        AND (cu.user_profile_mature_enabled = true OR p.is_mature_content = false)
      )
      OR p.is_mature_content = false
    )
  GROUP BY p.id, u.user_profile_name, u.auth_id
  ORDER BY 
    COUNT(r.reaction_id) DESC,  -- Sort by reaction count (most popular)
    p.updated_at DESC           -- Then by most recent
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recommended indexes for optimal performance
-- (These should be created in your Supabase database)
CREATE INDEX IF NOT EXISTS idx_reactions_project_id ON reactions(project_id);
CREATE INDEX IF NOT EXISTS idx_projects_is_completed_is_public ON projects(is_completed, is_public); 