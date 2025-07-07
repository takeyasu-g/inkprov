import React from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { CompletedStoriesData, ProjectsData } from "@/types/global";
import ProjectCard, { ProjectCardSkeleton } from "@/components/ProjectCard";
import { useTranslation } from "react-i18next";

interface StoryCarouselProps {
  stories: ProjectsData[] | CompletedStoriesData[];
  isLoading?: boolean;
  error?: string | null;
  emptyMessage?: string;
}

const StoryCarousel: React.FC<StoryCarouselProps> = ({ 
  stories = [], 
  isLoading = false,
  error = null,
  emptyMessage 
}) => {
  const { t } = useTranslation();
  const defaultEmptyMessage = emptyMessage || t("noStoriesAvailable", "No stories available yet");

  // Show loading skeletons
  if (isLoading) {
    return (
      <ScrollArea type="always" className="w-full">
        <div className="flex space-x-4 pb-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="min-w-[250px] md:min-w-[300px] flex-none">
              <ProjectCardSkeleton />
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    );
  }

  // Show error message
  if (error) {
    return (
      <Card className="p-4 text-center text-red-500 bg-red-50 rounded-md shadow-sm">
        {error}
      </Card>
    );
  }

  // Show empty state message
  if (!stories || stories.length === 0) {
    return (
      <Card className="p-6 text-center text-secondary-text bg-background-card rounded-md shadow-sm">
        {defaultEmptyMessage}
      </Card>
    );
  }

  // Transform CompletedStoriesData to format expected by ProjectCard if needed
  const formattedStories = stories.map(story => {
    if ('users_ext' in story) {
      // It's already a CompletedStoriesData
      return story as CompletedStoriesData;
    } else {
      // Convert ProjectsData to CompletedStoriesData format
      return {
        ...story,
        users_ext: {
          user_profile_name: story.creator?.user_profile_name || "Anonymous"
        }
      } as unknown as CompletedStoriesData;
    }
  });

  return (
    <ScrollArea type="always" className="w-full">
      <div className="flex space-x-4 pb-4">
        {formattedStories.map((story) => (
          <div key={story.id} className="min-w-[250px] md:min-w-[300px] flex-none">
            <ProjectCard projectData={story as CompletedStoriesData} />
          </div>
        ))}
      </div>
      <ScrollBar orientation="horizontal" className="mt-2" />
    </ScrollArea>
  );
};

export default StoryCarousel;
