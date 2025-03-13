// Global types/interfaces

interface UserProfile {
  auth_id: string;
  user_profile_name: string;
  avatar_url?: string;
}

interface ProjectContributor {
  contributor_id: string;
  contributor?: UserProfile;
  user_is_project_creator?: boolean;
}

export interface ProjectsData {
  id: string;
  title: string;
  description: string;
  project_genre: string;
  is_completed: boolean;
  creator_id: string;
  creator: {
    auth_id: string;
    user_profile_name: string;
  } | null;
  created_at: Date;
  current_contributors_count: number;
  max_contributors: number;
  project_contributors?: ProjectContributor[];
}

export interface ProjectSnippet {
  id: string;
  project_id: string;
  creator_id: string;
  content: string;
  word_count: number;
  sequence_number: number;
  created_at: Date;
}

export interface ProjectContributors {
  id: string;
  project_id: string;
  user_id: string;
  joined_at: Date;
  last_contribution_at: Date;
  current_writer: boolean;
  user_made_contribution: boolean;
}
