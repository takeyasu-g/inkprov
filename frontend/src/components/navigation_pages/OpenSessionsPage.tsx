import React, { useEffect, useState } from "react";
import GenreFilter from "../GenreFilter";
import SearchBar from "../SearchBar";
import SessionCard, { SessionCardSkeleton } from "../SessionCard";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { ProjectsData } from "@/types/global";
import { BookPlus } from "lucide-react";
import { getSessions } from "@/utils/supabase";
import { useAuth } from "@/contexts/AuthContext";

const OpenSessionsPage: React.FC = () => {
  const [genreFilter, setGenreFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [allSessions, setAllSessions] = useState<ProjectsData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [lastFocusTime, setLastFocusTime] = useState<number>(Date.now());

  const handleCreateSession = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    navigate("/sessions/create");
  };

  // getAllSessions
  const handleFetchAllSessions = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching all sessions with fresh contributor counts...");
      const allSessionsData = await getSessions();

      if (!allSessionsData) {
        setError("No sessions data returned");
        return;
      }

      setAllSessions(allSessionsData);
      setError(null);
    } catch (err) {
      setError("Failed to fetch sessions");
    } finally {
      setIsLoading(false);
    }
  };

  // useEffect to fetch allSessions once on mount
  useEffect(() => {
    handleFetchAllSessions();

    // Check if we need to refresh due to joining a project
    const shouldRefresh = sessionStorage.getItem("refreshSessions");
    if (shouldRefresh === "true") {
      // Clear the flag
      sessionStorage.removeItem("refreshSessions");
      // Set a small delay to ensure the DB has been updated
      setTimeout(() => {
        handleFetchAllSessions();
      }, 500);
    }
  }, []);

  // Refresh data when the component regains focus (user returns from another page)
  useEffect(() => {
    const handleFocus = () => {
      // Always refresh when the page gains focus - this ensures contributor counts are up-to-date
      console.log("Window gained focus, refreshing sessions data");
      handleFetchAllSessions();
      setLastFocusTime(Date.now());
    };

    // Add event listener for when the window regains focus
    window.addEventListener("focus", handleFocus);

    // Also refresh when location changes (user navigates back to this page)
    handleFocus();

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [location.pathname]);

  // handler to change assign filters
  const handleGenreFilter = (genre: string = "All") => setGenreFilter(genre);
  const handleSearch = (query: string) => setSearchQuery(query);

  // Make filteredSessions[] based on both searchQuery and genreFilter
  const filteredSessions = allSessions
    ?.filter((session) => {
      const matchesGenre =
        genreFilter === "All" || session.project_genre === genreFilter;
      const words = searchQuery.toLowerCase().split(" ");
      const matchesSearch =
        searchQuery.trim() === "" ||
        words.some((word) => session.title.toLowerCase().includes(word));
      return matchesGenre && matchesSearch;
    })
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

  const renderSkeletons = () => {
    return Array(6)
      .fill(0)
      .map((_, index) => <SessionCardSkeleton key={index} />);
  };

  // Add a refresh button to manually refresh sessions
  const handleManualRefresh = () => {
    handleFetchAllSessions();
    setLastFocusTime(Date.now());
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <header className="flex justify-between">
        <div className="mb-8 text-left">
          <h1 className="text-3xl font-bold text-primary-text">
            Open Writing Sessions
          </h1>
          <p className="text-secondary-text mt-2">
            Join an existing session or create your own!
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleManualRefresh}
            disabled={isLoading}
          >
            {isLoading ? "Refreshing..." : "Refresh"}
          </Button>
          <SearchBar onSearch={handleSearch} />
          <Button
            className="bg-amber-800 hover:bg-amber-700 cursor-pointer"
            onClick={handleCreateSession}
          >
            <BookPlus />
            <span>Create Session</span>
          </Button>
        </div>
      </header>

      <nav className="my-6">
        <GenreFilter onSelect={handleGenreFilter}></GenreFilter>
      </nav>

      {error && <div className="text-red-500 mb-4">Error: {error}</div>}

      {/* TODO: Add pagination */}
      {/* Sort by newest added */}
      <div className="content pb-16">
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            renderSkeletons()
          ) : filteredSessions && filteredSessions.length > 0 ? (
            filteredSessions.map((session) => (
              <SessionCard key={session.id} sessionData={session} />
            ))
          ) : (
            <p className="text-center text-gray-500">
              {error ? "Failed to load sessions" : "No sessions found."}
            </p>
          )}
        </section>
      </div>
    </main>
  );
};

export default OpenSessionsPage;
