import React from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import SessionCard from "@/components/SessionCard";
import { ProjectsData } from "@/types/global";

const ContributedSessionsCarousel: React.FC<ProjectsData[]> = (
  contributedSessions
) => (
  <ScrollArea type="always" className="w-full">
    <div className="flex space-x-4 pb-4">
      {contributedSessions.map((session) => (
        <SessionCard key={session.id} sessionData={session} />
      ))}
    </div>
    <ScrollBar orientation="horizontal" />
  </ScrollArea>
);

export default ContributedSessionsCarousel;
