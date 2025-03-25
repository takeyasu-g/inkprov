import React, { useEffect, useState, useCallback } from "react";
import GenreFilter from "../GenreFilter";
import SearchBar from "../SearchBar";
import SessionCard, { SessionCardSkeleton } from "../SessionCard";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { ProjectsData } from "@/types/global";
import {
  BookPlus,
  Loader2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getSessions } from "@/utils/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";

const OpenSessionsPage: React.FC = () => {
  const { t } = useTranslation();
  const [genreFilter, setGenreFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [allSessions, setAllSessions] = useState<ProjectsData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12; // Shows 12 sessions per page (3 rows of 4 on large screens)

  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const handleCreateSession = useCallback(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    navigate("/sessions/create");
  }, [isAuthenticated, navigate]);

  const handleFetchAllSessions = useCallback(async () => {
    try {
      setIsLoading(true);
      const allSessionsData = await getSessions();

      if (!allSessionsData) {
        setError("No sessions data returned");
        return;
      }

      setAllSessions(allSessionsData);
      setError(null);
      // Reset to first page when loading new data
      setCurrentPage(1);
    } catch (err) {
      setError(`${err}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // useEffect to fetch allSessions *once* on mount
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
    } else {
      // *only fetch if not already fetching!!*
      // *this is to prevent multiple fetches on initial load*
      handleFetchAllSessions();
    }
  }, [handleFetchAllSessions]);

  // Refresh data when the component regains focus (user navigates back to this page)
  useEffect(() => {
    // Only refresh when location pathname changes to /sessions
    if (location.pathname === "/sessions") {
      handleFetchAllSessions();
    }
  }, [location.pathname, handleFetchAllSessions]);

  // Memoize filter functions
  const handleGenreFilter = useCallback((genre: string = t("all")) => {
    setGenreFilter(genre);
    setCurrentPage(1); // Dump back to first page when filter changes
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Dump back to first page when search changes
  }, []);

  // Memoize refresh function
  const handleManualRefresh = useCallback(
    () => handleFetchAllSessions(),
    [handleFetchAllSessions]
  );

  // Filter and sort sessions
  const filteredSessions = React.useMemo(() => {
    if (!allSessions || allSessions.length === 0) return [];

    return allSessions
      .filter((session) => {
        // Only filter if we have filters applied
        if (genreFilter === "all" && searchQuery.trim() === "") {
          return true;
        }

        const matchesGenre =
          genreFilter === t("all") || session.project_genre.toLowerCase() === genreFilter;

        // Only perform search filtering if there's a search query
        if (searchQuery.trim() === "") {
          return matchesGenre;
        }

        const words = searchQuery.toLowerCase().split(" ");
        const matchesSearch = words.some((word) =>
          session.title.toLowerCase().includes(word)
        );

        return matchesGenre && matchesSearch;
      })
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  }, [allSessions, genreFilter, searchQuery]);

  // Calculate pagination values
  const totalPages = Math.ceil(filteredSessions.length / ITEMS_PER_PAGE);

  // Get current page items
  const currentSessions = React.useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredSessions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredSessions, currentPage, ITEMS_PER_PAGE]);

  // Pagination handlers
  const goToNextPage = useCallback(() => {
    setCurrentPage((page) => Math.min(page + 1, totalPages));
  }, [totalPages]);

  const goToPrevPage = useCallback(() => {
    setCurrentPage((page) => Math.max(page - 1, 1));
  }, []);

  // Renders skeletons
  const skeletons = React.useMemo(() => {
    return Array(ITEMS_PER_PAGE)
      .fill(0)
      .map((_, index) => (
        <div key={index} className="flex justify-center">
          <SessionCardSkeleton />
        </div>
      ));
  }, [ITEMS_PER_PAGE]);

  return (
    <main className="container mx-auto px-4 py-8">
      <header className="flex flex-col md:flex-row md:justify-between">
        <div className="mb-8 text-center md:text-left">
          <h1 className="text-3xl font-bold text-primary-text">
            {t("openSessions.header.title")}
          </h1>
          <p className="text-secondary-text mt-2">
            {t("openSessions.header.subtitle")}
          </p>
        </div>

        <div className="hidden xl:flex xl:gap-3">
          <Button
            variant="outline"
            onClick={handleManualRefresh}
            disabled={isLoading}
            className="flex items-center gap-1 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("openSessions.header.refreshLoading")}
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                {t("refresh")}
              </>
            )}
          </Button>
          <SearchBar onSearch={handleSearch} />
          <Button
            className="bg-amber-800 hover:bg-amber-700 cursor-pointer"
            onClick={handleCreateSession}
          >
            <BookPlus />
            <span>{t("createSession")}</span>
          </Button>
        </div>
      </header>

      <nav className="my-6 flex justify-between">
        <GenreFilter onSelect={handleGenreFilter}></GenreFilter>
        <div className="xl:hidden flex gap-3">
          <Button
            variant="outline"
            onClick={handleManualRefresh}
            disabled={isLoading}
            className="md:flex hidden items-center gap-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("openSessions.header.refreshLoading")}
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                {t("refresh")}
              </>
            )}
          </Button>
          <SearchBar onSearch={handleSearch} />
          <Button
            className="bg-amber-800 hover:bg-amber-700 cursor-pointer"
            onClick={handleCreateSession}
          >
            <BookPlus />
            <span className="hidden md:block">{t("createSession")}</span>
          </Button>
        </div>
      </nav>

      {error && <div className="text-red-500 mb-4">{t("error")}: {error}</div>}

      <div className="mb-6">
        <section className="grid grid-cols-1 place-items-center sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading ? (
            skeletons
          ) : currentSessions.length > 0 ? (
            currentSessions.map((session) => (
              <div key={session.id} className="flex space-x-4">
                <SessionCard sessionData={session} />
              </div>
            ))
          ) : (
            <p className="text-center col-span-full text-gray-500">
              {error ? t("loadSessionError") : t("noSessions")}
            </p>
          )}
        </section>
      </div>

      {/* Pagination Controls */}
      {!isLoading && filteredSessions.length > 0 && (
        <div className="flex justify-center items-center gap-4 mt-8 mb-4">
          <Button
            variant="outline"
            onClick={goToPrevPage}
            disabled={currentPage === 1}
            className="h-10 px-4"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            {t("pagination.previous")}
          </Button>

          <div className="text-sm text-secondary-text">
            {t("pagination.page")} {currentPage} {t("of")} {totalPages}
          </div>

          <Button
            variant="outline"
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className="h-10 px-4"
          >
            {t("pagination.next")}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </main>
  );
};

export default OpenSessionsPage;
