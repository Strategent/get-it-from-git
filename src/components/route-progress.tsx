import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";

/**
 * Thin top progress bar shown while a route transition is in flight. Client
 * only — it renders nothing during SSR so hydration always matches. Sits below
 * the safe-area inset so it stays visible in the iOS standalone web app.
 */
export function RouteProgress() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const pending = useRouterState({ select: (s) => s.status === "pending" });

  if (!mounted || !pending) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 z-[60]"
      style={{ top: "env(safe-area-inset-top, 0px)" }}
    >
      <div className="animate-route-progress h-[2px] origin-left bg-primary" />
    </div>
  );
}
