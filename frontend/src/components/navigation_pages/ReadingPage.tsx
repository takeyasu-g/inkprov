import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { ProjectSnippet, UserProfilePopUp } from "@/types/global";
import {
  getProfilesByUserIdsForPopUp,
  getProjectSnippets,
} from "@/utils/supabase";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
} from "@/components/ui";
import ContributorPopup from "@/components/ContributorPopup";

const ReadingPage: React.FC = () => {
  // extract params in the URL to ge the projectId
  const { projectId } = useParams();

  // this gets the passed state from the projectCard => projectData
  const location = useLocation();
  const project = location.state?.project;

  // useStates
  const [projectSnippets, setProjectSnippets] = useState<
    ProjectSnippet[] | null
  >();
  const [contributorsProfile, setContributorsProfile] = useState<
    UserProfilePopUp[] | []
  >([]);

  // handles fetching Project Snippets from the Project ID
  const handleFetchProjectSnippets = async () => {
    try {
      const projectSnippetsData = await getProjectSnippets(projectId);

      if (!projectSnippetsData) {
        throw new Error("No data returned for project snippets");
      }

      setProjectSnippets(projectSnippetsData);

      // need to get unique contributors, in case a user contributed more then once
      const contributors = [
        ...new Set(projectSnippetsData.map((snippet) => snippet.creator_id)),
      ];

      // get profileData for each contributors
      const profilesOfContributors = await getProfilesByUserIdsForPopUp(
        contributors
      );
      setContributorsProfile(profilesOfContributors);
    } catch (error) {
      console.error("Error fetching project snippets:", error);

      // Show error feedback (replace with a toast, modal, or UI message)
      alert("Failed to load project snippets. Please try again.");
    }
  };

  //useEffect on inital render
  useEffect(() => {
    handleFetchProjectSnippets();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="bg-background rounded-lg p-8 shadow-lg border border-primary-border">
        <CardHeader className="mb-2">
          <CardTitle className="text-3xl font-bold text-primary-text mb-2">
            {project?.title}
          </CardTitle>
          <div className="flex flex-wrap gap-4 items-center text-secondary-text">
            <Badge className={`genre-${project.project_genre.toLowerCase()}`}>
              {project?.project_genre}
            </Badge>
            <span>
              Completed:{" "}
              {project?.updated_at
                ? new Date(project.updated_at).toDateString()
                : "No date found"}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pb-10">
          {projectSnippets?.map((snippet) => {
            const contributor = contributorsProfile.find(
              (profile) => profile.id === snippet.creator_id
            );

            return (
              <div key={snippet.id} className="flex items-start gap-5">
                {/* Reusable Contributor Popup */}
                <ContributorPopup
                  profile={
                    contributor || {
                      // had to pass this to make accepet null or undefined contribtor
                      id: "unknown",
                      user_profile_name: "Unknown",
                      user_email: "No email",
                      profile_pic_url: "https://ui-avatars.com/api/?name=?",
                    }
                  }
                />

                {/* Snippet Text */}
                <p className="text-primary-text text-left leading-relaxed indent-6 break-words whitespace-normal">
                  {snippet.content}
                </p>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReadingPage;
