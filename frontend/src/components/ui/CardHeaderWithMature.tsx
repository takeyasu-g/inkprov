import React from "react";
import { CircleAlert } from "lucide-react";
import {
  Badge,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui";
import matureIcon from "@/assets/mature-icon.png";

interface CardHeaderWithMatureProps {
  genre: string;
  isMatureContent: boolean;
  children: React.ReactNode;
  rightContent?: React.ReactNode;
}

const CardHeaderWithMature: React.FC<CardHeaderWithMatureProps> = ({
  genre,
  isMatureContent,
  children,
  rightContent,
}) => {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <Badge className={`genre-${genre.toLowerCase()}`}>{genre}</Badge>
        <div className="flex items-center gap-1">
          {isMatureContent && (
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <img src={matureIcon} alt="Icon" className="w-6 h-6" />
                  {/* <CircleAlert className="h-4 w-4 text-amber-600" /> */}
                </TooltipTrigger>
                <TooltipContent>
                  <p>Mature Content</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {rightContent}
        </div>
      </div>
      {children}
    </div>
  );
};

export default CardHeaderWithMature;
