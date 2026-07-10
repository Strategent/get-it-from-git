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
  CalendarDays,
} from "lucide-react";
import { PageShell, PageHeader } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
};

const bookings: Record<number, Meeting[]> = {
  7: [
    { time: "10:00", end: "10:30", client: "Hartley Family Review", kind: "Client review", host: "John Harwick", location: "Zoom", status: "Confirmed", zoom: "https://zoom.us/j/0000000001" },
  ],
  16: [
    { time: "09:00", end: "09:45", client: "Hartley Family Trust", kind: "Estate planning", host: "John Harwick", location: "Mayfair · Room 3", status: "Confirmed", zoom: "https://zoom.us/j/0000000010" },
    { time: "11:30", end: "12:00", client: "Denis Marlow — Rebalance", kind: "Portfolio review", host: "Avery Sterne", location: "Zoom", status: "Confirmed", zoom: "https://zoom.us/j/0000000011" },
    { time: "14:00", end: "15:00", client: "Sterling Holdings Review", kind: "Quarterly review", host: "John Harwick", location: "Zoom", status: "Pending", zoom: "https://zoom.us/j/0000000012" },
    { time: "16:30", end: "17:00", client: "Caldwell Estate Planning", kind: "Onboarding", host: "Priya Shah", location: "Mayfair · Room 1", status: "Confirmed", zoom: "https://zoom.us/j/0000000013" },
  ],
  20: [
    { time: "09:00", end: "10:00", client: "CIO Roundtable — Valdai Fund", kind: "Roundtable", host: "Avery Sterne", location: "Zoom", status: "Confirmed", zoom: "https://zoom.us/j/0000000020" },
  ],
  22: [
    { time: "13:30", end: "14:30", client: "Sterling Holdings Estate Review", kind: "Estate review", host: "John Harwick", location: "Mayfair · Boardroom", status: "Confirmed", zoom: "https://zoom.us/j/0000000022" },
  ],
  28: [
    { time: "16:00", end: "17:00", client: "All-Hands — Q1 Planning", kind: "Internal", host: "John Harwick", location: "Mayfair · Boardroom", status: "Confirmed", zoom: "https://zoom.us/j/0000000028" },
  ],
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

  // stat strip totals
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
            <Button variant="outline" size="icon" className="h-9 w-9" aria-label="Search">
              <Search className="h-4 w-4" strokeWidth={1.75} />
            </Button>
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

      {/* Hairline stat strip — matches Calls / CRM */}
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

      {/* Month grid — full width, admin focused */}
      <div className="-mx-4 sm:-mx-6 md:-mx-8 border-b border-border/50">
        <div className="px-4 sm:px-6 md:px-8 py-5 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="text-[15px] font-semibold tracking-tight">{monthLabel}</div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => navMonth(-1)}
                aria-label="Previous month"
                className="grid h-8 w-8 place-items-center rounded-sm border border-border/70 bg-card hover:bg-foreground/[0.05] text-foreground/80"
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
              </button>
              <button
                onClick={() => navMonth(1)}
                aria-label="Next month"
                className="grid h-8 w-8 place-items-center rounded-sm border border-border/70 bg-card hover:bg-foreground/[0.05] text-foreground/80"
              >
                <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
              </button>
              <button
                onClick={goToday}
                className="ml-1 h-8 rounded-sm border border-border/70 bg-card px-3 text-[12px] font-medium text-foreground/85 hover:bg-foreground/[0.05]"
              >
                Today
              </button>
            </div>
          </div>
          <div className="flex items-center gap-1 rounded-sm border border-border/70 bg-card p-0.5 text-[12px]">
            {["Month", "Week", "Day"].map((v, i) => (
              <button
                key={v}
                className={`h-7 px-3 rounded-sm font-medium ${
                  i === 0 ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-7 border-t border-border/50 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/80">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div key={d} className="px-3 py-2 border-r border-border/50 last:border-r-0">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 border-t border-border/50">
          {grid.map((cell, i) => {
            const d = cell.d;
            const isToday = d === today.getDate() && viewMonth.getMonth() === today.getMonth() && viewMonth.getFullYear() === today.getFullYear();
            const isSelected = d === selectedDay;
            const meetings = d ? bookings[d] ?? [] : [];
            const rowEnd = i >= grid.length - 7;
            return (
              <button
                key={i}
                onClick={() => d && setSelectedDay(d)}
                disabled={!d}
                className={`text-left min-h-[104px] px-3 py-2 border-r border-border/50 last:border-r-0 ${
                  rowEnd ? "" : "border-b"
                } transition-colors ${
                  !d
                    ? "bg-muted/10 cursor-default"
                    : isSelected
                    ? "bg-foreground/[0.06]"
                    : "hover:bg-foreground/[0.03]"
                }`}
              >
                {d && (
                  <>
                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[12px] tabular-nums ${
                          isToday
                            ? "bg-foreground text-background font-semibold"
                            : isSelected
                            ? "text-foreground font-semibold"
                            : "text-foreground/80"
                        }`}
                      >
                        {d}
                      </span>
                      {meetings.length > 0 && (
                        <span className="text-[10px] tabular-nums text-muted-foreground">
                          {meetings.length}
                        </span>
                      )}
                    </div>
                    <div className="mt-1.5 space-y-1">
                      {meetings.slice(0, 3).map((m, mi) => (
                        <div
                          key={mi}
                          className={`truncate rounded-sm px-1.5 py-0.5 text-[10.5px] leading-tight ${
                            m.status === "Confirmed"
                              ? "bg-foreground/[0.08] text-foreground/90"
                              : "border border-dashed border-border text-muted-foreground"
                          }`}
                        >
                          <span className="tabular-nums font-medium">{m.time}</span>{" "}
                          <span className="text-foreground/70">{m.client}</span>
                        </div>
                      ))}
                      {meetings.length > 3 && (
                        <div className="text-[10px] text-muted-foreground pl-1.5">
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

      {/* Meetings for selected day — under the calendar */}
      <div className="pt-2">
        <div className="flex items-end justify-between flex-wrap gap-3 pb-3">
          <div>
            <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              <CalendarDays className="h-3 w-3" strokeWidth={1.75} />
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
          <div className="rounded-sm border border-dashed border-border/70 py-12 text-center">
            <div className="text-[13px] font-medium text-foreground/85">No meetings scheduled</div>
            <div className="mt-1 text-[12px] text-muted-foreground">
              Pick a different day or add a new meeting.
            </div>
          </div>
        ) : (
          <div className="rounded-sm border border-border/60 bg-card/40 divide-y divide-border/50 shadow-sm">
            {dayMeetings.map((m, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3.5 hover:bg-foreground/[0.03] transition-colors">
                <div className="w-20 shrink-0">
                  <div className="text-[13px] font-semibold tabular-nums tracking-tight">{m.time}</div>
                  <div className="text-[11px] tabular-nums text-muted-foreground">{m.end}</div>
                </div>
                <div className="h-9 w-px bg-border/70 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[13.5px] font-semibold truncate">{m.client}</span>
                    <Badge
                      variant="outline"
                      className={`h-5 rounded-sm border-border/60 px-1.5 text-[10px] font-medium ${
                        m.status === "Confirmed"
                          ? "text-foreground/80"
                          : "text-muted-foreground italic"
                      }`}
                    >
                      {m.status === "Confirmed" ? (
                        <><Check className="h-2.5 w-2.5 mr-1" /> {m.status}</>
                      ) : (
                        m.status
                      )}
                    </Badge>
                  </div>
                  <div className="mt-0.5 flex items-center gap-3 text-[11.5px] text-muted-foreground">
                    <span>{m.kind}</span>
                    <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" strokeWidth={1.75} /> {m.location}</span>
                  </div>
                </div>
                <div className="hidden md:flex items-center gap-2 shrink-0">
                  <img
                    src={avatarUrl(m.host)}
                    alt=""
                    className="h-6 w-6 rounded-full object-cover ring-1 ring-border/60"
                  />
                  <div className="text-[11.5px] text-foreground/80">{m.host}</div>
                </div>
                <div className="hidden lg:flex items-center gap-1 text-[11px] text-muted-foreground shrink-0">
                  <Users className="h-3 w-3" strokeWidth={1.75} /> 2
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
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
              </div>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
