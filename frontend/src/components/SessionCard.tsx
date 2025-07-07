import React, { useEffect, useState } from "react";
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
import { CircularProgress } from "@/components/ui/progress";
import { ProjectsData } from "@/types/global";
import { useTranslation } from "react-i18next";
import { supabase } from "@/utils/supabase";

interface SessionCardDataProp {
  sessionData: ProjectsData;
}

const SessionCard: React.FC<SessionCardDataProp> = ({
  sessionData,
}): React.ReactElement => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const maxSnippets = sessionData.max_snippets;
  const currentSnippets = sessionData.current_snippets ?? 0;
  const [isLocked, setIsLocked] = useState(sessionData.is_locked ?? false);
  const [isLastWriter, setIsLastWriter] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isCreator, setIsCreator] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUserId(user?.id ?? null);

      if (user?.id) {
        // Check if user is the creator of the session
        setIsCreator(user.id === sessionData.creator_id);
        
        // Get the most recent snippet for this project
        const { data: latestSnippet } = await supabase
          .from("project_snippets")
          .select("creator_id")
          .eq("project_id", sessionData.id)
          .order("sequence_number", { ascending: false })
          .limit(1)
          .single();

        // Check if the current user is the creator of the most recent snippet
        setIsLastWriter(latestSnippet?.creator_id === user.id);
      }
    };
    fetchUser();
  }, [sessionData.id, sessionData.creator_id]);

  useEffect(() => {
    const channel = supabase
      .channel(`project-lock-${sessionData.id}`)
      .on<ProjectsData>(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "projects",
          filter: `id=eq.${sessionData.id}`,
        },
        (payload) => {
          setIsLocked(payload.new.is_locked ?? false);
        }
      )
      .subscribe();

    // Listen for changes to project_snippets to detect new contributions
    const snippetsChannel = supabase
      .channel(`project-snippets-${sessionData.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "project_snippets",
          filter: `project_id=eq.${sessionData.id}`,
        },
        async (payload) => {
          if (currentUserId) {
            // Check if the new snippet was created by the current user
            setIsLastWriter(payload.new.creator_id === currentUserId);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(snippetsChannel);
    };
  }, [sessionData.id, currentUserId]);

  const getPhase = () => {
    const progress = (currentSnippets / maxSnippets) * 100;
    if (progress <= 33) return "Intro";
    if (progress <= 66) return "Body";
    return "Conclusion";
  };

  const progressCircle = (
    <div className="flex flex-col items-center gap-0.5 min-w-[50px]">
      <CircularProgress
        progress={(currentSnippets / maxSnippets) * 100}
        size={38}
        strokeWidth={3.5}
      >
        <span className="text-[11px] font-medium">{`${currentSnippets}/${maxSnippets}`}</span>
      </CircularProgress>
      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
        {getPhase()}
      </span>
    </div>
  );

  const renderStatusIndicator = () => {
    // Calculate if this is a new session (created within last 7 days)
    const isNew =
      new Date().getTime() - new Date(sessionData.created_at).getTime() <
      7 * 24 * 60 * 60 * 1000;

    // Calculate if this session needs an ending
    const needsEnding =
      currentSnippets >= Math.floor(maxSnippets * 0.7) &&
      currentSnippets < maxSnippets;

    // Calculate if this session is almost done
    const almostDone =
      currentSnippets >= maxSnippets - 2 && currentSnippets < maxSnippets - 1;

    // Calculate if this session is "hot" (3 or more snippets in the last week)
    const isHot = currentSnippets >= 3 && 
      (new Date().getTime() - new Date(sessionData.updated_at).getTime() < 
      7 * 24 * 60 * 60 * 1000);

    // Return the highest priority status
    if (needsEnding) {
      return (
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-[11px] font-medium text-orange-500 cursor-help">
                *Needs Ending !
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Need final snippet for the conclusion</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    
    // Priority 2: Almost Done
    if (almostDone) {
      return (
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-[11px] font-medium text-purple-500 cursor-help">
                *Almost Done !
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Try to wrap up the story</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    
    // Priority 3: Hot
    if (isHot) {
      return (
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-[11px] font-medium text-red-500 cursor-help">
                *Hot
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Active session with recent contributions</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    
    // Priority 4: New
    if (isNew) {
      return (
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-[11px] font-medium text-emerald-600 cursor-help">
                *New
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Created recently</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    
    return null;
  };

  const matureContent = sessionData.is_mature_content ? (
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
      onClick={() => navigate(`/writing/${sessionData.id}`)}
    >
      <div className="absolute top-0.5 left-4 z-10">
        {renderStatusIndicator()}
      </div>
      <CardHeader className="flex-none px-4">
        <div className="relative">
          <div className="absolute top-0 right-0">
            {progressCircle}
          </div>
          <div className="flex flex-col gap-2">
            <div>
              <Badge className={`genre-${sessionData.project_genre.toLowerCase()}`}>
                {t(`genres.${sessionData.project_genre.toLowerCase()}`)}
              </Badge>
            </div>
            <div className="flex flex-col justify-start h-[68px]">
              <div className="flex items-start pr-12">
                <CardTitle className="text-amber-900 text-left font-bold leading-tight">
                  {sessionData.title}
                </CardTitle>
                {matureContent}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-secondary-text">Started by: </span>
                <span className="text-sm font-medium">
                  {isCreator 
                    ? t("you") 
                    : sessionData.creator?.user_profile_name || t("anonymous")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <div className="flex-grow bg-white flex items-center justify-center overflow-hidden px-4">
        <div className="w-full h-[110px] overflow-y-auto custom-scrollbar flex items-center">
          <CardDescription className="text-secondary-text text-center py-2 w-full">
            {sessionData.description}
          </CardDescription>
        </div>
      </div>
      <div className="flex-none px-4 py-2 text-sm h-[34px]">
        {isLocked ? (
          <span className="text-amber-600">Someone is writing...</span>
        ) : isLastWriter ? (
          <span className="text-red-500">You wrote last</span>
        ) : null}
      </div>
    </Card>
  );
};

export default SessionCard;
