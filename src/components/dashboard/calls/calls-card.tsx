import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  Mic,
  MicOff,
  Pause,
  Play,
  PhoneOff,
  Headphones,
  HeadphoneOff,
  UserPlus,
} from "lucide-react";
import { Panel } from "@/components/ui/panel";
import { callQueue } from "@/components/dashboard/data";

/**
 * CallsCard — single live AI-handled call. Syra captures caller contact
 * details and logs them to the CRM as a new lead. Apple-native dev style:
 * one circle avatar, sleek status pill, and live call controls (Discord-style
 * mute / deafen toggles, hold, and a destructive End call).
 */
function parseDur(d: string): number {
  const [m, s] = d.split(":").map((n) => parseInt(n, 10) || 0);
  return m * 60 + s;
}
function fmtDur(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

const CALLER_NAME = "Adrian Whitfield";
const CALLER_PHONE = "+1 (561) 555‑7689";
const CALLER_EMAIL = "adrian.whitfield@whitfieldco.com";
const CALLER_INITIALS = "AW";

const transcript: { who: "client" | "agent"; text: string }[] = [
  { who: "agent", text: "Thanks for calling Harwick & Sterne — may I grab your name and best email?" },
  { who: "client", text: `${CALLER_NAME}. ${CALLER_EMAIL} — best number is this one.` },
  { who: "agent", text: "Got it. What's prompting the call today?" },
  { who: "client", text: "Rollover — two old 401(k)s, around $480K combined." },
  { who: "agent", text: "Perfect. I'll log you as a new lead and have an advisor reach out this week." },
];

const capturedFields = [
  { label: "Name", value: CALLER_NAME, done: true },
  { label: "Email", value: CALLER_EMAIL, done: true },
  { label: "Phone", value: CALLER_PHONE, done: true },
  { label: "Intent", value: "401(k) rollover · ~$480K", done: true },
  { label: "CRM", value: "Logging as new lead…", done: false },
];

export function CallsCard() {
  const live = callQueue[0];
  const [seconds, setSeconds] = useState(() => parseDur(live.dur));
  const [showTranscript, setShowTranscript] = useState(false);

  // Call controls
  const [muted, setMuted] = useState(false);
  const [deafened, setDeafened] = useState(false);
  const [onHold, setOnHold] = useState(false);
  const [callState, setCallState] = useState<"live" | "ending" | "ended">("live");
  // Deafening also silences the mic (Discord behaviour).
  const micMuted = muted || deafened;
  const isLive = callState === "live";

  // The duration clock only advances on a live, un-held call.
  useEffect(() => {
    if (!isLive || onHold) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [isLive, onHold]);
  const duration = useMemo(() => fmtDur(seconds), [seconds]);

  const toggleMute = () => {
    // Unmuting while deafened also un-deafens (Discord behaviour).
    if (deafened) {
      setDeafened(false);
      setMuted(false);
      return;
    }
    setMuted((m) => !m);
  };
  const toggleDeafen = () => {
    const next = !deafened;
    setDeafened(next);
    setMuted(next); // deafen → mute, undeafen → unmute
  };
  const toggleHold = () => setOnHold((h) => !h);
  const endCall = () => {
    if (!isLive) return;
    setCallState("ending");
    window.setTimeout(() => setCallState("ended"), 1200);
  };

  const status =
    callState === "ended"
      ? { label: "Call ended", dot: "bg-muted-foreground/70", ping: false, text: "text-muted-foreground" }
      : callState === "ending"
        ? { label: "Ending…", dot: "bg-red-500", ping: true, text: "text-red-400" }
        : onHold
          ? { label: "On hold", dot: "bg-amber-500", ping: false, text: "text-amber-400" }
          : { label: "On call", dot: "bg-emerald-500", ping: true, text: "text-muted-foreground" };

  return (
    <Panel
      label="Call handling"
      to="/calls"
      bodyClassName="gap-4"
      action={
        <span
          className={`inline-flex h-6 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-border/60 bg-foreground/[0.04] px-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] ${status.text}`}
        >
          <span className="relative grid h-1.5 w-1.5 shrink-0 place-items-center">
            {status.ping && (
              <span className={`absolute inset-0 animate-ping rounded-full ${status.dot} opacity-60`} />
            )}
            <span className={`relative h-1.5 w-1.5 rounded-full ${status.dot}`} />
          </span>
          {status.label}
        </span>
      }
    >
      {/* Live call header — lemni.com-inspired: quiet avatar, waveform pitch line */}
      <div className="flex shrink-0 flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-border bg-foreground/[0.06] text-[15px] font-semibold tracking-tight text-foreground/90">
            {CALLER_INITIALS}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[15px] font-semibold tracking-tight text-foreground">
              {CALLER_NAME}
            </div>
            <div className="truncate text-[11.5px] text-muted-foreground">
              {callState === "ended"
                ? "Call ended"
                : onHold
                  ? "On hold"
                  : "Handled by Syra · AI agent"}
            </div>
          </div>
          <div className="text-right leading-tight">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
              Duration
            </div>
            <div
              className="mt-1 text-[15px] font-semibold tabular-nums text-foreground"
              suppressHydrationWarning
            >
              {duration}
            </div>
          </div>
        </div>

        {/* Pitch line — lemni-style animated waveform behind phone/status */}
        <div className="relative flex items-center gap-3 rounded-xl border border-border/60 bg-foreground/[0.03] px-3 py-2.5 overflow-hidden">
          <div className="flex items-center gap-2 shrink-0 z-10">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-foreground/[0.06] text-foreground/80">
              <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor">
                <path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57a1 1 0 0 0-1.02.24l-2.2 2.2a15.05 15.05 0 0 1-6.59-6.59l2.2-2.2a1 1 0 0 0 .25-1.02A11.36 11.36 0 0 1 8.5 4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1c0 9.39 7.61 17 17 17a1 1 0 0 0 1-1v-3.5a1 1 0 0 0-1-1z" />
              </svg>
            </span>
            <span className="text-[12px] font-medium tabular-nums text-foreground/90">
              {CALLER_PHONE}
            </span>
          </div>
          <PitchWave active={isLive && !onHold} />
          <span
            className={`shrink-0 z-10 text-[10.5px] font-semibold uppercase tracking-[0.18em] ${
              isLive && !onHold
                ? "text-emerald-400"
                : callState === "ended"
                  ? "text-muted-foreground"
                  : "text-amber-400"
            }`}
          >
            {callState === "ended" ? "Ended" : onHold ? "Hold" : "Active"}
          </span>
        </div>


        {/* Controls — Discord-style mute/deafen toggles, hold, and End call. */}
        <div className="flex items-center justify-between px-1">
          <CallAction
            icon={micMuted ? MicOff : Mic}
            label={micMuted ? "Unmute" : "Mute"}
            active={micMuted}
            disabled={!isLive}
            onClick={toggleMute}
          />
          <CallAction
            icon={deafened ? HeadphoneOff : Headphones}
            label={deafened ? "Undeafen" : "Deafen"}
            active={deafened}
            disabled={!isLive}
            onClick={toggleDeafen}
          />
          <CallAction
            icon={onHold ? Play : Pause}
            label={onHold ? "Resume" : "Hold"}
            active={onHold}
            disabled={!isLive}
            onClick={toggleHold}
          />
          <CallAction
            icon={PhoneOff}
            label="End call"
            variant="danger"
            busy={callState === "ending"}
            disabled={!isLive}
            onClick={endCall}
          />
        </div>
      </div>

      {/* Section toggle */}
      <button
        onClick={() => setShowTranscript((v) => !v)}
        className="flex shrink-0 items-center justify-between border-t border-border/50 pt-3 text-left"
      >
        <span className="font-label text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/80">
          {showTranscript ? "Live transcript" : "Captured for CRM"}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${showTranscript ? "rotate-180" : ""}`}
        />
      </button>

      <div className="scroll-slim flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
        {showTranscript
          ? transcript.map((line, i) => (
              <div
                key={i}
                className={`flex ${line.who === "agent" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-1.5 text-[12px] leading-snug ${
                    line.who === "agent"
                      ? "bg-foreground/[0.10] text-foreground/95"
                      : "bg-foreground/[0.04] text-foreground/85"
                  }`}
                >
                  {line.text}
                </div>
              </div>
            ))
          : capturedFields.map((f, i) => (
              <div
                key={f.label}
                className={`flex items-center gap-3 py-1.5 ${
                  i === 0 ? "" : "border-t border-border/40"
                }`}
              >
                <span
                  className={`grid h-5 w-5 shrink-0 place-items-center rounded-full ${
                    f.done
                      ? "bg-foreground/[0.08] text-foreground/80"
                      : "bg-emerald-500/10 text-emerald-400"
                  }`}
                >
                  {f.done ? (
                    <svg
                      viewBox="0 0 12 12"
                      className="h-3 w-3"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        d="M2.5 6.5l2.5 2.5 4.5-5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <UserPlus className="h-3 w-3" />
                  )}
                </span>
                <div className="w-[64px] shrink-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/80">
                  {f.label}
                </div>
                <div
                  className={`min-w-0 flex-1 truncate text-[12px] ${
                    f.done ? "text-foreground/90" : "text-emerald-400"
                  }`}
                >
                  {f.value}
                </div>
              </div>
            ))}
      </div>
    </Panel>
  );
}

function CallAction({
  icon: Icon,
  label,
  onClick,
  active,
  disabled,
  busy,
  variant = "toggle",
}: {
  icon: typeof Mic;
  label: string;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
  busy?: boolean;
  variant?: "toggle" | "danger";
}) {
  const styles =
    variant === "danger"
      ? "border-red-500/70 bg-red-500 text-white hover:bg-red-600"
      : active
        ? "border-red-500/40 bg-red-500/15 text-red-400 hover:bg-red-500/25"
        : "border-border bg-foreground/[0.06] text-foreground/90 hover:bg-foreground/[0.12]";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={variant === "toggle" ? !!active : undefined}
      title={label}
      className={`grid h-11 w-11 place-items-center rounded-full border transition-colors disabled:pointer-events-none disabled:opacity-40 ${styles} ${
        busy ? "animate-pulse" : ""
      }`}
    >
      <Icon className="h-4 w-4" strokeWidth={1.75} />
    </button>
  );
}

/**
 * PitchWave — Apple Voice Memo–style single continuous waveform line that
 * scrolls left while a call is active. One monotone line, edges faded.
 */
function PitchWave({ active }: { active: boolean }) {
  // Two identical wave paths laid end-to-end so the horizontal scroll loops
  // seamlessly. Amplitude modulation gives it a lemni-style "breathing" feel.
  const W = 400; // logical width of one repeat
  const H = 24;
  const mid = H / 2;
  const points: string[] = [];
  const steps = 80;
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * W;
    const t = (i / steps) * Math.PI * 6;
    // Mixed sines create an organic, non-repetitive pitch trace.
    const amp =
      (Math.sin(t) * 0.55 +
        Math.sin(t * 1.9 + 0.7) * 0.28 +
        Math.sin(t * 0.6 + 1.3) * 0.17) *
      (mid - 2);
    points.push(`${i === 0 ? "M" : "L"}${x.toFixed(2)},${(mid + amp).toFixed(2)}`);
  }
  const d = points.join(" ");
  return (
    <div
      className="pointer-events-none relative flex-1 h-6 min-w-0 overflow-hidden"
      style={{
        maskImage:
          "linear-gradient(90deg, transparent 0%, black 14%, black 86%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(90deg, transparent 0%, black 14%, black 86%, transparent 100%)",
      }}
      aria-hidden="true"
    >
      <svg
        viewBox={`0 0 ${W * 2} ${H}`}
        preserveAspectRatio="none"
        className={`h-full w-[200%] ${active ? "pitch-scroll" : ""}`}
        style={{ opacity: active ? 0.9 : 0.35 }}
      >
        <path
          d={`${d} ${d.replace(/M/g, "L").replace(/L0\.00/, `L${W}`)}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-foreground"
        />
        {/* second repeat, translated */}
        <g transform={`translate(${W},0)`}>
          <path
            d={d}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-foreground"
          />
        </g>
      </svg>
    </div>
  );
}
