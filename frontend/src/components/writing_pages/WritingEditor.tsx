// container component for WritingPage

"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// Sonner component for toast notifications
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { supabase } from "../../utils/supabase";

const ContentSnippetEditor = () => {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch projects on component mount
  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);

      try {
        const { data, error } = await supabase
          .from("projects")
          .select("id, title");

        if (error) throw error;

        setProjects(data || []);
      } catch (error) {
        console.error("Error fetching projects:", error);
        toast({
          title: "Error fetching projects",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [toast]);

  // Handle form submission to save content to Supabase
  const handleSaveContent = async () => {
    if (!title || !content || !selectedProject) {
      toast({
        title: "Missing fields",
        description: "Please fill out all fields before saving.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const { data, error } = await supabase
        .from("content_snippets")
        .insert([
          {
            title,
            content,
            project_id: selectedProject,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select();

      if (error) throw error;

      toast({
        title: "Content saved",
        description: "Your content has been saved successfully!",
      });

      // Reset form after successful save
      setTitle("");
      setContent("");
      setSelectedProject("");
    } catch (error) {
      console.error("Error saving content:", error);
      toast({
        title: "Error saving content",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle>Create Content Snippet</CardTitle>
        <CardDescription>
          Write and save content snippets associated with a project.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="project">Project</Label>
          <Select
            value={selectedProject}
            onValueChange={setSelectedProject}
            disabled={isLoading || projects.length === 0}
          >
            <SelectTrigger id="project">
              <SelectValue placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent>
              {isLoading ? (
                <SelectItem value="loading" disabled>
                  Loading projects...
                </SelectItem>
              ) : projects.length === 0 ? (
                <SelectItem value="none" disabled>
                  No projects available
                </SelectItem>
              ) : (
                projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.title}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            placeholder="Enter snippet title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Content</Label>
          <Textarea
            id="content"
            placeholder="Write your content here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-32"
          />
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => {
            setTitle("");
            setContent("");
            setSelectedProject("");
          }}
        >
          Clear
        </Button>
        <Button
          onClick={handleSaveContent}
          disabled={isSaving || !title || !content || !selectedProject}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Content"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ContentSnippetEditor;
