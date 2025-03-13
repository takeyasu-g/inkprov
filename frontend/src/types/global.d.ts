// Global types/interfaces

interface UserProfile {
  auth_id: string;
  user_profile_name: string;
  avatar_url?: string;
}

interface ProjectContributor {
  contributor_id: string;
  contributor?: UserProfile;
}

export interface ProjectsData {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  project_genre: string;
  current_contributors_count: number;
  max_contributors: number;
  is_mature_content: boolean;
  is_public: boolean;
  created_at: Date;
  updated_at: Date;
  is_completed: boolean;
  total_contributors: number;
  creator?: UserProfile;
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
