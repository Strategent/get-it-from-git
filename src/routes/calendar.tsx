import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
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

// Host → subtle monochrome pip color (kept desaturated per project style)
const hostPip: Record<string, string> = {
  "John Harwick": "#9ca3af",
  "Avery Sterne": "#71717a",
  "Priya Shah": "#a3a3a3",
};

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

  // Upcoming (next 3 across month) for the left rail
  const upcoming = Object.entries(bookings)
    .flatMap(([d, list]) => list.map((m) => ({ ...m, day: Number(d) })))
    .filter((m) => m.day >= today.getDate())
    .sort((a, b) => a.day - b.day || a.time.localeCompare(b.time))
    .slice(0, 4);

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
            <Button variant="outline" size="icon" className="h-9 w-9" aria-label="Filter">
              <Filter className="h-4 w-4" strokeWidth={1.75} />
            </Button>
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
          <div key={s.label} className="px-6 py-5">
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{s.label}</div>
            <div className="mt-1.5 text-[22px] font-semibold tracking-tight tabular-nums">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Two-pane workspace — Linear style */}
      <div className="-mx-4 sm:-mx-6 md:-mx-8 grid grid-cols-1 lg:grid-cols-[240px_1fr] border-b border-border/50">
        {/* Left context rail */}
        <aside className="hidden lg:flex flex-col border-r border-border/50 bg-muted/[0.25] dark:bg-white/[0.015]">
          <RailSection title="Views">
            <RailItem label="All meetings" count={totalThisMonth} active />
            <RailItem label="My schedule" count={5} />
            <RailItem label="Client-facing" count={4} />
            <RailItem label="Internal" count={1} />
          </RailSection>

          <RailSection title="Hosts">
            {Object.entries(hostPip).map(([name, color]) => (
              <RailItem
                key={name}
                label={name}
                dotColor={color}
                count={Object.values(bookings).flat().filter((m) => m.host === name).length}
              />
            ))}
          </RailSection>

          <RailSection title="Up next">
            <div className="px-3 pb-3 space-y-1.5">
              {upcoming.map((m, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedDay(m.day)}
                  className="group w-full text-left rounded-sm border border-border/50 bg-card/70 hover:bg-card px-2.5 py-2 transition-colors"
                >
                  <div className="flex items-center justify-between text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
                    <span>{monthShort(viewMonth)} {m.day}</span>
                    <span className="tabular-nums">{m.time}</span>
                  </div>
                  <div className="mt-1 text-[12px] font-medium text-foreground/90 truncate">
                    {m.client}
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-[10.5px] text-muted-foreground">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: hostPip[m.host] ?? "#9ca3af" }}
                    />
                    {m.host}
                  </div>
                </button>
              ))}
            </div>
          </RailSection>
        </aside>

        {/* Main calendar column */}
        <div className="min-w-0">
          {/* Sticky toolbar */}
          <div className="sticky top-0 z-10 flex items-center justify-between gap-3 flex-wrap px-4 sm:px-6 md:px-8 py-3 border-b border-border/50 bg-background/85 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="text-[14px] font-semibold tracking-tight">{monthLabel}</div>
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
          <div className="grid grid-cols-7 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/80 bg-muted/[0.15] dark:bg-white/[0.01]">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div key={d} className="px-3 py-2 border-r border-border/40 last:border-r-0">
                {d}
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
                  className={`group relative text-left min-h-[112px] px-2.5 py-2 border-r border-border/40 last:border-r-0 ${
                    rowEnd ? "" : "border-b"
                  } transition-colors ${
                    !d
                      ? "bg-muted/10 cursor-default"
                      : isSelected
                      ? "bg-foreground/[0.055] ring-1 ring-inset ring-foreground/15"
                      : isWeekend
                      ? "bg-muted/[0.12] dark:bg-white/[0.008] hover:bg-foreground/[0.03]"
                      : "hover:bg-foreground/[0.03]"
                  }`}
                >
                  {d && (
                    <>
                      <div className="flex items-center justify-between">
                        <span
                          className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11.5px] tabular-nums ${
                            isToday
                              ? "bg-foreground text-background font-semibold"
                              : isSelected
                              ? "text-foreground font-semibold"
                              : "text-foreground/75"
                          }`}
                        >
                          {d}
                        </span>
                        {meetings.length > 0 && (
                          <span className="flex items-center gap-1 text-[10px] tabular-nums text-muted-foreground">
                            {meetings.slice(0, 3).map((m, idx) => (
                              <span
                                key={idx}
                                className="h-1.5 w-1.5 rounded-full"
                                style={{ background: hostPip[m.host] ?? "#9ca3af" }}
                              />
                            ))}
                          </span>
                        )}
                      </div>
                      <div className="mt-1.5 space-y-0.5">
                        {meetings.slice(0, 3).map((m, mi) => (
                          <div
                            key={mi}
                            className={`flex items-center gap-1.5 truncate rounded-sm px-1 py-0.5 text-[10.5px] leading-tight ${
                              m.status === "Confirmed"
                                ? "bg-foreground/[0.06] text-foreground/90 hover:bg-foreground/[0.09]"
                                : "border border-dashed border-border/70 text-muted-foreground"
                            }`}
                          >
                            <span
                              className="h-1 w-1 rounded-full shrink-0"
                              style={{ background: hostPip[m.host] ?? "#9ca3af" }}
                            />
                            <span className="tabular-nums font-medium">{m.time}</span>
                            <span className="text-foreground/70 truncate">{m.client}</span>
                          </div>
                        ))}
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

      {/* Agenda — Linear-style time rail */}
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
          <div className="relative rounded-sm border border-border/60 bg-card/40 overflow-hidden">
            {/* left hour-rail vertical guideline */}
            <div className="absolute left-[76px] top-0 bottom-0 w-px bg-border/50 pointer-events-none" />
            <ul className="divide-y divide-border/40">
              {dayMeetings.map((m, i) => (
                <li
                  key={i}
                  className="group relative flex items-stretch gap-4 pl-4 pr-3 py-3.5 hover:bg-foreground/[0.025] transition-colors"
                >
                  <div className="relative w-[60px] shrink-0 py-0.5">
                    <div className="text-[13px] font-semibold tabular-nums tracking-tight leading-none">
                      {m.time}
                    </div>
                    <div className="mt-1 text-[10.5px] tabular-nums text-muted-foreground leading-none">
                      → {m.end}
                    </div>
                  </div>
                  {/* rail node */}
                  <div className="relative w-3 shrink-0 flex justify-center">
                    <span
                      className="mt-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-background"
                      style={{ background: hostPip[m.host] ?? "#9ca3af" }}
                    />
                  </div>
                  <div className="min-w-0 flex-1 py-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[13.5px] font-semibold truncate">{m.client}</span>
                      <span className="inline-flex items-center gap-1 h-4.5 rounded-sm border border-border/60 px-1.5 text-[10px] font-medium text-foreground/75 bg-background/50">
                        {m.kind}
                      </span>
                      {m.status === "Confirmed" ? (
                        <span className="inline-flex items-center gap-1 text-[10.5px] font-medium text-foreground/70">
                          <Check className="h-2.5 w-2.5" strokeWidth={2.5} />
                          Confirmed
                        </span>
                      ) : (
                        <span className="text-[10.5px] italic text-muted-foreground">Pending</span>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-[11.5px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <img
                          src={avatarUrl(m.host)}
                          alt=""
                          className="h-4 w-4 rounded-full object-cover ring-1 ring-border/60"
                        />
                        {m.host}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" strokeWidth={1.75} /> {m.location}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3 w-3" strokeWidth={1.75} /> {m.attendees ?? 2}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 self-center">
                    <a
                      href={m.zoom}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-8 items-center gap-1.5 rounded-sm bg-foreground text-background px-3 text-[11.5px] font-semibold hover:bg-foreground/90 transition-colors"
                    >
                      <Video className="h-3.5 w-3.5" strokeWidth={2} /> Join
                    </a>
                    <button
                      aria-label="More"
                      className="grid h-8 w-8 place-items-center rounded-sm border border-border/70 bg-card text-foreground/70 hover:bg-foreground/[0.05]"
                    >
                      <MoreHorizontal className="h-4 w-4" strokeWidth={1.75} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </PageShell>
  );
}

function RailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-border/40 py-3">
      <div className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/80">
        {title}
      </div>
      <div>{children}</div>
    </div>
  );
}

function RailItem({
  label,
  count,
  active,
  dotColor,
}: {
  label: string;
  count?: number;
  active?: boolean;
  dotColor?: string;
}) {
  return (
    <button
      className={`flex w-full items-center justify-between gap-2 px-3 py-1.5 text-[12px] transition-colors ${
        active
          ? "bg-foreground/[0.06] text-foreground font-medium"
          : "text-foreground/75 hover:bg-foreground/[0.035] hover:text-foreground"
      }`}
    >
      <span className="inline-flex items-center gap-2 truncate">
        {dotColor && (
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: dotColor }} />
        )}
        <span className="truncate">{label}</span>
      </span>
      {typeof count === "number" && (
        <span className="text-[10.5px] tabular-nums text-muted-foreground">{count}</span>
      )}
    </button>
  );
}

function monthShort(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short" });
}
