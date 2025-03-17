import React, { useEffect, useState } from "react";
import ProjectCard from "../ProjectCard";
import SearchBar from "../SearchBar";
import GenreFilter from "../GenreFilter";
import { ProjectsData } from "@/types/global";
import { getProjects } from "@/utils/supabase";

const ProjectsPage: React.FC = () => {
  const [genreFilter, setGenreFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [allProjects, setAllProjects] = useState<ProjectsData[]>([]);

  // getAllProjects
  const handleFetchAllProjects = async () => {
    try {
      const allProjectsData = await getProjects();


      // if allProjectsData returns null, it will return empty []


      setAllProjects(allProjectsData || []);
    } catch (error) {
      console.error(error);
    }
  };

  // useEffect to fetch allSessions once
  useEffect(() => {
    handleFetchAllProjects();
  }, []);

  // handler to change assign filters
  const handleGenreFilter = (genre: string = "All") => setGenreFilter(genre);
  const handleSearch = (query: string) => setSearchQuery(query);

  // Make filteredSessions[] based on both searchQuery and genreFilter
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

        <div className="flex gap-3">
          <SearchBar onSearch={handleSearch} />
        </div>
      </header>

      <nav className="my-6">
        <GenreFilter onSelect={handleGenreFilter}></GenreFilter>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project) => (
            <ProjectCard key={project.id} projectData={project} />
          ))
        ) : (
          <p className="text-center text-gray-500">No Stories Found.</p>
        )}
      </div>
    </main>
  );
};

export default ProjectsPage;