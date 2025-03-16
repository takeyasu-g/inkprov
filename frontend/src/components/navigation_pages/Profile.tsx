import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { BookOpen, PenTool } from "lucide-react";
import ProfileStoriesCard from "../ProfileStoriesCard";
import ProfileSkeleton from "../ProfileSkeleton";
import { ProjectsData } from "@/types/global";
import {
  getUsername,
  getBio,
  getProjects,
  getProjectsInprogress,
  getProfilePictureOptions,
  getProfilePicture,
  updateProfilePicture,
} from "@/utils/supabase";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Profile: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Profile States
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [bio, setBio] = useState<string>("");
  const [selectedProfilePicture, setSelectedProfilePicture] = useState<number | null>(null);
  const [profilepictureOptions, setProfilePictureOptions] = useState<string[]>([]);
  const [currentProfilePicture, setCurrentProfilePicture] = useState<string | null>(null);
  const [storiesCompleted, setStoriesCompleted] = useState<ProjectsData[] | null>([]);
  const [storiesInprogress, setStoriesInprogress] = useState<ProjectsData[] | null>([]);

  useEffect(() => {
    setIsLoading(true);
    // Get username
    const fetchUsername = async () => {
      const usernameData = await getUsername();
      const user = usernameData[0].user_profile_name.split("@")[0];
      const username = user[0].toUpperCase() + user.substring(1);
      setUsername(username);
    };

    // Get user bio
    const fetchBio = async () => {
      const bio = await getBio();
      setBio(bio[0].user_profile_bio);
    };

    // Get Completed stories
    const fetchStoriesCompleted = async () => {
      const stories = await getProjects();
      setStoriesCompleted(stories);
    };

    // Get Inprogress stories
    const fetchInProgressStories = async () => {
      const inprogressStories = await getProjectsInprogress();
      setStoriesInprogress(inprogressStories);
    };

    // Get array of URLs of Profile Pictures for users to select from
    const fetchProfilePictureOptions = async () => {
      const profilePictures = await getProfilePictureOptions();
      setProfilePictureOptions(profilePictures);
    };

    // Get Profile Picture for logged in user
    const fetchProfilePicture = async () => {
      const profilePicture = await getProfilePicture();
      setCurrentProfilePicture(profilePicture);
    };

    fetchUsername();
    fetchBio();
    fetchProfilePicture();
    fetchProfilePictureOptions();
    fetchStoriesCompleted();
    fetchInProgressStories();

    setIsLoading(false);
  }, []);

  const getInitials = () => {
    if (!user?.email) return "?";
    return user.email
      .split("@")[0]
      .split(".")
      .map((n: string) => n[0].toUpperCase())
      .join("");
  };

  return (
    <>
      {isLoading ? (
        <ProfileSkeleton />
      ) : (
        <div className="h-full mb-5">
          <section className="w-full space-y-8 bg-card p-8 mt-5 rounded-lg border border-primary-border pb-4">
            <section className="flex">
              <div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <div className="relative group w-22 h-22 cursor-pointer">
                      <Avatar className="w-22 h-22 cursor-pointer">
                        <AvatarImage
                          src={
                            currentProfilePicture ||
                            user?.user_metadata?.avatar_url
                          }
                        />
                        <AvatarFallback className="bg-white border border-tab-active">
                          {getInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute inset-0 bg-background bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-60 transition-opacity duration-300 rounded-full">
                        <span className="text-primary-text text-sm font-bold">
                          Change
                        </span>
                      </div>
                    </div>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-primary-text font-bold">
                        Select Profile Picture
                      </AlertDialogTitle>
                      <AlertDialogDescription className="flex justify-between flex-wrap">
                        {profilepictureOptions.length > 0
                          ? profilepictureOptions.map((url, index) => (
                              <img
                                key={index}
                                src={url}
                                alt={url.substring(url.lastIndexOf("/") + 1)}
                                className={`w-32 h-32 rounded-full cursor-pointer ${
                                  selectedProfilePicture === index
                                    ? "border-3 border-primary-button-hover"
                                    : ""
                                }`}
                                onClick={() => setSelectedProfilePicture(index)}
                              />
                            ))
                          : "No Profile Pictures Available"}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel
                        className="cursor-pointer"
                        onClick={() => setSelectedProfilePicture(null)}
                      >
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        disabled={selectedProfilePicture === null}
                        onClick={() => {
                          if (selectedProfilePicture !== null) {
                            setCurrentProfilePicture(
                              profilepictureOptions[selectedProfilePicture]
                            );
                            setSelectedProfilePicture(null);
                            updateProfilePicture(
                              profilepictureOptions[selectedProfilePicture]
                            );
                          }
                        }}
                        className="bg-primary-button hover:bg-primary-button-hover cursor-pointer"
                      >
                        Select
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              <article>
                <h3 className="text-2xl font-bold text-primary-text text-left mb-1 ml-3">
                  {username}
                </h3>
                {/* Completed Stories Tracker */}
                <div className="flex items-center ml-3 text-secondary-text">
                  <BookOpen size={20} />
                  <p className="ml-2 mb-1">
                    {storiesCompleted?.length} Completed Stories
                  </p>
                </div>
                {/* In Progress Stories Tracker */}
                <div className="flex items-center ml-3 text-secondary-text">
                  <PenTool size={20} />
                  <p className="ml-2 mb-1">
                    {storiesInprogress?.length}/5 In Progress Stories
                  </p>
                </div>
              </article>
            </section>
            {/* Bio */}
            <section className="flex flex-col">
              <h3 className="text-xl font-bold text-primary-text text-left mb-1 ml-3">
                About Me
              </h3>
              <p className="ml-3 text-secondary-text text-left">
                {bio.length > 0 ? bio : "No Bio Written"}
              </p>
            </section>
          </section>
          {/* My Stories */}
          <section className="w-full space-y-8 bg-card p-8 my-5 rounded-lg border border-primary-border">
            <section className="flex flex-col">
              <div className="flex items-center text-secondary-text">
                <BookOpen />
                <h3 className="text-xl font-bold text-primary-text text-left mb-1 ml-3">
                  Your Stories
                </h3>
              </div>
              <p className="ml-3 text-secondary-text text-left">
                Stories you've contributed to
              </p>
            </section>
            {/* Completed and In Progress Stories Tabs */}
            <Tabs defaultValue="completed">
              <TabsList className="grid grid-cols-2 bg-tab-background">
                <TabsTrigger
                  value="completed"
                  className="data-[state=active]:text-white data-[state=active]:bg-tab-active cursor-pointer"
                >
                  Completed
                </TabsTrigger>
                <TabsTrigger
                  value="in-progress"
                  className="data-[state=active]:text-white data-[state=active]:bg-tab-active cursor-pointer"
                >
                  In progress
                </TabsTrigger>
              </TabsList>
              {/* Completed Stories Tab Content*/}
              <TabsContent value="completed">
                <section className="flex gap-4 flex-wrap">
                  {storiesCompleted == undefined ||
                  storiesCompleted?.length == 0 ? (
                    <div className="h-auto flex flex-col">
                      <p className="text-secondary-text font-medium mb-2">
                        No Completed Stories
                      </p>
                      <Button
                        className="bg-primary-button hover:bg-primary-button-hover cursor-pointer"
                        variant="default"
                        onClick={() => navigate("/sessions/create")}
                      >
                        Start Creating
                      </Button>
                    </div>
                  ) : (
                    // Completed Stories Cards
                    storiesCompleted?.map((story) => (
                      <ProfileStoriesCard
                        selectedTab="completed"
                        genre={story.project_genre}
                        creationDate={story.created_at}
                        title={story.title}
                        collaborators={story.total_contributors}
                        wordCount={1051}
                        lastUpdated={story.updated_at}
                        publicStory={story.is_public}
                        storyId={story.id}
                        key={story.id}
                      />
                    ))
                  )}
                </section>
              </TabsContent>
              {/* In Progress Stories Tab Content*/}
              <TabsContent value="in-progress">
                <section className="flex gap-4 flex-wrap">
                  {storiesInprogress == undefined ||
                  storiesInprogress?.length == 0 ? (
                    <div className="h-auto flex flex-col">
                      <p className="text-secondary-text font-medium mb-2">
                        No Stories in progress
                      </p>
                      <Button
                        className="bg-primary-button hover:bg-primary-button-hover cursor-pointer"
                        variant="default"
                        onClick={() => navigate("/sessions/create")}
                      >
                        Start Creating
                      </Button>
                    </div>
                  ) : (
                    // In Progress Stories Cards
                    storiesInprogress?.map((story) => (
                      <ProfileStoriesCard
                        selectedTab="in-progress"
                        genre={story.project_genre}
                        creationDate={story.created_at}
                        title={story.title}
                        collaborators={story.total_contributors}
                        wordCount={1051}
                        lastUpdated={story.updated_at}
                        publicStory={story.is_public}
                        storyId={story.id}
                        key={story.id}
                      />
                    ))
                  )}
                </section>
              </TabsContent>
            </Tabs>
          </section>
        </div>
      )}
    </>
  );
};

export default Profile;
