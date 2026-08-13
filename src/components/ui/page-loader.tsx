import { Skeleton } from "@/components/ui/skeleton";

/**
 * Generic page-level skeleton used as the router's pending component so a route
 * switch never shows a blank screen.
 */
export function PageLoader() {
  return (
    <div className="min-h-screen bg-background px-4 sm:px-6 md:px-8 pt-[calc(env(safe-area-inset-top,0px)+1.5rem)] md:pt-6 pb-28 md:pb-6">
      <div className="space-y-3">
        <Skeleton className="h-3 w-24 rounded-full" />
        <Skeleton className="h-8 w-56 rounded-lg" />
        <Skeleton className="h-3 w-72 rounded-full" />
      </div>
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
