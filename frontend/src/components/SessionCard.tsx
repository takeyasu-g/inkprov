import React from "react";
import { Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Badge,
} from "@/components/ui";
import { ProjectsData } from "@/types/global";

interface SessionCardDataProp {
  sessionData: ProjectsData;
}

const SessionCard: React.FC<SessionCardDataProp> = ({
  sessionData,
}): React.ReactElement => {
  const navigate = useNavigate();

  return (
    <Card className='w-[350px] h-[250px] bg-background-card'>
      <CardHeader>
        <div className='flex justify-between items-center'>
          <Badge className={`genre-${sessionData.project_genre.toLowerCase()}`}>
            {sessionData.project_genre}
          </Badge>
          <div className='flex items-center gap-1'>
            <Users className='text-secondary-text p-0.5' />
            <span className='text-secondary-text text-sm'>
              {sessionData.current_contributors_quantity}/
              {sessionData.max_contributors}
            </span>
          </div>
        </div>
        <CardTitle className='text-amber-900 text-left font-bold'>
          {sessionData.title}
        </CardTitle>
      </CardHeader>
      <div className='bg-white'>
        <CardDescription className='m-4 text-secondary-text'>
          {sessionData.description}
        </CardDescription>
      </div>
      <CardFooter className='flex justify-center'>
        <Button
          className='bg-primary-button hover:bg-primary-button-hover'
          onClick={() => navigate(`/writing/${sessionData.id}`)}
        >
          Join Session
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SessionCard;
