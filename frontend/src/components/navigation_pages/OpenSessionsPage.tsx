import React, { useEffect, useState } from "react";
import GenreFilter from "../GenreFilter";
import SearchBar from "../SearchBar";
import SessionCard, { SessionCardSkeleton } from "../SessionCard";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { ProjectsData } from "@/types/global";
import { BookPlus, Loader2, RefreshCw } from "lucide-react";
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

  // entry handling
  const handleCreateSession = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    navigate("/sessions/create");
  };

  // getAllSessions
  // this gets all sessions (open projects) for display on the main page

  const handleFetchAllSessions = async () => {
    try {
      setIsLoading(true);

      const allSessionsData = await getSessions();

      if (!allSessionsData) {
        setError("No sessions data returned");
        return;
      }

      setAllSessions(allSessionsData);
      setError(null);
    } catch (err) {
      setError(`${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  // useEffect to fetch allSessions once on mount
  useEffect(() => {
    // Check if we need to refresh due to joining a project
    const shouldRefresh = sessionStorage.getItem("refreshSessions");
    if (shouldRefresh === "true") {
      // Clear the flag immediately to prevent multiple refreshes
      sessionStorage.removeItem("refreshSessions");
      // Set a small delay to ensure the DB has been updated otherwise stuff breaks
      setTimeout(() => {
        handleFetchAllSessions();
      }, 500);
    }

    // Always fetch data on mount, regardless of the flag
    handleFetchAllSessions();
  }, []);

  // Refresh data when the component regains focus (user returns from another page)
  useEffect(() => {
    // Only refresh when location changes (user navigates back to this page)

    // If we're on the sessions page, fetch fresh data
    if (location.pathname === "/sessions") {
      handleFetchAllSessions();
    }

    // No need for cleanup function since we're not adding event listeners
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

  // loading placeholders
  const renderSkeletons = () => {
    return Array(6)
      .fill(0)
      .map((_, index) => <SessionCardSkeleton key={index} />);
  };

  // Adds a refresh button to manually refresh sessions
  // TODO: this may be no longer needed
  const handleManualRefresh = () => {
    handleFetchAllSessions();
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
            className="flex items-center gap-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Refresh
              </>
            )}
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
        <GenreFilter onSelect={handleGenreFilter} />
      </nav>

      {error && <div className="text-red-500 mb-4">Error: {error}</div>}

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
