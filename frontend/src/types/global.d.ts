// Global types/interfaces

interface UserProfile {
  auth_id: string;
  user_profile_name: string;
  avatar_url?: string;
}

interface UserProfilePopUp {
  id: string;
  user_profile_name: string;
  profile_pic_url?: string;
  user_email: string;
  is_instructor?: boolean;
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
  max_snippets: number;
  project_contributors?: ProjectContributor[];
  updated_at: Date;
  is_public: boolean;
  is_mature_content: boolean;
  current_snippets?: number;
}

// interface for just ProjectStoriesCompletedCards
export interface CompletedStoriesData {
  id: string;
  title: string; // Title of the project
  description: string; // User written description, hard-limited to 280 characters
  project_genre: string; // user-selected genre, string selected from "tags" fk
  creator_id: string;
  users_ext: {
    user_profile_name: string; // this the creator of the project, profile name
  }[0]; // this needs to be an array, as this is what supabase returns
  updated_at: string; // used for the completed Date, as this will be the last Date when lasted touched
  created_at: string;
  current_contributors_count: number; // provides the number of total project contributors (cumulative)
  is_mature_content: boolean;
}

export interface ProjectSnippet {
  id: string;
  project_id: string;
  creator_id: string;
  content: string;
  word_count: number;
  sequence_number: number;
  created_at: Date | string;
  creator?: {
    user_profile_name: string;
    is_instructor?: boolean;
  };
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

// interface for form input data in the create sessions page
export interface FormData {
  title: string;
  description: string;
  genre: string;
  maxSnippets: number;
  isPublic: boolean;
  isMature: boolean;
  content: string;
}
