import React, { useState } from "react";
import ProjectCard from "../ProjectCard";
import SearchBar from "../SearchBar";
import GenreFilter from "../GenreFilter";
import { ProjectCardData } from "@/types/global";

const ProjectsPage: React.FC = () => {
  const [genreFilter, setGenreFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Placeholder completed projects data
  const completedProjects: ProjectCardData[] = [
    {
      id: "1",
      title: "The Midnight Garden",
      description:
        "A mystical tale of a garden that only appears at midnight, where reality and magic intertwine.",
      genre: "Fantasy",
      contributors: [
        "Alice Smith",
        "Bob Johnson",
        "Carol White",
        "David Brown",
      ],
      dateCompleted: new Date("2024-03-15"),
    },
    {
      id: "2",
      title: "Echoes of Tomorrow",
      description:
        "Five writers explore a future where technology and humanity find new ways to coexist.",
      genre: "Sci-Fi",
      contributors: [
        "Emma Davis",
        "Frank Wilson",
        "Grace Lee",
        "Henry Miller",
        "Isabel Chen",
      ],
      dateCompleted: new Date("2024-03-10"),
    },
    {
      id: "3",
      title: "The Last Train Home",
      description:
        "A collaborative mystery set on a train where each passenger holds a piece of the puzzle.",
      genre: "Mystery",
      contributors: ["James Wright", "Kelly Thompson", "Liam O'Connor"],
      dateCompleted: new Date("2024-03-08"),
    },
    {
      id: "4",
      title: "Seasons of Change",
      description:
        "A heartwarming story about community and growth, told through the eyes of different residents.",
      genre: "Comedy",
      contributors: [
        "Maria Rodriguez",
        "Noah Parker",
        "Olivia Kim",
        "Paul Chen",
      ],
      dateCompleted: new Date("2024-03-01"),
    },
  ];

  // handler to change assign filters
  const handleGenreFilter = (genre: string = "All") => setGenreFilter(genre);
  const handleSearch = (query: string) => setSearchQuery(query);

  // Make filteredSessions[] based on both searchQuery and genreFilter
  const filteredProjects = completedProjects.filter((project) => {
    const matchesGenre = genreFilter === "All" || project.genre === genreFilter;
    const words = searchQuery.toLowerCase().split(" ");
    const matchesSearch =
      searchQuery.trim() === "" ||
      words.some((word) => project.title.toLowerCase().includes(word));
    return matchesGenre && matchesSearch;
  });

  return (
    <main className='container mx-auto px-4 py-8'>
      <header className='flex justify-between'>
        <div className='mb-8 text-left'>
          <h1 className='text-3xl font-bold text-primary-text'>
            Completed Stories
          </h1>
          <p className='text-secondary-text mt-2'>
            Browse and read collaborative stories created by our community
          </p>
        </div>

        <div className='flex gap-3'>
          <SearchBar onSearch={handleSearch} />
        </div>
      </header>

      <nav className='my-6'>
        <GenreFilter onSelect={handleGenreFilter}></GenreFilter>
      </nav>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project) => (
            <ProjectCard key={project.id} projectData={project} />
          ))
        ) : (
          <p className='text-center text-gray-500'>No projects found.</p>
        )}
      </div>
    </main>
  );
};

export default ProjectsPage;
