import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Video } from "lucide-react";
import { Panel } from "@/components/ui/panel";
import { todaysMeetings } from "@/components/dashboard/data";

/**
 * CalendarCard — Monday-start week strip + today's meetings with Join buttons.
 * Wrapped in the Origin <Panel> (CALENDAR ›).
 *
 * Owns its own clock so the dashboard route stays static — the bento grid
 * parent must not re-render on a timer or gridstack/React fight over the DOM.
 */
export function CalendarCard() {
  const [today, setToday] = useState<Date>(() => new Date(2026, 0, 16));
  const [weekOffset, setWeekOffset] = useState(0);
  useEffect(() => {
    setToday(new Date());
    const id = setInterval(() => setToday(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  // The visible week = today shifted by the user's week navigation. `todayKey`
  // still tracks the real date, so the circle only shows on the current week.
  const anchor = new Date(today);
  anchor.setDate(today.getDate() + weekOffset * 7);
  const startOfWeek = new Date(anchor);
  const jsDow = anchor.getDay(); // 0=Sun
  const offset = (jsDow + 6) % 7; // Monday-start offset
  startOfWeek.setDate(anchor.getDate() - offset);
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });
  const todayKey = today.toDateString();
  const weekRangeLabel = (() => {
    const end = week[6];
    const sameMonth = startOfWeek.getMonth() === end.getMonth();
    const fmtMonth = (d: Date) => d.toLocaleDateString("en-US", { month: "short" });
    return sameMonth
      ? `${fmtMonth(startOfWeek)} ${startOfWeek.getDate()} – ${end.getDate()}, ${end.getFullYear()}`
      : `${fmtMonth(startOfWeek)} ${startOfWeek.getDate()} – ${fmtMonth(end)} ${end.getDate()}, ${end.getFullYear()}`;
  })();
  const dayLetter = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <Panel
      label="Calendar"
      to="/calendar"
      bodyClassName="gap-4"
      action={
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setWeekOffset((o) => o - 1)}
            aria-label="Previous week"
            className="grid h-7 w-7 place-items-center rounded-full border border-border bg-foreground/[0.05] text-foreground/80 hover:bg-foreground/[0.1]"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          {weekOffset !== 0 && (
            <button
              type="button"
              onClick={() => setWeekOffset(0)}
              className="h-7 rounded-full border border-border bg-foreground/[0.05] px-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground/80 hover:bg-foreground/[0.1]"
            >
              Today
            </button>
          )}
          <button
            type="button"
            onClick={() => setWeekOffset((o) => o + 1)}
            aria-label="Next week"
            className="grid h-7 w-7 place-items-center rounded-full border border-border bg-foreground/[0.05] text-foreground/80 hover:bg-foreground/[0.1]"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      }
    >
      <div className="shrink-0">
        <div className="mb-4 text-[16px] font-semibold leading-none tracking-tight">
          {weekRangeLabel}
        </div>
        {/* Apple-native week strip — bare cells, single circle on today */}
        <div className="grid grid-cols-7 gap-1">
          {week.map((d, i) => {
            const weekend = i === 0 || i === 6;
            return (
              <div key={i} className="flex flex-col items-center gap-1.5 py-1">
                <span
                  className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${
                    weekend ? "text-muted-foreground/50" : "text-muted-foreground/80"
                  }`}
                >
                  {dayLetter[d.getDay()]}
                </span>
              </div>
            );
          })}
          {week.map((d, i) => {
            const isToday = d.toDateString() === todayKey;
            return (
              <button
                key={i}
                className="group flex items-center justify-center py-1"
                aria-label={d.toDateString()}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-[15px] leading-none tabular-nums transition-colors ${
                    isToday
                      ? "bg-white text-black font-semibold"
                      : "text-foreground/85 font-normal hover:bg-foreground/[0.06]"
                  }`}
                >
                  {d.getDate()}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Today's meetings beneath calendar */}
      <div className="relative flex min-h-0 flex-1 flex-col gap-3">
        <div className="flex shrink-0 items-center justify-between">
          <div className="font-label text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/80">
            Today's meetings
          </div>
          <span className="text-[11px] tabular-nums text-muted-foreground">
            {todaysMeetings.length} scheduled
          </span>
        </div>
        {/* Hairline-divided rows — no card-in-card */}
        <div className="flex min-h-0 flex-col overflow-hidden">
          {todaysMeetings.slice(0, 3).map((m, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 py-3 ${
                i === 0 ? "" : "border-t border-border/50"
              }`}
            >
              <div className="w-12 shrink-0 text-right text-[12px] font-medium tabular-nums text-muted-foreground/70">
                {m.time.split(" ")[0]}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13.5px] font-semibold leading-tight text-foreground/95">
                  {m.client}
                </div>
                <div className="mt-0.5 text-[11px] leading-tight text-muted-foreground">
                  {m.status}
                </div>
              </div>
              <a
                href={m.zoom}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-7 shrink-0 items-center gap-1 rounded-md border border-border bg-foreground/[0.06] px-3 text-[12px] font-semibold text-foreground/90 transition-colors hover:bg-foreground/[0.12]"
              >
                <Video className="h-3 w-3" /> Join
              </a>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}
