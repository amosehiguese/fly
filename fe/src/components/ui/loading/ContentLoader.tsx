import { cn } from "@/lib/utils";

interface ContentLoaderProps {
  className?: string;
}

export const ContentLoader = ({ className }: ContentLoaderProps) => {
  return (
    <div className={cn("space-y-4 p-4", className)}>
      {/* Header Skeleton */}
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
        <div className="space-y-2">
          <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>

      {/* Content Skeletons */}
      <div className="space-y-3">
        <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-4/6 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Card Skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="p-4 rounded-lg border border-gray-200 space-y-3"
          >
            <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
};
