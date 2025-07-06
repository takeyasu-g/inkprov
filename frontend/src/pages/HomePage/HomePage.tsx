import React, { useEffect, useState, useCallback, useMemo } from "react";
import ContributedSessionsCarousel from "./components/ContributedSessionsCarousel";
import JoinSessionCarousel from "./components/JoinSessionCarousel";
import ActiveStoriesSection from "./components/ActiveStoriesSection";
import HeroSection from "./components/HeroSection";
import { getUserContributableSessions, getPopularProjects, getMyProfile } from "@/services/api";
import { ProjectsData } from "@/types/global";
import { useAuth } from "@/contexts/AuthContext";

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const [username, setUsername] = useState("");
  
  // Ready to Write section state
  const [contributableSessions, setContributableSessions] = useState<ProjectsData[]>([]);
  const [contributableLoading, setContributableLoading] = useState(true);
  const [contributableError, setContributableError] = useState<string | null>(null);
  
  // Active Stories section state
  const [activeStories, setActiveStories] = useState<ProjectsData[]>([]);
  const [activeStoriesLoading, setActiveStoriesLoading] = useState(true);
  const [activeStoriesError, setActiveStoriesError] = useState<string | null>(null);

  // Fetch user profile to get the correct username
  useEffect(() => {
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
  }, [user]);

  // Memoized fetch function for contributable sessions to prevent unnecessary re-renders
  const fetchContributableSessions = useCallback(async () => {
    try {
      setContributableLoading(true);
      setContributableError(null);
      const sessions = await getUserContributableSessions();
      setContributableSessions(sessions);
    } catch (error) {
      console.error("Error fetching contributable sessions:", error);
      setContributableError(error instanceof Error ? error.message : "Failed to fetch sessions");
      setContributableSessions([]);
    } finally {
      setContributableLoading(false);
    }
  }, []);

  // Memoized fetch function for active stories to prevent unnecessary re-renders
  const fetchActiveStories = useCallback(async () => {
    try {
      setActiveStoriesLoading(true);
      setActiveStoriesError(null);
      const stories = await getPopularProjects(10); // Limit to 10 stories
      setActiveStories(stories);
    } catch (error) {
      console.error("Error fetching active stories:", error);
      setActiveStoriesError(error instanceof Error ? error.message : "Failed to fetch stories");
      setActiveStories([]);
    } finally {
      setActiveStoriesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContributableSessions();
    fetchActiveStories();
  }, [fetchContributableSessions, fetchActiveStories]);

  // Memoize the sessions and stories to prevent unnecessary re-renders of child components
  const memoizedSessions = useMemo(() => contributableSessions, [contributableSessions]);
  const memoizedStories = useMemo(() => activeStories, [activeStories]);

  return (
    <>
      <main className="min-h-screen p-4 md:p-6 lg:p-8 space-y-12">
        {/* Hero Section into to Home page */}
        <section>
          <HeroSection username={username} />
        </section>

        {/* Ready to Write Section */}
        <section>
          <h2 className="text-xl font-bold mb-2">Ready to Write</h2>
          {contributableLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-button"></div>
            </div>
          ) : contributableError ? (
            <div className="text-center text-red-500 p-4">
              {contributableError}
            </div>
          ) : (
            <ContributedSessionsCarousel
              contributedSessions={memoizedSessions}
            />
          )}
        </section>

        {/* Active Stories Section */}
        <ActiveStoriesSection
          stories={memoizedStories}
          isLoading={activeStoriesLoading}
          error={activeStoriesError}
        />

        {/* Looking for a Session to Join */}
        <section>
          <h2 className="text-xl font-bold mb-2">
            Looking for a Session to Join?
          </h2>
          <JoinSessionCarousel sessions={memoizedSessions} />
        </section>
      </main>
    </>
  );
};

export default HomePage;
