// Global types/interfaces

export interface ProjectsData {
  id: string; // not sure if this will be a number or sting
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
