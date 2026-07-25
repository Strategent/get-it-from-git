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
      {/* Live call header — lemni-inspired: quiet avatar, name + phone, duration */}
      <div className="flex shrink-0 flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-foreground/[0.06] text-[15px] font-semibold tracking-tight text-foreground/90">
            {CALLER_INITIALS}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[15px] font-semibold tracking-tight text-foreground">
              {CALLER_NAME}
            </div>
            <div className="truncate text-[12px] tabular-nums text-muted-foreground">
              {CALLER_PHONE}
            </div>
          </div>
          <div
            className="shrink-0 text-[15px] font-semibold tabular-nums text-foreground"
            suppressHydrationWarning
          >
            {duration}
          </div>
        </div>

        {/* Full-bleed waveform — edge-to-edge lemni pitch line, no container */}
        <div className="-mx-5">
          <PitchWave active={isLive && !onHold} />
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
 * VoiceBars — Lovable-style live voice-activity bars. A dense row of thin
 * bars pulses to a procedural voice envelope with natural silence gaps
 * every few seconds so it feels like real speech, not a canned loop.
 */
function PitchWave({ active }: { active: boolean }) {
  const H = 40;
  const BAR_COUNT = 56;
  const [t, setT] = useState(0);

  useEffect(() => {
    if (!active) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      setT((now - start) / 1000);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active]);

  // Procedural speech envelope: mostly speaking with periodic silence.
  // Cycle ~5.5s: speak ~4s, quiet ~1.5s, with a soft fade at edges.
  const envelope = (time: number) => {
    if (!active) return 0.05;
    const cycle = 5.5;
    const phase = time % cycle;
    const speakEnd = 4;
    if (phase > speakEnd) {
      // silence tail with a tiny residual flicker
      const q = (phase - speakEnd) / (cycle - speakEnd);
      return 0.04 + Math.max(0, 1 - q * 4) * 0.06;
    }
    // Fade in/out at speech boundaries
    const fadeIn = Math.min(1, phase / 0.35);
    const fadeOut = Math.min(1, (speakEnd - phase) / 0.4);
    return Math.max(0.05, Math.min(fadeIn, fadeOut));
  };

  const env = envelope(t);
  const mid = (BAR_COUNT - 1) / 2;

  return (
    <div
      className="pointer-events-none relative w-full overflow-hidden"
      style={{
        height: H,
        maskImage:
          "linear-gradient(90deg, transparent 0%, black 6%, black 94%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(90deg, transparent 0%, black 6%, black 94%, transparent 100%)",
      }}
      aria-hidden="true"
    >
      <div className="flex h-full w-full items-center justify-between gap-[3px] px-1">
        {Array.from({ length: BAR_COUNT }).map((_, i) => {
          // Layered sines per bar + slight bell around center for a mouth-like shape
          const bell = 0.55 + 0.45 * Math.cos(((i - mid) / mid) * (Math.PI / 2));
          const n =
            Math.sin(t * 6.2 + i * 0.55) * 0.5 +
            Math.sin(t * 11 + i * 0.31 + 1.3) * 0.3 +
            Math.sin(t * 3.1 + i * 0.9) * 0.2;
          const amp = (0.5 + 0.5 * n) * bell * env;
          const minH = 2;
          const h = Math.max(minH, amp * (H - 4));
          return (
            <span
              key={i}
              className="block w-[2px] rounded-full bg-foreground/85"
              style={{
                height: `${h}px`,
                opacity: active ? 0.55 + amp * 0.45 : 0.25,
                transition: "height 90ms linear, opacity 120ms linear",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

