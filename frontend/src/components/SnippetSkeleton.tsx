import { Skeleton } from "@/components/ui/skeleton";

const SnippetSkeleton = () => {
  return (
    <div className="p-4 bg-secondary rounded-lg space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <div className="flex items-center space-x-2 mt-4">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  );
};

export default SnippetSkeleton;
