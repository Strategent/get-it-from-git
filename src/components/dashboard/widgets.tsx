import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Plus, Paperclip, TrendingUp } from "lucide-react";

import { Panel } from "@/components/ui/panel";
import { planner, team, channels, docTemplates } from "@/components/dashboard/data";
import briefArtwork from "@/assets/daily-brief-orbs.jpeg.asset.json";
import { Button } from "@/components/ui/button";
import { DailyBriefStack } from "@/components/dashboard/hero/daily-brief-stack";
import { autoFocusUnlessTouch } from "@/lib/mobile-focus";



/** MobileWorkloadCard — focus-time signal, iOS Fitness-style ring feel. */
export function MobileWorkloadCard() {
  const booked = 5.5; // hrs already committed
  const total = 9;    // working hours today
  const focusLeft = 2; // uninterrupted blocks remaining
  const pct = Math.min(1, booked / total);
  return (
    <section className="origin-card relative flex aspect-square flex-col justify-between overflow-hidden p-4">
      <div className="flex items-start justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground/[0.4]">
          Focus
        </span>
        <span className="text-[11px] font-medium text-foreground/50 tabular-nums">
          {booked}/{total}h
        </span>
      </div>

      <div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-[32px] font-semibold leading-none tracking-[-0.03em] tabular-nums">
            {focusLeft}
          </span>
          <span className="text-[12px] text-foreground/50">deep blocks left</span>
        </div>
        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-foreground/[0.08]">
          <div
            className="h-full rounded-full bg-foreground/70"
            style={{ width: `${pct * 100}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] text-foreground/50">
          <span>Booked</span>
          <span className="tabular-nums">{Math.round(pct * 100)}%</span>
        </div>
      </div>
    </section>
  );
}

/** MobileTeamCard — iOS-native people list: one per row, presence dot + name. */
export function MobileTeamCard() {
  const roster = team.slice(0, 4);
  return (
    <section className="origin-card relative flex aspect-square flex-col overflow-hidden p-4">
      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground/[0.4]">
        Team
      </span>
      <ul className="mt-3 flex flex-1 flex-col divide-y divide-border/50">
        {roster.map((m) => (
          <li key={m.name} className="flex flex-1 items-center gap-2.5 min-w-0">
            <div className="relative shrink-0">
              <div className="grid h-6 w-6 place-items-center rounded-full bg-foreground/[0.08] text-[10px] font-semibold text-foreground/70">
                {m.initials}
              </div>
              <span
                className="absolute -bottom-[1px] -right-[1px] h-1.5 w-1.5 rounded-full ring-2 ring-card"
                style={{ background: m.status === "online" ? "#34c759" : "#8e8e93" }}
              />
            </div>
            <span className="truncate text-[12px] font-medium text-foreground/85">
              {m.name.split(" ")[0]}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}



/** MobileDailyBriefCard — the same Daily Brief image treatment as desktop. */
export function MobileDailyBriefCard() {
  const [open, setOpen] = useState(false);
  return (
    <>
    <section className="relative isolate flex min-h-[280px] w-full flex-col overflow-hidden rounded-lg border border-border/70 p-6 text-brief-foreground">
      {/* Background image */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-cover bg-center"
        style={{
          backgroundImage: `url("${briefArtwork.url}")`,
        }}
      />
      {/* Dark overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(105deg,var(--brief-scrim),var(--brief-scrim-soft)_70%,transparent)]"
      />

      <div className="relative flex flex-1 flex-col justify-center">
        <h1 className="font-dm-sans text-[29px] font-normal leading-[1.15]">
          Welcome back, John.
        </h1>
        <p className="mt-3 max-w-[20rem] text-[13px] font-normal leading-[1.6] text-brief-foreground/85">
          Markets opened steady. Hartley Trust review is your priority, followed by the Marlow rebalance at 11:30.
        </p>
        <div className="pt-5">
          <Button variant="outline" onClick={() => setOpen(true)} className="h-9 rounded-full border-brief-foreground/35 bg-brief-glass/60 px-5 font-dm-sans text-[12.5px] font-normal text-brief-foreground backdrop-blur-md hover:bg-brief-glass/85 hover:text-brief-foreground">
            Read daily brief
          </Button>
        </div>
      </div>
    </section>
    <DailyBriefStack open={open} onOpenChange={setOpen} />
    </>
  );
}


/** MobileRecapCard — market recap tile for mobile. */
export function MobileRecapCard() {
  return (
    <section className="origin-card relative flex flex-col overflow-hidden p-4">
      <div className="flex items-start justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground/[0.4]">
          Markets
        </span>
        <span className="grid h-7 w-7 place-items-center rounded-full bg-[color:var(--trend-up-soft)] text-[color:var(--trend-up)]">
          <TrendingUp className="h-3.5 w-3.5" strokeWidth={2.25} />
        </span>
      </div>
      <div className="mt-6">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[28px] font-semibold leading-none tracking-[-0.02em] tabular-nums">
            +0.42%
          </span>
          <span className="text-[12px] text-foreground/50">S&amp;P · open</span>
        </div>
        <div className="mt-2.5 font-serif-display text-[16px] leading-tight tracking-[-0.01em]">
          Daily market
        </div>
        <p className="mt-2 text-[12px] leading-snug text-muted-foreground">
          Treasuries firmed and breadth improved. 3 items flagged for your book.
        </p>
      </div>
    </section>
  );
}

/** MobilePlannerCard — condensed planner tile for mobile. */
export function MobilePlannerCard() {
  const open = planner.filter((p) => !p.done).length;
  const first = planner.filter((p) => !p.done).slice(0, 2);
  return (
    <Link
      to="/tasks"
      className="origin-card flex flex-col gap-3 p-4"
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground/[0.4]">
          Planner
        </span>
        <span className="text-[11px] tabular-nums text-muted-foreground">{open} open</span>
      </div>
      <div className="flex flex-col divide-y divide-border/50">
        {first.map((t) => (
          <div key={t.label} className="flex items-center gap-2 py-2">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/40" />
            <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-foreground/90">
              {t.label}
            </span>
            <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">{t.date}</span>
          </div>
        ))}
      </div>
    </Link>
  );
}

/** MobileChannelsCard — condensed channels tile for mobile. */
export function MobileChannelsCard() {
  const unread = channels.reduce((a, c) => a + c.unread, 0);
  const top = channels.slice(0, 3);
  return (
    <Link
      to="/channels"
      className="origin-card flex flex-col gap-3 p-4"
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground/[0.4]">
          Channels
        </span>
        <span className="grid h-5 min-w-5 place-items-center rounded-md bg-foreground/85 px-1.5 text-[11px] font-semibold tabular-nums text-background">
          {unread}
        </span>
      </div>
      <div className="flex flex-col divide-y divide-border/50">
        {top.map((c) => (
          <div key={c.name} className="flex items-center gap-2 py-2">
            <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md border border-border bg-foreground/[0.05] text-[10px] font-semibold text-foreground/60">
              #
            </span>
            <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-foreground/90">
              {c.name}
            </span>
            {c.unread > 0 && (
              <span className="shrink-0 text-[11px] font-semibold tabular-nums text-foreground/70">
                {c.unread}
              </span>
            )}
          </div>
        ))}
      </div>
    </Link>
  );
}

/** PlannerCard — Notion-style task list: progress glance, grouped rows, inline add. */
export function PlannerCard() {
  const [items, setItems] = useState(planner);
  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState("");
  const [date, setDate] = useState("");

  const open = items.filter((p) => !p.done).length;
  const done = items.length - open;
  const pct = items.length ? Math.round((done / items.length) * 100) : 0;

  const today = new Date().toLocaleDateString("en-US", { day: "numeric", month: "short" });
  const openItems = items.filter((p) => !p.done);
  const doneItems = items.filter((p) => p.done);

  // "2026-01-16" (or empty → today) → "16 Jan", matching the existing rows.
  const fmtDate = (v: string) => {
    let d: Date;
    if (v) {
      const [y, m, dd] = v.split("-").map(Number);
      d = new Date(y, m - 1, dd);
    } else {
      d = new Date();
    }
    return d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
  };

  const add = () => {
    const text = label.trim();
    if (!text) return;
    setItems((prev) => [{ label: text, date: fmtDate(date), done: false }, ...prev]);
    setLabel("");
    setDate("");
  };

  const toggle = (t: (typeof planner)[number]) =>
    setItems((prev) => prev.map((p) => (p === t ? { ...p, done: !p.done } : p)));

  return (
    <Panel
      label="Planner"
      to="/tasks"
      action={
        <button
          onClick={() => setAdding((v) => !v)}
          aria-label={adding ? "Close add task" : "Add task"}
          aria-expanded={adding}
          className={`grid h-7 w-7 place-items-center rounded-full border transition-colors ${
            adding
              ? "border-foreground/40 bg-foreground/[0.1] text-foreground"
              : "border-border bg-foreground/[0.06] text-foreground/80 hover:bg-foreground/[0.12]"
          }`}
        >
          <Plus className={`h-3.5 w-3.5 transition-transform ${adding ? "rotate-45" : ""}`} />
        </button>
      }
    >
      {/* Progress glance */}
      <div className="mb-4 shrink-0">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[28px] font-semibold leading-none tracking-[-0.02em] tabular-nums">{open}</span>
          <span className="text-[13px] text-muted-foreground">to do · {done} done</span>
        </div>
        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-foreground/[0.08]">
          <div
            className="h-full rounded-full bg-foreground/70 transition-[width] duration-500 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {adding && (
        <div className="mb-3 flex shrink-0 items-center gap-1.5 rounded-xl border border-border/70 bg-foreground/[0.03] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") add();
              if (e.key === "Escape") setAdding(false);
            }}
            placeholder="New task…"
            autoFocus={autoFocusUnlessTouch()}
            className="h-8 min-w-0 flex-1 rounded-lg bg-transparent px-2 text-[13px] outline-none placeholder:text-muted-foreground/60"
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            aria-label="Due date"
            className="h-8 shrink-0 rounded-lg bg-transparent px-1.5 text-[12px] text-muted-foreground outline-none"
          />
          <button
            onClick={add}
            disabled={!label.trim()}
            className="h-8 shrink-0 rounded-lg bg-foreground px-3 text-[12px] font-semibold text-background transition-opacity disabled:opacity-40"
          >
            Add
          </button>
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <div className="px-1 pb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground/40">
          Up next
        </div>
        {openItems.slice(0, 4).map((t) => (
          <button
            key={t.label}
            onClick={() => toggle(t)}
            className="group flex items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-foreground/[0.04] active:bg-foreground/[0.06]"
          >
            <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full border-[1.5px] border-foreground/30 transition-colors group-hover:border-foreground/60" />
            <span className="min-w-0 flex-1 truncate text-[13.5px] font-medium leading-snug text-foreground/95">
              {t.label}
            </span>
            <span
              className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10.5px] font-medium tabular-nums ${
                t.date === today
                  ? "bg-foreground/[0.08] text-foreground/80"
                  : "text-muted-foreground"
              }`}
            >
              {t.date === today ? "Today" : t.date}
            </span>
          </button>
        ))}

        {doneItems.length > 0 && (
          <>
            <div className="px-1 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground/40">
              Completed
            </div>
            {doneItems.slice(0, 2).map((t) => (
              <button
                key={t.label}
                onClick={() => toggle(t)}
                className="group flex items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-foreground/[0.04]"
              >
                <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-foreground/80">
                  <svg viewBox="0 0 10 8" className="h-2 w-2 text-background" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 4l2.5 2.5L9 1" />
                  </svg>
                </span>
                <span className="min-w-0 flex-1 truncate text-[13.5px] leading-snug text-muted-foreground line-through decoration-muted-foreground/50">
                  {t.label}
                </span>
              </button>
            ))}
          </>
        )}
      </div>
    </Panel>
  );
}

/** WorkloadCard — capacity as a graded ScoreBar (Origin credit-score pattern). */
export function WorkloadCard() {
  const value = 56;
  const labels = ["Light", "Healthy", "Busy", "Heavy", "Maxed"];
  return (
    <Panel label="Workload">
      <div className="flex items-end gap-3">
        <div className="text-[32px] font-semibold leading-none tracking-[-0.02em] tabular-nums">
          {value}<span className="ml-0.5 text-[15px] font-normal text-muted-foreground">%</span>
        </div>
        <span className="mb-1 inline-flex h-5 items-center rounded-full border border-border bg-foreground/[0.05] px-2.5 text-[11px] font-medium text-foreground/80">
          Healthy
        </span>
      </div>
      <div className="mt-5">
        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-foreground/[0.08]">
          <div
            className="h-full rounded-full bg-foreground/70"
            style={{ width: `${value}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between">
          {labels.map((l) => (
            <span
              key={l}
              className="text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground/60"
            >
              {l}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between text-[12px] text-muted-foreground">
        <span>Capacity used</span>
        <span className="tabular-nums">52 / 93 hrs</span>
      </div>
    </Panel>
  );
}

/** MarketChartCard — live crypto chart (Binance feed) in a dashboard panel. */
export function MarketChartCard() {
  return (
    <Panel label="Markets">
      <LiveMarketChart />
    </Panel>
  );
}

/** RecapCard — daily market recap glance. */
export function RecapCard() {
  return (
    <Panel label="Markets">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[28px] font-semibold leading-none tracking-[-0.02em] tabular-nums">
              +0.42%
            </span>
            <span className="text-[12px] text-muted-foreground">S&amp;P · open</span>
          </div>
          <div className="mt-2.5 font-serif-display text-[16px] leading-tight tracking-[-0.01em]">
            Daily market
          </div>
        </div>
        <span className="grid h-8 w-8 place-items-center rounded-full bg-[color:var(--trend-up-soft)] text-[color:var(--trend-up)]">
          <TrendingUp className="h-4 w-4" strokeWidth={2.25} />
        </span>
      </div>
      <p className="mt-3 text-[13px] leading-snug text-muted-foreground">
        Treasuries firmed and breadth improved. 3 items flagged for your book.
      </p>
    </Panel>
  );
}

/** TeamCard — who's online and what they're on. */
export function TeamCard() {
  const online = team.filter((t) => t.status === "online").length;
  return (
    <Panel label="Team" to="/team">
      <div className="mb-4 shrink-0 text-[24px] font-semibold leading-none tracking-[-0.02em]">
        {online} <span className="text-[12px] font-normal tracking-normal text-muted-foreground">online</span>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-2">
        {team.slice(0, 4).map((m) => (
          <div key={m.name} className="flex items-center gap-3 py-1">
            <div className="relative grid h-8 w-8 shrink-0 place-items-center rounded-full border border-border bg-foreground/[0.07] text-[11px] font-semibold text-foreground/90">
              {m.initials}
              <span
                className={`ring-card absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full ring-2 ${
                  m.status === "online" ? "bg-[color:var(--trend-up)]" : "bg-[color:var(--trend-down)]"
                }`}
              />
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <div className="truncate text-[13px] font-semibold text-foreground/95">{m.name}</div>
              <div className="truncate text-[11px] text-muted-foreground">{m.task}</div>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

/** ChannelsCard — team channels with unread counts. */
export function ChannelsCard() {
  const unread = channels.reduce((a, c) => a + c.unread, 0);
  return (
    <Panel label="Channels" to="/channels">
      <div className="mb-4 shrink-0 text-[24px] font-semibold leading-none tracking-[-0.02em]">
        {unread} <span className="text-[12px] font-normal tracking-normal text-muted-foreground">unread</span>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-2">
        {channels.slice(0, 4).map((c) => (
          <div key={c.name} className="flex items-center gap-3 py-1">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-border bg-foreground/[0.06] text-[12px] font-semibold text-foreground/70">
              #
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <div className="truncate text-[13px] font-semibold text-foreground/95">{c.name}</div>
              <div className="truncate text-[11px] text-muted-foreground">{c.preview}</div>
            </div>
            {c.unread > 0 && (
              <span className="grid h-5 min-w-5 place-items-center rounded-md bg-foreground/85 px-1.5 text-[11px] font-semibold tabular-nums text-background">
                {c.unread}
              </span>
            )}

          </div>
        ))}
      </div>
    </Panel>
  );
}

/** DocumentsCard — autofill templates grid. */
export function DocumentsCard() {
  const totalUses = docTemplates.reduce((a, d) => a + d.uses, 0);
  return (
    <Panel label="Documents">
      <div className="mb-4 shrink-0 text-[24px] font-semibold leading-none tracking-[-0.02em]">
        {docTemplates.length}{" "}
        <span className="text-[12px] font-normal tracking-normal text-muted-foreground">
          templates · {totalUses} uses
        </span>
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-2 gap-2.5">
        {docTemplates.map((d) => (
          <div
            key={d.name}
            className="origin-raised flex flex-col justify-between overflow-hidden p-3"
          >
            <div className="min-w-0">
              <div className="mb-2 grid h-6 w-6 place-items-center rounded-md bg-primary/15 text-primary">
                <Paperclip className="h-3 w-3" strokeWidth={2} />
              </div>
              <div className="line-clamp-2 text-[13px] font-semibold leading-tight tracking-tight">
                {d.name}
              </div>
              <div className="mt-1 text-[11px] text-muted-foreground">{d.uses} uses</div>
            </div>
            <button
              className="mt-3 h-7 self-stretch rounded-md text-[11px] font-semibold text-white"
              style={{ background: "var(--gradient-primary)" }}
            >
              Autofill
            </button>
          </div>
        ))}
      </div>
    </Panel>
  );
}
