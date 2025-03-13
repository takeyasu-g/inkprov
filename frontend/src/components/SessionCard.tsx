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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProjectsData } from "@/types/global";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "supabase";

interface SessionCardDataProp {
  sessionData: ProjectsData;
}

// SessionCardSkeleton component
export const SessionCardSkeleton: React.FC = () => {
  return (
    <Card className="w-[350px] h-[250px] bg-background-card">
      <CardHeader>
        <div className="flex justify-between items-center">
          <Skeleton className="h-5 w-20" /> {/* Genre badge */}
          <div className="flex items-center gap-1">
            <Skeleton className="h-4 w-12" /> {/* Contributors count */}
          </div>
        </div>
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-40" /> {/* Title */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full" /> {/* Avatar */}
          </div>
        </div>
      </CardHeader>
      <div className="bg-white">
        <div className="m-4">
          <Skeleton className="h-4 w-full mb-2" /> {/* Description line 1 */}
          <Skeleton className="h-4 w-3/4" /> {/* Description line 2 */}
        </div>
      </div>
      <CardFooter className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-24" /> {/* Contributors text */}
          <div className="flex -space-x-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-6 w-6 rounded-full" />
          </div>
        </div>
        <Skeleton className="h-10 w-full" /> {/* Button */}
      </CardFooter>
    </Card>
  );
};

const SessionCard: React.FC<SessionCardDataProp> = ({
  sessionData,
}): React.ReactElement => {
  const navigate = useNavigate();
  const contributors = sessionData.project_contributors || [];

  console.log("Session Data:", sessionData);
  console.log("Creator Data:", sessionData.creator);

  const formattedDate = sessionData.created_at
    ? `Created ${formatDistanceToNow(new Date(sessionData.created_at))} ago`
    : "";

  return (
    <Card className="w-[350px] min-h-[250px] bg-background-card flex flex-col text-justified">
      <CardHeader className="flex-none space-y-3">
        <div className="flex justify-between items-center">
          <Badge className={`genre-${sessionData.project_genre.toLowerCase()}`}>
            {sessionData.project_genre}
          </Badge>
          <div className="flex items-center gap-1">
            <Users className="text-secondary-text p-0.5" />
            <span className="text-secondary-text text-sm">
              {sessionData.current_contributors_count} /{" "}
              {sessionData.max_contributors}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <CardTitle className="text-amber-900 text-left font-bold">
            {sessionData.title}
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-secondary-text">by</span>
            <span className="text-sm font-medium">
              {sessionData.creator?.user_profile_name || "Anonymous"}
            </span>
            <span className="text-xs text-secondary-text italic">
              {formattedDate}
            </span>
          </div>
        </div>
      </CardHeader>
      <div className="bg-white flex-grow">
        <CardDescription className="m-4 text-secondary-text">
          {sessionData.description}
        </CardDescription>
      </div>
      <CardFooter className="flex-none p-4 w-full">
        {contributors.length > 0 && (
          <div className="flex flex-col w-full gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-secondary-text">Contributors:</span>
              <div className="flex -space-x-2 overflow-hidden">
                {contributors.map((pc) => (
                  <Avatar
                    key={pc.contributor_id}
                    className="h-6 w-6 border-2 border-background"
                  >
                    <AvatarImage src={pc.contributor?.avatar_url} />
                    <AvatarFallback>
                      {pc.contributor?.user_profile_name?.[0]?.toUpperCase() ||
                        "?"}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
            </div>
            <Button
              className="bg-primary-button hover:bg-primary-button-hover w-full cursor-pointer"
              onClick={() => navigate(`/writing/${sessionData.id}`)}
            >
              View Session
            </Button>
          </div>
        )}
        {!contributors.length && (
          <Button
            className="bg-primary-button hover:bg-primary-button-hover w-full cursor-pointer"
            onClick={() => navigate(`/writing/${sessionData.id}`)}
          >
            View Session
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default SessionCard;
