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
  contributor_count: number;
  max_snippets: number;
  project_contributors?: ProjectContributor[];
  updated_at: Date;
  is_public: boolean;
  is_mature_content: boolean;
  word_count: number;
  current_snippets?: number;
  is_locked?: boolean;
  locked_by?: string;
  last_writer?: string;
  recent_contributions_count?: number;
  reaction_count?: number;
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
  reaction_count?: number; // number of reactions for the project
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

// New Interfaces for the Profile API Response

/**
 * Represents the basic user profile information.
 */
interface UserProfileV2 {
  user_profile_name: string;
  user_profile_bio: string | null;
  profile_pic_url: string;
  user_profile_mature_enabled: boolean;
  user_email: string;
}

/**
 * Contains the user's projects, categorized into completed and in-progress.
 */
interface UserProjects {
  completedProjects: ProjectsData[];
  inProgressProjects: ProjectsData[];
}

/**
 * Represents the user's gamification and activity statistics.
 * Based on the `user_gamification_stats` table.
 */
interface UserStats {
  user_id: string; // Corresponds to auth_id
  created_at: string;
  user_total_contribution: number;
  user_total_projects_created: number;
  user_total_wordcount: number;
  user_total_invites: number;
  user_total_score: number;
  user_total_logins: number;
  projects_completed: number;
  comments_made: number;
  likes_given: number;
  likes_received: number;
  unique_projects_contributed: number;
  attended_demo_day: number; // Using number for 0 or 1
  is_cc_instructor: number; // Using number for 0 or 1
}

/**
 * Defines the complete data structure for the response from the
 * GET /api/profile/:userId endpoint.
 */
interface ProfileApiResponse {
  profile: UserProfileV2;
  projects: UserProjects;
  stats: UserStats | null; // Can be null if no stats row exists for the user
  pictureOptions: string[];
}
