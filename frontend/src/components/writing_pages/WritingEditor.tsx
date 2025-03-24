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
import { RealtimeChannel } from "@supabase/supabase-js";

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
  };
  user_is_project_creator: boolean;
}

const WritingEditor: React.FC = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  // State management
  const [project, setProject] = useState<Project | null>(null);
  const [isContributor, setIsContributor] = useState(false);
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

  const [lockSubscription, setLockSubscription] =
    useState<RealtimeChannel | null>(null);

  console.log(isContributor);

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
          setIsContributor(true);
          setIsProjectCreator(myStatus.user_is_project_creator || false);
        }
      }
    } catch (error) {
      console.error("Failed to load contributors:", error);
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
      toast.error("Failed to refresh snippets");
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
          toast.error("Please log in to view this project");
          navigate("/login");
          return;
        }

        // Set user data directly from auth
        setUserData({ auth_id: user.id });

        // Fetch all data in parallel for better performance
        const [projectResult, contributorData, snippets] = await Promise.all([
          // Fetch project details
          supabase.from("projects").select("*").eq("id", projectId).single(),

          // Check if user is a contributor
          supabase
            .from("project_contributors")
            .select("*, user:user_id(*)")
            .eq("project_id", projectId)
            .eq("user_id", user.id)
            .single(),

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

        // Set contributor status
        setIsContributor(!!contributorData.data);
        setIsProjectCreator(
          contributorData.data?.user_is_project_creator || false
        );

        // Fetch project contributors (moved to supabase.tsx)
        const contributorsData = await getProjectContributors(projectId);

        // Sort contributors by joined_at to ensure consistent display order
        const sortedContributors = [...contributorsData].sort(
          (a, b) =>
            new Date(a.joined_at || "").getTime() -
            new Date(b.joined_at || "").getTime()
        );

        setContributors(sortedContributors);

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
            console.error("Error marking project as completed:", updateError);
          } else {
            console.log(
              "Project automatically marked as completed due to max snippets reached"
            );
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
        console.error("Error fetching project for lock check:", projectError);
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
            console.error("Error unlocking stale project:", unlockError);
            return;
          }

          // Update local state if we're viewing this project
          setProjectLocked(false);
          setLockedBy(null);

          toast.info(
            "Project was automatically unlocked after 10 minutes of inactivity"
          );

          // Refresh project data
          fetchProject();
        }
      }
    } catch (error) {
      console.error("Error in checkForStaleLocks:", error);
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
        console.error("Error fetching project data:", error);
        return;
      }

      if (projectData) {
        setProject(projectData);
        setProjectLocked(projectData.is_locked);
        setLockedBy(projectData.locked_by || null);
      }
    } catch (error) {
      console.error("Error in fetchProject:", error);
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

    console.log(`Setting up real-time subscription for project ${projectId}`);

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
          console.log("Received real-time update:", {
            old: payload.old,
            new: payload.new,
            event: payload.eventType,
          });

          // Only process updates (not deletes or inserts)
          if (payload.eventType === "UPDATE") {
            const updatedProject = payload.new as any;
            console.log("Updating local state with new project data:", {
              is_locked: updatedProject.is_locked,
              locked_by: updatedProject.locked_by,
              iam: userData?.auth_id,
            });

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
      .subscribe((status) => {
        console.log("Subscription status:", status);
      });

    setLockSubscription(subscription);

    // Cleanup subscription on unmount
    return () => {
      if (subscription) {
        console.log("Cleaning up subscription for project:", projectId);
        subscription.unsubscribe();
      }
    };
  }, [projectId, userData?.auth_id]);

  // Modify handleStartContribution to use optimistic updates
  const handleStartContribution = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        toast.error("Please log in to contribute to this project");
        return;
      }

      console.log("Starting contribution process:", {
        projectId,
        userId: user.id,
        currentLockStatus: {
          isLocked: project?.is_locked,
          lockedBy: project?.locked_by,
          lockedAt: project?.locked_at,
        },
      });

      if (project?.is_completed) {
        toast.error("This project is already completed");
        return;
      }

      if (
        project?.max_snippets &&
        previousSnippets.length >= project.max_snippets
      ) {
        toast.error("This project has reached its maximum number of snippets");
        return;
      }

      // First, verify project exists and is not already locked
      const { data: projectCheck, error: checkError } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();

      if (checkError) {
        console.error("Error verifying project:", checkError);
        toast.error("Error verifying project status. Please try again.");
        return;
      }

      if (!projectCheck) {
        toast.error("Project not found");
        return;
      }

      if (projectCheck.is_locked) {
        console.log("Project is already locked:", {
          lockedBy: projectCheck.locked_by,
          lockedAt: projectCheck.locked_at,
        });
        toast.error(
          `Someone else is currently writing. Please try again later.`
        );
        return;
      }

      // Optimistically update local state
      setProjectLocked(true);
      setLockedBy(user.id);
      setIsCurrentlyWriting(true);

      console.log("Attempting to lock project in database");
      // Attempt to lock the project - no .single() or additional conditions
      const { data: lockResult, error: lockError } = await supabase
        .from("projects")
        .update({
          is_locked: true,
          locked_by: user.id,
          locked_at: new Date().toISOString(),
        })
        .eq("id", projectId);

      if (lockError) {
        console.error("Failed to lock project:", lockError);
        // Revert optimistic update if lock fails
        setProjectLocked(false);
        setLockedBy(null);
        setIsCurrentlyWriting(false);
        toast.error("Failed to start contribution. Please try again.");
        return;
      }

      console.log("Successfully locked project");

      // Start the timer when contribution begins
      setTimeRemaining(600); // Reset to 10 minutes
      setTimerActive(true);

      toast.success(
        "You can now write your contribution! You have 10 minutes to submit."
      );
    } catch (error: any) {
      // Revert optimistic updates on any error
      setProjectLocked(false);
      setLockedBy(null);
      setIsCurrentlyWriting(false);
      console.error("Start contribution error:", error);
      toast.error(
        `Failed to start contribution: ${error.message || "Unknown error"}`
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

    toast.warning("Time's up! The project has been unlocked.");

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
              console.error("Error completing project:", updateError);
            } else {
              console.log(
                "Project automatically marked as completed due to max snippets reached"
              );
              toast.success(
                "Project completed - maximum contributions reached!"
              );
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
              console.error("Error unlocking project:", error);
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
            console.error("Error unlocking project:", error);
          }
        }

        setProjectLocked(false);
        setLockedBy(null);
      }
    } catch (error) {
      console.error("Error in handleTimerExpired:", error);
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
      console.error("Error fetching writing ideas:", error);
    }
  };

  // Helper function to unlock the project
  const unlockProject = async () => {
    if (!projectId) return;

    try {
      console.log("Starting unlock process:", {
        projectId,
        currentUserId: userData?.auth_id,
        currentLockStatus: {
          isLocked: project?.is_locked,
          lockedBy: project?.locked_by,
          lockedAt: project?.locked_at,
        },
      });

      // Only attempt to unlock if the current user is the one who locked it
      if (lockedBy !== userData?.auth_id) {
        console.log(
          "Not unlocking project - current user is not the lock owner"
        );
        return;
      }

      // Fetch the latest project data to ensure accurate check
      const { data: latestProject, error: fetchError } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();

      if (fetchError) {
        console.error("Error fetching latest project data:", fetchError);
        return;
      }

      if (!latestProject) {
        console.error("Project not found during unlock");
        return;
      }

      console.log("Latest project data:", latestProject);

      // Get the latest snippet count from the database
      const { data: snippetsData, error: snippetsError } = await supabase
        .from("project_snippets")
        .select("id")
        .eq("project_id", projectId);

      if (snippetsError) {
        console.error("Error fetching snippets:", snippetsError);
        return;
      }

      const currentSnippetCount = snippetsData ? snippetsData.length : 0;

      // Check if project should be marked as completed
      if (
        latestProject?.max_snippets &&
        currentSnippetCount >= latestProject.max_snippets &&
        !latestProject.is_completed
      ) {
        console.log("Project reached max snippets, marking as completed");
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
          console.error("Error marking project as completed:", completedError);
        } else {
          console.log("Successfully marked project as completed");
          toast.success("Project completed! This was the final contribution.");
          sessionStorage.setItem("refreshSessions", "true");
        }
      } else {
        console.log("Unlocking project without marking as completed");
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
          console.error("Error unlocking project:", error);
          return;
        }

        console.log("Successfully unlocked project");
      }

      // Update local state - don't rely solely on real-time updates
      setProjectLocked(false);
      setLockedBy(null);
      setIsCurrentlyWriting(false);
    } catch (error) {
      console.error("Error in unlockProject:", error);
      // Try a final fallback unlock if all else fails
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
        console.error("Final fallback unlock failed:", finalError);
      }
    }
  };

  // Modify handleSubmit to reset timer and unlock project on successful submission
  const handleSubmit = async () => {
    if (wordCount < 50 || wordCount > 100) {
      toast.error("Please write between 50 and 100 words.");
      return;
    }

    try {
      if (!userData?.auth_id) {
        toast.error("User data not available. Please log in again.");
        return;
      }
      setIsSubmitting(true);

      // const moderationResponse = await axios.post(
      //   `${API_BASE_URL}/moderation`,
      //   {
      //     content: content,
      //   }
      // );

      // // If content is flagged, display reason
      // if (moderationResponse.data.flagged) {
      //   toast.error(
      //     `Content flagged for ${moderationResponse.data.reason}. Please try again.`
      //   );
      //   setIsSubmitting(false);
      //   return;
      // }

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
        toast.error(`Failed to submit contribution: ${snippetError.message}`);
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
          console.log(
            `Project has reached max snippets (${snippetCount}/${project.max_snippets}). Marking as completed.`
          );
          // We'll mark the project as completed later in unlockProject()
          // This serves as an additional check
        }
      }

      const { data: existingContributor } = await supabase
        .from("project_contributors")
        .select("id")
        .eq("project_id", projectId)
        .eq("user_id", userData.auth_id);

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
      toast.success("Contribution added successfully!");

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
      console.error("Submit contribution error:", error);
      toast.error(
        `Failed to submit contribution: ${error.message || "Unknown error"}`
      );
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
          console.error("Error unlocking project:", error);
          return;
        }

        setProjectLocked(false);
        setLockedBy(null);
      }
    } catch (error) {
      console.error("Error in handleCancelWriting:", error);
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
        console.error("Error refreshing project data:", error);
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
      console.error("Error during manual refresh:", error);
    }
  };

  // Handle word count
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    setWordCount(newContent.trim().split(/\s+/).filter(Boolean).length);
  };

  const handleDeleteProject = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this project? This action cannot be undone."
      )
    ) {
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

      toast.success("Project deleted successfully!");
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
        <span
          className={`text-sm font-medium px-3 py-1 rounded-full ${
            contributor.user_is_project_creator
              ? "bg-orange-500 text-white"
              : "bg-secondary text-black"
          }`}
        >
          {contributor.user?.user_profile_name || "Unknown"}
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
            console.error("Error unlocking project on unmount:", error);
          }
        };

        unlockProjectOnUnmount();
      }
    };
  }, [projectId, userData, projectLocked, lockedBy]);

  return (
    <div className="h-full md:flex md:flex-col md:gap-5 py-6 mb-15 md:px-4 md:mx-auto md:max-w-[800px] bg-white md:bg-background">
      <div className="bg-white md:bg-background px-5">
        <Button
          variant="outline"
          onClick={handleBackClick}
          className="text-sm bg-white md:bg-background"
        >
          <ChevronLeft />
          <span>Back</span>
        </Button>
      </div>
      <Card className="border-none shadow-none md:shadow-lg">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span className="text-lg">{project?.title || "Loading..."}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualRefresh}
              disabled={isSubmitting || isRefreshing || loadingContributors}
              className="ml-2"
            >
              {isRefreshing || loadingContributors ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Refresh"
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
                      <span className="font-medium">Contributions:</span>{" "}
                      {previousSnippets.length} / {project.max_snippets}
                      {project.is_completed && " (Completed)"}
                    </p>
                    <p className="text-xs text-secondary-text mt-1">
                      Each contribution: 50-100 words
                    </p>
                    <p className="text-xs text-secondary-text">
                      Estimated total story length: {project.max_snippets * 50}-
                      {project.max_snippets * 100} words
                    </p>
                    <p className="text-xs text-secondary-text mt-1 italic">
                      Note: Stories are limited to a maximum of 12 contributions
                    </p>
                  </div>
                )}
                {projectLocked &&
                  lockedBy &&
                  lockedBy !== userData?.auth_id && (
                    <p className="text-sm text-amber-500 mt-2 font-medium">
                      Someone is currently writing a contribution
                    </p>
                  )}
              </div>
            )}
          </div>

          <div className="mb-6 space-y-4">
            <h3 className="text-lg font-semibold">Story So Far:</h3>
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
                    <p className="text-sm text-secondary-text mt-2">
                      Contribution #{snippet.sequence_number} by{" "}
                      {snippet.creator?.user_profile_name || "Unknown"}
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
                  <p className="text-sm text-secondary-text mt-2">
                    Contribution #{snippet.sequence_number} by{" "}
                    {snippet.creator?.user_profile_name || "Unknown"}
                  </p>
                </div>
              ))
            )}
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Contributors:</h3>
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
                  <span className="text-sm">remaining</span>
                </div>
              </div>

              <Textarea
                value={content}
                onChange={handleContentChange}
                placeholder="Add your contribution (50-100 words)..."
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
                  <p className="text-sm font-medium mt-1">Writer's Block?</p>
                </div>
                {showWritersBlockIdeas ? (
                  <div className="mb-3 rounded-lg">
                    <h3 className="text-lg font-semibold text-left mb-3 text-primary-text">
                      Writing Ideas
                    </h3>
                    <div className="flex justify-start">
                      <Lightbulb className="text-primary-button-hover" />
                      <p className="text-left text-secondary-text">
                        {writingIdeas.length > 0
                          ? writingIdeas
                          : "No writing ideas available"}
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
              <div className="flex justify-between items-center">
                <span
                  className={
                    wordCount > 100 || wordCount < 50 ? "text-red-500" : ""
                  }
                >
                  {wordCount} words
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleCancelWriting}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={wordCount > 100 || wordCount < 50 || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Contribution"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <Button
                onClick={handleStartContribution}
                className="w-full max-w-md"
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
                    Loading...
                  </>
                ) : project?.is_completed === true ||
                  (project?.max_snippets !== undefined &&
                    previousSnippets.length >= project.max_snippets) ? (
                  "Project Completed"
                ) : projectLocked && lockedBy !== userData?.auth_id ? (
                  "Someone is currently writing..."
                ) : (
                  "Make Contribution"
                )}
              </Button>
            </div>
          )}

          {/* Project creator actions */}
          {isProjectCreator && (
            <div className="flex justify-center mt-4">
              <Button
                className="bg-red-500 hover:bg-red-600 text-white"
                onClick={handleDeleteProject}
              >
                Delete Project
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WritingEditor;
