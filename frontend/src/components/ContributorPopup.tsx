import React from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { UserProfilePopUp } from "@/types/global";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChalkboard } from "@fortawesome/free-solid-svg-icons";

interface ContributorPopupProps {
  profile: UserProfilePopUp;
}

const ContributorPopup: React.FC<ContributorPopupProps> = ({ profile }) => {
  const navigate = useNavigate();

  // Ensure the avatar image is never an empty string
  const avatarSrc =
    profile.profile_pic_url && profile.profile_pic_url.trim() !== ""
      ? profile.profile_pic_url
      : undefined; // to avatarFallBack

  return (
    <Popover>
      <PopoverTrigger>
        <Avatar className="mt-4 w-7 h-7 cursor-pointer hover:scale-110 transition border-1 border-gray-400">
          <AvatarImage src={avatarSrc} alt={profile.user_profile_name} />
          <AvatarFallback>
            {profile.user_profile_name[0].toUpperCase() || "?"}
          </AvatarFallback>
        </Avatar>
      </PopoverTrigger>
      <PopoverContent className="p-3 max-w-60 w-full shadow-lg border">
        <div className="flex items-center gap-2">
          <Avatar
            className="w-9 h-9 cursor-pointer border-1 border-gray-300"
            // not sure if this is the right path, since we didn't finish profile page yet
            onClick={() => navigate(`/profile/${profile.id}`)}
          >
            <AvatarImage src={avatarSrc} alt={profile.user_profile_name} />
            <AvatarFallback>
              {profile.user_profile_name[0].toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
          {/* Would be nice to add maybe more things here , maybe the acheivments */}
          <div className="overflow-hidde max-w-40">
            <div className="flex items-center gap-1">
              <p
                className="font-bold cursor-pointer truncate w-full hover:underline"
                onClick={() => navigate(`/profile/${profile.id}`)}
              >
                {profile.user_profile_name || "Unknown"}
              </p>
              {!!profile.is_instructor && (
                <FontAwesomeIcon
                  icon={faChalkboard}
                  className="text-yellow-500"
                  size="lg"
                />
              )}
            </div>
            <p className="text-xs text-gray-500 truncate w-full">
              {profile.user_email || "No email"}
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ContributorPopup;
