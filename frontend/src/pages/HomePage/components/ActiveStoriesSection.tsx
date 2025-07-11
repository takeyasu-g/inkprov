import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ProjectsData } from '@/types/global';
import StoryCarousel from './StoryCarousel';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface ActiveStoriesSectionProps {
  stories: ProjectsData[];
  isLoading: boolean;
  error: string | null;
}

const ActiveStoriesSection: React.FC<ActiveStoriesSectionProps> = ({
  stories,
  isLoading,
  error
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-2 mb-4">
        <div>
          <h2 className="text-xl font-bold text-primary-text">{t('home.activeStories', 'Active Stories')}</h2>
          <p className="text-secondary-text text-sm mt-1">
            Stories that are recently completed or have gained popularity with many reactions.
          </p>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          className="flex items-center gap-1 text-primary hover:text-primary-hover px-2 py-1"
          onClick={() => navigate('/stories')}
        >
          {t('home.viewMore', 'View More')} 
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
      
      <div className="w-full overflow-hidden">
        <StoryCarousel 
          stories={stories} 
          isLoading={isLoading} 
          error={error}
          emptyMessage={t('home.noActiveStories', 'No active stories yet. Check back soon for popular completed stories!')}
        />
      </div>
    </div>
  );
};

export default ActiveStoriesSection; 