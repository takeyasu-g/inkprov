import React, { useEffect, useState } from "react";
import {
  Feather,
  House,
  BookOpen,
  PenTool,
  User,
  LogOut,
  PanelRightOpen,
  Globe,
  // GitBranchPlus,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { supabase, getProfilesByUserIdsForPopUp } from "@/utils/supabase";
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
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/contexts/LangContext";
import "/node_modules/flag-icons/css/flag-icons.min.css";

// Check if we're in development mode
// eslint-disable-next-line no-undef
// const isDevelopment = process.env.NODE_ENV === "development";

interface HeaderProps {
  loggedIn: boolean;
  page: string;
}

const Header: React.FC<HeaderProps> = function Header({ loggedIn, page }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setLang } = useLanguage();
  const { isAuthenticated, user, setIsAuthenticated, setUser } = useAuth();
  const [accountPopOpen, setAccountPopOpen] = useState<boolean>(false);
  const [langPopOpen, setLangPopOpen] = useState<boolean>(false);
  const [currentProfilePicture, setCurrentProfilePicture] = useState<string>();
  const [username, setUsername] = useState<string>("");

  useEffect(() => {
    const fetchUserData = async () => {
      if (!isAuthenticated) return;

      try {
        // Use the consolidated API call
        // using this fetcher , causes less calls to supabase
        const userData = await getProfilesByUserIdsForPopUp([user.id]);

        // Process username
        const splitusername = userData[0].user_profile_name.split("@")[0];
        const formattedUsername =
          splitusername[0].toUpperCase() + splitusername.substring(1);

        setUsername(formattedUsername);
        setCurrentProfilePicture(userData[0].profile_pic_url);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [isAuthenticated]); // Only run when authentication status changes

  // const handleLoggedInHomepage = () => {
  //   if (isAuthenticated) {
  //     navigate("/sessions");
  //   } else {
  //     navigate("/");
  //   }
  // };

  const handleLogout = async () => {
    try {
      setAccountPopOpen(false);

      // Small delay for smooth sheet closing
      await new Promise((resolve) => setTimeout(resolve, 100));

      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setIsAuthenticated(false);
      setUser(null);
      toast.success(t("toasts.logoutSuccess"));
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || t("toasts.logoutError"));
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
      <div
        className={
          page === "/login" || page === "/register"
            ? "lg:col-start-2 border-b border-primary-border p-4 bg-background"
            : "justify-self-start"
        }
      >
        <div className="flex items-center text-primary-text">
          <Feather className="cursor-pointer" onClick={() => navigate("/")} />
          <Button
            className="text-primary-text text-xl font-bold pl-2 hover:no-underline cursor-pointer"
            variant="link"
            onClick={() => navigate("/")}
          >
            {t("header.appName")}
          </Button>
        </div>
      </div>
      {page === "/login" || page === "/register" ? null : loggedIn ? (
        // Navigation menu only appears if the user has logged in
        <>
          <NavigationMenu className="hidden md:grid md:place-self-center">
            <NavigationMenuList className="gap-8">
              <NavigationMenuItem className="group/sessions">
                <NavigationMenuLink
                  onClick={() => navigate("/sessions")}
                  className="hover:bg-transparent cursor-pointer "
                >
                  <div className="flex gap-1 items-center cursor-pointer ">
                    <House className="text-primary-text group-hover/sessions:text-hover-text" />
                    <p className="text-base text-primary-text group-hover/sessions:text-hover-text">
                      {t("header.navbar.sessions")}
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
                      {t("header.navbar.stories")}
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
                      {t("header.navbar.create")}
                    </p>
                  </div>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          {/* Profile Picture Account Menu */}
          <div className="hidden md:flex md:gap-4 md:items-center md:justify-self-end">
            <Popover open={langPopOpen} onOpenChange={setLangPopOpen}>
              <PopoverTrigger asChild>
                <div className="flex flex-col items-center cursor-pointer text-primary-text">
                  <Globe size={25} />
                </div>
              </PopoverTrigger>
              <PopoverContent
                className="w-full p-0 bg-background"
                side="top"
                align="end"
              >
                <div className="divide-y-2 divide-primary-border border border-primary-border">
                  <div>
                    <button
                      onClick={() => {
                        setLangPopOpen(false);
                        setLang("en");
                      }}
                      className="w-full flex gap-2 p-2 text-primary-text cursor-pointer hover:bg-menu-hover"
                    >
                      <span className="fi fi-gb"></span>
                      <p>{t("header.languagePopover.english")}</p>
                    </button>
                    <button
                      onClick={() => {
                        setLangPopOpen(false);
                        setLang("ja");
                      }}
                      className="w-full flex gap-2 p-2 text-primary-text cursor-pointer hover:bg-menu-hover"
                    >
                      <span className="fi fi-jp"></span>
                      <p>{t("header.languagePopover.japanese")}</p>
                    </button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <Popover open={accountPopOpen} onOpenChange={setAccountPopOpen}>
              <PopoverTrigger asChild>
                <Avatar className="w-10 h-10 cursor-pointer">
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
                        navigate(`/profile`, {
                          state: { userId: user.id },
                        });
                        setAccountPopOpen(false);
                      }}
                      className="w-full flex gap-2 p-2 text-primary-text cursor-pointer hover:bg-menu-hover"
                    >
                      <User />
                      <p>{t("header.accountPopover.profile")}</p>
                    </button>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex gap-2 p-2 text-primary-text cursor-pointer hover:bg-menu-hover"
                  >
                    <LogOut />
                    <p>{t("header.accountPopover.logout")}</p>
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          {/* in mobile will display a panel right open icon */}
          <nav className="items-center justify-self-end md:hidden">
            <Sheet>
              {/* Button to open menu */}
              <SheetTrigger asChild>
                <PanelRightOpen className="text-primary-text cursor-pointer w-9 h-9" />
              </SheetTrigger>

              {/* Side Menu Content */}
              <SheetContent side="right" className="w-45 overflow-y-auto">
                <SheetHeader className="gap-0 p-0">
                  <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                  {/* sr-only hides it visually but keeps it for screen readers */}
                  <SheetDescription className="sr-only">
                    Main navigation links for the application
                  </SheetDescription>
                </SheetHeader>
                <div className="p-4 flex flex-col space-y-4">
                  <div className="pb-3 border-b border-primary-border">
                    <Avatar className="w-10 h-10 ">
                      <AvatarImage
                        src={
                          currentProfilePicture ||
                          user?.user_metadata?.avatar_url
                        }
                      />
                      <AvatarFallback className="bg-white">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  {/* Profile Link */}
                  <SheetClose asChild>
                    <Link
                      to="/profile"
                      state={{ userId: user.id }}
                      className="w-full flex gap-2 p-2 text-primary-text cursor-pointer hover:bg-menu-hover"
                    >
                      <User />
                      <p>{t("header.accountPopover.profile")}</p>
                    </Link>
                  </SheetClose>

                  {/* Sessions Link */}
                  <SheetClose asChild>
                    <Link
                      to="/sessions"
                      className="w-full flex gap-2 p-2 text-primary-text cursor-pointer hover:bg-menu-hover"
                    >
                      <House />
                      <p>{t("header.navbar.sessions")}</p>
                    </Link>
                  </SheetClose>

                  {/* Stories Link */}
                  <SheetClose asChild>
                    <Link
                      to="/stories"
                      className="w-full flex gap-2 p-2 text-primary-text cursor-pointer hover:bg-menu-hover"
                    >
                      <BookOpen />
                      <p>{t("header.navbar.stories")}</p>
                    </Link>
                  </SheetClose>

                  {/* Create Link */}
                  <SheetClose asChild>
                    <Link
                      to="/sessions/create"
                      className="w-full flex gap-2 p-2 text-primary-text cursor-pointer hover:bg-menu-hover"
                    >
                      <PenTool />
                      <p>{t("header.navbar.create")}</p>
                    </Link>
                  </SheetClose>

                  {/* Logout Button */}
                  <SheetClose asChild>
                    <button
                      onClick={handleLogout}
                      className="w-full flex gap-2 p-2 text-primary-text cursor-pointer hover:bg-menu-hover"
                    >
                      <LogOut />
                      <p>{t("header.accountPopover.logout")}</p>
                    </button>
                  </SheetClose>
                  <a
                    onClick={() => {
                      setLang("en");
                    }}
                    className=" w-full flex gap-2 p-2 text-primary-text cursor-pointer hover:bg-menu-hover"
                  >
                    <span className="fi fi-gb"></span>
                    <p>{t("header.languagePopover.english")}</p>
                  </a>
                  <a
                    onClick={() => {
                      setLang("ja");
                    }}
                    className=" w-full flex gap-2 p-2 text-primary-text cursor-pointer hover:bg-menu-hover"
                  >
                    <span className="fi fi-jp"></span>
                    <p>{t("header.languagePopover.japanese")}</p>
                  </a>
                </div>
              </SheetContent>
            </Sheet>
          </nav>
        </>
      ) : (
        <div className="col-start-3 justify-self-end flex md:gap-4">
          {/* Language Change */}
          <div className=" flex items-center justify-self-end">
            <Popover open={langPopOpen} onOpenChange={setLangPopOpen}>
              <PopoverTrigger asChild>
                <div className="flex flex-col items-center cursor-pointer text-primary-text">
                  <Globe size={25} />
                </div>
              </PopoverTrigger>
              <PopoverContent
                className="w-full p-0 bg-background"
                side="top"
                align="end"
              >
                <div className="divide-y-2 divide-primary-border border border-primary-border">
                  <div>
                    <button
                      onClick={() => {
                        setLangPopOpen(false);
                        setLang("en");
                      }}
                      className="w-full flex gap-2 p-2 text-primary-text cursor-pointer hover:bg-menu-hover"
                    >
                      <span className="fi fi-gb"></span>
                      <p>{t("header.languagePopover.english")}</p>
                    </button>
                    <button
                      onClick={() => {
                        setLangPopOpen(false);
                        setLang("ja");
                      }}
                      className="w-full flex gap-2 p-2 text-primary-text cursor-pointer hover:bg-menu-hover"
                    >
                      <span className="fi fi-jp"></span>
                      <p>{t("header.languagePopover.japanese")}</p>
                    </button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          {/* Auth Buttons */}
          <Button
            className="text-primary-text text-md hover:no-underline hover:text-hover-text cursor-pointer"
            variant="link"
            onClick={() => navigate("/login")}
          >
            {t("header.signIn")}
          </Button>

          <Button
            className="bg-primary-button hover:bg-primary-button-hover cursor-pointer"
            variant="default"
            onClick={() => navigate("/register")}
          >
            {t("header.register")}
          </Button>
        </div>
      )}
    </>
  );

  return (
    <header
      className={
        page === "/login" || page === "/register"
          ? "grid grid-cols-1 lg:grid-cols-2 bg-accent"
          : "sticky w-full top-0 z-50 py-4 px-6 border-b border-primary-border grid grid-cols-2 bg-background md:grid-cols-3"
      }
    >
      {headerLayout}
    </header>
  );
};

export default Header;
