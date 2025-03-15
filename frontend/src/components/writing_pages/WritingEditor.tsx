// container component for WritingPage

"use client";

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

// Sonner component for toast notifications
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Loader2 } from "lucide-react";
import {
  supabase,
  getCurrentUser,
  getProjectContributors,
} from "../../utils/supabase";
import SnippetSkeleton from "../SnippetSkeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { PenTool, Crown } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

// Basic interfaces for our data
interface Project {
  id: string;
  title: string;
  description: string;
  max_contributors: number;
  current_contributors_count: number;
  is_completed: boolean;
}

interface ProjectSnippet {
  content: string;
  creator_id: string;
  sequence_number: number;
  created_at: string;
  creator?: {
    user_profile_name: string;
  };
}

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
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [content, setContent] = useState("");
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

  // Function to fetch contributors
  const fetchContributors = async () => {
    if (!projectId) return;

    setLoadingContributors(true);
    try {
      console.log("Fetching contributors for project:", projectId);
      const contributorsData = await getProjectContributors(projectId);

      // Debug log to check the current_writer status
      console.log("Contributors data received:", contributorsData);

      // Explicitly check if anyone has current_writer set to true
      const currentWriter = contributorsData.find(
        (c) => c.current_writer === true
      );
      console.log(
        "Current writer:",
        currentWriter?.user?.user_profile_name || "None"
      );

      setContributors(contributorsData);

      // If we're one of the contributors, update our status
      if (userData?.auth_id) {
        const myStatus = contributorsData.find(
          (c) => c.user_id === userData.auth_id
        );
        if (myStatus) {
          console.log("My contributor status:", myStatus);
          setIsMyTurn(myStatus.current_writer || false);
          setIsProjectCreator(myStatus.user_is_project_creator || false);
        }
      }
    } catch (error) {
      console.error("Failed to load contributors:", error);
    } finally {
      setLoadingContributors(false);
    }
  };

  // Function to fetch snippets
  const fetchSnippets = async () => {
    setIsRefreshing(true);
    try {
      const { data: snippets, error: snippetsError } = await supabase
        .from("project_snippets")
        .select(
          `
          *,
          creator:creator_id (
            user_profile_name
          )
        `
        )
        .eq("project_id", projectId)
        .order("sequence_number", { ascending: true });

      if (snippetsError) throw snippetsError;
      setPreviousSnippets(snippets || []);
    } catch (error) {
      toast.error("Failed to refresh snippets");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Fetch project data and check user status
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

        // Fetch project details
        const { data: projectData, error: projectError } = await supabase
          .from("projects")
          .select("*")
          .eq("id", projectId)
          .single();

        if (projectError) throw projectError;
        setProject(projectData);

        // Check if user is a contributor
        const { data: contributorData } = await supabase
          .from("project_contributors")
          .select("*, user:user_id(*)")
          .eq("project_id", projectId)
          .eq("user_id", user.id)
          .single();

        setIsContributor(!!contributorData); // force convert to a boolean value
        setIsMyTurn(contributorData?.current_writer || false); // if user is not current_writer, its not their turn to write
        setIsProjectCreator(contributorData?.user_is_project_creator || false); // set project creator status

        // Fetch project contributors
        await fetchContributors();

        // Check if the project has a valid current writer
        await checkAndFixCurrentWriter();

        // Fetch previous snippets
        await fetchSnippets();
      } catch (error) {
        toast.error("Error loading project");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId, navigate]);

  // Helper function to check if there's a current writer and fix if not
  const checkAndFixCurrentWriter = async () => {
    try {
      // Get all contributors
      const { data: allContributors, error } = await supabase
        .from("project_contributors")
        .select("*")
        .eq("project_id", projectId);

      if (error) {
        console.error("Error checking for current writer:", error);
        return;
      }

      // Check if any contributor has current_writer set to true
      const hasCurrentWriter =
        allContributors &&
        allContributors.some(
          (contributor) => contributor.current_writer === true
        );

      console.log(`Project has a current writer: ${hasCurrentWriter}`);

      // If no one is set as current writer, assign someone
      if (!hasCurrentWriter && allContributors && allContributors.length > 0) {
        console.log("No current writer found, assigning one...");

        // Get the first contributor by join date
        const firstContributor = allContributors.sort(
          (a, b) =>
            new Date(a.joined_at).getTime() - new Date(b.joined_at).getTime()
        )[0];

        // Update this contributor to be current writer
        const { error: updateError } = await supabase
          .from("project_contributors")
          .update({ current_writer: true })
          .eq("id", firstContributor.id);

        if (updateError) {
          console.error("Error assigning new writer:", updateError);
        } else {
          console.log(`Assigned ${firstContributor.user_id} as current writer`);
          // Refresh the contributors list
          await fetchContributors();
        }
      }
    } catch (err) {
      console.error("Error in checkAndFixCurrentWriter:", err);
    }
  };

  // Handle word count
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    setWordCount(newContent.trim().split(/\s+/).filter(Boolean).length);
  };

  // Join project
  const handleJoin = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        toast.error("Please log in to join this project");
        return;
      }

      // Check if user is already a contributor
      const { data: existingContributor, error: existingContributorError } =
        await supabase
          .from("project_contributors")
          .select("id")
          .eq("project_id", projectId)
          .eq("user_id", user.id);

      // Handle checking for existing contributor more robustly
      if (existingContributorError) {
        console.error(
          "Error checking existing contributor:",
          existingContributorError
        );
        // Continue instead of throwing, as this might be a "not found" error which is expected
      }

      if (existingContributor && existingContributor.length > 0) {
        toast.error("You've already joined this project");
        return;
      }

      // Check if project is completed
      if (project?.is_completed) {
        toast.error("This project is already completed");
        return;
      }

      // Check if project is at max contributors
      if (
        project &&
        project.current_contributors_count >= project.max_contributors
      ) {
        toast.error(
          "This project has reached its maximum number of contributors"
        );
        return;
      }

      // Check if there are any current writers
      const { data: currentWriters, error: currentWritersError } =
        await supabase
          .from("project_contributors")
          .select("*")
          .eq("project_id", projectId)
          .eq("current_writer", true);

      if (currentWritersError) {
        console.error("Error checking current writers:", currentWritersError);
      }

      // If no current writers or error fetching (meaning no results), this user should be the writer
      const shouldBeCurrentWriter =
        !currentWriters || currentWriters.length === 0;

      // Check if this user is the project creator
      const { data: projectData } = await supabase
        .from("projects")
        .select("creator_id")
        .eq("id", projectId)
        .single();

      const isProjectCreator = projectData?.creator_id === user.id;

      // Insert new contributor with all required fields
      const newContributorData = {
        project_id: projectId,
        user_id: user.id,
        joined_at: new Date().toISOString(),
        current_writer: shouldBeCurrentWriter,
        user_made_contribution: false,
        user_is_project_creator: isProjectCreator,
        // Adding a default value for last_contribution_at to prevent null issues
        last_contribution_at: new Date().toISOString(),
      };

      // Insert with more detailed error handling
      const { data: newContributor, error } = await supabase
        .from("project_contributors")
        .insert(newContributorData)
        .select();

      if (error) {
        console.error("Failed to insert new contributor:", error);

        // If we get a 406 error, it might be missing fields or a constraint violation
        if (error.code === "406" || error.code === "23502") {
          // 23502 is PostgreSQL's not-null violation code
          toast.error("Failed to join project: Missing required information");
        } else {
          toast.error(`Failed to join project: ${error.message}`);
        }
        return;
      }

      // Update the project's current_contributors_count
      const { error: updateError } = await supabase
        .from("projects")
        .update({
          current_contributors_count:
            (project?.current_contributors_count || 0) + 1,
        })
        .eq("id", projectId);

      if (updateError) {
        console.error(
          "Failed to update project contributor count:",
          updateError
        );
        // Continue execution even if this fails
      }

      // Set a flag in sessionStorage to signal to the sessions page that data should be refreshed
      sessionStorage.setItem("refreshSessions", "true");

      setIsContributor(true);
      setIsMyTurn(shouldBeCurrentWriter);
      setIsProjectCreator(isProjectCreator);

      if (shouldBeCurrentWriter) {
        toast.success(
          "Successfully joined the project! It's your turn to write!"
        );
      } else {
        toast.success(
          "Successfully joined the project! Waiting for your turn..."
        );
      }

      // Refresh the contributors list
      await fetchContributors();

      // Refresh the snippets list
      await fetchSnippets();

      // Force refresh project data to ensure we have latest state
      const { data: refreshedProject } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();

      if (refreshedProject) {
        setProject(refreshedProject);
      }
    } catch (error: any) {
      console.error("Join project error:", error);
      toast.error(
        `Failed to join project: ${error.message || "Unknown error"}`
      );
    }
  };

  // Leave project
  const handleLeave = async () => {
    // Add confirmation dialog
    if (
      !window.confirm(
        "Are you sure you want to leave this project? You'll lose your spot in the writing queue."
      )
    ) {
      return;
    }

    try {
      if (!userData?.auth_id) {
        toast.error("User data not available. Please try again.");
        return;
      }

      // Check if this user is the current writer
      const { data: contributorData, error: contributorError } = await supabase
        .from("project_contributors")
        .select("current_writer")
        .eq("project_id", projectId)
        .eq("user_id", userData.auth_id)
        .single();

      if (contributorError) {
        console.error("Error checking writer status:", contributorError);
      }

      const isCurrentWriter = contributorData?.current_writer || false;

      // Before deleting, fetch all contributors to find the next writer
      let nextWriterId = null;

      if (isCurrentWriter) {
        // Get all contributors ordered by join date
        const { data: allContributors } = await supabase
          .from("project_contributors")
          .select("*")
          .eq("project_id", projectId)
          .order("joined_at", { ascending: true });

        if (allContributors && allContributors.length > 1) {
          // Find the current user's index
          const currentUserIndex = allContributors.findIndex(
            (contributor) => contributor.user_id === userData.auth_id
          );

          // Find the next user in rotation, or the first if current user is last
          let nextUserIndex = (currentUserIndex + 1) % allContributors.length;

          // Make sure we're not selecting the current user
          if (allContributors[nextUserIndex].user_id === userData.auth_id) {
            nextUserIndex = (nextUserIndex + 1) % allContributors.length;
          }

          nextWriterId = allContributors[nextUserIndex].id;
        }
      }

      // Delete the user from project contributors
      const { error } = await supabase
        .from("project_contributors")
        .delete()
        .eq("project_id", projectId)
        .eq("user_id", userData.auth_id);

      if (error) {
        console.error("Error leaving project:", error);
        toast.error(`Failed to leave project: ${error.message}`);
        return;
      }

      // If this user was the current writer, assign a new one based on our earlier calculation
      if (isCurrentWriter && nextWriterId) {
        const { error: updateWriterError } = await supabase
          .from("project_contributors")
          .update({ current_writer: true })
          .eq("id", nextWriterId);

        if (updateWriterError) {
          console.error("Error updating new writer:", updateWriterError);
        }
      }

      // Update the project's current_contributors_count
      const { error: updateError } = await supabase
        .from("projects")
        .update({
          current_contributors_count: Math.max(
            (project?.current_contributors_count || 1) - 1,
            0
          ),
        })
        .eq("id", projectId);

      if (updateError) {
        console.error("Error updating project count:", updateError);
      }

      // Signal that sessions page needs to refresh data
      sessionStorage.setItem("refreshSessions", "true");

      setIsContributor(false);
      setIsMyTurn(false);
      setIsProjectCreator(false);
      toast.success("Successfully left the project");
      navigate("/sessions");
    } catch (error: any) {
      console.error("Leave project error:", error);
      toast.error(
        `Failed to leave project: ${error.message || "Unknown error"}`
      );
    }
  };

  // Submit contribution
  const handleSubmit = async () => {
    if (wordCount < 50 || wordCount > 100) {
      toast.error("Please write between 50 and 100 words");
      return;
    }

    try {
      if (!userData?.auth_id) {
        toast.error("User data not available. Please log in again.");
        return;
      }
      setIsSubmitting(true);

      // Add new snippet
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

      // Update contributor status
      const { error: contributorError } = await supabase
        .from("project_contributors")
        .update({
          current_writer: false,
          user_made_contribution: true,
          last_contribution_at: new Date().toISOString(),
        })
        .eq("project_id", projectId)
        .eq("user_id", userData.auth_id);

      if (contributorError) {
        console.error("Error updating contributor status:", contributorError);
        toast.error(
          `Failed to update contributor status: ${contributorError.message}`
        );
        // Continue to pass the pen even if this fails
      }

      // Fetch all contributors for this project to implement a proper rotation
      const { data: allContributors, error: allContributorsError } =
        await supabase
          .from("project_contributors")
          .select("*")
          .eq("project_id", projectId)
          .order("joined_at", { ascending: true });

      if (allContributorsError) {
        console.error("Error fetching all contributors:", allContributorsError);
      }

      let nextWriter = null;

      // If we have contributors, implement a rotation system
      if (allContributors && allContributors.length > 0) {
        if (allContributors.length === 1) {
          // If there's only one contributor (just the current user), they remain the writer
          nextWriter = allContributors[0];
        } else {
          // Find the current writer's index
          const currentWriterIndex = allContributors.findIndex(
            (contributor) => contributor.user_id === userData.auth_id
          );

          // Calculate the next writer's index with rotation
          // If currentWriterIndex is the last one, go back to index 0
          const nextWriterIndex =
            currentWriterIndex === allContributors.length - 1
              ? 0
              : currentWriterIndex + 1;

          nextWriter = allContributors[nextWriterIndex];
        }

        // Update the next writer
        if (nextWriter) {
          const { error: updateWriterError } = await supabase
            .from("project_contributors")
            .update({ current_writer: true })
            .eq("id", nextWriter.id);

          if (updateWriterError) {
            console.error("Error updating next writer:", updateWriterError);
          }
        }
      }

      // Immediately fetch updated snippets
      await fetchSnippets();

      // Refresh contributors list
      await fetchContributors();

      toast.success("Contribution submitted successfully!");
      setContent("");
      setWordCount(0);
      setIsMyTurn(false);
    } catch (error: any) {
      console.error("Submit contribution error:", error);
      toast.error(
        `Failed to submit contribution: ${error.message || "Unknown error"}`
      );
    } finally {
      setIsSubmitting(false);
    }
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
      toast.error("Failed to delete project");
    }
  };

  const renderContributors = (contributors: Contributor[]) => {
    return contributors.map((contributor) => (
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
        {contributor.current_writer && (
          <PenTool className="text-primary-text" />
        )}
      </div>
    ));
  };

  const checkIfContributor = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        // Not logged in, so can't be a contributor
        setIsContributor(false);
        return;
      }

      // Check if user is already a contributor
      const { data: contributorData, error } = await supabase
        .from("project_contributors")
        .select("*") // Select all fields to get additional information like current_writer status
        .eq("project_id", projectId)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error checking contributor status:", error);
        // Don't throw, handle gracefully
        setIsContributor(false);
        return;
      }

      // Check if contributorData is not empty
      const isUserContributor = contributorData && contributorData.length > 0;
      setIsContributor(isUserContributor);

      // If the user is a contributor, update their status
      if (isUserContributor && contributorData[0]) {
        setIsMyTurn(contributorData[0].current_writer || false);
        setIsProjectCreator(
          contributorData[0].user_is_project_creator || false
        );
      }
    } catch (error) {
      console.error("Error checking contributor status:", error);
      // In case of error, assume not a contributor for safety
      setIsContributor(false);
    }
  };

  // Call this function when the component mounts or when the user tries to join
  useEffect(() => {
    checkIfContributor();
  }, [projectId]);

  return (
    <div className="container mx-auto py-8 px-4 pb-16 max-w-xl">
      <div className="mb-4">
        <Button
          variant="outline"
          onClick={() => navigate("/sessions")}
          className="text-sm"
        >
          Back to Sessions
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{project?.title || "Loading..."}</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Project Description */}
          <div className="mb-6">
            {isLoading ? (
              <Skeleton className="h-4 w-3/4" />
            ) : (
              <p className="text-secondary-text text-justify">
                {project?.description}
              </p>
            )}
          </div>

          {/* Previous Snippets */}
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
                    <p>{snippet.content}</p>
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
                  <p>{snippet.content}</p>
                  <p className="text-sm text-secondary-text mt-2">
                    Contribution #{snippet.sequence_number} by{" "}
                    {snippet.creator?.user_profile_name || "Unknown"}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Contributors section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Contributors:</h3>
            {loadingContributors ? (
              <Skeleton className="h-10 w-full" />
            ) : contributors.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {renderContributors(contributors)}
              </div>
            ) : (
              <p className="text-secondary-text">No contributors yet</p>
            )}
          </div>

          {/* Writing Area */}
          {isContributor ? (
            <>
              <div className="mb-4">
                {isMyTurn ? (
                  <>
                    <Textarea
                      value={content}
                      onChange={handleContentChange}
                      placeholder="Add your contribution (50-100 words)..."
                      className="min-h-[200px] mb-2"
                      disabled={!isMyTurn || isSubmitting}
                    />
                    <div className="flex justify-between items-center">
                      <span
                        className={
                          wordCount > 100 || wordCount < 50
                            ? "text-red-500"
                            : ""
                        }
                      >
                        {wordCount} words
                      </span>
                      <Button
                        onClick={handleSubmit}
                        disabled={
                          wordCount > 100 || wordCount < 50 || isSubmitting
                        }
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
                  </>
                ) : (
                  <p className="text-center text-secondary-text">
                    Waiting for your turn...
                  </p>
                )}
                <div className="flex justify-center mt-4 gap-4">
                  <Button
                    variant="outline"
                    onClick={handleLeave}
                    disabled={isSubmitting}
                  >
                    Leave Project
                  </Button>
                  {isProjectCreator && (
                    <Button
                      className="bg-red-500 hover:bg-red-600 text-white"
                      onClick={handleDeleteProject}
                    >
                      Delete Project
                    </Button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <Button
              onClick={handleJoin}
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                "Join Project"
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WritingEditor;
