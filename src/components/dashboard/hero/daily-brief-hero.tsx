import { useState } from "react";
import { DailyBriefStack } from "./daily-brief-stack";
import heroScenery from "@/assets/daily-brief-hero.jpg.asset.json";

export interface BriefPriority {
  status: "urgent" | "this-week" | "closed";
  title: string;
  description: string;
  meta?: string;
}

export interface DailyBriefData {
  date: string;
  workspace: string;
  greeting: string;
  summary: string;
  stats: { value: number; label: string }[];
  priorities: BriefPriority[];
}

export const MOCK_DAILY_BRIEF: DailyBriefData = {
  date: "MONDAY · JUNE 9, 2026",
  workspace: "HARWICK & STERNE",
  greeting: "Good morning, John.",
  summary:
    "4 meetings today. Hartley Trust is your first priority — IPS ready for sign-off. Markets opened steady, breadth improved.",
  stats: [
    { value: 4, label: "meetings today" },
    { value: 3, label: "need attention" },
    { value: 2, label: "drafts ready" },
  ],
  priorities: [
    {
      status: "urgent",
      title: "Hartley Family Trust — IPS sign-off",
      description:
        "Olivia's draft is ready. Review and approve before the 9:00 meeting. Q4 statements attached by Eleanor.",
      meta: "Today · 9:00 – 10:00 AM · Confirmed",
    },
    {
      status: "urgent",
      title: "Denis Marlow — rebalance at 11:30",
      description:
        "Allocation shift memo attached. Marcus Sterling confirmed we're good to proceed.",
      meta: "Today · 11:30 AM",
    },
    {
      status: "this-week",
      title: "Office B123 onboarding prep",
      description: "Prep required before Friday. No owner assigned yet.",
      meta: "Due Friday",
    },
    {
      status: "closed",
      title: "Rebecca Caldwell — engagement letter",
      description: "Countersigned and vaulted. No action needed.",
    },
  ],
};

export function DailyBriefHero({
  summary = "Markets opened steady. Hartley Trust review is your priority, followed by the Marrow rebalance at 11:30.",
  onReadBrief,
}: {
  summary?: string;
  brief?: DailyBriefData;
  onReadBrief?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const handleClick = () => {
    setOpen(true);
    onReadBrief?.();
  };
  return (
    <>
      <section
        className="relative h-full w-full overflow-hidden"
        style={{
          borderRadius: "var(--radius)",
          backgroundColor: "#1a1a1d",
          backgroundImage: `linear-gradient(105deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.62) 32%, rgba(0,0,0,0.36) 62%, rgba(0,0,0,0.14) 100%), url("${heroScenery.url}")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="relative z-10 flex h-full flex-col justify-center px-7 py-8 lg:px-12 lg:py-12">
          <span
            className="font-serif-display text-[12px] uppercase tracking-[0.18em] text-white/90 lg:text-[13px]"
            style={{ textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}
          >
            Syra <span className="mx-1.5">→</span> Daily Brief
          </span>

          <h1
            className="font-serif-display mt-10 font-normal leading-[1.05] text-white lg:mt-12"
            style={{ fontSize: "clamp(34px, 4vw, 56px)", textShadow: "0 2px 20px rgba(0,0,0,0.55)" }}
          >
            Welcome back, John.
          </h1>

          <p
            className="mt-5 max-w-[32rem] text-[14px] leading-relaxed text-white/90 lg:text-[15px]"
            style={{ textShadow: "0 1px 10px rgba(0,0,0,0.5)" }}
          >
            {summary}
          </p>

          <button
            type="button"
            onClick={handleClick}
            className="mt-10 w-fit rounded-sm bg-black/50 px-7 py-3 text-[14px] text-white ring-1 ring-white/15 backdrop-blur-sm transition-colors hover:bg-black/70"
          >
            Read daily brief
          </button>
        </div>
      </section>
      <DailyBriefStack open={open} onOpenChange={setOpen} />
    </>
  );
}
