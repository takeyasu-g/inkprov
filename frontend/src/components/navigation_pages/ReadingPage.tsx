import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ProjectSnippet, ProjectsData } from "@/types/global";
import { getProjectOfId, getProjectSnippets } from "@/utils/supabase";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  ScrollArea,
} from "@/components/ui";
// temp samples
const exampleContributors: string[] = ["G", "D", "T"];

const ReadingPage: React.FC = () => {
  // extract params in the URL to ge the projectId
  const { projectId } = useParams();

  const [projectSnippets, setProjectSnippets] = useState<
    ProjectSnippet[] | null
  >();
  const [projectData, setProjectData] = useState<ProjectsData | null>();

  // handles fetching Project Snippets from the Project ID
  const handleFetchProjectSnippets = async () => {
    const projectSnippetsData = await getProjectSnippets(projectId);

    if (projectSnippetsData) {
      const orderedSnippets = projectSnippetsData
        .slice() // Create a shallow copy to avoid mutating the original array
        .sort((a, b) => a.sequence_number - b.sequence_number); // Sort in ascending order
      // .map((snippet) => snippet.content); // gets only content

      setProjectSnippets(orderedSnippets);
    }
  };

  // handles fetching projectData where = projectId
  const handleFetchProjectData = async () => {
    const projectData = await getProjectOfId(projectId);
    setProjectData(projectData);
  };

  //useEffect on inital render
  useEffect(() => {
    handleFetchProjectSnippets();
    handleFetchProjectData();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="bg-background rounded-lg p-8 shadow-lg border border-primary-border">
        <CardHeader className="mb-2">
          <CardTitle className="text-3xl font-bold text-primary-text mb-2">
            {projectData?.title}
          </CardTitle>
          <div className="flex flex-wrap gap-4 items-center text-secondary-text">
            <Badge className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm">
              {projectData?.project_genre}
            </Badge>
            <span>
              Completed:{" "}
              {projectData?.updated_at
                ? new Date(projectData.updated_at).toDateString()
                : "No date found"}
            </span>
            <div className="flex items-center gap-2">
              <span>Contributors:</span>
              <div className="flex -space-x-2">
                {exampleContributors.map((contributor, index) => (
                  <div
                    key={index}
                    className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm border-2 border-background"
                    title={contributor}
                  >
                    {contributor[0]}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[320px] p-2">
            {projectSnippets?.map((snippet) => (
              <p
                key={snippet.id}
                className="text-primary-text break-words whitespace-normal"
              >
                {snippet.content}
              </p>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReadingPage;
