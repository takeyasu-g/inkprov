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

  useEffect(() => {
    // Fetch user profile
    if (user) {
      getMyProfile()
        .then((profile) => {
          setUsername(profile.profile.user_profile_name || "");
        })
        .catch((error) => {
          console.error("Error fetching profile:", error);
          setUsername("");
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

  return (
    <>
      <main className="min-h-screen p-4 md:p-6 lg:p-8 space-y-12">
        <div className="max-w-screen-xl mx-auto">
          <section>
            <HeroSection username={username} />
          </section>

          <ReadyToWriteSection
            sessions={memoizedContributable}
            isLoading={contributableLoading}
            error={contributableError}
          />

          <ActiveStoriesSection
            stories={memoizedStories}
            isLoading={activeStoriesLoading}
            error={activeStoriesError}
          />

          <FreshSessionsSection
            sessions={memoizedFreshSessions}
            isLoading={freshSessionsLoading}
            error={freshSessionsError}
          />
        </div>
      </main>
    </>
  );
};

export default HomePage;
