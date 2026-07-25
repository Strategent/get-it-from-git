import { useEffect, useMemo, useRef, useState } from "react";
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
 * PitchWave — static, in-place audio level meter (Apple/iOS voice-input
 * style). Bars are anchored to fixed X positions; only their height animates
 * up and down via a CSS transition, so movement reads as smooth breathing
 * rather than a scrolling waveform. A center-weighted amplitude envelope
 * makes the middle taller than the edges; per-bar phase offsets stagger the
 * timing so bars don't move in lockstep; the outer few bars fade via mask.
 */
function PitchWave({ active }: { active: boolean }) {
  const H = 40;
  const BAR_COUNT = 56;
  const barsRef = useRef<HTMLSpanElement[]>([]);
  const timerRef = useRef<number | null>(null);

  // Fixed per-bar phase offsets so each bar has its own rhythm.
  const phases = useMemo(
    () => Array.from({ length: BAR_COUNT }, () => Math.random() * Math.PI * 2),
    [],
  );
  // Fixed per-bar speed multipliers for gentle stagger.
  const speeds = useMemo(
    () => Array.from({ length: BAR_COUNT }, () => 0.85 + Math.random() * 0.5),
    [],
  );

  useEffect(() => {
    if (!active) {
      // Ease all bars down to the resting height.
      for (const el of barsRef.current) {
        if (el) el.style.transform = "scaleY(0.06)";
      }
      return;
    }

    const start = performance.now();
    // Retarget bar heights on a slow cadence; the CSS transition does the
    // smoothing between targets, giving an eased rise/fall rather than snaps.
    const step = () => {
      const t = (performance.now() - start) / 1000;
      for (let i = 0; i < BAR_COUNT; i++) {
        const el = barsRef.current[i];
        if (!el) continue;
        // Center-weighted envelope: taller in the middle, shorter at edges.
        // Cosine profile is smooth end-to-end (no flat plateau).
        const x = i / (BAR_COUNT - 1); // 0..1
        const centerBias = 0.35 + 0.65 * Math.cos((x - 0.5) * Math.PI); // 0.35..1
        // Layered slow oscillators drive the "voice" motion — same shape
        // for every bar, but each has its own phase & speed.
        const s = speeds[i];
        const p = phases[i];
        const osc =
          0.55 +
          0.28 * Math.sin(t * 2.1 * s + p) +
          0.14 * Math.sin(t * 4.7 * s + p * 1.9) +
          0.08 * Math.sin(t * 0.9 * s + p * 0.5);
        const level = Math.max(0.08, Math.min(1, osc * centerBias));
        el.style.transform = `scaleY(${level.toFixed(3)})`;
      }
      timerRef.current = window.setTimeout(step, 140);
    };
    step();
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [active, phases, speeds]);

  return (
    <div
      className="pointer-events-none relative w-full overflow-hidden"
      style={{
        height: H,
        maskImage:
          "linear-gradient(90deg, transparent 0%, black 10%, black 90%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(90deg, transparent 0%, black 10%, black 90%, transparent 100%)",
      }}
      aria-hidden="true"
    >
      <div
        className="flex h-full w-full items-center justify-between px-1"
        style={{ gap: 2 }}
      >
        {Array.from({ length: BAR_COUNT }).map((_, i) => (
          <span
            key={i}
            ref={(el) => {
              if (el) barsRef.current[i] = el;
            }}
            className="block flex-1 rounded-full bg-foreground/90"
            style={{
              height: H - 4,
              transform: "scaleY(0.06)",
              transformOrigin: "center",
              transition: "transform 320ms cubic-bezier(0.4, 0, 0.2, 1)",
              willChange: "transform",
            }}
          />
        ))}
      </div>
    </div>
  );
}



