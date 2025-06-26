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
import { useTranslation } from "react-i18next";
// import axios from "axios";
// const API_BASE_URL =
//   (import.meta.env.VITE_BACKEND_URL as string) || "http://localhost:8080";

// Initializes supabase clientimport { supabase } from "../../utils/supabase";
import { ChevronLeft } from "lucide-react";

// interface imports
import { FormData } from "@/types/global";

// custom hook
import useLocalStorage from "@/hooks/useLocalStorage";
import { supabase } from "@/utils/supabase";

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
  "all",
  "adventure",
  "comedy",
  "crime",
  "fantasy",
  "history",
  "horror",
  "mystery",
  "paranormal",
  "romance",
  "scifi",
  "thriller",
  "western",
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
  const { t } = useTranslation();
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
      toast.error(t("toasts.titleRequired.title"), {
        description: t("toasts.titleRequired.description"),
      });
      setIsLoading(false);
      return;
    }

    if (!description.trim()) {
      toast.error(t("toasts.descriptionRequired.title"), {
        description: t("toasts.descriptionRequired.description"),
      });
      setIsLoading(false);
      return;
    }

    if (!genre.trim()) {
      toast.error(t("toasts.genreRequired.title"), {
        description: t("toasts.genreRequired.description"),
      });
      setIsLoading(false);
      return;
    }

    if (wordCount < 50 || wordCount > 100) {
      toast.error(t("toasts.wordCountError.title"), {
        description: `${t("toasts.wordCountError.description")} ${wordCount}`,
      });
      setIsLoading(false);
      return;
    }

    if (!authUser) {
      toast.error(t("toasts.authRequired.title"), {
        description: t("toasts.authRequired.description"),
      });
      setIsLoading(false);
      return;
    }

    try {
      if (!authUser?.id) {
        throw new Error(t("userIdError"));
      }

      // Check if content is flagged for moderation
      // comment out if OpenAI account is stopped

      // const moderationResponse = await axios.post(`${API_BASE_URL}moderation`, {
      //   content: title + " " + description + " " + content,
      // });

      // // If content is flagged, display reason
      // if (moderationResponse.data.flagged) {
      //   toast.error(
      //     `${t("moderation.flagged")} ${t(moderationResponse.data.reason)}`
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
            user_made_contribution: true,
            joined_at: new Date().toISOString(),
          },
        ]);

      if (contributorError) {
        throw contributorError;
      }

      // Clear localStorage after successful submission
      // We don't want next create session to get last saved localStorage data
      localStorage.removeItem(localStorageKey);

      toast.success(t("toasts.sessionCreated.title"), {
        description: t("toasts.sessionCreated.description"),
      });

      navigate("/sessions");
    } catch (error: any) {
      toast.error(t("toasts.sessionCreationError.title"), {
        description:
          error.message || t("toasts.sessionCreationError.description"),
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
      <div className="px-5 bg-white md:bg-background text-primary-text">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="text-sm bg-white md:bg-background cursor-pointer hover:text-primary-text"
        >
          <ChevronLeft />
          <span>{t("back")}</span>
        </Button>
      </div>
      <Card className="border-none shadow-none md:shadow-lg">
        <CardHeader>
          <CardTitle className="text-primary-text text-2xl font-bold">
            {t("create.header.title")}
          </CardTitle>
          <CardDescription className="text-left text-secondary-text">
            {t("create.header.description")}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="title"
                className="text-sm font-medium text-primary-text"
              >
                {t("create.form.titleField.title")}
              </label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                className="mt-1 block w-full rounded-md border border-primary-border bg-white px-4 py-2 text-primary-text shadow-sm focus:outline-none focus-visible:ring-1 focus-visible:ring-input-focus focus-visible:border-input-focus sm:text-sm"
                placeholder={t("create.form.titleField.placeholder")}
                maxLength={MAX_TITLE_LENGTH}
                required
              />
              <div className="text-sm text-right font-semibold">
                <span
                  className={
                    formData.title.length === MAX_TITLE_LENGTH
                      ? "text-red-500"
                      : "text-secondary-text"
                  }
                >
                  {formData.title.length}/{MAX_TITLE_LENGTH} {t("characters")}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="description"
                className="text-sm font-medium text-primary-text"
              >
                {t("create.form.descriptionField.title")}
              </label>
              <Textarea
                id="description"
                value={formData.description || initialFormData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder={t("create.form.descriptionField.placeholder")}
                className="min-h-[100px] text-justify lg:text-left mt-1 block w-full rounded-md border border-primary-border bg-white px-4 py-2 text-primary-text shadow-sm focus:outline-none focus-visible:ring-1 focus-visible:ring-input-focus focus-visible:border-input-focus sm:text-sm"
                maxLength={MAX_DESCRIPTION_LENGTH}
                required
              />
              <div className="text-sm text-right font-semibold">
                <span
                  className={
                    formData.description.length === MAX_DESCRIPTION_LENGTH
                      ? "text-red-500"
                      : "text-secondary-text"
                  }
                >
                  {formData.description.length}/{MAX_DESCRIPTION_LENGTH}{" "}
                  {t("characters")}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="genre"
                className="text-sm font-medium text-primary-text"
              >
                {t("create.form.genreField.title")}
              </label>

              <Select
                value={formData.genre}
                onValueChange={(value) => handleChange("genre", value)}
              >
                <SelectTrigger className="mt-1 rounded-md border border-primary-border bg-white px-4 py-2 text-primary-text shadow-sm focus:outline-none focus-visible:ring-1 focus-visible:ring-input-focus focus-visible:border-input-focus sm:text-sm">
                  <SelectValue
                    className="text-secondary-text"
                    placeholder={t("create.form.genreField.placeholder")}
                  />
                </SelectTrigger>
                <SelectContent className="text-primary-text">
                  {genres.map((genre) => (
                    <SelectItem key={genre} value={genre}>
                      {genre === "all" ? t("all") : t(`genres.${genre}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="maxSnippets"
                className="text-sm font-medium text-primary-text"
              >
                {t("create.form.snippetsField.title")}
              </Label>

              <Select
                value={formData.maxSnippets.toString()}
                onValueChange={(value) =>
                  handleChange("maxSnippets", Number(value))
                }
              >
                <SelectTrigger className="mt-1 rounded-md border border-primary-border bg-white px-4 py-2 text-primary-text shadow-sm focus:outline-none focus-visible:ring-1 focus-visible:ring-input-focus focus-visible:border-input-focus sm:text-sm">
                  <SelectValue
                    className="text-secondary-text"
                    placeholder="Select snippet count"
                  />
                </SelectTrigger>
                <SelectContent className="text-secondary-text">
                  {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {t("create.form.snippetsField.snippets")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs mt-1 text-secondary-text">
                {t("create.form.snippetsField.subtitle")}{" "}
                {formData.maxSnippets * 50}-{formData.maxSnippets * 100}{" "}
                {t("words")}
              </p>
            </div>

            <div className="flex items-center space-x-8 mt-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="public"
                  className="data-[state=checked]:bg-primary-button-hover cursor-pointer"
                  checked={formData.isPublic}
                  onCheckedChange={(checked) =>
                    handleChange("isPublic", checked)
                  }
                />
                <Label
                  htmlFor="public"
                  className="text-sm font-medium text-primary-text"
                >
                  {t("create.form.publicSession")}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="mature"
                  className="data-[state=checked]:bg-primary-button-hover cursor-pointer"
                  checked={formData.isMature}
                  onCheckedChange={(checked) =>
                    handleChange("isMature", checked)
                  }
                />
                <Label
                  htmlFor="mature"
                  className="text-sm font-medium text-primary-text"
                >
                  {t("matureContent")}
                </Label>
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="content"
                className="text-sm font-medium text-primary-text"
              >
                {t("create.form.contributionField.title")}
              </label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => handleChange("content", e.target.value)}
                placeholder={t("create.form.contributionField.placeholder")}
                className="min-h-[200px] text-justify lg:text-left mt-1 block w-full rounded-md border border-primary-border bg-white px-4 py-2 text-primary-text shadow-sm focus:outline-none focus-visible:ring-1 focus-visible:ring-input-focus focus-visible:border-input-focus sm:text-sm"
                required
              />
              <div className="text-sm text-right">
                <span
                  className={
                    wordCount > 100 || wordCount < 50
                      ? "text-red-500 font-semibold"
                      : "text-tertiary-text font-semibold"
                  }
                >
                  {wordCount}/100 {t("words")}
                </span>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="text-primary-text hover:text-primary-text cursor-pointer"
              disabled={isLoading}
            >
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              className="bg-primary-button hover:bg-primary-button-hover cursor-pointer mt-2"
              disabled={
                isLoading ||
                wordCount > 100 ||
                wordCount < 50 ||
                !formData.title.trim() ||
                !formData.description.trim() ||
                !formData.genre
              }
            >
              {isLoading ? t("createSessionLoading") : t("createSession")}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default CreateSession;
