import React, { useEffect, useState } from "react";
import GenreFilter from "../GenreFilter";
import SearchBar from "../SearchBar";
import SessionCard, { SessionCardSkeleton } from "../SessionCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
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
  const { isAuthenticated } = useAuth();

  const handleCreateSession = () => {
    console.log("Create session clicked, auth state:", isAuthenticated);
    if (!isAuthenticated) {
      console.log("User not authenticated, redirecting to login");
      navigate("/login");
      return;
    }
    navigate("/sessions/create");
  };

  // getAllSessions
  const handleFetchAllSessions = async () => {
    try {
      setIsLoading(true);
      const allSessionsData = await getSessions();
      console.log("Fetched sessions data:", allSessionsData);

if (!allSessionsData) {
        setError("No sessions data returned");
        return;
      }
      setAllSessions(allSessionsData);
      setError(null);
    } catch (err) {
      console.error("Error fetching sessions:", err);
      setError("Failed to fetch sessions");
    } finally {
      setIsLoading(false);
    }
  };
  // useEffect to fetch allSessions once
  useEffect(() => {
    handleFetchAllSessions();
  }, []);
  // handler to change assign filters
  const handleGenreFilter = (genre: string = "All") => setGenreFilter(genre);
  const handleSearch = (query: string) => setSearchQuery(query);
  // Make filteredSessions[] based on both searchQuery and genreFilter
  const filteredSessions = allSessions?.filter((session) => {
    const matchesGenre =
      genreFilter === "All" || session.project_genre === genreFilter;
    const words = searchQuery.toLowerCase().split(" ");
    const matchesSearch =
      searchQuery.trim() === "" ||
      words.some((word) => session.title.toLowerCase().includes(word));
    return matchesGenre && matchesSearch;
  });
  const renderSkeletons = () => {
    return Array(6)
      .fill(0)
      .map((_, index) => <SessionCardSkeleton key={index} />);
  };
  return (
    <main className="container mx-auto px-4 py-8">
      <header className="flex justify-between">
        <div className="mb-8 text-left">
          <h1 className="text-3xl font-bold text-primary-text">
            Open Writing Sessions
          </h1>
          <p className="text-secondary-text mt-2">
            Join an existing session or create your own.
          </p>
        </div>

        <div className="flex gap-3">
          <SearchBar onSearch={handleSearch} />
          <Button
            className="bg-amber-800 hover:bg-amber-700"
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
    </main>
  );
};

export default OpenSessionsPage;
