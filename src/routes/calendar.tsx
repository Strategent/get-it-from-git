import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Video,
  Check,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  MapPin,
  Users,
  Circle,
  Clock,
  Command,
} from "lucide-react";
import { PageShell, PageHeader } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { avatarUrl } from "@/lib/avatar";

export const Route = createFileRoute("/calendar")({
  component: CalendarPage,
  head: () => ({ meta: [{ title: "Calendar — Harwick & Sterne" }] }),
});

type Meeting = {
  time: string;
  end: string;
  client: string;
  kind: string;
  host: string;
  location: string;
  status: "Confirmed" | "Pending";
  zoom: string;
  attendees?: number;
};

const bookings: Record<number, Meeting[]> = {
  7: [
    { time: "10:00", end: "10:30", client: "Hartley Family Review", kind: "Client review", host: "John Harwick", location: "Zoom", status: "Confirmed", zoom: "https://zoom.us/j/0000000001", attendees: 3 },
  ],
  16: [
    { time: "09:00", end: "09:45", client: "Hartley Family Trust", kind: "Estate planning", host: "John Harwick", location: "Mayfair · Room 3", status: "Confirmed", zoom: "https://zoom.us/j/0000000010", attendees: 4 },
    { time: "11:30", end: "12:00", client: "Denis Marlow — Rebalance", kind: "Portfolio review", host: "Avery Sterne", location: "Zoom", status: "Confirmed", zoom: "https://zoom.us/j/0000000011", attendees: 2 },
    { time: "14:00", end: "15:00", client: "Sterling Holdings Review", kind: "Quarterly review", host: "John Harwick", location: "Zoom", status: "Pending", zoom: "https://zoom.us/j/0000000012", attendees: 5 },
    { time: "16:30", end: "17:00", client: "Caldwell Estate Planning", kind: "Onboarding", host: "Priya Shah", location: "Mayfair · Room 1", status: "Confirmed", zoom: "https://zoom.us/j/0000000013", attendees: 2 },
  ],
  20: [
    { time: "09:00", end: "10:00", client: "CIO Roundtable — Valdai Fund", kind: "Roundtable", host: "Avery Sterne", location: "Zoom", status: "Confirmed", zoom: "https://zoom.us/j/0000000020", attendees: 6 },
  ],
  22: [
    { time: "13:30", end: "14:30", client: "Sterling Holdings Estate Review", kind: "Estate review", host: "John Harwick", location: "Mayfair · Boardroom", status: "Confirmed", zoom: "https://zoom.us/j/0000000022", attendees: 4 },
  ],
  28: [
    { time: "16:00", end: "17:00", client: "All-Hands — Q1 Planning", kind: "Internal", host: "John Harwick", location: "Mayfair · Boardroom", status: "Confirmed", zoom: "https://zoom.us/j/0000000028", attendees: 12 },
  ],
};

// iOS system colors — used as meeting-kind tag palette
type Ios = { name: string; solid: string; tint: string; text: string };
const IOS: Record<string, Ios> = {
  blue:    { name: "Blue",    solid: "#0A84FF", tint: "rgba(10,132,255,0.16)",  text: "#7CB8FF" },
  indigo:  { name: "Indigo",  solid: "#5E5CE6", tint: "rgba(94,92,230,0.16)",   text: "#A6A5F3" },
  purple:  { name: "Purple",  solid: "#BF5AF2", tint: "rgba(191,90,242,0.16)",  text: "#D9A2F7" },
  pink:    { name: "Pink",    solid: "#FF375F", tint: "rgba(255,55,95,0.16)",   text: "#FF8FA6" },
  red:     { name: "Red",     solid: "#FF453A", tint: "rgba(255,69,58,0.16)",   text: "#FF8F87" },
  orange:  { name: "Orange",  solid: "#FF9F0A", tint: "rgba(255,159,10,0.16)",  text: "#FFC069" },
  yellow:  { name: "Yellow",  solid: "#FFD60A", tint: "rgba(255,214,10,0.16)",  text: "#FFE066" },
  green:   { name: "Green",   solid: "#32D74B", tint: "rgba(50,215,75,0.16)",   text: "#78E28C" },
  mint:    { name: "Mint",    solid: "#66D4CF", tint: "rgba(102,212,207,0.16)", text: "#9EE3DF" },
  teal:    { name: "Teal",    solid: "#40C8E0", tint: "rgba(64,200,224,0.16)",  text: "#7FDBEC" },
};

const kindColor: Record<string, keyof typeof IOS> = {
  "Client review": "blue",
  "Estate planning": "indigo",
  "Portfolio review": "mint",
  "Quarterly review": "orange",
  "Onboarding": "green",
  "Roundtable": "purple",
  "Estate review": "indigo",
  "Internal": "pink",
};

const colorFor = (kind: string): Ios => IOS[kindColor[kind] ?? "blue"];

function CalendarPage() {
  const today = new Date(2026, 0, 16);
  const [viewMonth, setViewMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState<number>(16);

  const monthLabel = viewMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const grid = useMemo(() => {
    const first = new Date(viewMonth);
    const lastDay = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();
    const startOffset = (first.getDay() + 6) % 7;
    const cells: { d: number | null }[] = [];
    for (let i = 0; i < startOffset; i++) cells.push({ d: null });
    for (let d = 1; d <= lastDay; d++) cells.push({ d });
    while (cells.length % 7 !== 0) cells.push({ d: null });
    return cells;
  }, [viewMonth]);

  const dayMeetings = bookings[selectedDay] ?? [];
  const selectedDate = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), selectedDay);
  const selectedLabel = selectedDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const navMonth = (delta: number) =>
    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + delta, 1));

  const goToday = () => {
    setViewMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDay(today.getDate());
  };

  const totalThisMonth = Object.values(bookings).reduce((a, b) => a + b.length, 0);
  const confirmed = Object.values(bookings).flat().filter((m) => m.status === "Confirmed").length;
  const pending = totalThisMonth - confirmed;

  return (
    <PageShell>
      <PageHeader
        eyebrow="Scheduling"
        title="Calendar"
        description="Every client and internal meeting across Harwick & Sterne — book, reschedule, and join without leaving the workspace."
        actions={
          <>
            <div className="hidden md:inline-flex h-9 items-center gap-2 rounded-sm border border-border/70 bg-card px-2.5 text-[12px] text-muted-foreground">
              <Search className="h-3.5 w-3.5" strokeWidth={1.75} />
              <span>Jump to…</span>
              <span className="inline-flex items-center gap-0.5 rounded-sm border border-border/70 bg-background/60 px-1 py-0.5 text-[10px] font-medium">
                <Command className="h-2.5 w-2.5" /> K
              </span>
            </div>
            <FilterMenu total={totalThisMonth} confirmed={confirmed} pending={pending} />
            <Button size="sm" className="h-9 gap-1.5">
              <Plus className="h-4 w-4" strokeWidth={2} />
              New meeting
            </Button>
          </>
        }
      />

      {/* Hairline stat strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 border-y border-border/50 divide-x divide-border/50 -mx-4 sm:-mx-6 md:-mx-8">
        {[
          { label: "Meetings this month", value: String(totalThisMonth) },
          { label: "Confirmed", value: String(confirmed) },
          { label: "Pending", value: String(pending) },
          { label: "Avg per day", value: "1.4" },
        ].map((s) => (
          <div key={s.label} className="px-4 py-3.5 sm:px-6 sm:py-5">
            <div className="text-[9.5px] sm:text-[10px] uppercase tracking-[0.16em] sm:tracking-[0.18em] text-muted-foreground truncate">{s.label}</div>
            <div className="mt-1 sm:mt-1.5 text-[18px] sm:text-[22px] font-semibold tracking-tight tabular-nums">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Main calendar surface — raised card with subtle depth */}
      <div className="-mx-4 sm:-mx-6 md:-mx-8 border-b border-border/50">
        <div className="bg-card/60 dark:bg-white/[0.02] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
          {/* Toolbar */}
          <div className="sticky top-0 z-10 flex items-center justify-between gap-3 flex-wrap px-4 sm:px-6 md:px-8 py-3 border-b border-border/50 bg-background/85 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="text-[15px] font-semibold tracking-tight">{monthLabel}</div>
              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => navMonth(-1)}
                  aria-label="Previous month"
                  className="grid h-7 w-7 place-items-center rounded-sm text-muted-foreground hover:text-foreground hover:bg-foreground/[0.05]"
                >
                  <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
                </button>
                <button
                  onClick={() => navMonth(1)}
                  aria-label="Next month"
                  className="grid h-7 w-7 place-items-center rounded-sm text-muted-foreground hover:text-foreground hover:bg-foreground/[0.05]"
                >
                  <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.75} />
                </button>
              </div>
              <button
                onClick={goToday}
                className="h-7 rounded-sm border border-border/70 bg-card px-2.5 text-[11.5px] font-medium text-foreground/85 hover:bg-foreground/[0.05]"
              >
                Today
              </button>
            </div>
            <div className="flex items-center gap-1 rounded-sm border border-border/70 bg-card p-0.5 text-[11.5px]">
              {["Month", "Week", "Day"].map((v, i) => (
                <button
                  key={v}
                  className={`h-6 px-2.5 rounded-sm font-medium transition-colors ${
                    i === 0 ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Day-of-week header */}
          <div className="grid grid-cols-7 text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.14em] sm:tracking-[0.18em] text-muted-foreground/80 bg-muted/[0.2] dark:bg-white/[0.015]">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div key={d} className="px-1.5 py-1.5 sm:px-3 sm:py-2 border-r border-border/40 last:border-r-0 text-center sm:text-left">
                <span className="sm:hidden">{d[0]}</span>
                <span className="hidden sm:inline">{d}</span>
              </div>
            ))}
          </div>

          {/* Month grid */}
          <div className="grid grid-cols-7 border-t border-border/50">
            {grid.map((cell, i) => {
              const d = cell.d;
              const isToday = d === today.getDate() && viewMonth.getMonth() === today.getMonth() && viewMonth.getFullYear() === today.getFullYear();
              const isSelected = d === selectedDay;
              const isWeekend = i % 7 >= 5;
              const meetings = d ? bookings[d] ?? [] : [];
              const rowEnd = i >= grid.length - 7;
              return (
                <button
                  key={i}
                  onClick={() => d && setSelectedDay(d)}
                  disabled={!d}
                  className={`group relative text-left min-h-[62px] sm:min-h-[92px] md:min-h-[116px] px-1 py-1.5 sm:px-2 sm:py-2 border-r border-border/40 last:border-r-0 ${
                    rowEnd ? "" : "border-b"
                  } transition-colors ${
                    !d
                      ? "bg-muted/10 cursor-default"
                      : isSelected
                      ? "bg-foreground/[0.05] ring-1 ring-inset ring-foreground/15"
                      : isWeekend
                      ? "bg-muted/[0.12] dark:bg-white/[0.012] hover:bg-foreground/[0.03]"
                      : "hover:bg-foreground/[0.03]"
                  }`}
                >
                  {d && (
                    <>
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={`inline-flex h-5 min-w-5 sm:h-6 sm:min-w-6 items-center justify-center rounded-full px-1 text-[11px] sm:text-[12px] tabular-nums ${
                            isToday
                              ? "bg-[#FF453A] text-white font-semibold shadow-[0_1px_2px_rgba(0,0,0,0.35)]"
                              : isSelected
                              ? "text-foreground font-semibold"
                              : "text-foreground/75"
                          }`}
                        >
                          {d}
                        </span>
                        {meetings.length > 0 && (
                          <span className="flex items-center gap-0.5">
                            {meetings.slice(0, 3).map((m, idx) => (
                              <span
                                key={idx}
                                className="h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full"
                                style={{ background: colorFor(m.kind).solid }}
                              />
                            ))}
                          </span>
                        )}
                      </div>
                      {/* Mobile: single compact chip showing first meeting time; hide the full pill list */}
                      {meetings.length > 0 && (
                        <div className="mt-1 sm:hidden">
                          <div
                            className="inline-flex items-center gap-1 rounded-[4px] px-1 py-[1px] text-[9px] font-semibold tabular-nums leading-none"
                            style={{
                              background: colorFor(meetings[0].kind).tint,
                              color: colorFor(meetings[0].kind).text,
                            }}
                          >
                            <span
                              className="h-1.5 w-[2px] rounded-[1px]"
                              style={{ background: colorFor(meetings[0].kind).solid }}
                            />
                            {meetings[0].time}
                          </div>
                          {meetings.length > 1 && (
                            <div className="text-[8.5px] text-muted-foreground/70 mt-0.5 leading-none">
                              +{meetings.length - 1}
                            </div>
                          )}
                        </div>
                      )}
                      {/* Desktop / tablet: full inline pill list */}
                      <div className="hidden sm:block mt-1.5 space-y-1">
                        {meetings.slice(0, 3).map((m, mi) => {
                          const c = colorFor(m.kind);
                          const isPending = m.status === "Pending";
                          return (
                            <div
                              key={mi}
                              className={`flex items-center gap-1.5 truncate rounded-[5px] pl-1.5 pr-1 py-[3px] text-[10.5px] leading-tight transition-colors ${
                                isPending ? "border border-dashed" : ""
                              }`}
                              style={
                                isPending
                                  ? { borderColor: `${c.solid}66`, color: c.text }
                                  : { background: c.tint, color: c.text }
                              }
                            >
                              <span
                                className="h-2.5 w-[3px] rounded-[1px] shrink-0"
                                style={{ background: c.solid }}
                              />
                              <span className="tabular-nums font-semibold">{m.time}</span>
                              <span className="truncate opacity-90">{m.client}</span>
                            </div>
                          );
                        })}
                        {meetings.length > 3 && (
                          <div className="text-[10px] text-muted-foreground pl-1">
                            +{meetings.length - 3} more
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Agenda */}
      <div className="pt-6">
        <div className="flex items-end justify-between flex-wrap gap-3 pb-4">
          <div>
            <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              <Clock className="h-3 w-3" strokeWidth={1.75} />
              Agenda
            </div>
            <div className="mt-1 text-[18px] font-semibold tracking-tight">{selectedLabel}</div>
            <div className="text-[12px] text-muted-foreground">
              {dayMeetings.length} meeting{dayMeetings.length === 1 ? "" : "s"} scheduled
            </div>
          </div>
          <Button variant="outline" size="sm" className="h-8 gap-1.5">
            <Plus className="h-3.5 w-3.5" strokeWidth={2} />
            Add to this day
          </Button>
        </div>

        {dayMeetings.length === 0 ? (
          <div className="rounded-sm border border-dashed border-border/70 py-14 text-center">
            <Circle className="h-4 w-4 text-muted-foreground/50 mx-auto" strokeWidth={1.5} />
            <div className="mt-3 text-[13px] font-medium text-foreground/85">No meetings scheduled</div>
            <div className="mt-1 text-[12px] text-muted-foreground">
              Pick a different day or add a new meeting.
            </div>
          </div>
        ) : (
          <div className="relative rounded-sm border border-border/60 bg-card/60 dark:bg-white/[0.02] overflow-hidden shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset,0_8px_24px_-16px_rgba(0,0,0,0.6)]">
            <ul className="divide-y divide-border/40">
              {dayMeetings.map((m, i) => {
                const c = colorFor(m.kind);
                return (
                  <li
                    key={i}
                    className="group relative flex items-stretch gap-2 sm:gap-4 pl-0 pr-2 sm:pr-3 py-3 sm:py-3.5 hover:bg-foreground/[0.025] transition-colors"
                  >
                    {/* Left color bar — iOS style */}
                    <span
                      aria-hidden
                      className="w-[3px] shrink-0 self-stretch my-1 rounded-r-sm"
                      style={{ background: c.solid, boxShadow: `0 0 12px ${c.solid}55` }}
                    />
                    <div className="relative w-[52px] sm:w-[60px] shrink-0 py-0.5 pl-2 sm:pl-3">
                      <div className="text-[13px] font-semibold tabular-nums tracking-tight leading-none">
                        {m.time}
                      </div>
                      <div className="mt-1 text-[10.5px] tabular-nums text-muted-foreground leading-none">
                        → {m.end}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1 py-0.5">
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        <span className="text-[13px] sm:text-[13.5px] font-semibold truncate max-w-full">{m.client}</span>
                        <span
                          className="inline-flex items-center gap-1 h-[18px] rounded-full px-2 text-[10px] font-semibold whitespace-nowrap shrink-0"
                          style={{ background: c.tint, color: c.text }}
                        >
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ background: c.solid }}
                          />
                          {m.kind}
                        </span>
                        {m.status === "Confirmed" ? (
                          <span className="inline-flex items-center gap-1 text-[10.5px] font-medium text-foreground/70 whitespace-nowrap shrink-0">
                            <Check className="h-2.5 w-2.5" strokeWidth={2.5} />
                            Confirmed
                          </span>
                        ) : (
                          <span className="text-[10.5px] italic text-muted-foreground whitespace-nowrap shrink-0">Pending</span>
                        )}
                      </div>
                      <div className="mt-1.5 flex items-center gap-2.5 sm:gap-3 text-[11.5px] text-muted-foreground overflow-hidden">
                        <span className="inline-flex items-center gap-1 min-w-0 shrink">
                          <img
                            src={avatarUrl(m.host)}
                            alt=""
                            className="h-4 w-4 rounded-full object-cover ring-1 ring-border/60 shrink-0"
                          />
                          <span className="truncate whitespace-nowrap">{m.host}</span>
                        </span>
                        <span className="inline-flex items-center gap-1 min-w-0 shrink-0 whitespace-nowrap">
                          <MapPin className="h-3 w-3 shrink-0" strokeWidth={1.75} />
                          <span className="truncate">{m.location}</span>
                        </span>
                        <span className="inline-flex items-center gap-1 shrink-0 whitespace-nowrap">
                          <Users className="h-3 w-3" strokeWidth={1.75} /> {m.attendees ?? 2}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 self-center">
                      <a
                        href={m.zoom}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Join meeting"
                        className="inline-flex h-8 items-center gap-1 sm:gap-1.5 rounded-sm bg-foreground text-background px-2.5 sm:px-3 text-[11.5px] font-semibold hover:bg-foreground/90 transition-colors whitespace-nowrap"
                      >
                        <Video className="h-3.5 w-3.5" strokeWidth={2} />
                        <span className="hidden sm:inline">Join</span>
                      </a>
                      <button
                        aria-label="More"
                        className="hidden sm:grid h-8 w-8 place-items-center rounded-sm border border-border/70 bg-card text-foreground/70 hover:bg-foreground/[0.05]"
                      >
                        <MoreHorizontal className="h-4 w-4" strokeWidth={1.75} />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 pt-4">
        {Object.entries(kindColor).map(([kind, key]) => {
          const c = IOS[key];
          return (
            <span
              key={kind}
              className="inline-flex items-center gap-1.5 h-[22px] rounded-full px-2.5 text-[10.5px] font-medium"
              style={{ background: c.tint, color: c.text }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: c.solid }} />
              {kind}
            </span>
          );
        })}
      </div>
    </PageShell>
  );
}

function FilterMenu({
  total,
  confirmed,
  pending,
}: {
  total: number;
  confirmed: number;
  pending: number;
}) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"all" | "mine" | "client" | "internal">("all");
  const [statuses, setStatuses] = useState({ Confirmed: true, Pending: true });
  const [hosts, setHosts] = useState({
    "John Harwick": true,
    "Avery Sterne": true,
    "Priya Shah": true,
  });
  const [kinds, setKinds] = useState<Record<string, boolean>>(
    Object.fromEntries(Object.keys(kindColor).map((k) => [k, true])),
  );
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const activeCount =
    (view !== "all" ? 1 : 0) +
    Object.values(statuses).filter((v) => !v).length +
    Object.values(hosts).filter((v) => !v).length +
    Object.values(kinds).filter((v) => !v).length;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-9 items-center gap-1.5 rounded-sm border border-border/70 bg-card px-2.5 text-[12px] font-medium text-foreground/85 hover:bg-foreground/[0.05]"
      >
        <Filter className="h-3.5 w-3.5" strokeWidth={1.75} />
        Filters
        {activeCount > 0 && (
          <span className="ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#0A84FF] px-1 text-[10px] font-semibold text-white">
            {activeCount}
          </span>
        )}
      </button>
      {open && (
        <div
          className="absolute right-0 top-[calc(100%+6px)] z-30 w-[280px] rounded-md border border-border/70 bg-popover shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6),0_1px_0_0_rgba(255,255,255,0.04)_inset] p-3 space-y-3"
          role="menu"
        >
          <div>
            <div className="text-[9.5px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/80 mb-1.5">
              View
            </div>
            <div className="grid grid-cols-2 gap-1">
              {[
                { id: "all", label: "All meetings", count: total },
                { id: "mine", label: "My schedule", count: 5 },
                { id: "client", label: "Client-facing", count: 4 },
                { id: "internal", label: "Internal", count: 1 },
              ].map((v) => (
                <button
                  key={v.id}
                  onClick={() => setView(v.id as typeof view)}
                  className={`flex items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-[11.5px] transition-colors ${
                    view === v.id
                      ? "bg-foreground/[0.08] text-foreground font-medium"
                      : "text-foreground/75 hover:bg-foreground/[0.04]"
                  }`}
                >
                  <span className="truncate">{v.label}</span>
                  <span className="text-[10px] tabular-nums text-muted-foreground">
                    {v.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-border/50 pt-2.5">
            <div className="text-[9.5px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/80 mb-1.5">
              Status
            </div>
            <div className="grid grid-cols-2 gap-1">
              {(["Confirmed", "Pending"] as const).map((s) => (
                <Toggle
                  key={s}
                  label={s}
                  count={s === "Confirmed" ? confirmed : pending}
                  on={statuses[s]}
                  onChange={() => setStatuses((p) => ({ ...p, [s]: !p[s] }))}
                />
              ))}
            </div>
          </div>

          <div className="border-t border-border/50 pt-2.5">
            <div className="text-[9.5px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/80 mb-1.5">
              Category
            </div>
            <div className="max-h-[140px] overflow-y-auto space-y-1 pr-1">
              {Object.entries(kindColor).map(([k, key]) => {
                const c = IOS[key];
                const on = kinds[k];
                return (
                  <button
                    key={k}
                    onClick={() => setKinds((p) => ({ ...p, [k]: !p[k] }))}
                    className={`flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-[11.5px] transition-colors ${
                      on ? "hover:bg-foreground/[0.04]" : "opacity-40 hover:bg-foreground/[0.04]"
                    }`}
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ background: c.solid }}
                    />
                    <span className="flex-1 text-left truncate">{k}</span>
                    {on && <Check className="h-3 w-3 text-foreground/70" strokeWidth={2.5} />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-border/50 pt-2.5">
            <div className="text-[9.5px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/80 mb-1.5">
              Hosts
            </div>
            <div className="space-y-1">
              {Object.keys(hosts).map((name) => (
                <Toggle
                  key={name}
                  label={name}
                  on={hosts[name as keyof typeof hosts]}
                  onChange={() =>
                    setHosts((p) => ({ ...p, [name]: !p[name as keyof typeof p] }))
                  }
                  avatar={avatarUrl(name)}
                />
              ))}
            </div>
          </div>

          {activeCount > 0 && (
            <div className="border-t border-border/50 pt-2 flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">
                {activeCount} filter{activeCount === 1 ? "" : "s"} active
              </span>
              <button
                onClick={() => {
                  setView("all");
                  setStatuses({ Confirmed: true, Pending: true });
                  setHosts({ "John Harwick": true, "Avery Sterne": true, "Priya Shah": true });
                  setKinds(Object.fromEntries(Object.keys(kindColor).map((k) => [k, true])));
                }}
                className="text-[11px] font-medium text-foreground/85 hover:text-foreground"
              >
                Reset
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Toggle({
  label,
  count,
  on,
  onChange,
  avatar,
}: {
  label: string;
  count?: number;
  on: boolean;
  onChange: () => void;
  avatar?: string;
}) {
  return (
    <button
      onClick={onChange}
      className={`flex items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-[11.5px] transition-colors ${
        on ? "text-foreground/90 hover:bg-foreground/[0.04]" : "opacity-40 hover:bg-foreground/[0.04]"
      }`}
    >
      <span className="flex items-center gap-2 min-w-0">
        {avatar && (
          <img
            src={avatar}
            alt=""
            className="h-4 w-4 rounded-full object-cover ring-1 ring-border/60 shrink-0"
          />
        )}
        <span className="truncate">{label}</span>
      </span>
      <span className="flex items-center gap-1.5 shrink-0">
        {typeof count === "number" && (
          <span className="text-[10px] tabular-nums text-muted-foreground">{count}</span>
        )}
        {on && <Check className="h-3 w-3 text-foreground/70" strokeWidth={2.5} />}
      </span>
    </button>
  );
}
