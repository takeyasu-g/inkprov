import React from "react";
import { Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Badge,
} from "@/components/ui";

// Receive props from SessionPage component
// SessionPage needs to handle fetch session data from the database
// TO DO => interface needs to be put in a global file later?
// might need to refactor to either pass the properties of session or pass the whole session data as object
interface ProjectCardProps {
  id: string;
  title: string;
  description: string;
  genre: string;
  contributors: string[];
  dateCompleted: string;
}

// TO DO => implement a way for the card to switch between sessions card to project card
// based on if on SessionPage or ExplorePage
const ProjectCard: React.FC<ProjectCardProps> = ({
  id,
  title,
  description,
  genre,
  contributors,
  dateCompleted,
}) => {
  const navigate = useNavigate();

  return (
    <Card className="w-[350px] h-[250px] bg-background">
      <CardHeader>
        <div className="flex justify-between items-center">
          <Badge className="bg-indigo-100 text-indigo-800">{genre}</Badge>
          <div className="flex items-center gap-1">
            <Users className="text-secondary-text h-4 w-4" />
            <span className="text-secondary-text text-sm">
              {contributors.length} contributors
            </span>
          </div>
        </div>
        <CardTitle className="text-primary-text text-left font-bold">
          {title}
        </CardTitle>
      </CardHeader>
      <div>
        <CardDescription className="m-4 text-secondary-text">
          {description}
        </CardDescription>
      </div>
      <CardFooter className="flex justify-between items-center">
        <span className="text-sm text-secondary-text">
          Completed: {new Date(dateCompleted).toLocaleDateString()}
        </span>
        <Button
          className="bg-primary-button hover:bg-primary-button-hover"
          onClick={() => navigate(`/projects/${id}/read`)}
        >
          Read Story
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;
