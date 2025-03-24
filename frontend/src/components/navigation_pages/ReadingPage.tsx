import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { ProjectSnippet, ProjectsData, UserProfilePopUp } from "@/types/global";
import {
  getProjectOfId,
  getProjectSnippets,
  getUserProjectReaction,
  addOrUpdateProjectReaction,
  getProjectReactionCounts,
  getProfilesByUserIdsForPopUp,
} from "@/utils/supabase";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Button,
} from "@/components/ui";
import ContributorPopup from "@/components/ContributorPopup";
import { toast } from "sonner";

// adds reactions to the project
// cool, funny, sad, heartwarming, interesting, scary
// database table: reactions
import {
  ThumbsUp,
  Laugh,
  HeartCrack,
  Heart,
  Sparkles,
  Ghost,
  ChevronLeft,
} from "lucide-react";

// Define reaction types
const reactionTypes = [
  { type: "cool", icon: ThumbsUp, color: "#3b82f6", label: "Cool" },
  { type: "funny", icon: Laugh, color: "#f59e0b", label: "Funny" },
  { type: "sad", icon: HeartCrack, color: "#6b7280", label: "Sad" },
  {
    type: "heartwarming",
    icon: Heart,
    color: "#ef4444",
    label: "Moving",
  },
  {
    type: "interesting",
    icon: Sparkles,
    color: "#8b5cf6",
    label: "Interesting",
  },
  { type: "scary", icon: Ghost, color: "#10b981", label: "Scary" },
];

const ReadingPage: React.FC = () => {
  const { projectId } = useParams();

  // this gets the passed state from the projectCard => projectData
  const location = useLocation();
  const project = location.state?.project;
  const navigate = useNavigate();

  // useStates
  const [projectSnippets, setProjectSnippets] = useState<
    ProjectSnippet[] | null
  >();
  const [contributorsProfile, setContributorsProfile] = useState<
    UserProfilePopUp[] | []
  >([]);
  const [projectData, setProjectData] = useState<ProjectsData | null>();
  const [userReaction, setUserReaction] = useState<string | null>(null);
  const [reactionCounts, setReactionCounts] = useState<Record<string, number>>(
    {}
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleFetchProjectSnippets = async () => {
    try {
      const projectSnippetsData = await getProjectSnippets(projectId);

      if (!projectSnippetsData) {
        console.error("No data returned for project snippets");
      }

      setProjectSnippets(projectSnippetsData);

      // need to get unique contributors, in case a user contributed more then once
      const contributors = [
        ...new Set(projectSnippetsData?.map((snippet) => snippet.creator_id)),
      ];

      // get profileData for each contributors
      const profilesOfContributors = await getProfilesByUserIdsForPopUp(
        contributors
      );
      setContributorsProfile(profilesOfContributors);
    } catch (error) {
      console.error("Error fetching project snippets:", error);
    }
  };

  const handleFetchProjectData = async () => {
    if (!projectId) return;
    try {
      const projectData = await getProjectOfId(projectId);
      setProjectData(projectData);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReactions = async () => {
    if (!projectId) return;

    const userReaction = await getUserProjectReaction(projectId);
    setUserReaction(userReaction);

    const counts = await getProjectReactionCounts(projectId);
    setReactionCounts(counts);
  };

  // handle the user clicking on a reaction
  // users can react to a project with one of the 6 reactions
  const handleReactionClick = async (reactionType: string) => {
    if (!projectId || isLoading) return;

    setIsLoading(true);
    try {
      const newReaction = userReaction === reactionType ? null : reactionType;

      const success = await addOrUpdateProjectReaction(
        projectId,
        newReaction || ""
      );

      if (success) {
        setUserReaction(newReaction);

        const counts = await getProjectReactionCounts(projectId);
        setReactionCounts(counts);

        const reactionLabel =
          reactionTypes.find(
            (toastMessage) => toastMessage.type === newReaction
          )?.label || "";

        toast.success(
          newReaction
            ? `Marked this story as ${reactionLabel}`
            : "Reaction removed"
        );
      } else {
        toast.error("Couldn't update your reaction");
      }
    } catch (error) {
      console.error("Error updating reaction:", error);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  //useEffect on inital render
  useEffect(() => {
    handleFetchProjectSnippets();
    handleFetchProjectData();
    fetchReactions();
  }, [projectId]);

  return (
    <main className="h-full md:flex md:flex-col md:gap-5 py-6 lg:mb-15 md:px-4 md:mx-auto md:max-w-[800px] bg-white md:bg-background">
      <div className="bg-white md:bg-background px-5">
        <Button
          variant="outline"
          onClick={() => navigate(-1)} // go back where came from , so now if came from profile it will go back there
          className="text-sm bg-white md:bg-background"
        >
          <ChevronLeft />
          <span>Back</span>
        </Button>
      </div>
      <Card className="border-none shadow-none md:shadow-lg">
        <CardHeader className="mb-2">
          <CardTitle className="text-3xl font-bold text-primary-text mb-2">
            {project?.title || projectData?.title}
          </CardTitle>
          <div className="flex flex-wrap gap-4 items-center text-secondary-text">
            <Badge
              className={`genre-${
                projectData?.project_genre?.toLowerCase() || ""
              }`}
            >
              {projectData?.project_genre ||
                project?.project_genre ||
                "Unknown"}
            </Badge>
            <span className="text-secondary-text">
              Completed:{" "}
              {project?.updated_at || projectData?.updated_at
                ? new Date(
                    project?.updated_at || projectData?.updated_at
                  ).toDateString()
                : "No date found"}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pb-10">
          {projectSnippets?.map((snippet) => {
            const contributor = contributorsProfile.find(
              (profile) => profile.id === snippet.creator_id
            );

            return (
              <div key={snippet.id} className="flex items-start gap-2 ">
                {/* Reusable Contributor Popup */}
                <ContributorPopup
                  profile={
                    contributor || {
                      // had to pass this to make accepet null or undefined contribtor
                      id: "unknown",
                      user_profile_name: "Unknown",
                      user_email: "No email",
                      profile_pic_url: "https://ui-avatars.com/api/?name=?",
                    }
                  }
                />

                {/* Snippet Text */}
                <p className="pr-3 text-primary-text text-justify lg:text-left leading-relaxed indent-6 break-words whitespace-normal">
                  {snippet.content}
                </p>
              </div>
            );
          })}

          {projectData?.is_completed && (
            <div className="mt-8 border-t pt-4">
              <h3 className="text-primary-text text-center font-medium my-3">
                How did this story make you feel?
              </h3>
              <div className="flex flex-wrap gap-4 justify-center">
                <TooltipProvider>
                  {reactionTypes.map((reaction) => {
                    const Icon = reaction.icon;
                    const count = reactionCounts[reaction.type] || 0;
                    const isSelected = userReaction === reaction.type;

                    return (
                      <Tooltip key={reaction.type}>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => handleReactionClick(reaction.type)}
                            className={`reaction-btn flex flex-col items-center w-14 h-16 rounded-lg transition-all ${
                              isSelected
                                ? "bg-gray-100 dark:bg-gray-800 shadow-sm"
                                : "hover:bg-gray-50 dark:hover:bg-gray-800"
                            }`}
                            disabled={isLoading}
                            aria-label={`React with ${reaction.label}`}
                          >
                            <div className="flex items-center justify-center h-7 w-full mt-2">
                              <Icon
                                size={20}
                                color={isSelected ? reaction.color : "#6b7280"}
                                fill={isSelected ? reaction.color : "none"}
                                strokeWidth={isSelected ? 2.5 : 2}
                                className="transition-all"
                              />
                            </div>
                            {count > 0 && (
                              <span className="text-xs text-center text-tertiary-text mb-1">
                                {count}
                              </span>
                            )}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                          <p>
                            {isSelected
                              ? "Remove reaction"
                              : `Mark as ${reaction.label}`}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </TooltipProvider>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
};

export default ReadingPage;
