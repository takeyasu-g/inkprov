import React, { useEffect, useState, useCallback, useMemo } from "react";
import ContributedSessionsCarousel from "./components/ContributedSessionsCarousel";
import StoryCarousel from "./components/StoryCarousel";
import JoinSessionCarousel from "./components/JoinSessionCarousel";
import HeroSection from "./components/HeroSection";
import { getUserContributableSessions } from "@/services/api";
import { ProjectsData, CompletedStoriesData } from "@/types/global";

const stories: CompletedStoriesData[] = [];
const sessions: ProjectsData[] = [];

const HomePage: React.FC = () => {
  const [contributableSessions, setContributableSessions] = useState<ProjectsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoized fetch function to prevent unnecessary re-renders
  const fetchContributableSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const sessions = await getUserContributableSessions();
      setContributableSessions(sessions);
    } catch (error) {
      console.error("Error fetching contributable sessions:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch sessions");
      setContributableSessions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContributableSessions();
  }, [fetchContributableSessions]);

  // Memoize the sessions to prevent unnecessary re-renders of child components
  const memoizedSessions = useMemo(() => contributableSessions, [contributableSessions]);

  return (
    <>
      <main className="min-h-screen p-4 md:p-6 lg:p-8 space-y-12">
        {/* Hero Section into to Home page */}
        <section>
          <HeroSection username="James"></HeroSection>
        </section>

        {/* Ready to Write Section */}
        <section>
          <h2 className="text-xl font-bold mb-2">Ready to Write</h2>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-button"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 p-4">
              {error}
            </div>
          ) : (
            <ContributedSessionsCarousel
              contributedSessions={memoizedSessions}
            />
          )}
        </section>

        {/* Stories to Read */}
        <section>
          <h2 className="text-xl font-bold mb-2">Stories to Read</h2>
          <StoryCarousel stories={stories} />
        </section>

        {/* Looking for a Session to Join */}
        <section>
          <h2 className="text-xl font-bold mb-2">
            Looking for a Session to Join?
          </h2>
          <JoinSessionCarousel sessions={sessions} />
        </section>
      </main>
    </>
  );
};

export default HomePage;
