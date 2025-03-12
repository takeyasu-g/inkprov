// container component for WritingPage

"use client";

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

// Sonner component for toast notifications
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Loader2 } from "lucide-react";
import { supabase, getCurrentUser } from "../../utils/supabase";
import SnippetSkeleton from "../SnippetSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

// Basic interfaces for our data
interface Project {
  id: string;
  title: string;
  description: string;
  max_contributors: number;
  current_contributors_count: number;
  is_completed: boolean;
}

// interface ProjectContributor {
//   id: string;
//   user_id: string;
//   current_writer: boolean;
//   user_made_contribution: boolean;
// }

interface ProjectSnippet {
  content: string;
  creator_id: string;
  sequence_number: number;
  created_at: string;
  creator?: {
    user_profile_name: string;
  };
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
        const { data: contributorData } =
          await supabase
            .from("project_contributors")
            .select("*")
            .eq("project_id", projectId)
            .eq("user_id", user.id)
            .single();

        setIsContributor(!!contributorData);
        setIsMyTurn(contributorData?.current_writer || false);

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
      const { data: currentWriters, } = await supabase
        .from("project_contributors")
        .select("*")
        .eq("project_id", projectId)
        .eq("current_writer", true);

      // If no current writers or error fetching (meaning no results), this user should be the writer
      const shouldBeCurrentWriter =
        !currentWriters || currentWriters.length === 0;

      // Insert new contributor
      // const { data: newContributor, error } = await supabase
      //   .from("project_contributors")
      //   .insert({
      //     project_id: projectId,
      //     user_id: user.id,
      //     joined_at: new Date().toISOString(),
      //     current_writer: shouldBeCurrentWriter,
      //     user_made_contribution: false,
      //   })
      //   .select();

      // if (error) throw error;

      // Update the project's current_contributors_count
      const { error: updateError } = await supabase
        .from("projects")
        .update({
          current_contributors_count:
            (project?.current_contributors_count || 0) + 1,
        })
        .eq("id", projectId);

      if (updateError) throw updateError;

      setIsContributor(true);
      setIsMyTurn(shouldBeCurrentWriter);

      if (shouldBeCurrentWriter) {
        toast.success(
          "Successfully joined the project! It's your turn to write!"
        );
      } else {
        toast.success(
          "Successfully joined the project! Waiting for your turn..."
        );
      }

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
    } catch (error) {
      toast.error("Failed to join project");
    }
  };

  // Leave project
  const handleLeave = async () => {
    try {
      if (!userData?.auth_id) return;

      const { error } = await supabase
        .from("project_contributors")
        .delete()
        .eq("project_id", projectId)
        .eq("user_id", userData.auth_id);

      if (error) throw error;

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

      if (updateError) throw updateError;

      setIsContributor(false);
      setIsMyTurn(false);
      toast.success("Successfully left the project");
      navigate("/sessions");
    } catch (error) {
      toast.error("Failed to leave project");
    }
  };

  // Submit contribution
  const handleSubmit = async () => {
    if (wordCount < 50 || wordCount > 100) {
      toast.error("Please write between 50 and 100 words");
      return;
    }

    try {
      if (!userData?.auth_id) return;
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

      if (snippetError) throw snippetError;

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

      if (contributorError) throw contributorError;

      // Immediately fetch updated snippets
      await fetchSnippets();

      toast.success("Contribution submitted successfully!");
      setContent("");
      setWordCount(0);
      setIsMyTurn(false);
    } catch (error) {
      toast.error("Failed to submit contribution");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
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
              <p className="text-secondary-text">{project?.description}</p>
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
                <Button
                  variant="outline"
                  onClick={handleLeave}
                  className="mt-4"
                  disabled={isSubmitting}
                >
                  Leave Project
                </Button>
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
