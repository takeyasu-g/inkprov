import React from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { CompletedStoriesData } from "@/types/global";

interface StoryCarouselProps {
  stories?: CompletedStoriesData[];
}

const StoryCarousel: React.FC<StoryCarouselProps> = ({ stories = [] }) => (
  <ScrollArea type="always" className="w-full">
    <div className="flex space-x-4 pb-4">
      {stories.map((story) => (
        <Card key={story.id} className="min-w-[300px]">
          {/* Replace with <ProjectCard story={story} /> */}
          <div>{story.title}</div>
        </Card>
      ))}
    </div>
    <ScrollBar orientation="horizontal" />
  </ScrollArea>
);

export default StoryCarousel;
