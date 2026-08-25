import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { PageShell } from "@/components/page-shell";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { BentoGridStack, type BentoItem } from "@/components/layout/bento-grid-stack";
import { DailyBriefHero } from "@/components/dashboard/hero/daily-brief-hero";
import { InboxCard } from "@/components/dashboard/inbox/inbox-card";
import { CalendarCard } from "@/components/dashboard/calendar/calendar-card";
import { CallsCard } from "@/components/dashboard/calls/calls-card";
import { BulletinCard } from "@/components/dashboard/bulletin/bulletin-card";
import {
  WorkloadCard,
  MobileWorkloadCard,
  PlannerCard,
  TeamCard,
  MobileTeamCard,
  ChannelsCard,
  MobileDailyBriefCard,
  MobileRecapCard,
  MobilePlannerCard,
  MobileChannelsCard,
} from "@/components/dashboard/widgets";
import { useIsMobile } from "@/hooks/use-mobile";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "strategent — Dashboard" },
      {
        name: "description",
        content: "Private wealth dashboard: workload, planner and upcoming client meetings.",
      },
      { property: "og:title", content: "strategent — Dashboard" },
      {
        property: "og:description",
        content: "Private wealth dashboard: workload, planner and upcoming client meetings.",
      },
    ],
  }),
});

function MobileHome({ setupDone, finishSetup }: { setupDone: boolean; finishSetup: () => void }) {
  return (
    <PageShell>
      <div className="flex flex-col gap-3 rounded-[28px] border border-border/60 bg-card/30 p-2.5 pb-3 mb-6">
        {/* 1. Hero full-width up top */}
        <MobileDailyBriefCard />

        {/* 2. Markets full width */}
        <MobileRecapCard />

        {/* 3. Workload + Team squares */}
        <div className="grid grid-cols-2 gap-3">
          <MobileWorkloadCard />
          <MobileTeamCard />
        </div>

        {/* 4. Inbox — fixed height sized to exactly 4 threads + header, so
             tapping a thread doesn't morph the card and there's no blank space. */}
        <div className="h-[420px]">
          <InboxCard />
        </div>

        {/* 5. Calendar */}
        <CalendarCard />

        {/* 6. Bulletin */}
        <BulletinCard />

        {/* 7. Planner + Channels — condensed side by side */}
        <div className="grid grid-cols-2 gap-3">
          <MobilePlannerCard />
          <MobileChannelsCard />
        </div>

        {/* 8. Calls */}
        <CallsCard />
      </div>
    </PageShell>
  );
}

function Home() {
  // Onboarding state — once "Finish setup" is clicked, the onboarding card
  // is removed from the rail and the hero in the main grid extends downward
  // to reclaim the visual weight.
  const isMobile = useIsMobile();
  const [setupDone, setSetupDone] = useState(false);
  useEffect(() => {
    try {
      if (localStorage.getItem("hs-setup-done") === "1") setSetupDone(true);
    } catch {
      /* ignore */
    }
  }, []);
  const finishSetup = () => {
    setSetupDone(true);
    try {
      localStorage.setItem("hs-setup-done", "1");
    } catch {
      /* ignore */
    }
  };

  // Stable item arrays — built once. The bento grids init gridstack against
  // these DOM nodes, so the lists must not change identity on re-render.
  // (Per-card timers live inside the cards themselves, e.g. CalendarCard.)
  // Row heights: visible card height ≈ h·76(cellHeight) − 2·10(margin).
  // hero h=3 → ~208px (target ~210) · inbox/bulletin h=6 → ~436px (target
  // ~420) · calls/calendar h=5 → ~360px (closest integer rows to ~390).
  const heroH = 3;
  const mainItems = useMemo<BentoItem[]>(
    () => [
      {
        id: "daily-brief",
        x: 0,
        y: 0,
        w: 12,
        h: heroH,
        minW: 8,
        minH: heroH,
        maxH: 6,

        node: (
          // data-density scales the hero to banner height via wrapper-scoped
          // CSS (styles.css) — the card component itself stays untouched.
          <div data-density="compact" className="h-full w-full">
            <DailyBriefHero />
          </div>
        ),
      },
      { id: "bulletin", x: 0, y: 3, w: 4, h: 6, minW: 3, minH: 4, maxH: 10, node: <BulletinCard /> },
      { id: "inbox", x: 4, y: 3, w: 8, h: 6, minW: 5, minH: 4, maxH: 10, node: <InboxCard /> },
      { id: "planner", x: 0, y: 9, w: 4, h: 4, minW: 3, minH: 3, maxW: 8, maxH: 6, node: <PlannerCard /> },
      { id: "channels", x: 4, y: 9, w: 4, h: 4, minW: 3, minH: 3, maxW: 8, maxH: 6, node: <ChannelsCard /> },
      { id: "workload", x: 8, y: 9, w: 4, h: 4, minW: 3, minH: 3, maxW: 8, maxH: 6, node: <WorkloadCard /> },
    ],
    [heroH],
  );

  const railItems = useMemo<BentoItem[]>(
    () => [
      { id: "calendar", x: 0, y: 0, w: 1, h: 6, minH: 4, maxH: 10, node: <CalendarCard /> },
      { id: "calls", x: 0, y: 6, w: 1, h: 6, minH: 4, maxH: 10, node: <CallsCard /> },
      { id: "team", x: 0, y: 12, w: 1, h: 5, minH: 3, maxH: 8, node: <TeamCard /> },
    ],
    [],
  );


  if (isMobile) {
    return <MobileHome setupDone={setupDone} finishSetup={finishSetup} />;
  }

  return (
    <PageShell>
      <DashboardShell
        rail={
          <div className="rounded-[28px] border border-border/60 bg-card/30 p-2.5">
            <BentoGridStack
              key="rail-v8"
              items={railItems}
              column={1}
              storageKey="hs-rail-layout-v8"
              resizeHandles="s"
              className="-mx-2.5"
            />
          </div>
        }
      >
        <div className="rounded-[28px] border border-border/60 bg-card/30 p-2.5">
          <BentoGridStack
            key="main-v8"
            items={mainItems}
            column={12}
            storageKey="hs-main-layout-v8"
            className="-mx-2.5"
          />
        </div>


      </DashboardShell>
    </PageShell>
  );
}
