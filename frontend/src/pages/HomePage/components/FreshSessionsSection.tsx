import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ProjectsData } from '@/types/global';
import JoinSessionCarousel from './JoinSessionCarousel';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface FreshSessionsSectionProps {
  sessions: ProjectsData[];
  isLoading: boolean;
  error: string | null;
}

const FreshSessionsSection: React.FC<FreshSessionsSectionProps> = ({
  sessions,
  isLoading,
  error
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-2 mb-4">
        <div>
          <h2 className="text-xl font-bold text-primary-text">{t('home.freshSessions', 'Fresh Sessions')}</h2>
          <p className="text-secondary-text text-sm mt-1">
            Sessions you haven't joined yet—discover something new to contribute to.
          </p>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          className="flex items-center gap-1 text-primary hover:text-primary-hover px-2 py-1"
          onClick={() => navigate('/sessions')}
        >
          {t('home.viewMore', 'View More')} 
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
      
      <div className="w-full overflow-hidden">
        <JoinSessionCarousel 
          sessions={sessions}
          isLoading={isLoading}
          error={error}
          emptyMessage={t('home.noFreshSessions', 'No fresh sessions available. Check back soon!')}
        />
      </div>
    </div>
  );
};

export default FreshSessionsSection; 