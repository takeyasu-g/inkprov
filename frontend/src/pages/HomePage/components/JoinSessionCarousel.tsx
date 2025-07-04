import React from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import SessionCard from "@/components/SessionCard"; // Adjust path if needed
import { ProjectsData } from "@/types/global";

interface JoinSessionCarouselProps {
  sessions?: ProjectsData[];
}

const JoinSessionCarousel: React.FC<JoinSessionCarouselProps> = ({
  sessions = [],
}) => (
  <ScrollArea type="always" className="w-full">
    <div className="flex space-x-4 pb-4">
      {sessions.map((session) => (
        <SessionCard key={session.id} sessionData={session} />
      ))}
    </div>
    <ScrollBar orientation="horizontal" />
  </ScrollArea>
);

export default JoinSessionCarousel;
