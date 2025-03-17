import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Pen, User, Award, Settings, Activity } from "lucide-react";
import { supabase, getCurrentUser } from "@/utils/supabase";
import RewardTrophiesPage from "../user/RewardTrophiesPage";
import { Skeleton } from "@/components/ui/skeleton";

interface UserProfile {
  auth_id: string;
  user_profile_name: string;
  user_email: string;
  avatar_url?: string;
  created_at: string;
  bio?: string;
}

const Profile: React.FC = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user data when component mounts
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);

        // Gets current user
        const user = await getCurrentUser();

        if (!user) {
          console.error("No user logged in");
          return;
        }

        // Gets user profile from users_ext table
        const { data, error } = await supabase
          .from("users_ext")
          .select("*")
          .eq("auth_id", user.id)
          .single();

        if (error) {
          console.error("Error fetching user profile:", error);
          return;
        }

        setUserProfile(data);
      } catch (error) {
        console.error("Error in fetchUserProfile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Gets initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 max-w-3xl space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      {/* User Profile Header */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={userProfile?.avatar_url} />
              <AvatarFallback className="text-lg">
                {userProfile?.user_profile_name
                  ? getInitials(userProfile.user_profile_name)
                  : "U"}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-2 flex-1">
              <h1 className="text-2xl font-bold">
                {userProfile?.user_profile_name}
              </h1>
              <p className="text-secondary-text">{userProfile?.user_email}</p>
              <p className="text-sm text-secondary-text">
                Member since{" "}
                {userProfile?.created_at
                  ? new Date(userProfile.created_at).toLocaleDateString()
                  : "Unknown date"}
              </p>
              {userProfile?.bio && (
                <p className="text-sm mt-2">{userProfile.bio}</p>
              )}
            </div>

            <Button variant="outline" className="self-start">
              <Pen className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Navigation */}
      <Tabs
        defaultValue="profile"
        className="w-full"
        onValueChange={setActiveTab}
      >
        <TabsList className="mb-4">
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="achievements">
            <Award className="h-4 w-4 mr-2" />
            Achievements
          </TabsTrigger>
          <TabsTrigger value="activity">
            <Activity className="h-4 w-4 mr-2" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Tab Content */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                View and manage your personal information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Profile information and stats will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements">
          <RewardTrophiesPage />
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your recent contributions and project activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Activity timeline will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Account settings will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
