import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, FileText, Clock, VenetianMask } from "lucide-react";
import { formatRelative, formatDistanceToNow } from "date-fns";
import { enUS, ja } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface ProfileStoriesCardProps {
  selectedTab: string;
  genre: string;
  creationDate: Date;
  title: string;
  collaborators: number;
  wordCount: number;
  lastUpdated: Date;
  publicStory: boolean;
  storyId: string;
}

const ProfileStoriesCard: React.FC<ProfileStoriesCardProps> = ({
  selectedTab,
  genre,
  creationDate,
  title,
  collaborators,
  wordCount,
  lastUpdated,
  publicStory,
  storyId,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentTab = selectedTab[0].toUpperCase() + selectedTab.substring(1);
  const formattedCreationDate = formatRelative(new Date(creationDate), new Date(), { locale: sessionStorage.getItem("lang") === "ja" ? ja : enUS });
  const formattedLastUpdatedDate = formatDistanceToNow(new Date(lastUpdated));

  return (
    <Card
      className="w-[350px] bg-background-card  flex flex-col cursor-pointer"
      onClick={() => {
        if (currentTab === "Completed") {
          navigate(`/projects/${storyId}/read`);
        } else {
          navigate(`/writing/${storyId}`);
        }
      }}
    >
      <CardHeader>
        <div className="flex justify-between items-center">
          <Badge variant="default" className={`genre-${genre.toLowerCase()}`}>
            {t(`genres.${genre.toLowerCase()}`)}
          </Badge>
          <div className="flex items-center gap-1 text-secondary-text">
            <Calendar size={18} />
            <p className="text-secondary-text text-sm">
              {formattedCreationDate}
            </p>
          </div>
        </div>
        <CardTitle className="text-primary-text font-medium text-left text-xl">
          {title}
        </CardTitle>
        <CardDescription>
          <div className="flex items-center gap-1 text-secondary-text mb-2">
            <Users size={18} />
            <p className="text-secondary-text text-sm">
              {t("profile.card.collaborators") }: {collaborators}
            </p>
          </div>
          <div className="flex items-center gap-1 text-secondary-text mb-2">
            <FileText size={18} />
            <p className="text-secondary-text text-sm">
              {t("profile.card.wordCount") }: {wordCount}
            </p>
          </div>
          {selectedTab === "in-progress" ? (
            <div className="flex items-center gap-1 text-secondary-text mb-2">
              <Clock size={18} />
              <p className="text-secondary-text text-sm">
                {t("profile.card.lastUpdated")} {formattedLastUpdatedDate}
              </p>
            </div>
          ) : null}
          {!publicStory ? (
            <div className="flex items-center gap-1 text-secondary-text">
              <VenetianMask size={18} />
              <p className="text-secondary-text text-sm">{t("profile.card.private")}</p>
            </div>
          ) : null}
        </CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-end">
        <Badge variant="outline" className={`flex justify-end ${selectedTab}`}>
          {currentTab}
        </Badge>
      </CardFooter>
    </Card>
  );
};

export default ProfileStoriesCard;