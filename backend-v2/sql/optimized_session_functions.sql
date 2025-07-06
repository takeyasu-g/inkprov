-- Corrected function that properly determines who wrote last
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
    AND p.is_locked = false  -- Session is not locked
    AND (
      cu.user_profile_mature_enabled = true 
      OR p.is_mature_content = false
    )
    -- Check if user did NOT write the last snippet
    AND NOT EXISTS (
      SELECT 1 FROM project_snippets ps
      WHERE ps.project_id = p.id
      AND ps.creator_id = p_user_id
      AND ps.sequence_number = (
        SELECT MAX(sequence_number) 
        FROM project_snippets 
        WHERE project_id = p.id
      )
    )
  ORDER BY p.updated_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;