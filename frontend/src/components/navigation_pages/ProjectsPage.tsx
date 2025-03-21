import React, { useEffect, useState } from "react";
import ProjectCard, { ProjectCardSkeleton } from "../ProjectCard";
import SearchBar from "../SearchBar";
import GenreFilter from "../GenreFilter";
import { CompletedStoriesData } from "@/types/global";
import { getAllStoriesWithProfileName } from "@/utils/supabase";

const ProjectsPage: React.FC = () => {
  const [genreFilter, setGenreFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [allProjects, setAllProjects] = useState<CompletedStoriesData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  const handleGenreFilter = (genre: string = "All") => setGenreFilter(genre);
  const handleSearch = (query: string) => setSearchQuery(query);

  // Make filteredProjects[] based on both searchQuery and genreFilter
  const filteredProjects = allProjects.filter((project) => {
    const matchesGenre =
      genreFilter === "All" || project.project_genre === genreFilter;
    const words = searchQuery.toLowerCase().split(" ");
    const matchesSearch =
      searchQuery.trim() === "" ||
      words.some((word) => project.title.toLowerCase().includes(word));
    return matchesGenre && matchesSearch;
  });

  return (
    <main className="container mx-auto px-4 py-8">
      <header className="flex justify-between">
        <div className="mb-8 text-left">
          <h1 className="text-3xl font-bold text-primary-text">
            Completed Stories
          </h1>
          <p className="text-secondary-text mt-2">
            Browse and read collaborative stories created by our community
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
          // Loading skeletons
          Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex space-x-4">
              <ProjectCardSkeleton />
            </div>
          ))
        ) : filteredProjects.length > 0 ? (
          filteredProjects.map((project) => (
            <div key={project.id} className="flex space-x-4">
              <ProjectCard projectData={project} />
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-secondary-text">
            No stories found matching your criteria
          </div>
        )}
      </div>
    </main>
  );
};

export default ProjectsPage;
