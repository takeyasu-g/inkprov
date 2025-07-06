import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ProjectsData } from '@/types/global';
import ContributedSessionsCarousel from './ContributedSessionsCarousel';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface ReadyToWriteSectionProps {
  sessions: ProjectsData[];
  isLoading: boolean;
  error: string | null;
}

const ReadyToWriteSection: React.FC<ReadyToWriteSectionProps> = ({
  sessions,
  isLoading,
  error
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  return (
    <section className="space-y-4 w-full">
      <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-2 mb-2">
        <h2 className="text-xl font-bold">{t('home.readyToWrite', 'Ready to Write')}</h2>
        <Button 
          variant="ghost" 
          size="sm"
          className="flex items-center gap-1 text-primary hover:text-primary-hover px-2 py-1"
          onClick={() => navigate('/sessions?filter=my-turn')}
        >
          {t('home.viewMore', 'View More')} 
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
      
      <div className="w-full overflow-hidden">
        <ContributedSessionsCarousel
          contributedSessions={sessions} 
          isLoading={isLoading} 
          error={error}
          emptyMessage={t('home.noContributableSessions', 'No sessions waiting for you. Why not start a new one?')}
          showEmptyStateCTAs={true}
        />
      </div>
    </section>
  );
};

export default ReadyToWriteSection; 