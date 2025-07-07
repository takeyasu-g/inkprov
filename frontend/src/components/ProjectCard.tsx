import React, { useState, useEffect } from "react";
import { Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui";
import { CompletedStoriesData } from "@/types/global";
import { getProjectContributors, supabase } from "@/utils/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";

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
      <div className="px-4 mt-auto">
        <div className="flex justify-end">
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </Card>
  );
};

// ProjectCards
const ProjectCard: React.FC<ProjectCardDataProp> = ({ projectData }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isContributor, setIsContributor] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [totalContributors, setTotalContributors] = useState<number | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [isHot, setIsHot] = useState(false);

  // Check if user is a contributor of the story
  useEffect(() => {
    const checkContributorStatus = async () => {
      // check first if user exists, meaning authenticated and in session
      if (!user) return;

      // Check if current user is project creator
      if (user.id === projectData.creator_id) {
        setIsCreator(true);
      } else {
        // Check if user is a contributor
        const { data: contributorData, error: contributorError } = await supabase
          .from("project_contributors")
          .select("*")
          .eq("project_id", projectData.id)
          .eq("user_id", user.id)
          .eq("user_made_contribution", true)
          .maybeSingle(); // if we can't find a project of user_id, do not return error

        if (!contributorError) {
          // Returns true user is in the project
          setIsContributor(!!contributorData);
        }
      }

      // Always fetch contributors regardless of whether the user is creator or not
      const contributors = await getProjectContributors(projectData.id);
      setTotalContributors(contributors.length);
    };

    checkContributorStatus();
  }, [projectData, user]);

  useEffect(() => {
    const checkStoryStatus = () => {
      if (projectData.updated_at) {
        const updatedAt = new Date(projectData.updated_at);
        const currentDate = new Date();
        const diffInDays = Math.floor((currentDate.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24));
        if (diffInDays <= 7) {
          setIsNew(true);
        } else {
          setIsNew(false);
        }
        // Hot: 10 or more reactions in the last 30 days
        if ((projectData.reaction_count ?? 0) >= 10 && diffInDays <= 30) {
          setIsHot(true);
        } else {
          setIsHot(false);
        }
      }
    };
    checkStoryStatus();
  }, [projectData.updated_at, projectData.reaction_count]);

  const renderStatusIndicator = () => {
    // Priority 1: Hot
    if (isHot) {
      return (
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-[11px] font-medium text-red-500 cursor-help">*Hot</span>
            </TooltipTrigger>
            <TooltipContent>
              <p>10+ reactions in the last month</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    
    // Priority 2: New
    if (isNew) {
      return (
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-[11px] font-medium text-emerald-600 cursor-help">*New</span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Completed recently</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    
    return null;
  };

  const matureContent = projectData.is_mature_content ? (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center justify-center rounded-full bg-amber-100 w-5 h-5 ml-2 flex-shrink-0">
            <span className="text-[10px] font-medium text-amber-700">18+</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{t("matureContent")}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ) : null;

  return (
    <Card
      className="w-[300px] h-[327px] bg-background-card cursor-pointer hover:bg-accent/50 transition-colors flex flex-col relative"
      onClick={() =>
        navigate(`/projects/${projectData.id}/read`, {
          state: { project: projectData },
        })
      }
    >
      <div className="absolute top-0.5 left-4 z-10">
        {renderStatusIndicator()}
      </div>
      <CardHeader className="flex-none px-4">
        <div className="relative">
          <div className="absolute top-0 right-0 flex items-center gap-1">
            <Users className={`p-0.5 ${isContributor || isCreator ? "text-green-600" : "text-secondary-text"}`} />
            <span className="text-secondary-text text-sm">{totalContributors}</span>
          </div>
          <div className="flex flex-col gap-2">
            <div>
              <Badge className={`genre-${projectData.project_genre.toLowerCase()}`}>
                {t(`genres.${projectData.project_genre.toLowerCase()}`)}
              </Badge>
            </div>
            <div className="flex flex-col justify-start h-[68px]">
              <div className="flex items-start pr-12">
                <CardTitle className="text-amber-900 text-left font-bold leading-tight">
                  {projectData.title}
                </CardTitle>
                {matureContent}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-secondary-text">{t("startedby")}:</span>
                <span className="text-sm font-medium">
                  {isCreator
                    ? t("you")
                    : projectData.users_ext.user_profile_name || t("anonymous")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <div className="flex-grow bg-white flex items-center justify-center overflow-hidden px-4">
        <div className="w-full h-[110px] overflow-y-auto custom-scrollbar flex items-center">
          <CardDescription className="text-secondary-text text-center py-2 w-full">
            {projectData.description}
          </CardDescription>
        </div>
      </div>
      <div className="flex-none px-4 py-2 text-sm h-[34px] flex justify-end">
        <span className="text-gray-700">Reactions: {projectData.reaction_count || 0}</span>
      </div>
    </Card>
  );
};

export default ProjectCard;
