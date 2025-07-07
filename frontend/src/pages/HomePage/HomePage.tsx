import React, { useEffect, useState, useMemo } from "react";
import ReadyToWriteSection from "./components/ReadyToWriteSection";
import FreshSessionsSection from "./components/FreshSessionsSection";
import ActiveStoriesSection from "./components/ActiveStoriesSection";
import HeroSection from "./components/HeroSection";
import {
  getUserContributableSessions,
  getPopularProjects,
  getJoinableSessions,
  getMyProfile,
} from "@/services/api";
import { ProjectsData } from "@/types/global";
import { useAuth } from "@/contexts/AuthContext";

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const [username, setUsername] = useState("");

  // State for all three sections
  const [contributableSessions, setContributableSessions] = useState<ProjectsData[]>([]);
  const [contributableLoading, setContributableLoading] = useState(true);
  const [contributableError, setContributableError] = useState<string | null>(null);

  const [activeStories, setActiveStories] = useState<ProjectsData[]>([]);
  const [activeStoriesLoading, setActiveStoriesLoading] = useState(true);
  const [activeStoriesError, setActiveStoriesError] = useState<string | null>(null);

  const [freshSessions, setFreshSessions] = useState<ProjectsData[]>([]);
  const [freshSessionsLoading, setFreshSessionsLoading] = useState(true);
  const [freshSessionsError, setFreshSessionsError] = useState<string | null>(null);

  // Function to extract username from email
  const getUsernameFromEmail = (email: string): string => {
    if (!email) return "User";
    return email.split('@')[0];
  };

  useEffect(() => {
    // Fetch user profile
    if (user) {
      getMyProfile()
        .then((profile) => {
          // If profile name exists, use it; otherwise extract from email
          if (profile.profile.user_profile_name) {
            setUsername(profile.profile.user_profile_name);
          } else if (user.email) {
            setUsername(getUsernameFromEmail(user.email));
          } else {
            setUsername("User"); // Fallback
          }
        })
        .catch((error) => {
          console.error("Error fetching profile:", error);
          // If profile fetch fails, still try to extract name from email
          if (user.email) {
            setUsername(getUsernameFromEmail(user.email));
          } else {
            setUsername("User"); // Fallback
          }
        });
    }

    // Fetch all page data in parallel
    const fetchAllHomePageData = async () => {
      setContributableLoading(true);
      setActiveStoriesLoading(true);
      setFreshSessionsLoading(true);

      try {
        const [contributableData, activeStoriesData, freshSessionsData] =
          await Promise.all([
            getUserContributableSessions(),
            getPopularProjects(10), // Limit to 10 stories per PRD
            getJoinableSessions(),
          ]);

        setContributableSessions(contributableData);
        setActiveStories(activeStoriesData);
        setFreshSessions(freshSessionsData.slice(0, 10)); // Limit to 10 cards per PRD
        
      } catch (error) {
        console.error("Error fetching homepage data:", error);
        const errorMessage =
          error instanceof Error ? error.message : "An unknown error occurred";
        setContributableError(errorMessage);
        setActiveStoriesError(errorMessage);
        setFreshSessionsError(errorMessage);
      } finally {
        setContributableLoading(false);
        setActiveStoriesLoading(false);
        setFreshSessionsLoading(false);
      }
    };

    fetchAllHomePageData();
  }, [user]);

  // Memoize data to prevent unnecessary re-renders of child components
  const memoizedContributable = useMemo(() => contributableSessions, [contributableSessions]);
  const memoizedStories = useMemo(() => activeStories, [activeStories]);
  const memoizedFreshSessions = useMemo(() => freshSessions, [freshSessions]);

  // Function to check if a story is "New" (completed within the last 7 days)
  const isStoryNew = (story: ProjectsData) => {
    const updatedAt = new Date(story.updated_at);
    const currentDate = new Date();
    const diffInDays = Math.floor((currentDate.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24));
    return diffInDays <= 7;
  };

  // Function to check if a story is "Hot" (10+ reactions in the last 30 days)
  const isStoryHot = (story: ProjectsData) => {
    const updatedAt = new Date(story.updated_at);
    const currentDate = new Date();
    const diffInDays = Math.floor((currentDate.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24));
    return (story.reaction_count ?? 0) >= 10 && diffInDays <= 30;
  };

  // Sort stories by priority: New > Hot > Others
  const sortedActiveStories = useMemo(() => {
    return [...activeStories].sort((a, b) => {
      const aIsNew = isStoryNew(a);
      const bIsNew = isStoryNew(b);
      const aIsHot = isStoryHot(a);
      const bIsHot = isStoryHot(b);
      
      if (aIsNew && !bIsNew) return -1;
      if (!aIsNew && bIsNew) return 1;
      if (aIsHot && !bIsHot) return -1;
      if (!aIsHot && bIsHot) return 1;
      return 0;
    });
  }, [activeStories]);

  return (
    <main className="container mx-auto px-4 py-8">
      <header className="flex flex-col md:flex-row md:justify-between mb-8">
        <div className="mb-4 md:mb-0 text-center md:text-left">
          <h1 className="text-3xl font-bold text-primary-text">
            {username
              ? `Welcome back, ${username.includes('@') ? username.split('@')[0] : username}!`
              : "Welcome!"}
          </h1>
          <p className="text-secondary-text mt-2">
            See what's new in your writing community
          </p>
        </div>
      </header>

      <div className="space-y-12">
        <section>
          <ReadyToWriteSection
            sessions={memoizedContributable}
            isLoading={contributableLoading}
            error={contributableError}
          />
        </section>

        <section>
          <ActiveStoriesSection
            stories={sortedActiveStories}
            isLoading={activeStoriesLoading}
            error={activeStoriesError}
          />
        </section>

        <section>
          <FreshSessionsSection
            sessions={memoizedFreshSessions}
            isLoading={freshSessionsLoading}
            error={freshSessionsError}
          />
        </section>
      </div>
    </main>
  );
};

export default HomePage;
