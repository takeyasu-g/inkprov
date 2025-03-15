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

// merge conflicts here came from the ProjectsData interface being rewritten by multiple developers
// currently every field on "Projects" Supabase table is represented on the ProjectsData interface, so no further refinements should be necessary 
/* Projects have a number of fields that should be populated by default on project creation:
  id
  title
  description
  genre
  is_completed (false by default)
  creator_id (who 'owns' the project?)
  created_at 
  total_contributors (should always be at least 1)
  current_contributors_count (should always be least 1)
  max_contributors (selected by the creator on project creation, should be a value between 1 and 5)
*/
export interface ProjectsData {
  id: string;
  title: string; // Title of the project
  description: string; // User written description, hard-limited to 280 characters
  project_genre: string; // user-selected genre, string selected from "tags" fk
  is_completed: boolean; // is the project completed - 'True' yes, 'False' still open for contributors and writers
  creator_id: string; // sourced from feat-adds-round-robin-writing-queue, 
  creator?: UserProfile; // sourced from main, using UserProfile interface to attach UserProfile
  created_at: Date; // source from feat-adds-round-robin-writing-queue, the date the project was created on as Date (converted to user-readable later)
  total_contributors: number; // sourced from man, provides the number of total project contributors (cumulative)
  current_contributors_count: number; // sourced from feat-adds-round-robin-writing-queue, the number of contributors currently on the project
  max_contributors: number; // sourced from feat-adds-round-robin-writing-queue, 
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