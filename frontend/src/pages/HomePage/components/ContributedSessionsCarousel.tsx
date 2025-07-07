import React from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import SessionCard from "@/components/SessionCard";
import { ProjectsData } from "@/types/global";
import { ProjectCardSkeleton } from "@/components/ProjectCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface ContributedSessionsCarouselProps {
  contributedSessions?: ProjectsData[];
  isLoading: boolean;
  error: string | null;
  emptyMessage: string;
  showEmptyStateCTAs?: boolean;
}

const ContributedSessionsCarousel: React.FC<ContributedSessionsCarouselProps> = ({
  contributedSessions = [],
  isLoading,
  error,
  emptyMessage,
  showEmptyStateCTAs = false,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

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

  if (contributedSessions.length === 0) {
    if (showEmptyStateCTAs) {
      return (
        <div className="text-center p-6 bg-card rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2">{t('home.noContributableSessions.title', 'Nothing to write right now!')}</h3>
          <p className="text-secondary-text mb-4">{t('home.noContributableSessions.description', 'Get started by creating your own story or joining an existing one.')}</p>
          <div className="flex justify-center gap-4">
            <Button 
              className="bg-primary-button hover:bg-primary-button-hover text-white" 
              onClick={() => navigate('/sessions/create')}
            >
              {t('home.createSession', 'Create a Session')}
            </Button>
            <Button variant="secondary" onClick={() => navigate('/sessions')}>
              {t('home.joinSession', 'Join a Session')}
            </Button>
          </div>
        </div>
      );
    }
    return <p>{emptyMessage}</p>;
  }

  return (
    <ScrollArea type="always" className="w-full">
      <div className="flex space-x-4 pb-4">
        {contributedSessions.map((session) => (
          <SessionCard key={session.id} sessionData={session} />
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};

export default ContributedSessionsCarousel;
