// container component for WritingPage

"use client";

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
const API_BASE_URL =
  (import.meta.env.VITE_BACKEND_URL as string) || "http://localhost:8080";

// Sonner component for toast notifications
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Crown, Loader2, Lightbulb, Clock, ChevronLeft } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChalkboard } from "@fortawesome/free-solid-svg-icons";
import {
  supabase,
  getCurrentUser,
  getProjectContributors,
  getProjectSnippets,
} from "../../utils/supabase";
import SnippetSkeleton from "../SnippetSkeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { ProjectSnippet } from "@/types/global";
import { useAuth } from "@/contexts/AuthContext";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useTranslation } from "react-i18next";

// Basic interfaces for our data
interface Project {
  id: string;
  title: string;
  description: string;
  max_snippets: number;
  current_contributors_count: number;
  is_completed: boolean;
  is_locked: boolean;
  locked_by?: string;
  locked_at?: string;
}

// Use the imported type instead of redefining it
// interface ProjectSnippet {
//   content: string;
//   creator_id: string;
//   sequence_number: number;
//   created_at: string;
//   creator?: {
//     user_profile_name: string;
//   };
// }

// Interface for contributor (imported from supabase utils)
interface Contributor {
  id: string;
  user_id: string;
  project_id: string;
  user_made_contribution: boolean;
  current_writer: boolean;
  joined_at?: string;
  last_contribution_at?: string;
  user?: {
    id: string;
    user_profile_name: string;
    avatar_url?: string;
    is_instructor?: boolean;
  };
  user_is_project_creator: boolean;
}

// to log errors without showing in console in production
const logDevError = (error: unknown) => {
  if (import.meta.env.DEV) {
    console.error("[DEV]", error);
  }
};

const WritingEditor: React.FC = () => {
  const { t } = useTranslation();
  const { projectId } = useParams();
  const navigate = useNavigate();

  // State management
  const [project, setProject] = useState<Project | null>(null);
  const [isCurrentlyWriting, setIsCurrentlyWriting] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [previousSnippets, setPreviousSnippets] = useState<ProjectSnippet[]>(
    []
  );
  const [userData, setUserData] = useState<{ auth_id: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [loadingContributors, setLoadingContributors] = useState(false);
  const [isProjectCreator, setIsProjectCreator] = useState(false);
  const [projectLocked, setProjectLocked] = useState(false);
  const [lockedBy, setLockedBy] = useState<string | null>(null);
  const [showWritersBlockIdeas, setShowWritersBlockIdeas] =
    useState<boolean>(false);
  const [writingIdeas, setWritingIdeas] = useState<string>("");
  // State to track if writing ideas have been viewed (Avoids Spamming API Calls)
  const [writingIdeasViewed, setWritingIdeasViewed] = useState<boolean>(false);

  // New state for timer
  const [timeRemaining, setTimeRemaining] = useState<number>(600); // 10 minutes in seconds
  const [timerActive, setTimerActive] = useState<boolean>(false);
  const [lockCleanupInterval, setLockCleanupInterval] = useState<number | null>(
    null
  );

  const { user } = useAuth();
  const localStorageKey = `draftText_${user?.id}_${projectId}`;
  const [content, setContent] = useLocalStorage(localStorageKey, "");

  // Function to fetch contributors - simplified version
  const fetchContributors = async () => {
    if (!projectId) return;

    setLoadingContributors(true);
    try {
      const contributorsData = await getProjectContributors(projectId);

      // Sort contributors by joined_at to ensure consistent display order
      const sortedContributors = [...contributorsData].sort(
        (a, b) =>
          new Date(a.joined_at || "").getTime() -
          new Date(b.joined_at || "").getTime()
      );

      setContributors(sortedContributors);

      // Check if current user is a contributor
      if (userData?.auth_id) {
        const myStatus = contributorsData.find(
          (c) => c.user_id === userData.auth_id
        );
        if (myStatus) {
          setIsProjectCreator(myStatus.user_is_project_creator || false);
        }
      }
    } catch (error) {
      // Error handling without logging
      logDevError(error); // Only shows in dev
    } finally {
      setLoadingContributors(false);
    }
  };

  // original code has been moved to supabase.tsx with other helper functions for better organization
  const fetchSnippets = async () => {
    setIsRefreshing(true);
    try {
      const snippets = await getProjectSnippets(projectId || "");
      if (snippets) {
        // redundancy
        setPreviousSnippets(snippets);
      } else {
        setPreviousSnippets([]);
      }
    } catch (error) {
      console.error("Error fetching snippets:", error);
      toast.error(t("toasts.snippetsError"));
      setPreviousSnippets([]);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Fetch project data and check lock status
  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        // Get current user
        const user = await getCurrentUser();

        if (!user) {
          toast.error(t("toasts.authRequired.description"));
          navigate("/login");
          return;
        }

        // Set user data directly from auth
        setUserData({ auth_id: user.id });

        // Fetch all data in parallel for better performance
        const [projectResult, snippets] = await Promise.all([
          // Fetch project details
          supabase.from("projects").select("*").eq("id", projectId).single(),

          // Fetch project snippets
          getProjectSnippets(projectId || ""),
        ]);

        const { data: projectData, error: projectError } = projectResult;

        if (projectError) throw projectError;

        // Cap max_snippets at 12 if a larger value is provided (shouldn't be possible but accounts for spooky behavior)
        const cappedProjectData = {
          ...projectData,
          max_snippets: projectData.max_snippets
            ? Math.min(projectData.max_snippets, 12)
            : 12,
        };

        setProject(cappedProjectData);

        // Set project lock status
        setProjectLocked(cappedProjectData.is_locked || false);
        setLockedBy(cappedProjectData.locked_by || null);
        setIsCurrentlyWriting(cappedProjectData.locked_by === user.id);

        // Process snippets
        if (snippets) {
          setPreviousSnippets(snippets);
        } else {
          setPreviousSnippets([]);
        }

        // Check if project has reached max snippets (using capped value)
        if (
          snippets &&
          snippets.length >= (cappedProjectData.max_snippets || 0) &&
          cappedProjectData.max_snippets > 0 &&
          !cappedProjectData.is_completed // Only update if not already marked as completed
        ) {
          // Mark project as completed if it's reached max snippets
          const { error: updateError } = await supabase
            .from("projects")
            .update({ is_completed: true })
            .eq("id", projectId);

          if (updateError) {
            // Handle error without logging
          } else {
            // Flag that sessions page needs to refresh data
            sessionStorage.setItem("refreshSessions", "true");
          }
        }
      } catch (error) {
        toast.error(`${error}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId, navigate]);

  // Function to check for and clean up stale locks
  // TODO: Might need to move to a helper function, currently its specific to this component
  const checkForStaleLocks = async () => {
    try {
      // Don't run if no project ID is available ( API call prevention edge handling)
      if (!projectId) return;

      // Skip check if the project is not locked or if the current user is the one writing (API call prevention)
      if (!projectLocked || lockedBy === userData?.auth_id) {
        return;
      }

      // Get current time
      const now = new Date();

      // Get the current project data
      const { data: currentProject, error: projectError } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();

      if (projectError || !currentProject) {
        return;
      }

      // IF project is locked and has a locked_at timestamp
      if (currentProject.is_locked && currentProject.locked_at) {
        const lockedTime = new Date(currentProject.locked_at);
        const timeDiffMinutes =
          (now.getTime() - lockedTime.getTime()) / (1000 * 60);

        // If locked for more than 10 minutes, force unlock it
        if (timeDiffMinutes >= 10) {
          const { error: unlockError } = await supabase
            .from("projects")
            .update({
              is_locked: false,
              locked_by: null,
              locked_at: null,
            })
            .eq("id", projectId);

          if (unlockError) {
            return;
          }

          // Update local state if we're viewing this project
          setProjectLocked(false);
          setLockedBy(null);

          toast.info(t("toasts.inactivity"));

          // Refresh project data
          fetchProject();
        }
      }
    } catch (error) {
      // Error handling without console lo
      logDevError(error); // Only shows in dev
    }
  };

  // Fetches the most recent project data
  const fetchProject = async () => {
    try {
      const { data: projectData, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();

      if (error) {
        // Handle error without logging
        return;
      }

      if (projectData) {
        setProject(projectData);
        setProjectLocked(projectData.is_locked);
        setLockedBy(projectData.locked_by || null);
      }
    } catch (error) {
      // Handle error without logging
      logDevError(error); // Only shows in dev
    }
  };

  // Set up periodic lock check when component mounts
  useEffect(() => {
    // Start the interval
    const interval = window.setInterval(checkForStaleLocks, 15000); // Check every 15 seconds
    setLockCleanupInterval(interval);

    // Run once at component mount
    checkForStaleLocks();

    // Clean up the interval when the component unmounts
    return () => {
      if (lockCleanupInterval) {
        clearInterval(lockCleanupInterval);
      }
    };
  }, [projectId, userData]);

  // Set up real-time subscription for project lock changes
  useEffect(() => {
    if (!projectId) return;

    // Subscribe to project lock changes
    const subscription = supabase
      .channel(`project-lock-${projectId}`)
      .on(
        "postgres_changes",
        {
          event: "*", // Listen for all events (INSERT, UPDATE, DELETE)
          schema: "public",
          table: "projects",
          filter: `id=eq.${projectId}`,
        },
        (payload) => {
          // Only process updates (not deletes or inserts)
          if (payload.eventType === "UPDATE") {
            const updatedProject = payload.new as any;

            setProjectLocked(updatedProject.is_locked || false);
            setLockedBy(updatedProject.locked_by || null);
            setIsCurrentlyWriting(
              (updatedProject.locked_by || null) === userData?.auth_id
            );

            // Update project object too
            setProject((prev) => {
              if (!prev) return updatedProject;
              return { ...prev, ...updatedProject };
            });
          }
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [projectId, userData?.auth_id]);

  // Modify handleStartContribution to use optimistic updates
  const handleStartContribution = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        toast.error(t("toasts.authRequired.description"));
        return;
      }

      if (project?.is_completed) {
        toast.error(t("toasts.completedStoryError"));
        return;
      }

      if (
        project?.max_snippets &&
        previousSnippets.length >= project.max_snippets
      ) {
        toast.error(t("toasts.maxSnippetsError"));
        return;
      }

      // First, verify project exists and is not already locked
      const { data: projectCheck, error: checkError } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();

      if (checkError) {
        toast.error("Error verifying project status. Please try again.");
        return;
      }

      if (!projectCheck) {
        toast.error("Project not found");
        return;
      }

      if (projectCheck.is_locked) {
        toast.error(toast.error(t("toasts.otherUserWritingError")));
        return;
      }

      // Optimistically update local state
      setProjectLocked(true);
      setLockedBy(user.id);
      setIsCurrentlyWriting(true);

      // Attempt to lock the project - no .single() or additional conditions

      // const { data: lockResult, error: lockError } = await supabase
      //   .from("projects")
      //   .update({
      //     is_locked: true,
      //     locked_by: user.id,
      //     locked_at: new Date().toISOString(),
      //   })
      //   .eq("id", projectId);

      // if (lockError) {
      //   // Revert optimistic update if lock fails
      //   setProjectLocked(false);
      //   setLockedBy(null);
      //   setIsCurrentlyWriting(false);
      //   toast.error("Failed to start contribution. Please try again.");
      //   return;
      // }

      // Start the timer when contribution begins
      setTimeRemaining(600); // Reset to 10 minutes
      setTimerActive(true);

      toast.success(t("toasts.collaborationSuccess"));
    } catch (error: any) {
      // Revert optimistic updates on any error
      setProjectLocked(false);
      setLockedBy(null);
      setIsCurrentlyWriting(false);
      toast.error(
        `${t("toasts.collaborationError")}: ${
          error.message || t("unknownError")
        }`
      );
    }
  };

  // Timer effect
  useEffect(() => {
    let timer: number | undefined;

    if (timerActive && timeRemaining > 0) {
      timer = window.setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
    } else if (timerActive && timeRemaining <= 0) {
      // Time's up - cancel writing and unlock project
      handleTimerExpired();
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [timerActive, timeRemaining]);

  // Handle timer expiration
  const handleTimerExpired = async () => {
    setTimerActive(false);
    setIsCurrentlyWriting(false);

    toast.warning(t("toasts.timerExpired"));

    // Reset content if user hasn't submitted
    setContent("");
    setWordCount(0);

    // Unlock the project in the database
    try {
      if (projectId) {
        // Check if the project has reached max snippets
        const { data: projectData, error: fetchError } = await supabase
          .from("projects")
          .select("*")
          .eq("id", projectId)
          .single();

        const { data: snippetsData, error: snippetsError } = await supabase
          .from("project_snippets")
          .select("id")
          .eq("project_id", projectId);

        if (!fetchError && !snippetsError && projectData && snippetsData) {
          const shouldComplete =
            projectData.max_snippets &&
            snippetsData.length >= projectData.max_snippets &&
            !projectData.is_completed;

          if (shouldComplete) {
            // Mark project as completed
            const { error: updateError } = await supabase
              .from("projects")
              .update({
                is_completed: true,
                is_locked: false,
                locked_by: null,
                locked_at: null,
              })
              .eq("id", projectId);

            if (updateError) {
              // Handle error without logging
            } else {
              toast.success(t("toasts.projectCompleted"));
              sessionStorage.setItem("refreshSessions", "true");
            }
          } else {
            // Just unlock the project
            const { error } = await supabase
              .from("projects")
              .update({
                is_locked: false,
                locked_by: null,
                locked_at: null,
              })
              .eq("id", projectId);

            if (error) {
              // Handle error without logging
            }
          }
        } else {
          // Fallback to just unlocking if there was an error fetching data
          const { error } = await supabase
            .from("projects")
            .update({
              is_locked: false,
              locked_by: null,
              locked_at: null,
            })
            .eq("id", projectId);

          if (error) {
            // Handle error without logging
          }
        }

        setProjectLocked(false);
        setLockedBy(null);
      }
    } catch (error) {
      // Handle error without logging
      logDevError(error); // Only shows in dev
    }
  };

  // Format time remaining as MM:SS
  // TODO: Human-readable format or just MM:SS? Which do we like? (I like MM:SS -D)
  const formatTimeRemaining = () => {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  // Get ideas from AI API
  const getWritingIdeas = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/ideas`, {
        prompt: previousSnippets[previousSnippets.length - 1].content,
      });
      setWritingIdeas(response.data);
    } catch (error) {
      // Handle error without logging
      logDevError(error); // Only shows in dev
    }
  };

  // Helper function to unlock the project
  const unlockProject = async () => {
    if (!projectId) return;

    try {
      // Only attempt to unlock if the current user is the one who locked it
      if (lockedBy !== userData?.auth_id) {
        return;
      }

      // Fetch the latest project data to ensure accurate check
      const { data: latestProject, error: fetchError } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();

      if (fetchError) {
        return;
      }

      if (!latestProject) {
        return;
      }

      // Get the latest snippet count from the database
      const { data: snippetsData, error: snippetsError } = await supabase
        .from("project_snippets")
        .select("id")
        .eq("project_id", projectId);

      if (snippetsError) {
        return;
      }

      const currentSnippetCount = snippetsData ? snippetsData.length : 0;

      // Check if project should be marked as completed
      if (
        latestProject?.max_snippets &&
        currentSnippetCount >= latestProject.max_snippets &&
        !latestProject.is_completed
      ) {
        // Mark project as completed
        const { error: completedError } = await supabase
          .from("projects")
          .update({
            is_completed: true,
            is_locked: false,
            locked_by: null,
            locked_at: null,
          })
          .eq("id", projectId);

        if (completedError) {
          // Handle error but don't log it
        } else {
          toast.success(t("toasts.projectCompleted"));
          // Flags that sessions page needs to refresh data
          sessionStorage.setItem("refreshSessions", "true");
        }
      } else {
        // Just unlock the project
        const { error } = await supabase
          .from("projects")
          .update({
            is_locked: false,
            locked_by: null,
            locked_at: null,
          })
          .eq("id", projectId);

        if (error) {
          return;
        }
      }

      // Update local state - don't rely solely on real-time updates
      setProjectLocked(false);
      setLockedBy(null);
      setIsCurrentlyWriting(false);
    } catch (error) {
      // Try a final fallback unlock if all else fails
      logDevError(error); // Only shows in dev
      try {
        await supabase
          .from("projects")
          .update({
            is_locked: false,
            locked_by: null,
            locked_at: null,
          })
          .eq("id", projectId);

        setProjectLocked(false);
        setLockedBy(null);
        setIsCurrentlyWriting(false);
      } catch (finalError) {
        // Handle error but don't log it
        logDevError(finalError); // Only shows in dev
      }
    }
  };

  // Modify handleSubmit to reset timer and unlock project on successful submission
  const handleSubmit = async () => {
    if (wordCount < 50 || wordCount > 100) {
      toast.error(t("toasts.wordCountErrorGeneral"));
      return;
    }

    try {
      if (!userData?.auth_id) {
        toast.error(t("toasts.noUserDataError"));
        return;
      }
      setIsSubmitting(true);

      const moderationResponse = await axios.post(`${API_BASE_URL}moderation`, {
        content: content,
      });

      // If content is flagged, display reason
      if (moderationResponse.data.flagged) {
        toast.error(
          `${t(
            "moderation.flagged"
          )} ${moderationResponse.data.reason.toLowerCase()}`
        );
        setIsSubmitting(false);
        return;
      }

      // Add the snippet
      const { error: snippetError } = await supabase
        .from("project_snippets")
        .insert({
          project_id: projectId,
          creator_id: userData.auth_id,
          content,
          word_count: wordCount,
          sequence_number: previousSnippets.length + 1,
          created_at: new Date().toISOString(),
        });

      if (snippetError) {
        console.error("Error adding new snippet:", snippetError);
        toast.error(
          `${t("toasts.contributionSubmitError")} ${snippetError.message}`
        );
        setIsSubmitting(false);
        return;
      }

      // Get the latest snippet count to check if we should mark the project as completed
      const { data: currentSnippets, error: snippetsCountError } =
        await supabase
          .from("project_snippets")
          .select("id")
          .eq("project_id", projectId);

      if (snippetsCountError) {
        console.error(
          "Error fetching current snippets count:",
          snippetsCountError
        );
      } else {
        const snippetCount = currentSnippets?.length || 0;

        // Check if this submission completes the project
        if (
          project?.max_snippets &&
          snippetCount >= project.max_snippets &&
          !project.is_completed
        ) {
          // We'll mark the project as completed later in unlockProject()
          // This serves as an additional check
        }
      }

      // Stop the timer and reset writing fields
      setTimerActive(false);
      setTimeRemaining(600);

      setIsCurrentlyWriting(false);
      setContent("");
      setWordCount(0);

      // Unlock the project
      await unlockProject();
      await fetchSnippets();
      await fetchContributors();

      // Toast the user
      toast.success(t("writingSession.content.contributionAddSuccess"));

      const { data: refreshedProject } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();

      if (refreshedProject) {
        setProject(refreshedProject);
      }

      setIsSubmitting(false);
    } catch (error: any) {
      toast.error(`t("writingSession.content.submitError") ${error}`);
      setIsSubmitting(false);
    }
    // when on Submit is clear localStorage
    localStorage.removeItem(localStorageKey);
  };

  const handleCancelWriting = async () => {
    // Reset the timer
    setTimerActive(false);
    setTimeRemaining(600);

    try {
      if (!userData?.auth_id || !projectId) {
        return;
      }

      setContent("");
      setWordCount(0);
      setIsCurrentlyWriting(false);

      // Only try to unlock if the current user is the one who locked it
      // There shouldn't be a way for the non-current user to see cancel button for another user, but handles spooky cases
      if (lockedBy === userData.auth_id) {
        const { error } = await supabase
          .from("projects")
          .update({
            is_locked: false,
            locked_by: null,
          })
          .eq("id", projectId);

        if (error) {
          return;
        }

        setProjectLocked(false);
        setLockedBy(null);
      }
    } catch (error) {
      // Error handling without console log
      logDevError(error); // Only shows in dev
    }

    // clear localStorage on cancel
    localStorage.removeItem(localStorageKey);
  };

  // Manual refresh
  const handleManualRefresh = async () => {
    try {
      await fetchContributors();
      await fetchSnippets();

      // Refresh project data to get current lock status
      const { data: refreshedProject, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();

      if (error) {
        // Handle error without logging
        return;
      }

      if (refreshedProject) {
        setProject(refreshedProject);
        setProjectLocked(refreshedProject.is_locked || false);
        setLockedBy(refreshedProject.locked_by || null);

        if (userData?.auth_id) {
          setIsCurrentlyWriting(
            refreshedProject.locked_by === userData.auth_id
          );
        }
      }
    } catch (error) {
      // Handle error without logging
      logDevError(error); // Only shows in dev
    }
  };

  // Handle word count
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    setWordCount(newContent.trim().split(/\s+/).filter(Boolean).length);
  };

  const handleDeleteProject = async () => {
    if (!window.confirm(t("writingSession.content.deleteProjectConfirm"))) {
      return;
    }

    try {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId);

      if (error) throw error;

      // Signal that sessions page needs to refresh data
      sessionStorage.setItem("refreshSessions", "true");

      toast.success(t("writingSession.content.form.deleteProjectSuccess"));
      navigate("/sessions");
    } catch (error) {
      toast.error(`${error}`);
    }
  };

  const renderContributors = (contributors: Contributor[]) => {
    // Always sort contributors by join date for consistent display
    // TODO: re-add "current writer" pen or quill icon
    const sortedContributors = [...contributors].sort(
      (a, b) =>
        new Date(a.joined_at || "").getTime() -
        new Date(b.joined_at || "").getTime()
    );

    return sortedContributors.map((contributor) => (
      <div key={contributor.id} className="flex items-center gap-2">
        {contributor.user_is_project_creator && <Crown className="text-gold" />}
        {contributor.user?.is_instructor && (
          <FontAwesomeIcon
            icon={faChalkboard}
            className="text-yellow-500"
            size="lg"
          />
        )}
        <span
          className={`text-sm font-medium px-3 py-1 rounded-full ${
            contributor.user_is_project_creator
              ? "bg-orange-500 text-white"
              : "bg-secondary text-black"
          }`}
        >
          {contributor.user?.user_profile_name || t("unknown")}
        </span>
      </div>
    ));
  };

  // Create a function to handle the Back to Sessions button click
  const handleBackClick = async () => {
    // If the current user is writing, cancel it before navigating away
    if (isCurrentlyWriting && lockedBy === userData?.auth_id) {
      await handleCancelWriting();
    }
    navigate(-1);
  };

  // Add a cleanup effect to unlock the project when the component unmounts
  useEffect(() => {
    return () => {
      // Only try to unlock if the current user is the one who locked it
      if (projectLocked && lockedBy === userData?.auth_id && projectId) {
        // Release the lock asynchronously (can't await in useEffect cleanup)
        const unlockProjectOnUnmount = async () => {
          try {
            await supabase
              .from("projects")
              .update({
                is_locked: false,
                locked_by: null,
                locked_at: null,
              })
              .eq("id", projectId);
          } catch (error) {
            // Handle error without logging
            logDevError(error); // Only shows in dev
          }
        };

        unlockProjectOnUnmount();
      }
    };
  }, [projectId, userData, projectLocked, lockedBy]);

  return (
    <div className="h-full md:flex md:flex-col md:gap-5 py-6 mb-15 md:px-4 md:mx-auto md:max-w-[800px] bg-white md:bg-background">
      <div className="bg-white md:bg-background px-5 text-secondary-text">
        <Button
          variant="outline"
          onClick={handleBackClick}
          className="text-sm bg-white md:bg-background hover:text-secondary-text cursor-pointer"
        >
          <ChevronLeft />
          <span>{t("back")}</span>
        </Button>
      </div>
      <Card className="border-none shadow-none md:shadow-lg">
        <CardHeader>
          <CardTitle className="flex justify-between items-center text-primary-text font-bold">
            <span className="text-lg">{project?.title || t("loading")}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualRefresh}
              disabled={isSubmitting || isRefreshing || loadingContributors}
              className="ml-2 text-secondary-text hover:text-secondary-text cursor-pointer"
            >
              {isRefreshing || loadingContributors ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t("refresh")
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            {isLoading ? (
              <Skeleton className="h-4 w-3/4" />
            ) : (
              <div>
                <p className="text-secondary-text text-justify mb-2">
                  {project?.description}
                </p>
                {project?.max_snippets && (
                  <div className="mt-3">
                    <p className="text-sm text-primary-text">
                      <span className="font-medium">{t("contributions")}</span>{" "}
                      {previousSnippets.length} / {project.max_snippets}
                      {project.is_completed && t("completed")}
                    </p>
                    <p className="text-xs text-secondary-text mt-1">
                      {t("writingSession.header.subtitle1")}
                    </p>
                    <p className="text-xs text-secondary-text">
                      {t("writingSession.header.subtitle2")}{" "}
                      {project.max_snippets * 50}-{project.max_snippets * 100}{" "}
                      {t("words")}
                    </p>
                    <p className="text-xs text-secondary-text mt-1 italic">
                      {t("writingSession.header.note")}
                    </p>
                  </div>
                )}
                {projectLocked &&
                  lockedBy &&
                  lockedBy !== userData?.auth_id && (
                    <p className="text-sm text-amber-500 mt-2 font-medium">
                      {t("writingSession.header.userCurrentlyWriting")}
                    </p>
                  )}
              </div>
            )}
          </div>

          <div className="mb-6 space-y-4">
            <h3 className="text-lg font-semibold text-primary-text">
              {t("writingSession.content.title")}
            </h3>
            {isLoading ? (
              <>
                <SnippetSkeleton />
                <SnippetSkeleton />
              </>
            ) : isRefreshing ? (
              <>
                {previousSnippets.map((snippet) => (
                  <div
                    key={snippet.sequence_number}
                    className="p-4 bg-secondary rounded-lg opacity-50 transition-opacity"
                  >
                    <p className="text-justify lg:text-left">
                      {snippet.content}
                    </p>
                    <p className="text-sm text-secondary-text mt-2 flex items-center gap-1">
                      {t("writingSession.content.contribution")} #
                      {snippet.sequence_number} {t("by")}{" "}
                      {snippet.creator?.user_profile_name || t("unknown")}
                      {snippet.creator?.is_instructor && (
                        <FontAwesomeIcon
                          icon={faChalkboard}
                          className="text-yellow-500"
                          size="lg"
                        />
                      )}
                    </p>
                  </div>
                ))}
                <SnippetSkeleton />
              </>
            ) : (
              previousSnippets.map((snippet) => (
                <div
                  key={snippet.sequence_number}
                  className="p-4 bg-secondary rounded-lg"
                >
                  <p className="text-justify lg:text-left">{snippet.content}</p>
                  <p className="text-sm text-secondary-text mt-2 flex items-center gap-1">
                    {t("writingSession.content.contribution")} #
                    {snippet.sequence_number} {t("by")}{" "}
                    {snippet.creator?.user_profile_name || t("unknown")}
                    {snippet.creator?.is_instructor && (
                      <FontAwesomeIcon
                        icon={faChalkboard}
                        className="text-yellow-500"
                        size="lg"
                      />
                    )}
                  </p>
                </div>
              ))
            )}
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-primary-text">
              {t("writingSession.content.form.contributors")}
            </h3>
            {loadingContributors ? (
              <div className="flex gap-2">
                <Skeleton className="h-8 w-24 rounded-full" />
                <Skeleton className="h-8 w-24 rounded-full" />
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {renderContributors(contributors)}
              </div>
            )}
          </div>

          {/* Writing Area - Only show when isCurrentlyWriting is true */}
          {isCurrentlyWriting ? (
            <div className="mb-4">
              {/* Timer display */}
              <div className="flex justify-end mb-3">
                <div
                  className={`flex items-center gap-1 ${
                    timeRemaining < 60 ? "text-red-500" : "text-amber-600"
                  }`}
                >
                  <Clock size={18} />
                  <span className="font-mono">{formatTimeRemaining()}</span>
                  <span className="text-sm">
                    {t("writingSession.content.form.textarea.timeRemaining")}
                  </span>
                </div>
              </div>

              <Textarea
                value={content}
                onChange={handleContentChange}
                placeholder={t(
                  "writingSession.content.form.textarea.placeholder"
                )}
                className="min-h-[200px] mb-2"
                disabled={isSubmitting}
              />
              <div className="flex flex-col">
                <div
                  onClick={() => {
                    setShowWritersBlockIdeas(!showWritersBlockIdeas);
                    if (!showWritersBlockIdeas) {
                      if (!writingIdeasViewed) {
                        getWritingIdeas();
                      }
                      setWritingIdeasViewed(true);
                    }
                  }}
                  className="flex justify-end text-secondary-text cursor-pointer my-3"
                >
                  <Lightbulb />
                  <p className="text-sm font-medium mt-1">
                    {t("writingSession.content.writersBlock")}
                  </p>
                </div>
                {showWritersBlockIdeas ? (
                  <div className="mb-3 rounded-lg">
                    <h3 className="text-lg font-semibold text-left mb-3 text-primary-text">
                      {t("writingSession.content.writingIdeas")}
                    </h3>
                    <div className="flex justify-start">
                      <Lightbulb className="text-primary-button-hover" />
                      <p className="text-left text-secondary-text">
                        {writingIdeas.length > 0
                          ? writingIdeas
                          : t("writingSession.content.noWritingIdeas")}
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
              <div className="flex justify-between items-center">
                <span
                  className={
                    wordCount > 100 || wordCount < 50
                      ? "text-red-500"
                      : "text-secondary-text"
                  }
                >
                  {wordCount} {t("words")}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleCancelWriting}
                    disabled={isSubmitting}
                    className="text-primary-button hover:text-primary-button-hover cursor-pointer"
                  >
                    {t("cancel")}
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={wordCount > 100 || wordCount < 50 || isSubmitting}
                    className="bg-primary-button hover:bg-primary-button-hover text-white cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("writingSession.content.form.submitLoading")}
                      </>
                    ) : (
                      t("writingSession.content.form.submitContribution")
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <Button
                onClick={handleStartContribution}
                className="w-full max-w-md bg-primary-button hover:bg-primary-button-hover text-white cursor-pointer"
                disabled={
                  isLoading ||
                  projectLocked ||
                  project?.is_completed === true ||
                  (project?.max_snippets !== undefined &&
                    previousSnippets.length >= project.max_snippets)
                }
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("loading")}
                  </>
                ) : project?.is_completed === true ||
                  (project?.max_snippets !== undefined &&
                    previousSnippets.length >= project.max_snippets) ? (
                  t("writingSession.content.projectCompleted")
                ) : projectLocked && lockedBy !== userData?.auth_id ? (
                  t("writingSession.header.userCurrentlyWriting")
                ) : (
                  t("makeContribution")
                )}
              </Button>
            </div>
          )}

          {/* Project creator actions */}
          {isProjectCreator && (
            <div className="flex justify-center mt-4">
              <Button
                className="bg-red-500 hover:bg-red-600 text-white cursor-pointer"
                onClick={handleDeleteProject}
              >
                {t("writingSession.content.form.deleteProject")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WritingEditor;
