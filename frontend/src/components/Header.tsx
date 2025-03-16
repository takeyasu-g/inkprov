import React, { useEffect, useState } from "react";
import {
  Feather,
  House,
  BookOpen,
  PenTool,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { supabase, getUsername, getProfilePicture } from "@/utils/supabase";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";

interface HeaderProps {
  loggedIn: boolean;
  page: string;
}

const Header: React.FC<HeaderProps> = function Header({ loggedIn, page }) {
  const navigate = useNavigate();
  const { isAuthenticated, user, setIsAuthenticated, setUser } = useAuth();
  const [popoverOpen, setPopoverOpen] = useState<boolean>(false);
  const [currentProfilePicture, setCurrentProfilePicture] = useState<string>();
  const [username, setUsername] = useState<string>("");

  useEffect(() => {
    // Get username
    const fetchUsername = async () => {
      const usernameData = await getUsername();
      const user = usernameData[0].user_profile_name.split("@")[0];
      const username = user[0].toUpperCase() + user.substring(1);
      setUsername(username);
    };

    // Get Profile Picture
    const fetchProfilePicture = async () => {
      const profilePicture = await getProfilePicture();
      setCurrentProfilePicture(profilePicture);
    };

    fetchUsername();
    fetchProfilePicture();
  });

  const handleLoggedInHomepage = () => {
    if (isAuthenticated) {
      navigate("/sessions");
    } else {
      navigate("/");
    }
  };

  const handleLogout = async () => {
    try {
      setPopoverOpen(false);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setIsAuthenticated(false);
      setUser(null);
      toast.success("Successfully logged out");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "An error occurred during logout");
    }
  };

  // Get user's initials for avatar fallback (Google image pull doesn't seem to work yet)
  const getInitials = () => {
    if (!user?.email) return "?";
    return user.email
      .split("@")[0]
      .split(".")
      .map((n: string) => n[0].toUpperCase())
      .join("");
  };

  const headerLayout = (
    <>
      <div className="flex ml-4 items-center text-primary-text">
        <Feather />
        <Button
          className="text-primary-text text-xl font-bold pl-2 hover:no-underline cursor-pointer"
          variant="link"
          onClick={handleLoggedInHomepage}
        >
          Inkprov
        </Button>
      </div>
      {page === "/login" || page === "/register" ? null : loggedIn ? (
        // Navigation menu only appears if the user has logged in
        <>
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem className="group/sessions">
                <NavigationMenuLink
                  onClick={() => navigate("/sessions")}
                  className="hover:bg-transparent cursor-pointer"
                >
                  <div className="flex gap-1 items-center cursor-pointer">
                    <House className="text-primary-text group-hover/sessions:text-hover-text" />
                    <p className="text-base text-primary-text group-hover/sessions:text-hover-text">
                      Sessions
                    </p>
                  </div>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem className="group/stories">
                <NavigationMenuLink
                  onClick={() => navigate("/stories")}
                  className="hover:bg-transparent cursor-pointer"
                >
                  <div className="flex gap-1 items-center cursor-pointer">
                    <BookOpen className="text-primary-text group-hover/stories:text-hover-text" />
                    <p className="text-base text-primary-text group-hover/stories:text-hover-text">
                      Stories
                    </p>
                  </div>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem className="group/create">
                <NavigationMenuLink
                  onClick={() => navigate("/sessions/create")}
                  className="hover:bg-transparent cursor-pointer"
                >
                  <div className="flex gap-1 items-center cursor-pointer">
                    <PenTool className="text-primary-text group-hover/create:text-hover-text" />
                    <p className="text-base text-primary-text group-hover/create:text-hover-text">
                      Create
                    </p>
                  </div>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          {/* Profile Picture Account Menu */}
          <div className="flex gap-4 items-center">
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                <Avatar className="w-9 h-9 cursor-pointer">
                  <AvatarImage
                    src={
                      currentProfilePicture || user?.user_metadata?.avatar_url
                    }
                  />
                  <AvatarFallback className="bg-white">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
              </PopoverTrigger>
              <PopoverContent
                className="w-full p-0 bg-background"
                side="top"
                align="end"
              >
                <div className="divide-y-2 divide-primary-border border border-primary-border">
                  <div className="pb-2 p-4">
                    <h1 className="text-lg text-primary-text font-medium">
                      {username}
                    </h1>
                    <p className="text-secondary-text">{user?.email}</p>
                  </div>
                  <div>
                    <button
                      onClick={() => {
                        setPopoverOpen(false);
                        navigate("/profile");
                      }}
                      className="w-full flex gap-2 p-2 text-primary-text cursor-pointer hover:bg-menu-hover"
                    >
                      <User />
                      <p>Profile</p>
                    </button>
                    <button
                      onClick={() => {
                        setPopoverOpen(false);
                        navigate("/settings");
                      }}
                      className="w-full flex gap-2 p-2 text-primary-text cursor-pointer hover:bg-menu-hover"
                    >
                      <Settings />
                      <p>Settings</p>
                    </button>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex gap-2 p-2 text-primary-text cursor-pointer hover:bg-menu-hover"
                  >
                    <LogOut />
                    <p>Logout</p>
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </>
      ) : (
        <div className="flex gap-4">
          {/* Auth Buttons */}
          <Button
            className="text-primary-text text-md hover:no-underline hover:text-hover-text cursor-pointer"
            variant="link"
            onClick={() => navigate("/login")}
          >
            Sign In
          </Button>

          <Button
            className="bg-primary-button hover:bg-primary-button-hover cursor-pointer"
            variant="default"
            onClick={() => navigate("/register")}
          >
            Register
          </Button>
        </div>
      )}
    </>
  );

  return (
    <header
      className={
        page === "/login" || page === "/register"
          ? "grid grid-cols-2 grid-rows-1 gap-0 relative mt-3"
          : "flex justify-between relative pb-4 before:absolute before:bottom-0 before:left-1/2 before:-translate-x-1/2 before:w-screen before:h-px before:bg-primary-border mt-3"
      }
    >
      {page === "/login" || page === "/register" ? (
        <>
          <div className="row-span-5"></div>
          <div className="row-span-5 relative w-screen pb-4 before:absolute before:bottom-0 before:left-0 before:w-full before:h-px before:bg-primary-border">
            {headerLayout}
          </div>
        </>
      ) : (
        <>{headerLayout}</>
      )}
    </header>
  );
};

export default Header;
