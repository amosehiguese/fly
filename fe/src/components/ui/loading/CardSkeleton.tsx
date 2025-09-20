import { cn } from "@/lib/utils";

interface CardSkeletonProps {
  className?: string;
}

export const CardSkeleton = ({ className }: CardSkeletonProps) => {
  return (
    <div
      className={cn(
        "p-4 rounded-lg border border-gray-200 space-y-3",
        className
      )}
    >
      <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
      <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
      <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
    </div>
  );
};
