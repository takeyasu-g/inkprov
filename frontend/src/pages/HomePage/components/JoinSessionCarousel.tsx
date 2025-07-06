import React from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import SessionCard from "@/components/SessionCard"; // Adjust path if needed
import { ProjectsData } from "@/types/global";
import { ProjectCardSkeleton } from "@/components/ProjectCard";

interface JoinSessionCarouselProps {
  sessions?: ProjectsData[];
  isLoading: boolean;
  error: string | null;
  emptyMessage: string;
}

const JoinSessionCarousel: React.FC<JoinSessionCarouselProps> = ({
  sessions = [],
  isLoading,
  error,
  emptyMessage,
}) => {
  if (isLoading) {
    return (
      <div className="flex space-x-4 pb-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="min-w-[250px] md:min-w-[300px] flex-none">
            <ProjectCardSkeleton />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (sessions.length === 0) {
    return <p>{emptyMessage}</p>;
  }

  return (
    <ScrollArea type="always" className="w-full">
      <div className="flex space-x-4 pb-4">
        {sessions.map((session) => (
          <SessionCard key={session.id} sessionData={session} />
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};

export default JoinSessionCarousel;
