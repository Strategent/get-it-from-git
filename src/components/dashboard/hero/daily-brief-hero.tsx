import { useState } from "react";
import { cn } from "@/lib/utils";
import { DailyBriefStack } from "./daily-brief-stack";

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

const STATUS_STYLES: Record<
  BriefPriority["status"],
  { label: string; badge: string; dot: string }
> = {
  urgent: { label: "Urgent", badge: "bg-[#e7e7fb] text-[#5a5bd6]", dot: "bg-[#7b7cf0]" },
  "this-week": { label: "This week", badge: "bg-[#f0f0f0] text-[#6b6b6b]", dot: "bg-[#c4c4c4]" },
  closed: { label: "Closed", badge: "bg-[#e3f3e3] text-[#3f8a4a]", dot: "bg-[#9ed4a3]" },
};

export function DailyBriefHero({
  summary = "Markets opened steady. Hartley Trust review is your priority, followed by the Marrow rebalance at 11:30.",
  brief = MOCK_DAILY_BRIEF,
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
      className="daily-brief-hero-bg relative h-full w-full overflow-hidden"
      style={{ borderRadius: "var(--radius)" }}
    >

      {/* Left zone — eyebrow, headline, summary (no button) */}
      <div className="relative z-10 flex h-full flex-col justify-center px-7 py-8 lg:max-w-[52%] lg:px-12 lg:py-12">
        <span className="font-serif-display text-[12px] uppercase tracking-[0.18em] text-white/90 lg:text-[13px]">
          Syra <span className="mx-1.5">→</span> Daily Brief
        </span>

        <h1
          className="font-serif-display mt-10 font-normal leading-[1.05] text-white lg:mt-12"
          style={{ fontSize: "clamp(34px, 4vw, 56px)" }}
        >
          Welcome back, John.
        </h1>

        <p className="mt-5 max-w-[28rem] text-[14px] leading-relaxed text-white/90 lg:text-[15px]">
          {summary}
        </p>

        <button
          type="button"
          onClick={handleClick}
          className="mt-24 w-fit rounded-md bg-[#2a2a2e]/90 px-7 py-3 text-[14px] text-white shadow-[0_8px_24px_rgba(0,0,0,0.4)] backdrop-blur-sm transition-colors hover:bg-[#3a3a3e]/90"
        >
          Read daily brief
        </button>
      </div>


      {/* Right zone — white brief document, top-aligned with margin */}
      <div className="daily-brief-document absolute z-10 overflow-hidden rounded-[6px] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        <p className="font-sans text-[5px] uppercase tracking-[0.1em] text-neutral-500 whitespace-nowrap">
          {brief.date} · {brief.workspace}
        </p>
        <h2 className="font-serif-display mt-3 text-[18px] font-normal leading-tight text-neutral-900">
          daily brief
        </h2>
        <p className="mt-2 text-[8.5px] leading-relaxed text-neutral-600">{brief.summary}</p>

        <div className="mt-5 grid grid-cols-3 gap-3">
          {brief.stats.map((s) => (
            <div key={s.label}>
              <div className="text-[14px] font-semibold text-neutral-900">{s.value}</div>
              <div className="mt-0.5 text-[7px] text-neutral-500">{s.label}</div>
            </div>
          ))}
        </div>

        <p className="font-label mt-5 text-[7px] uppercase tracking-[0.14em] text-neutral-500">
          Priorities
        </p>
        <div className="mt-2 flex flex-col gap-2.5">
          {brief.priorities.slice(0, 2).map((p) => {
            const s = STATUS_STYLES[p.status];
            return (
              <div key={p.title}>
                <div className="flex items-center gap-1.5">
                  <span className={cn("h-[3px] w-[3px] shrink-0 rounded-full", s.dot)} />
                  <span className={cn("rounded-sm px-1 py-0.5 text-[6.5px] font-medium", s.badge)}>
                    {s.label}
                  </span>
                  <span className="truncate text-[8.5px] font-semibold text-neutral-900">
                    {p.title}
                  </span>
                </div>
                <p className="mt-0.5 pl-[9px] text-[7.5px] leading-snug text-neutral-600">
                  {p.description}
                </p>
                {p.meta && <p className="mt-0.5 pl-[9px] text-[7px] text-neutral-500">{p.meta}</p>}
              </div>
            );
          })}
        </div>
      </div>


      <div aria-hidden className="daily-brief-grain pointer-events-none absolute inset-0" />
    </section>
    <DailyBriefStack open={open} onOpenChange={setOpen} />
    </>
  );
}
