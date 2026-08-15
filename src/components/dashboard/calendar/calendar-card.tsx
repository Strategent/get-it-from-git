import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Video } from "lucide-react";
import { Panel } from "@/components/ui/panel";
import { todaysMeetings } from "@/components/dashboard/data";

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function startOfWeekMonday(date: Date): Date {
  const d = new Date(date);
  const jsDow = d.getDay(); // 0=Sun
  const offset = (jsDow + 6) % 7; // Monday-start offset
  d.setDate(d.getDate() - offset);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * CalendarCard — Monday-start week strip + selected day's meetings with Join buttons.
 * Wrapped in the Origin <Panel> (CALENDAR ›).
 *
 * Owns its own clock so the dashboard route stays static — the bento grid
 * parent must not re-render on a timer or gridstack/React fight over the DOM.
 */
export function CalendarCard() {
  const [today, setToday] = useState<Date>(() => new Date());
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  useEffect(() => {
    const now = new Date();
    setToday(now);
    setSelectedKey(now.toDateString());
    const id = setInterval(() => setToday(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const todayKey = today.toDateString();
  const activeKey = selectedKey ?? todayKey;
  const activeDate = useMemo(() => new Date(activeKey), [activeKey]);
  const isViewingToday = activeKey === todayKey;

  // Week strip is always anchored to the selected date's Monday-start week.
  const startOfWeek = useMemo(() => startOfWeekMonday(activeDate), [activeDate]);
  const week = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(startOfWeek, i)),
    [startOfWeek],
  );

  const shiftDay = (direction: -1 | 1) => {
    setSelectedKey(addDays(activeDate, direction).toDateString());
  };

  const meetings = isViewingToday ? todaysMeetings : [];
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
            onClick={() => shiftDay(-1)}
            aria-label="Previous day"
            className="grid h-7 w-7 place-items-center rounded-full border border-border bg-foreground/[0.05] text-foreground/80 hover:bg-foreground/[0.1]"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => shiftDay(1)}
            aria-label="Next day"
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
            const isSelected = d.toDateString() === activeKey;
            return (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedKey(d.toDateString())}
                className="group flex items-center justify-center py-1"
                aria-label={d.toDateString()}
                aria-pressed={isSelected}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-[15px] leading-none tabular-nums transition-colors ${
                    isSelected && isToday
                      ? "bg-primary text-primary-foreground font-semibold"
                      : isSelected
                        ? "bg-foreground text-background font-semibold"
                        : isToday
                          ? "font-semibold text-primary hover:bg-primary/10"
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
            {isViewingToday
              ? "Today's meetings"
              : activeDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })}
          </div>
          <span className="text-[11px] tabular-nums text-muted-foreground">
            {meetings.length} scheduled
          </span>
        </div>
        {/* Hairline-divided rows — no card-in-card */}
        <div className="flex min-h-0 flex-col overflow-hidden">
          {meetings.length === 0 && (
            <div className="flex flex-1 flex-col items-center justify-center gap-1 py-8 text-center">
              <div className="text-[13px] font-medium text-foreground/70">
                No meetings scheduled
              </div>
              <div className="text-[11.5px] text-muted-foreground">
                Your calendar is clear for this day.
              </div>
            </div>
          )}
          {meetings.slice(0, 3).map((m, i) => (
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
