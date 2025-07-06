import React from "react";
import {
  Badge,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

  const matureContent = isMatureContent ? (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center justify-center rounded-full bg-amber-100 w-5 h-5 ml-2">
            <span className="text-[10px] font-medium text-amber-700">18+</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{t("matureContent")}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ) : null;

  return (
    <div className="relative">
      <div className="absolute top-0 right-0">
        {rightContent}
      </div>
      <div className="flex flex-col gap-2">
        <div>
          <Badge className={`genre-${genre.toLowerCase()}`}>{t(`genres.${genre.toLowerCase()}`)}</Badge>
        </div>
        {React.Children.map(children, (child) => {
          if (!React.isValidElement(child)) return child;
          
          // Cast child to ReactElement with proper props type
          const childElement = child as React.ReactElement<{
            className?: string;
            children?: React.ReactNode;
          }>;
          
          // If this is the container div
          if (childElement.props.className?.includes('flex flex-col justify-start')) {
            return React.cloneElement(childElement, {
              children: React.Children.map(childElement.props.children, (titleChild) => {
                if (!React.isValidElement(titleChild)) return titleChild;
                
                // Cast titleChild to ReactElement with proper props type
                const titleChildElement = titleChild as React.ReactElement<{
                  className?: string;
                }>;
                
                // If this is the title element
                if (titleChildElement.props.className?.includes('text-amber-900')) {
                  return (
                    <div className="flex items-center">
                      {titleChild}
                      {matureContent}
                    </div>
                  );
                }
                return titleChild;
              })
            });
          }
          return child;
        })}
      </div>
    </div>
  );
};

export default CardHeaderWithMature;
