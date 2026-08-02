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
          backgroundImage: `linear-gradient(100deg, rgba(0,0,0,0.48) 0%, rgba(0,0,0,0.30) 35%, rgba(0,0,0,0.14) 65%, rgba(0,0,0,0.03) 100%), url("${heroScenery.url}")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >

        <div className="relative z-10 flex h-full flex-col justify-center pl-10 pr-8 py-8 lg:pl-20 lg:pr-16 lg:py-12">
          <h1
            className="font-serif-display mt-2 font-normal tracking-[-0.02em] text-white lg:mt-3"
            style={{
              fontSize: "clamp(28px, 2.6vw, 38px)",
              lineHeight: 1.08,
              textShadow: "0 1px 4px rgba(0,0,0,0.25)",
            }}
          >
            Welcome back, John.
          </h1>

          <p
            className="mt-4 max-w-[34rem] text-[14px] leading-[1.55] text-white/[0.85] lg:mt-5 lg:text-[16px]"
            style={{ textShadow: "0 1px 4px rgba(0,0,0,0.35)" }}
          >
            {summary}
          </p>

          <button
            type="button"
            onClick={handleClick}
            className="mt-8 w-fit rounded-lg bg-white/40 px-6 py-2.5 text-[13.5px] font-medium text-neutral-900 shadow-[0_1px_0_0_rgba(255,255,255,0.45)_inset,0_6px_20px_-6px_rgba(0,0,0,0.45)] ring-1 ring-white/40 backdrop-blur-md backdrop-saturate-150 transition-all hover:bg-white/65 hover:shadow-[0_1px_0_0_rgba(255,255,255,0.55)_inset,0_8px_24px_-8px_rgba(0,0,0,0.5)] lg:mt-10"
          >
            Read daily brief
          </button>
        </div>
      </section>

      <DailyBriefStack open={open} onOpenChange={setOpen} />
    </>
  );
}
