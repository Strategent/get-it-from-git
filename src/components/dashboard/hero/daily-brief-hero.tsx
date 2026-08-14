import { useState } from "react";
import { DailyBriefStack } from "./daily-brief-stack";
import heroScenery from "@/assets/daily-brief-hero.jpg";

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
        style={{ borderRadius: "var(--radius)", containerType: "size" }}
      >
        <div
          aria-hidden
          className="absolute inset-0 overflow-hidden"
          style={{
            borderRadius: "var(--radius)",
            backgroundColor: "#1a1a1d",
            backgroundImage: `linear-gradient(100deg, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.44) 38%, rgba(0,0,0,0.2) 70%, rgba(0,0,0,0.06) 100%), linear-gradient(to top, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0) 55%), url("${heroScenery}")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />

        {/* Sizing is driven by container-query units so the text stays
            proportional to this fixed-height card at any viewport or zoom
            level. Plain px values act as the fallback where cq units are
            unsupported. */}
        <div
          className="relative z-10 flex h-full flex-col justify-center pl-10 pr-8 py-6"
          style={{
            paddingLeft: "clamp(1.25rem, 5cqw, 5rem)",
            paddingRight: "clamp(1rem, 4cqw, 4rem)",
            paddingTop: "clamp(0.75rem, 5cqh, 2rem)",
            paddingBottom: "clamp(0.75rem, 5cqh, 2rem)",
          }}
        >
          <h1
            className="font-serif-display font-normal tracking-[-0.015em] text-white text-[30px] leading-[1.15]"
            style={{
              fontSize: "clamp(20px, 17cqh, 42px)",
              textShadow: "0 1px 6px rgba(0,0,0,0.3)",
            }}
          >
            Welcome back, John.
          </h1>

          <p
            className="mt-3 max-w-[30rem] text-[13.5px] font-medium leading-[1.5] text-white/[0.88]"
            style={{
              marginTop: "clamp(0.375rem, 3cqh, 1.25rem)",
              fontSize: "clamp(11px, 6.5cqh, 14px)",
              textShadow: "0 1px 5px rgba(0,0,0,0.4)",
            }}
          >
            {summary}
          </p>

          <button
            type="button"
            onClick={handleClick}
            className="mt-4 w-fit rounded-full border border-white/70 bg-white/[0.08] px-7 py-2 text-[13.5px] font-medium text-white backdrop-blur-md transition-all hover:bg-white/[0.18]"
            style={{
              marginTop: "clamp(0.5rem, 4cqh, 1.75rem)",
              paddingLeft: "clamp(1rem, 3.5cqw, 1.75rem)",
              paddingRight: "clamp(1rem, 3.5cqw, 1.75rem)",
              paddingTop: "clamp(0.3rem, 2cqh, 0.625rem)",
              paddingBottom: "clamp(0.3rem, 2cqh, 0.625rem)",
              fontSize: "clamp(11px, 6cqh, 13.5px)",
            }}
          >
            Read daily brief
          </button>
        </div>
      </section>

      <DailyBriefStack open={open} onOpenChange={setOpen} />
    </>
  );
}
