import React, { useEffect, useState, useMemo, useCallback } from "react";
import ProjectCard, { ProjectCardSkeleton } from "../ProjectCard";
import SearchBar from "../SearchBar";
import GenreFilter from "../GenreFilter";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CompletedStoriesData } from "@/types/global";
import { getAllStoriesWithProfileName } from "@/utils/supabase";
import { useTranslation } from "react-i18next";

const ProjectsPage: React.FC = () => {
  const { t } = useTranslation();
  const [genreFilter, setGenreFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [allProjects, setAllProjects] = useState<CompletedStoriesData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  // getAllProjects + users auth_id and user_profile_name
  const handleFetchAllProjects = async () => {
    try {
      setIsLoading(true);
      const allProjectsData = await getAllStoriesWithProfileName();
      if (!allProjectsData) {
        setError("No projects data returned");
        return;
      }
      setAllProjects(allProjectsData);
      setCurrentPage(1); // Reset to first page
    } catch (error) {
      console.error(error);
      setError("Failed to fetch projects");
    } finally {
      setIsLoading(false);
    }
  };

  // useEffect to fetch allProjects once
  useEffect(() => {
    handleFetchAllProjects();
  }, []);

  // handler to change assign filters
  const handleGenreFilter = (genre: string = t("all")) => {
    setGenreFilter(genre);
    setCurrentPage(1);
  };
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  // Make filteredProjects[] based on both searchQuery and genreFilter
  const filteredProjects = useMemo(() => allProjects.filter((project) => {
    const matchesGenre =
      genreFilter.toLowerCase() === "all" || project.project_genre.toLowerCase() === genreFilter.toLowerCase();
    const words = searchQuery.toLowerCase().split(" ");
    const matchesSearch =
      searchQuery.trim() === "" ||
      words.some((word) => project.title.toLowerCase().includes(word));
    return matchesGenre && matchesSearch;
  }), [allProjects, genreFilter, searchQuery]);

  // Pagination logic
  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);
  const currentProjects = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProjects.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProjects, currentPage, ITEMS_PER_PAGE]);

  const goToNextPage = useCallback(() => {
    setCurrentPage((page) => Math.min(page + 1, totalPages));
  }, [totalPages]);

  const goToPrevPage = useCallback(() => {
    setCurrentPage((page) => Math.max(page - 1, 1));
  }, []);

  const skeletons = useMemo(() => {
    return Array(ITEMS_PER_PAGE)
      .fill(0)
      .map((_, index) => (
        <div key={index} className="flex justify-center">
          <ProjectCardSkeleton />
        </div>
      ));
  }, [ITEMS_PER_PAGE]);

  return (
    <main className="container mx-auto px-4 py-8">
      <header className="flex justify-between">
        <div className="mb-8 text-left">
          <h1 className="text-3xl font-bold text-primary-text">
            {t("stories.header.title")}
          </h1>
          <p className="text-secondary-text mt-2">
            {t("stories.header.subtitle")}
          </p>
        </div>

        <div className="hidden xl:flex gap-3">
          <SearchBar onSearch={handleSearch} />
        </div>
      </header>

      <nav className="my-6 flex justify-between">
        <GenreFilter onSelect={handleGenreFilter}></GenreFilter>
        <div className="xl:hidden xl:gap-3">
          <SearchBar onSearch={handleSearch} />
        </div>
      </nav>

      {/* Error State */}
      {error && <div className="text-red-500 text-center py-4">{error}</div>}

      <div className="grid grid-cols-1 place-items-center sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-10">
        {isLoading ? (
          skeletons
        ) : currentProjects.length > 0 ? (
          currentProjects.map((project) => (
            <div key={project.id} className="flex justify-center">
              <ProjectCard projectData={project} />
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-secondary-text">
            {t("noStories")}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {!isLoading && filteredProjects.length > 0 && (
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

export default ProjectsPage;
