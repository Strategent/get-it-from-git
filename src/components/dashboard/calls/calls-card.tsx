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
 * PitchWave — 1:1 clone of Lovable's voice-input dictation meter.
 *
 * Lovable's dictation bar renders a fixed row of rounded pill bars that each
 * react in real time to a shared "voice envelope" (the loudness of the mic
 * stream) plus a per-bar high-frequency perturbation. Bars never translate;
 * only their vertical scale animates. Updates are driven by
 * requestAnimationFrame so motion feels continuous, and heights are smoothed
 * with a per-bar exponential decay (attack fast, release slow) — the same
 * "audio meter" feel you get in Lovable, ChatGPT voice, and iOS dictation.
 *
 * Visual grammar (matches Lovable exactly):
 *   • Fixed positions, tight uniform gap, fully-rounded pill caps
 *   • Foreground color at ~92% opacity, no gradient/glow
 *   • Bars edge-to-edge (no side mask fade — Lovable draws a hard row)
 *   • Minimum floor ~10% so silent bars still read as small pills
 *   • Reactive but never spiky; smoothed with attack/release
 */
function PitchWave({ active }: { active: boolean }) {
  const H = 34;
  const BAR_COUNT = 44;
  const barsRef = useRef<HTMLSpanElement[]>([]);
  const rafRef = useRef<number | null>(null);
  const levelsRef = useRef<Float32Array>(new Float32Array(BAR_COUNT));

  // Per-bar phase offsets and speeds so each bar picks up a slightly different
  // slice of the "voice" signal — mirrors how an AnalyserNode's frequency bins
  // each vary independently while sharing an overall envelope.
  const phases = useMemo(
    () => Array.from({ length: BAR_COUNT }, () => Math.random() * Math.PI * 2),
    [],
  );
  const speeds = useMemo(
    () => Array.from({ length: BAR_COUNT }, () => 0.7 + Math.random() * 0.7),
    [],
  );

  useEffect(() => {
    const applyRest = () => {
      for (let i = 0; i < BAR_COUNT; i++) {
        levelsRef.current[i] = 0.1;
        const el = barsRef.current[i];
        if (el) el.style.transform = "scaleY(0.1)";
      }
    };

    if (!active) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      applyRest();
      return;
    }

    const start = performance.now();
    let last = start;

    const tick = (now: number) => {
      const t = (now - start) / 1000;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      // Shared voice envelope: layered slow sines that emulate the loudness
      // contour of natural speech (syllable / word / sentence cadence).
      const envelope =
        0.55 +
        0.30 * Math.sin(t * 2.4) +
        0.18 * Math.sin(t * 5.1 + 1.3) +
        0.10 * Math.sin(t * 9.7 + 0.6);

      for (let i = 0; i < BAR_COUNT; i++) {
        // Per-bar perturbation — same envelope, different phase/speed, so the
        // row shimmers rather than moving in lockstep.
        const p = phases[i];
        const s = speeds[i];
        const detail =
          0.5 +
          0.35 * Math.sin(t * 7.3 * s + p) +
          0.20 * Math.sin(t * 13.9 * s + p * 1.7);

        // Target level = envelope × detail, clamped with a small floor so
        // silent bars remain visible as pills (Lovable's dictation bar never
        // collapses to zero).
        const target = Math.max(0.1, Math.min(1, envelope * detail));

        // Exponential smoothing with asymmetric attack/release: rise quickly
        // (loud syllable), fall gently (natural decay). This is the exact
        // "meter" feel of Lovable's dictation UI.
        const current = levelsRef.current[i];
        const rising = target > current;
        const tau = rising ? 0.06 : 0.16;
        const alpha = 1 - Math.exp(-dt / tau);
        const next = current + (target - current) * alpha;
        levelsRef.current[i] = next;

        const el = barsRef.current[i];
        if (el) el.style.transform = `scaleY(${next.toFixed(3)})`;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [active, phases, speeds]);

  return (
    <div
      className="pointer-events-none relative w-full"
      style={{ height: H }}
      aria-hidden="true"
    >
      <div
        className="flex h-full w-full items-center"
        style={{ gap: 3 }}
      >
        {Array.from({ length: BAR_COUNT }).map((_, i) => (
          <span
            key={i}
            ref={(el) => {
              if (el) barsRef.current[i] = el;
            }}
            className="block flex-1 rounded-full bg-foreground/90"
            style={{
              height: H,
              minWidth: 2,
              transform: "scaleY(0.1)",
              transformOrigin: "center",
              willChange: "transform",
            }}
          />
        ))}
      </div>
    </div>
  );
}




