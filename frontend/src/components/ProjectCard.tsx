import React from "react";
import { Users } from "lucide-react";
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
interface SessionCard {
  currentUsers: number;
  maxUsers: number;
  title: string;
  description: string;
  genre: string;
  // Id of session?
}

// TO DO => implement a way for the card to switch between sessions card to project card
// based on if on SessionPage or ExplorePage
const ProjectCard: React.FC<SessionCard> = ({
  currentUsers,
  maxUsers,
  title,
  description,
  genre,
}): React.ReactElement => {
  return (
    <Card className='w-[350px] h-[250px] bg-backgournd-card'>
      <CardHeader>
        <div className='flex justify-between items-center'>
          <Badge className='bg-amber-600'>{genre}</Badge>
          <div className='flex'>
            <Users className='text-amber-800 mx-1' />
            <span className='text-amber-800'>
              {currentUsers}/{maxUsers}
            </span>
          </div>
        </div>
        <CardTitle className='text-amber-900 text-left font-bold'>
          {title}
        </CardTitle>
      </CardHeader>
      <div className='bg-white'>
        <CardDescription className='m-4 text-amber-700'>
          {description}
        </CardDescription>
      </div>
      <CardFooter className='flex justify-center'>
        {/* TO DO => needs a handler for onClick(), but not should how to implement that (wait until fetched data is done in SessionPage component) */}
        <Button
          className='bg-amber-800  hover:bg-amber-700'
          onClick={(): void => console.log("co-writing page of session Id")}
        >
          Join Session
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;
