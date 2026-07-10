import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Video,
  Globe,
  Check,
} from "lucide-react";
import { SyraChatWidget } from "@/components/syra-chat-widget";

export const Route = createFileRoute("/calendar")({
  component: CalendarPage,
  head: () => ({ meta: [{ title: "Calendar — Harwick & Sterne" }] }),
});

type Meeting = { time: string; client: string; status: "Confirmed" | "Pending"; zoom: string };

// Booked meetings keyed by day-of-month (assumes current viewing month)
const bookings: Record<number, Meeting[]> = {
  7:  [{ time: "10:00",  client: "Hartley Family Review",           status: "Confirmed", zoom: "https://zoom.us/j/0000000001" }],
  16: [
    { time: "09:00", client: "Hartley Family Trust",                status: "Confirmed", zoom: "https://zoom.us/j/0000000010" },
    { time: "11:30", client: "Denis Marlow — Rebalance",            status: "Confirmed", zoom: "https://zoom.us/j/0000000011" },
    { time: "14:00", client: "Sterling Holdings Review",            status: "Pending",   zoom: "https://zoom.us/j/0000000012" },
    { time: "16:30", client: "Caldwell Estate Planning",            status: "Confirmed", zoom: "https://zoom.us/j/0000000013" },
  ],
  20: [{ time: "09:00", client: "CIO Roundtable — Valdai Fund",     status: "Confirmed", zoom: "https://zoom.us/j/0000000020" }],
  22: [{ time: "13:30", client: "Sterling Holdings Estate Review",  status: "Confirmed", zoom: "https://zoom.us/j/0000000022" }],
  28: [{ time: "16:00", client: "All-Hands — Q1 Planning",          status: "Confirmed", zoom: "https://zoom.us/j/0000000028" }],
};

const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00",
];

function CalendarPage() {
  const today = new Date(2026, 0, 16);
  const [viewMonth, setViewMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState<number>(16);

  const monthLabel = viewMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const grid = useMemo(() => {
    const first = new Date(viewMonth);
    const lastDay = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();
    const startOffset = (first.getDay() + 6) % 7; // Monday-start
    const cells: { d: number | null; inMonth: boolean }[] = [];
    for (let i = 0; i < startOffset; i++) cells.push({ d: null, inMonth: false });
    for (let d = 1; d <= lastDay; d++) cells.push({ d, inMonth: true });
    while (cells.length % 7 !== 0) cells.push({ d: null, inMonth: false });
    return cells;
  }, [viewMonth]);

  const dayMeetings = bookings[selectedDay] ?? [];
  const bookedSet = new Set(dayMeetings.map((m) => m.time));

  const selectedDate = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), selectedDay);
  const selectedLabel = selectedDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const navMonth = (delta: number) =>
    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + delta, 1));

  return (
    <>
      <div className="w-full bg-background flex flex-col" style={{ minHeight: "calc(100dvh - 53px)" }}>
        {/* Top bar — matches Calls / CRM PageHeader */}
        <div className="px-4 sm:px-6 md:px-8 pt-5 md:pt-6 pb-6 border-b border-border/50 flex items-end justify-between flex-wrap gap-6">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 text-[10.5px] font-medium uppercase tracking-[0.22em] text-muted-foreground/80">
              <span aria-hidden className="inline-block h-1 w-1 rounded-full bg-foreground/40" />
              Scheduling
            </div>
            <h1 className="font-serif-display mt-3 text-4xl md:text-[44px] font-normal leading-[1.05] tracking-[-0.02em] text-foreground">
              Calendar
            </h1>
            <p className="mt-3 text-[13.5px] leading-relaxed text-muted-foreground max-w-xl">
              Book meetings across the firm — clients see availability in their timezone.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
            <Globe className="h-3.5 w-3.5" />
            America / New York (GMT-5)
          </div>
        </div>

        <div className="flex-1 grid grid-cols-12">
          {/* Left — event info */}
          <aside className="col-span-12 md:col-span-3 border-r border-border/60 px-8 py-7 flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div
                className="h-10 w-10 rounded-full grid place-items-center text-[12px] font-semibold text-white"
                style={{ background: "var(--gradient-primary)" }}
              >
                HS
              </div>
              <div>
                <div className="text-[12px] text-muted-foreground">Harwick & Sterne</div>
                <div className="text-[14px] font-semibold tracking-tight">John Harwick</div>
              </div>
            </div>
            <div>
              <h2 className="text-[18px] font-semibold tracking-tight">Client consultation</h2>
              <ul className="mt-4 space-y-2.5 text-[13px] text-foreground/85">
                <li className="flex items-center gap-2.5">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  30 minutes
                </li>
                <li className="flex items-center gap-2.5">
                  <Video className="h-3.5 w-3.5 text-muted-foreground" />
                  Zoom · details shared on booking
                </li>
                <li className="flex items-center gap-2.5">
                  <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                  Mayfair office · also remote
                </li>
              </ul>
            </div>
            <p className="text-[12.5px] leading-relaxed text-muted-foreground border-t border-border/60 pt-4">
              Schedule a confidential review of your portfolio, estate, or onboarding with our team.
              Syra will prepare a brief and share it with you the morning of the meeting.
            </p>
          </aside>

          {/* Middle — month calendar */}
          <section className="col-span-12 md:col-span-6 border-r border-border/60 px-8 py-7">
            <div className="flex items-center justify-between mb-5">
              <div className="text-[16px] font-semibold tracking-tight">{monthLabel}</div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => navMonth(-1)}
                  aria-label="Previous month"
                  className="grid h-8 w-8 place-items-center rounded-full border border-border bg-foreground/[0.04] text-foreground/80 hover:bg-foreground/[0.08]"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => navMonth(1)}
                  aria-label="Next month"
                  className="grid h-8 w-8 place-items-center rounded-full border border-border bg-foreground/[0.04] text-foreground/80 hover:bg-foreground/[0.08]"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-y-2 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/80 mb-3">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-y-1.5 text-center">
              {grid.map((cell, i) => {
                if (!cell.d) return <div key={i} />;
                const d = cell.d;
                const isToday = d === today.getDate() && viewMonth.getMonth() === today.getMonth();
                const isSelected = d === selectedDay;
                const hasMeeting = !!bookings[d];
                return (
                  <div key={i} className="flex flex-col items-center justify-center py-1">
                    <button
                      onClick={() => setSelectedDay(d)}
                      className={`relative flex h-11 w-11 items-center justify-center rounded-full text-[14px] tabular-nums transition-colors ${
                        isSelected
                          ? "bg-foreground text-background font-semibold"
                          : isToday
                          ? "border border-foreground/60 text-foreground font-semibold hover:bg-foreground/[0.05]"
                          : "text-foreground/85 hover:bg-foreground/[0.06]"
                      }`}
                    >
                      {d}
                      {hasMeeting && !isSelected && (
                        <span className="absolute bottom-1.5 h-1 w-1 rounded-full bg-foreground/60" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Right — time slots / meetings */}
          <section className="col-span-12 md:col-span-3 px-6 py-7 flex flex-col min-h-0">
            <div className="px-2 mb-4">
              <div className="text-[13px] font-semibold tracking-tight">{selectedLabel}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                {dayMeetings.length} booked · {TIME_SLOTS.length - bookedSet.size} open
              </div>
            </div>
            <div className="flex-1 overflow-y-auto pr-1 space-y-2">
              {TIME_SLOTS.map((slot) => {
                const meeting = dayMeetings.find((m) => m.time === slot);
                if (meeting) {
                  return (
                    <div
                      key={slot}
                      className="px-3 py-2.5 border border-border rounded-lg bg-muted/30"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-[12.5px] font-semibold tabular-nums leading-tight">
                            {slot}
                          </div>
                          <div className="mt-0.5 text-[11.5px] text-foreground/80 truncate">
                            {meeting.client}
                          </div>
                          <div className="mt-0.5 flex items-center gap-1 text-[10.5px] text-muted-foreground">
                            {meeting.status === "Confirmed" ? (
                              <>
                                <Check className="h-3 w-3" /> Confirmed
                              </>
                            ) : (
                              "Pending"
                            )}
                          </div>
                        </div>
                        <a
                          href={meeting.zoom}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 inline-flex h-8 items-center gap-1.5 rounded-md bg-foreground text-background px-3 text-[11.5px] font-semibold hover:bg-foreground/90 transition-colors"
                        >
                          <Video className="h-3 w-3" /> Join
                        </a>
                      </div>
                    </div>
                  );
                }
                return (
                  <button
                    key={slot}
                    className="w-full h-10 px-3 rounded-lg border border-border text-[12.5px] font-medium tabular-nums text-foreground/85 hover:border-foreground/40 hover:bg-foreground/[0.04] transition-colors text-left"
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      </div>
      <SyraChatWidget />
    </>
  );
}
