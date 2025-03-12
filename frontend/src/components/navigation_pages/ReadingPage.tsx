import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ProjectSnippet, ProjectsData } from "@/types/global";
import { getProjectOfId, getProjectSnippets } from "@/utils/supabase";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  ScrollArea,
} from "@/components/ui";

const ReadingPage: React.FC = () => {
  // extract params in the URL to ge the projectId
  const { projectId } = useParams();

  const [projectSnippets, setProjectSnippets] = useState<
    ProjectSnippet[] | null
  >();
  const [projectData, setProjectData] = useState<ProjectsData[] | null>();

  // handles fetching Project Snippets from the Project ID
  const handleFetchProjectSnippets = async () => {
    const projectSnippetsData = await getProjectSnippets(projectId);

    console.log(projectSnippetsData);
    setProjectSnippets(projectSnippetsData);
  };

  // handles fetching projectData where = projectId
  const handleFetchProjectData = async () => {
    const projectData = await getProjectOfId(projectId);

    console.log(projectData);
    setProjectData(projectData);
  };

  //useEffect on inital render
  useEffect(() => {
    handleFetchProjectSnippets();
    handleFetchProjectData();
  }, []);

  // Placeholder data - this would come from your database
  const exampleProject = {
    title: "The Midnight Garden",
    genre: "Fantasy",
    contributors: ["Alice Smith", "Bob Johnson", "Carol White", "David Brown"],
    dateCompleted: "2024-03-15",
    content: `In the heart of an ancient city, where cobblestone streets whispered tales of centuries past, stood a peculiar garden that only appeared at midnight. The wrought-iron gates would materialize from the mist, their intricate patterns seeming to dance in the moonlight. Local legends spoke of wishes granted and destinies altered within its mysterious bounds.

Sarah discovered it quite by accident, during one of her late-night walks. The sound of tinkling wind chimes drew her attention, though there wasn't a breath of wind that night. As she approached, the gates swung open silently, inviting her into a world that defied explanation.

Flowers that glowed like starlight lined the paths, their petals changing colors with each passing moment. In the center stood a fountain that flowed upward, its water defying gravity as it created shapes in the air – dragons, unicorns, and phoenixes that seemed almost alive.

The garden had chosen her, just as it had chosen others before. Each midnight visitor would add their own magic to this place, their stories intertwining like the vines that climbed the invisible walls. Sarah reached out to touch a flower, and as her fingers brushed its petals, she felt the stories of all who had come before her...`,
  };

  return (
    <div className='container mx-auto px-4 py-8 max-w-4xl'>
      <div className='bg-background rounded-lg p-8 shadow-lg border border-primary-border'>
        <header className='mb-8'>
          <h1 className='text-3xl font-bold text-primary-text mb-2'>
            {exampleProject.title}
          </h1>
          <div className='flex flex-wrap gap-4 items-center text-secondary-text'>
            <span className='bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm'>
              {exampleProject.genre}
            </span>
            <span>Completed: {exampleProject.dateCompleted}</span>
            <div className='flex items-center gap-2'>
              <span>Contributors:</span>
              <div className='flex -space-x-2'>
                {exampleProject.contributors.map((contributor, index) => (
                  <div
                    key={index}
                    className='w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm border-2 border-background'
                    title={contributor}
                  >
                    {contributor[0]}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </header>

        <article className='prose prose-lg max-w-none'>
          {exampleProject.content.split("\n\n").map((paragraph, index) => (
            <p key={index} className='text-primary-text'>
              {paragraph}
            </p>
          ))}
        </article>
      </div>
    </div>
  );
};

export default ReadingPage;
