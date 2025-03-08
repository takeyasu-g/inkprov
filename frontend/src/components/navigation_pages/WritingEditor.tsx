import { useState, useEffect, ChangeEvent } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

const MIN_WORDS: number = 20; // Minimum word requirement
const MAX_WORDS: number = 100; // Maximum word limit

interface WritingEditorProps {
  projectId: string;
}

interface ContentSnippet {
  content: string;
  sequence_number: number;
}

export function WritingEditor({ projectId }: WritingEditorProps) {
  const [previousWriting, setPreviousWriting] = useState<string>("");
  const [currentWriting, setCurrentWriting] = useState<string>("");
  const [wordCount, setWordCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [sequenceNumber, setSequenceNumber] = useState<number>(1);

  // Load previous writing snippets for this project
  useEffect(() => {
    const fetchPreviousSnippets = async () => {
      setIsInitialLoading(true);
      try {
        const { data, error } = await supabase
          .from("content_snippets")
          .select("content, sequence_number")
          .eq("project_id", projectId)
          .order("sequence_number", { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          // Combine all previous snippets
          const snippets = data as ContentSnippet[];
          const combinedContent = snippets
            .map((snippet) => snippet.content)
            .join("\n\n");
          setPreviousWriting(combinedContent);

          // Set the next sequence number
          const nextSequence =
            Math.max(...snippets.map((snippet) => snippet.sequence_number)) + 1;
          setSequenceNumber(nextSequence);
        } else {
          // This shouldn't happen based on your workflow, but just in case
          console.warn(
            "No previous writing found for this project, which is unexpected"
          );
          setPreviousWriting("Loading previous content...");

          // Try to get the project details instead
          const { data: projectData } = await supabase
            .from("projects")
            .select("description")
            .eq("id", projectId)
            .single();

          if (projectData?.description) {
            setPreviousWriting(projectData.description);
          }
        }
      } catch (error) {
        console.error("Error fetching previous snippets:", error);
        setError("Failed to load previous writing");
      } finally {
        setIsInitialLoading(false);
      }
    };

    if (projectId) {
      fetchPreviousSnippets();
    }
  }, [projectId]);

  // Loads any saved draft from localStorage
  useEffect(() => {
    const savedDraft = localStorage.getItem(`writing-draft-${projectId}`);
    if (savedDraft) {
      setCurrentWriting(savedDraft);
      countWords(savedDraft);
    }
  }, [projectId]);

  // Saves current writing to localStorage as user types
  useEffect(() => {
    if (currentWriting) {
      localStorage.setItem(`writing-draft-${projectId}`, currentWriting);
    }
  }, [currentWriting, projectId]);

  // Counts words in the current writing
  const countWords = (text: string): number => {
    const words = text
      .trim()
      .split(/\s+/)
      .filter((word) => word !== "");
    setWordCount(words.length);
    return words.length;
  };

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setCurrentWriting(newText);
    countWords(newText);
  };

  const handleSubmit = async () => {
    if (wordCount < MIN_WORDS) {
      setError(`Please write at least ${MIN_WORDS} words`);
      return;
    }

    setIsLoading(true);
    try {
      // Gets current user ID
      const { data, error: userError } = await supabase.auth.getUser();

      if (userError || !data.user) throw new Error("User not authenticated");

      // Submits the writing snippet
      const { error } = await supabase.from("content_snippets").insert({
        project_id: projectId,
        author_id: data.user.id,
        content: currentWriting,
        word_count: wordCount,
        sequence_number: sequenceNumber,
        created_at: new Date().toISOString(),
      });

      if (error) throw error;

      // Clears the draft from localStorage
      localStorage.removeItem(`writing-draft-${projectId}`);

      // Updates the previous writing to include this new snippet
      setPreviousWriting((prev) =>
        prev ? `${prev}\n\n${currentWriting}` : currentWriting
      );

      // Clear the current writing area
      setCurrentWriting("");
      setWordCount(0);

      // Increments sequence number for next snippet
      setSequenceNumber((prev) => prev + 1);

      setIsDialogOpen(false);
    } catch (error: any) {
      console.error("Error submitting writing:", error);
      setError("Failed to submit your writing. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Collects and displays previo writing snippets */}
      <div>
        <h3 className="text-lg font-medium mb-2">Story So Far</h3>
        <Textarea
          value={previousWriting}
          readOnly
          className="min-h-[200px] bg-muted"
          placeholder={
            isInitialLoading
              ? "Loading previous content..."
              : "Story content will appear here"
          }
        />
      </div>

      {/* Current writing field */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-medium">Your Contribution</h3>
          <span
            className={`text-sm ${
              wordCount < MIN_WORDS
                ? "text-red-500"
                : wordCount > MAX_WORDS
                ? "text-amber-500"
                : "text-green-500"
            }`}
          >
            {wordCount}/{MAX_WORDS} words
          </span>
        </div>
        <Textarea
          value={currentWriting}
          onChange={handleTextChange}
          placeholder="Continue the story (between 20-100 words)"
          className="min-h-[150px]"
        />
      </div>

      {/* Submit button and confirmation dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            className="w-full"
            disabled={wordCount < MIN_WORDS || isLoading}
          >
            {isLoading ? "Submitting..." : "Submit Your Writing"}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Submission</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you're finished with your contribution? Once submitted,
            you won't be able to edit it.
          </p>
          <p className="font-semibold mt-2">
            Current word count: {wordCount} words
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Keep Editing
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? "Submitting..." : "Yes, Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
