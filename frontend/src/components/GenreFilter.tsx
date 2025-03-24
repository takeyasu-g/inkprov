import React, { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "react-i18next";

// hard coded some genres here
const genres: string[] = [
  "all",
  "adventure",
  "comedy",
  "crime",
  "fantasy",
  "history",
  "horror",
  "mystery",
  "paranormal",
  "romance",
  "scifi",
  "thriller",
  "western",
];
interface GenreFilterProps {
  onSelect: (genre: string) => void;
}

const GenreFilter: React.FC<GenreFilterProps> = ({ onSelect }) => {
  const { t } = useTranslation();
  const [selectedGenre, setSelectedGenre] = useState<string>("All");

  // this handler sends filter selected to SessionsPage to render filter
  const handleSelectFilter = (value: string | null) => {
    // if value is truthy send the filter type to parent
    // and prevent to spam onSelect handler
    if (value) {
      setSelectedGenre(value);
      onSelect(value); // sending what genre to filter
    } else {
      // if we want to refresh on re-select, but then could be spammed
    }
  };

  return (
    // ToggleGroup is like a bunch of Buttons together, when selected a button it will go to handleSelect
    <nav className="pb-2">
      {/* Dropdown for mobile devices */}
      <div className="block xl:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={`px-4 py-2 text-white ${`genre-${selectedGenre.toLowerCase()}`} cursor-pointer rounded-lg w-auto text-left`}
            >
              {selectedGenre.toLowerCase() === "all" ? t("all") : t(`genres.${selectedGenre.toLowerCase()}`)} <span className="ml-2">▼</span> 
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-fit bg-white">
            <DropdownMenuLabel>{t("genresTitle")}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {genres.map((genre) => (
              <DropdownMenuItem
                key={genre}
                onClick={() => handleSelectFilter(genre)}
                className="cursor-pointer px-4 py-2 text-sm hover:bg-amber-600 rounded-lg"
              >
                {genre === "all" ? t("all") : t(`genres.${genre}`)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ToggleGroup
        className="hidden xl:flex gap-1 bg-secondary-background text-[var(--filter-btn-text)]"
        type="single"
        value={selectedGenre.toLowerCase() === "all" ? "All" : selectedGenre.toLowerCase()}
        onValueChange={handleSelectFilter}
      >
        {/* map through hard coded genres */}
        {genres.map((genre) => (
          <ToggleGroupItem
            className="px-4 min-w-auto  hover:bg-amber-600 rounded-lg not-data-[state=on]:hover:text-white data-[state=on]:text-white data-[state=on]:bg-amber-700 data-[state=on]:rounded-lg cursor-pointer"
            key={genre}
            value={genre}
          >
            {genre === "all" ? t("all") : t(`genres.${genre}`)}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </nav>
  );
};

export default GenreFilter;
