import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPen,
  faUsers,
  faStar,
  faTrophy,
  faCrown,
  faBookOpen,
  faFeather,
  faAward,
  faGem,
  faFire,
  faHeart,
  faUser,
  faSchool,
} from "@fortawesome/free-solid-svg-icons";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase, getCurrentUser } from "@/utils/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: any; // FontAwesome icon
  category: string;
  requiredValue: number;
  isUnlocked: boolean;
  progress: number; // Current progress toward achievement (percentage or count)
  color: string; // Color for the achievement icon
}

interface RewardTrophiesPageProps {
  userId?: string; // Optional - if not provided, will use the current user
}

const RewardTrophiesPage: React.FC<RewardTrophiesPageProps> = ({ userId }) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [userStats, setUserStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>("all");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);

        // Get the current user if userId is not provided
        let targetUserId = userId;
        if (!targetUserId) {
          const currentUser = await getCurrentUser();
          if (!currentUser) return;
          targetUserId = currentUser.id;
        }

        // Fetch user stats from the database - using the correct table name
        const { data: stats, error } = await supabase
          .from("user_gamification_stats") // Changed from "user_stats" to "user_gamification_stats" to match current supabase titling
          .select("*")
          .eq("user_id", targetUserId)
          .single();

        // Create default stats object
        const defaultStats = {
          user_id: targetUserId,
          user_total_projects_created: 0,
          user_total_contribution: 0,
          projects_completed: 0,
          user_total_wordcount: 0,
          comments_made: 0,
          likes_given: 0,
          likes_received: 0,
          unique_projects_contributed: 0,
          user_total_invites: 0,
          user_total_score: 0,
          user_total_logins: 0,
        };

        // If no record exists for this user, create one
        if (!stats && !error) {
          // Insert default stats for this user
          const { data: insertedStats, error: insertError } = await supabase
            .from("user_gamification_stats")
            .insert([defaultStats])
            .select()
            .single();

          if (insertError) {
            console.error("Error creating default stats:", insertError);
            setUserStats(defaultStats);
          } else {
            setUserStats(insertedStats);
          }
        } else if (error) {
          console.error("Error fetching user stats:", error);
          setUserStats(defaultStats);
        } else {
          setUserStats(stats);
        }

        // Function to calculate which achievements are unlocked
        calculateAchievements(
          stats || {
            user_id: targetUserId,
            user_total_projects_created: 0,
            user_total_contribution: 0,
            projects_completed: 0,
            user_total_wordcount: 0,
            comments_made: 0,
            likes_given: 0,
            likes_received: 0,
            unique_projects_contributed: 0,
            user_total_invites: 0,
            user_total_score: 0,
            user_total_logins: 0,
          }
        );
      } catch (error) {
        console.error("Error in fetchUserData:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  const calculateAchievements = (stats: any) => {
    const allAchievements: Achievement[] = [
      // Writing achievements
      {
        id: "demo_champion",
        name: "Demo Day Darling",
        description: "Attended Inkprov's Demo Event!",
        icon: faSchool,
        category: "special",
        requiredValue: 1,
        isUnlocked: stats.attended_demo_day >= 1,
        progress: Math.min(stats.attended_demo_day, 1) * 100,
        color: "#facc7d", // volt
      },
      {
        id: "first_contribution",
        name: "First Contribution",
        description: "Made your first contribution to a project",
        icon: faPen,
        category: "writing",
        requiredValue: 1,
        isUnlocked: stats.user_total_contribution >= 1,
        progress: Math.min(stats.user_total_contribution, 1) * 100,
        color: "#3B82F6", // blue
      },
      {
        id: "prolific_writer",
        name: "Prolific Writer",
        description: "Made 10 contributions to projects",
        icon: faFeather,
        category: "writing",
        requiredValue: 10,
        isUnlocked: stats.user_total_contribution >= 10,
        progress: Math.min(stats.user_total_contribution / 10, 1) * 100,
        color: "#8B5CF6", // purple
      },
      {
        id: "wordsmith",
        name: "Wordsmith",
        description: "Written 1,000 words across all projects",
        icon: faBookOpen,
        category: "writing",
        requiredValue: 1000,
        isUnlocked: stats.user_total_wordcount >= 1000,
        progress: Math.min(stats.user_total_wordcount / 1000, 1) * 100,
        color: "#EC4899", // pink
      },

      // Creation achievements
      {
        id: "project_creator",
        name: "Project Creator",
        description: "Created your first writing project",
        icon: faStar,
        category: "creation",
        requiredValue: 1,
        isUnlocked: stats.user_total_projects_created >= 1,
        progress: Math.min(stats.user_total_projects_created, 1) * 100,
        color: "#F59E0B", // amber
      },
      {
        id: "visionary",
        name: "Visionary",
        description: "Created 5 writing projects",
        icon: faCrown,
        category: "creation",
        requiredValue: 5,
        isUnlocked: stats.user_total_projects_created >= 5,
        progress: Math.min(stats.user_total_projects_created / 5, 1) * 100,
        color: "#10B981", // emerald
      },

      // Completion achievements
      {
        id: "finisher",
        name: "Finisher",
        description: "Completed your first project",
        icon: faTrophy,
        category: "completion",
        requiredValue: 1,
        isUnlocked: stats.projects_completed >= 1,
        progress: Math.min(stats.projects_completed, 1) * 100,
        color: "#F97316", // orange
      },
      {
        id: "master_storyteller",
        name: "Master Storyteller",
        description: "Completed 3 projects",
        icon: faGem,
        category: "completion",
        requiredValue: 3,
        isUnlocked: stats.projects_completed >= 3,
        progress: Math.min(stats.projects_completed / 3, 1) * 100,
        color: "#EF4444", // red
      },

      // Social achievements
      {
        id: "loyal_user",
        name: "Loyal User",
        description: "Logged into the platform 5 times",
        icon: faUser,
        category: "social",
        requiredValue: 5,
        isUnlocked: stats.user_total_logins >= 5,
        progress: Math.min(stats.user_total_logins / 5, 1) * 100,
        color: "#14B8A6", // teal
      },
      {
        id: "appreciator",
        name: "Appreciator",
        description: "Gave 10 likes to other projects",
        icon: faHeart,
        category: "social",
        requiredValue: 10,
        isUnlocked: stats.likes_given >= 10,
        progress: Math.min(stats.likes_given / 10, 1) * 100,
        color: "#DC2626", // red
      },
      {
        id: "popular",
        name: "Popular",
        description: "Received 10 likes on your projects",
        icon: faFire,
        category: "social",
        requiredValue: 10,
        isUnlocked: stats.likes_received >= 10,
        progress: Math.min(stats.likes_received / 10, 1) * 100,
        color: "#FB923C", // orange
      },

      // Special achievements
      {
        id: "community_member",
        name: "Community Member",
        description: "Contributed to 5 different projects",
        icon: faUsers,
        category: "special",
        requiredValue: 5,
        isUnlocked: stats.unique_projects_contributed || 0 >= 5,
        progress:
          Math.min((stats.unique_projects_contributed || 0) / 5, 1) * 100,
        color: "#0EA5E9", // sky
      },
      {
        id: "all_star",
        name: "All-Star",
        description: "Unlocked 5 other achievements",
        icon: faAward,
        category: "special",
        requiredValue: 5,
        isUnlocked: false,
        progress: 0,
        color: "#FBBF24", // amber
      },
    ];

    const unlockedCount = allAchievements.filter(
      (a) => a.id !== "all_star" && a.isUnlocked
    ).length;
    const allStarIndex = allAchievements.findIndex((a) => a.id === "all_star");
    if (allStarIndex >= 0) {
      allAchievements[allStarIndex].isUnlocked = unlockedCount >= 5;
      allAchievements[allStarIndex].progress =
        Math.min(unlockedCount / 5, 1) * 100;
    }

    setAchievements(allAchievements);
  };

  const filteredAchievements =
    activeTab === "all"
      ? achievements
      : achievements.filter(
          (achievement) => achievement.category === activeTab
        );

  const unlockedCounts = {
    all: achievements.filter((a) => a.isUnlocked).length,
    writing: achievements.filter(
      (a) => a.category === "writing" && a.isUnlocked
    ).length,
    creation: achievements.filter(
      (a) => a.category === "creation" && a.isUnlocked
    ).length,
    completion: achievements.filter(
      (a) => a.category === "completion" && a.isUnlocked
    ).length,
    social: achievements.filter((a) => a.category === "social" && a.isUnlocked)
      .length,
    special: achievements.filter(
      (a) => a.category === "special" && a.isUnlocked
    ).length,
  };

  const renderAchievementCard = (achievement: Achievement) => {
    return (
      <Card
        key={achievement.id}
        className={`achievement-card ${
          !achievement.isUnlocked ? "opacity-60" : ""
        }`}
      >
        <CardContent className="p-4 flex items-center">
          <div
            className="achievement-icon mr-4 rounded-full p-3"
            style={{
              backgroundColor: achievement.isUnlocked
                ? achievement.color
                : "#CBD5E1",
              color: "white",
              width: 48,
              height: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FontAwesomeIcon icon={achievement.icon} size="lg" />
          </div>
          <div className="achievement-details flex-1">
            <h3 className="font-semibold text-base">{achievement.name}</h3>
            <p className="text-sm text-secondary-text">
              {achievement.description}
            </p>

            <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="h-2.5 rounded-full transition-all duration-500 ease-in-out"
                style={{
                  width: `${achievement.progress}%`,
                  backgroundColor: achievement.isUnlocked
                    ? achievement.color
                    : "#9CA3AF",
                }}
              />
            </div>

            {achievement.isUnlocked && (
              <Badge
                className="mt-2"
                style={{ backgroundColor: achievement.color }}
              >
                Unlocked
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="trophies-container">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FontAwesomeIcon icon={faTrophy} className="mr-2 text-amber-500" />
            Achievements & Trophies
          </CardTitle>
          <CardDescription>
            Track your progress and unlock achievements as you write, create,
            and engage with the community.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="achievement-stats mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="stat-card bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-secondary-text">Contributions</p>
              <p className="text-2xl font-bold">
                {userStats?.user_total_contribution || 0}
              </p>
            </div>
            <div className="stat-card bg-purple-50 p-3 rounded-lg">
              <p className="text-sm text-secondary-text">Projects Created</p>
              <p className="text-2xl font-bold">
                {userStats?.user_total_projects_created || 0}
              </p>
            </div>
            <div className="stat-card bg-amber-50 p-3 rounded-lg">
              <p className="text-sm text-secondary-text">Projects Completed</p>
              <p className="text-2xl font-bold">
                {userStats?.projects_completed || 0}
              </p>
            </div>
            <div className="stat-card bg-green-50 p-3 rounded-lg">
              <p className="text-sm text-secondary-text">Words Written</p>
              <p className="text-2xl font-bold">
                {userStats?.user_total_wordcount || 0}
              </p>
            </div>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            {/* Desktop View: Normal Tabs */}
            <ScrollArea type="always">
              <TabsList className="mb-4 overflow-x-auto flex-nowrap ">
                <TabsTrigger value="all" className="cursor-pointer">
                  All ({unlockedCounts.all}/{achievements.length})
                </TabsTrigger>
                <TabsTrigger value="writing" className="cursor-pointer">
                  Writing ({unlockedCounts.writing}/
                  {achievements.filter((a) => a.category === "writing").length})
                </TabsTrigger>
                <TabsTrigger value="creation" className="cursor-pointer">
                  Creation ({unlockedCounts.creation}/
                  {achievements.filter((a) => a.category === "creation").length}
                  )
                </TabsTrigger>
                <TabsTrigger value="completion" className="cursor-pointer">
                  Completion ({unlockedCounts.completion}/
                  {
                    achievements.filter((a) => a.category === "completion")
                      .length
                  }
                  )
                </TabsTrigger>
                <TabsTrigger value="social" className="cursor-pointer">
                  Social ({unlockedCounts.social}/
                  {achievements.filter((a) => a.category === "social").length})
                </TabsTrigger>
                <TabsTrigger value="special" className="cursor-pointer">
                  Special ({unlockedCounts.special}/
                  {achievements.filter((a) => a.category === "special").length})
                </TabsTrigger>
              </TabsList>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>

            {/* Tab Content */}
            <TabsContent value={activeTab} className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredAchievements.map((achievement) =>
                  renderAchievementCard(achievement)
                )}
                {filteredAchievements.length === 0 && (
                  <div className="col-span-2 text-center py-8 text-secondary-text">
                    No achievements found in this category.
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default RewardTrophiesPage;
