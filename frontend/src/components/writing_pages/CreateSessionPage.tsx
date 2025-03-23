import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";
const API_BASE_URL =
  (import.meta.env.VITE_BACKEND_URL as string) || "http://localhost:8080";

// Initializes supabase client
import { supabase } from "../../utils/supabase";
// import { read } from "fs";

// interface imports
import { FormData } from "@/types/global";

// custom hook
import useLocalStorage from "@/hooks/useLocalStorage";

// Defines Project interface
interface Project {
  id?: number;
  title: string;
  description: string;
  creator_id: string; // This will be the auth_id from users_ext
  created_at: string;
  is_public: boolean;
  is_mature_content: boolean;
  project_genre: string;
  max_snippets: number;
}

// Defines ProjectSnippet interface
interface ProjectSnippet {
  id?: number;
  project_id: number;
  content: string;
  creator_id: string;
  created_at: string;
  word_count: number;
  sequence_number: number;
}

// hard coded some genres here
const genres: string[] = [
  "All",
  "Adventure",
  "Comedy",
  "Crime",
  "Fantasy",
  "History",
  "Horror",
  "Mystery",
  "Paranormal",
  "Romance",
  "Sci-Fi",
  "Thriller",
  "Western",
];

// initlial data for useLocalStorage
const initialFormData: FormData = {
  title: "",
  description: "",
  genre: "",
  maxSnippets: 10,
  isPublic: true,
  isMature: false,
  content: "",
};

const CreateSession: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user: authUser } = useAuth();
  const localStorageKey = `draftText_${authUser?.id}_session_create`;
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [wordCount, setWordCount] = useState<number>(0);

  // put all formData here, for it to be stored & updated to localStorage
  const [formData, setFormData] = useLocalStorage(
    localStorageKey,
    initialFormData
  );

  const MAX_DESCRIPTION_LENGTH = 280;
  const MAX_TITLE_LENGTH = 50;

  // Check authentication on mount
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
  }, [isAuthenticated, navigate]);

  const handleChange = useCallback(
    (field: keyof FormData, value: string | number | boolean) => {
      // Handle specific checks for each field
      if (field === "title" && typeof value === "string") {
        if (value.length > MAX_TITLE_LENGTH) return; // Skip update if title exceeds limit
      }

      if (field === "description" && typeof value === "string") {
        if (value.length > MAX_DESCRIPTION_LENGTH) return; // Skip update if description exceeds limit
      }

      if (field === "content" && typeof value === "string") {
        // Count words for content field
        const words = value.trim() ? value.trim().split(/\s+/) : [];
        setWordCount(words.length);
      }

      // Update the form data => which will save to localStorage
      setFormData((prevData) => ({
        ...prevData,
        [field]: value,
      }));
    },
    []
  );

  // Handles form submission
  // Clear LocalStorage when submitting, to not save the data when creating another session later
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);

    const {
      title,
      description,
      content,
      genre,
      isPublic,
      isMature,
      maxSnippets,
    } = formData;

    if (!title.trim()) {
      toast.error("Title Required", {
        description: "Please provide a title for your project.",
      });
      setIsLoading(false);
      return;
    }

    if (!description.trim()) {
      toast.error("Description Required", {
        description: "Please provide a description for your project.",
      });
      setIsLoading(false);
      return;
    }

    if (!genre.trim()) {
      toast.error("Genre Required", {
        description: "Please select a genre for your project.",
      });
      setIsLoading(false);
      return;
    }

    if (wordCount < 50 || wordCount > 100) {
      toast.error("Invalid Word Count", {
        description: `Please write between 50 to 100 words. Current count: ${wordCount}`,
      });
      setIsLoading(false);
      return;
    }

    if (!authUser) {
      toast.error("Authentication Required", {
        description: "You must be logged in to create a new session.",
      });
      setIsLoading(false);
      return;
    }

    try {
      if (!authUser?.id) {
        throw new Error("User ID not found");
      }

      // Check if content is flagged for moderation
      // const moderationResponse = await axios.post(
      //   `${API_BASE_URL}/moderation`,
      //   {
      //     content: title + " " + description + " " + content,
      //   }
      // );

      // // If content is flagged, display reason
      // if (moderationResponse.data.flagged) {
      //   toast.error(
      //     `Content flagged for ${moderationResponse.data.reason}. Please try again.`
      //   );
      //   setIsLoading(false);
      //   return;
      // }

      const newProject: Project = {
        title,
        description,
        creator_id: authUser.id,
        created_at: new Date().toISOString(),
        is_public: isPublic,
        is_mature_content: isMature,
        project_genre: genre,
        max_snippets: maxSnippets,
      };

      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .insert([newProject])
        .select()
        .single();

      if (projectError) {
        throw projectError;
      }

      const newSnippet: ProjectSnippet = {
        project_id: projectData.id,
        content,
        creator_id: authUser.id,
        created_at: new Date().toISOString(),
        word_count: wordCount,
        sequence_number: 1,
      };

      const { error: snippetError } = await supabase
        .from("project_snippets")
        .insert([newSnippet]);

      if (snippetError) {
        throw snippetError;
      }

      const { error: contributorError } = await supabase
        .from("project_contributors")
        .insert([
          {
            project_id: projectData.id,
            user_id: authUser.id,
            user_is_project_creator: true,
            joined_at: new Date().toISOString(),
          },
        ]);

      if (contributorError) {
        throw contributorError;
      }

      // Clear localStorage after successful submission
      // We don't want next create session to get last saved localStorage data
      localStorage.removeItem(localStorageKey);

      toast.success("Session Created", {
        description: "Your writing session has been created successfully!",
      });

      navigate("/sessions");
    } catch (error: any) {
      toast.error("Creation Failed", {
        description:
          error.message || "Failed to create session. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = (): void => {
    // clears localStorage, because they no longer want to create the session
    // we don't want the same inputs to be saved if they cancel
    localStorage.removeItem(localStorageKey);

    // navigate back to sessions page
    navigate("/sessions");
  };

  return (
    <div className="h-full md:flex md:flex-col md:gap-5 py-6 mb-15 md:px-4 md:mx-auto md:max-w-[800px] bg-white md:bg-background">
      <div className="px-5 bg-white md:bg-background">
        <Button
          variant="outline"
          onClick={() => navigate("/sessions")}
          className="text-sm bg-white md:bg-background"
        >
          Back to Sessions
        </Button>
      </div>
      <Card className="border-none shadow-none md:shadow-lg">
        <CardHeader>
          <CardTitle>Create New Writing Session</CardTitle>
          <CardDescription className="text-left">
            Start a new collaborative writing session. Each contributor adds
            50-100 words per snippet. Set how many total contributions you want
            for your story.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Session Title
              </label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="Enter session title"
                maxLength={MAX_TITLE_LENGTH}
                required
              />
              <div className="text-sm text-right">
                <span
                  className={
                    formData.title.length === MAX_TITLE_LENGTH
                      ? "text-red-500"
                      : "text-secondary-text"
                  }
                >
                  {formData.title.length}/{MAX_TITLE_LENGTH} characters
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="description"
                value={formData.description || initialFormData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Describe what this writing session is about..."
                className="min-h-[100px] text-justify lg:text-left"
                maxLength={MAX_DESCRIPTION_LENGTH}
                required
              />
              <div className="text-sm text-right">
                <span
                  className={
                    formData.description.length === MAX_DESCRIPTION_LENGTH
                      ? "text-red-500"
                      : "text-secondary-text"
                  }
                >
                  {formData.description.length}/{MAX_DESCRIPTION_LENGTH}{" "}
                  characters
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="genre" className="text-sm font-medium">
                Genre
              </label>

              <Select
                value={formData.genre}
                onValueChange={(value) => handleChange("genre", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a genre" />
                </SelectTrigger>
                <SelectContent>
                  {genres.map((genre) => (
                    <SelectItem key={genre} value={genre}>
                      {genre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxSnippets">Maximum Number of Snippets</Label>

              <Select
                value={formData.maxSnippets.toString()}
                onValueChange={(value) =>
                  handleChange("maxSnippets", Number(value))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select snippet count" />
                </SelectTrigger>
                <SelectContent>
                  {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} snippets
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Each snippet is 50-100 words. Estimated total story length:{" "}
                {formData.maxSnippets * 50}-{formData.maxSnippets * 100} words
              </p>
            </div>

            <div className="flex items-center space-x-8 mt-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="public"
                  checked={formData.isPublic}
                  onCheckedChange={(checked) =>
                    handleChange("isPublic", checked)
                  }
                />
                <Label htmlFor="public">Public Session</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="mature"
                  checked={formData.isMature}
                  onCheckedChange={(checked) =>
                    handleChange("isMature", checked)
                  }
                />
                <Label htmlFor="mature">Mature Content</Label>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="content" className="text-sm font-medium">
                Your Contribution (50-100 words)
              </label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => handleChange("content", e.target.value)}
                placeholder="Start the story here..."
                className="min-h-[200px] text-justify lg:text-left"
                required
              />
              <div className="text-sm text-right">
                <span
                  className={
                    wordCount > 100 || wordCount < 50
                      ? "text-red-500 font-bold"
                      : ""
                  }
                >
                  {wordCount}/100 words
                </span>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isLoading ||
                wordCount > 100 ||
                wordCount < 50 ||
                !formData.title.trim() ||
                !formData.description.trim() ||
                !formData.genre
              }
            >
              {isLoading ? "Creating..." : "Create Session"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default CreateSession;
