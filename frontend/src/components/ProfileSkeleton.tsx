import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { useTranslation } from "react-i18next";

const ProfileSkeleton: React.FC = () => {
  const { t } = useTranslation();
  const renderSkeletons = () => {
    return Array(3)
      .fill(0)
      .map((_, index) => <ProfileCardSkeleton key={index} />);
  };

  return (
    <>
      <section className="w-full space-y-8 bg-card p-8 mt-5 rounded-lg border border-primary-border">
        <section className="flex">
          {/* Profile Picture */}
          <div>
            <Skeleton className="w-22 h-22 rounded-full" />
          </div>
          <article>
            {/* Username */}
            <Skeleton className="h-5 w-20" />
            {/* Completed Projects */}
            <Skeleton className="h-5 w-20" />
            {/* In Progress Projects */}
            <Skeleton className="h-5 w-20" />
          </article>
        </section>
        {/* About Me */}
        <section className="flex flex-col">
          <Skeleton className="h-5 w-20" />
        </section>
      </section>
      {/* My Stories */}
      <section className="w-full space-y-8 bg-card p-8 mt-5 rounded-lg border border-primary-border">
        <section className="flex flex-col">
          <Skeleton className="h-5 w-20" />
        </section>
        {/* Completed and In Progress Stories Tabs */}
        <Tabs defaultValue="completed">
          <TabsList className="grid grid-cols-2 bg-tab-background">
            <TabsTrigger
              disabled={true}
              value="completed"
              className="data-[state=active]:text-white data-[state=active]:bg-tab-active cursor-pointer"
            >
              {t("completed")}
            </TabsTrigger>
            <TabsTrigger
              disabled={true}
              value="in-progress"
              className="data-[state=active]:text-white data-[state=active]:bg-tab-active cursor-pointer"
            >
              {t("inProgress")}
            </TabsTrigger>
          </TabsList>
          {/* Completed Stories */}
          <TabsContent value="completed">
            <section className="flex gap-4 flex-wrap">
              {renderSkeletons()}
            </section>
          </TabsContent>
          {/* In Progress Stories */}
          <TabsContent value="in-progress">
            <section className="flex gap-4 flex-wrap">
              {renderSkeletons()}
            </section>
          </TabsContent>
        </Tabs>
      </section>
    </>
  );
};

const ProfileCardSkeleton: React.FC = () => {
  return (
    <Card className="w-[350px] bg-background-card  flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-center">
          <Skeleton className="h-5 w-20" /> {/* Genre badge */}
        </div>
        <CardTitle className="text-primary-text font-medium text-left text-xl">
          <Skeleton className="h-6 w-full" /> {/* Title */}
        </CardTitle>
        <CardDescription>
          <div className="flex items-center gap-1 text-secondary-text mb-2">
            <Skeleton className="h-4 w-3/4" /> {/* Collaborators*/}
          </div>
          <div className="flex items-center gap-1 text-secondary-text mb-2">
            <Skeleton className="h-4 w-3/4" /> {/* Word Count*/}
          </div>
          <div className="flex items-center gap-1 text-secondary-text mb-2">
            <Skeleton className="h-4 w-3/4" /> {/* Last Updated*/}
          </div>
          <div className="flex items-center gap-1 text-secondary-text">
            <Skeleton className="h-4 w-3/4" /> {/* Private Story*/}
          </div>
        </CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-end">
        <Skeleton className="h-6 w-24" /> {/* Completed/In-Progress Text */}
      </CardFooter>
    </Card>
  );
};

export default ProfileSkeleton;
