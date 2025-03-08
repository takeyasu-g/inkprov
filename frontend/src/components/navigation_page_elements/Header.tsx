import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Feather,
  House,
  BookOpen,
  PenTool,
  User,
  Settings,
  LogOut,
} from "lucide-react";

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
  handleLogout?: () => void;
}

const Header: React.FC<HeaderProps> = function Header({
  loggedIn,
  page,
  handleLogout,
}) {
  const navigate = useNavigate();

  return (
    <header className="flex justify-between relative pb-4 before:absolute before:bottom-0 before:left-1/2 before:-translate-x-1/2 before:w-screen before:h-px before:bg-primary-border">
      {/* Logo */}
      <div className="flex gap-4 items-center text-primary-text">
        <Feather />
        <a href="/" className="text-xl font-bold">
          Inkprov
        </a>
      </div>
      {loggedIn ? (
        // Navigation menu only appears if the user has logged in
        <>
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem className="group/sessions">
                <NavigationMenuLink
                  href="/sessions"
                  className="hover:bg-transparent"
                >
                  <div className="flex gap-1 items-center cursor-pointer">
                    <House className="text-primary-text group-hover/sessions:text-hover-text" />
                    <p className="text-base text-primary-text group-hover/sessions:text-hover-text">
                      Sessions
                    </p>
                  </div>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem className="group/projects">
                <NavigationMenuLink
                  href="/projects"
                  className="hover:bg-transparent"
                >
                  <div className="flex gap-1 items-center cursor-pointer">
                    <BookOpen className="text-primary-text group-hover/projects:text-hover-text" />
                    <p className="text-base text-primary-text group-hover/projects:text-hover-text">
                      Projects
                    </p>
                  </div>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem className="group/create">
                <NavigationMenuLink
                  href="/create"
                  className="hover:bg-transparent"
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
            <Popover>
              <PopoverTrigger asChild>
                <Avatar className="w-9 h-9 cursor-pointer">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>CN</AvatarFallback>
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
                      Saoirse O'Riordian
                    </h1>
                    <p className="text-secondary-text">saoirse@emory.edu</p>
                  </div>
                  <div>
                    <a
                      href="profile"
                      className="flex gap-2 p-2 text-primary-text cursor-pointer hover:bg-menu-hover"
                    >
                      <User />
                      <p>Profile</p>
                    </a>
                    <a
                      href="settings"
                      className="flex gap-2 p-2 text-primary-text cursor-pointer hover:bg-menu-hover"
                    >
                      <Settings />
                      <p>Settings</p>
                    </a>
                  </div>
                  <div
                    className="flex gap-2 p-2 text-primary-text cursor-pointer hover:bg-menu-hover"
                    onClick={handleLogout}
                  >
                    <LogOut />
                    <p>Logout</p>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </>
      ) : (
        <div>
          {/* Auth Buttons */}
          <Button
            className="text-primary-text hover:no-underline hover:text-hover-text cursor-pointer"
            variant="link"
            onClick={() => navigate("/login")}
          >
            Login
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
    </header>
  );
};

export default Header;
