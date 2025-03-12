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
  current_contributors_quantity: number;
  max_contributors: number;
  is_mature_content: boolean;
  is_public: boolean;
  created_at: Date;
  updated_at: Date;
  is_completed: boolean;
  total_contributors: number;
  current_contributors_count: number;
  creator?: UserProfile;
  project_contributors?: ProjectContributor[];
}

// export interface ProjectCardData {
//   id: string;
//   creatorId: string;
//   title: string;
//   description: string;
//   genre: string;
//   totalContributors: number;
//   dateCompleted: Date;
//   isMature: boolean;
// }
