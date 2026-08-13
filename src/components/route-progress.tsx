import { useRouterState } from "@tanstack/react-router";

/**
 * Thin top progress bar shown while a route transition is in flight. Sits above
 * the safe-area strip so it stays visible in the iOS standalone (home-screen)
 * web app.
 */
export function RouteProgress() {
  const isLoading = useRouterState({ select: (s) => s.status === "pending" });

  return (
    <div
      aria-hidden={!isLoading}
      className="pointer-events-none fixed inset-x-0 z-[60]"
      style={{ top: "env(safe-area-inset-top, 0px)" }}
    >
      <div
        className={`h-[2px] origin-left bg-primary transition-opacity duration-200 ${
          isLoading ? "animate-route-progress opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}
