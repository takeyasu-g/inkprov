import React, { useState, useEffect } from "react";
import { Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import CardHeaderWithMature from "@/components/ui/CardHeaderWithMature";
import { CompletedStoriesData } from "@/types/global";
import { supabase } from "@/utils/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

interface ProjectCardDataProp {
  projectData: CompletedStoriesData;
}

// Adds skeleton version of ProjectCard form Sessions
export const ProjectCardSkeleton: React.FC = () => {
  return (
    <Card className="w-full h-[300px] bg-card border-primary-border">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <Skeleton className="h-6 w-[200px]" />
            <Skeleton className="h-4 w-[150px]" />
          </div>
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </CardHeader>
      <div className="px-6">
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2 mt-2" />
      </div>
      <CardFooter className="flex justify-between items-center mt-auto">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-9 w-24" />
      </CardFooter>
    </Card>
  );
};

// ProjectCards
const ProjectCard: React.FC<ProjectCardDataProp> = ({ projectData }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isContributor, setIsContributor] = useState(false);
  const [isCreator, setIsCreator] = useState(false);

  // Check if user is a contributor of the story
  useEffect(() => {
    const checkContributorStatus = async () => {
      // check first if user exists, meaning authenticated and in session
      if (!user) return;

      // Check if current user is project creator
      if (user.id === projectData.creator_id) return setIsCreator(true);

      // Check if user is a contributor
      const { data: contributorData, error: contributorError } = await supabase
        .from("project_contributors")
        .select("*")
        .eq("project_id", projectData.id)
        .eq("user_id", user.id)
        .eq("user_made_contribution", true)
        .maybeSingle(); // if we can't find a project of user_id, do not return error

      if (contributorError) {
        return;
      } else {
        // Returns true user is in the project
        setIsContributor(!!contributorData);
      }
    };

    checkContributorStatus();
  }, [projectData, user]);

  const contributorsIcon = (
    <>
      <Users
        className={`p-0.5 ${
          isContributor || isCreator ? "text-green-600" : "text-secondary-text"
        }`}
      />
      <span className="text-secondary-text text-sm">
        {projectData.current_contributors_count}
      </span>
    </>
  );

  return (
    <Card
      className="w-[300px] h-[327px] bg-background-card cursor-pointer"
      onClick={() =>
        navigate(`/projects/${projectData.id}/read`, {
          state: { project: projectData },
        })
      }
    >
      {/* header of card => Genre, Title, Contributors */}
      <CardHeader className="flex-none space-y-3 h-[76px]">
        <CardHeaderWithMature
          genre={projectData.project_genre}
          isMatureContent={projectData.is_mature_content}
          rightContent={contributorsIcon}
        >
          <div className="flex flex-col gap-1">
            <CardTitle className="text-amber-900 text-left font-bold">
              {projectData.title}
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-secondary-text">started by:</span>
              <span className="text-sm font-medium">
                {isCreator
                  ? "You"
                  : projectData.users_ext.user_profile_name || "Anonymous"}
              </span>
            </div>
          </div>
        </CardHeaderWithMature>
      </CardHeader>
      <div className="bg-white h-[112px]">
        <CardDescription className="m-4 text-secondary-text text-center">
          {projectData.description}
        </CardDescription>
      </div>
      <CardFooter className="flex justify-between items-center">
        <span className="text-sm text-secondary-text">
          Completed: {new Date(projectData.updated_at).toLocaleDateString()}
        </span>
        <Button
          className="bg-primary-button hover:bg-primary-button-hover cursor-pointer"
          onClick={() =>
            navigate(`/projects/${projectData.id}/read`, {
              state: { project: projectData },
            })
          }
        >
          Read Story
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;
