import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  FileText,
  Inbox,
  Calendar,
  ChevronDown,
  Check,
  X,
} from "lucide-react";
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";
import { PromptInputBox } from "@/components/ui/ai-prompt-box";
import { useTheme } from "@/components/theme-provider";
import { SyraAgentRunSheet } from "@/components/syra/agent-run-sheet";


export const Route = createFileRoute("/syra")({
  component: SyraPage,
  head: () => ({ meta: [{ title: "strategent" }] }),
});

const quickActions = [
  { icon: FileText, label: "Draft Email" },
  { icon: Inbox, label: "Triage Inbox" },
  { icon: Calendar, label: "Schedule Meeting" },
];

const models = [
  { id: "claude-sonnet-4.5", name: "Claude Sonnet 4.5", provider: "Anthropic" },
  { id: "claude-opus-4", name: "Claude Opus 4", provider: "Anthropic" },
  { id: "gpt-5", name: "GPT-5", provider: "OpenAI" },
  { id: "gpt-5-mini", name: "GPT-5 Mini", provider: "OpenAI" },
];

function SyraPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [input, setInput] = useState("");
  const [modelId, setModelId] = useState(models[0].id);
  const [open, setOpen] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [agentPrompt, setAgentPrompt] = useState<string | null>(null);

  const runAgent = (text: string) => {
    const t = text.trim();
    if (!t) return;
    setAgentPrompt(t);
    setInput("");
  };
  const activeModel = models.find((m) => m.id === modelId) ?? models[0];

  // Colors pulled from the Daily Brief hero mountain photo for continuity:
  // warm cream sky, muted sage-gray ridges, deep warm mountain shadow.
  const bgStart = isDark ? "rgb(52, 48, 43)" : "rgb(240, 235, 228)";
  const bgEnd = isDark ? "rgb(34, 32, 29)" : "rgb(228, 220, 210)";
  const c1 = isDark ? "142, 144, 137" : "216, 208, 198"; // sage / warm cream
  const c2 = isDark ? "90, 84, 76"    : "190, 182, 172"; // warm brown / taupe
  const c3 = isDark ? "120, 116, 108" : "200, 194, 184"; // mid warm gray
  const c4 = isDark ? "74, 66, 56"    : "176, 170, 160"; // deep ridge / soft stone
  const c5 = isDark ? "108, 100, 92"  : "208, 200, 190"; // bridge tone
  const blending = isDark ? "soft-light" : "normal";



  return (
    <div className="relative w-full overflow-hidden" style={{ height: "calc(100dvh - 53px)" }}>
      <style>{`
        .font-radley { font-family: 'Radley', Georgia, serif; }
      `}</style>

      {/* Animated on-brand monotone + subtle purple fluid background */}
      <div className="absolute inset-0 pointer-events-none">
        <BackgroundGradientAnimation
          interactive={false}
          gradientBackgroundStart={bgStart}
          gradientBackgroundEnd={bgEnd}
          firstColor={c1}
          secondColor={c2}
          thirdColor={c3}
          fourthColor={c4}
          fifthColor={c5}
          blendingValue={blending}
          size="70%"
          containerClassName="h-full w-full"
        />
        <div
          className="absolute inset-0"
          style={{
            background: isDark
              ? "radial-gradient(120% 80% at 50% 100%, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 60%), radial-gradient(120% 80% at 50% 0%, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 55%)"
              : "radial-gradient(120% 80% at 50% 100%, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 60%), radial-gradient(120% 80% at 50% 0%, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 55%)",
          }}
        />
      </div>

      {/* Content — composer only, no copy outside the chat box */}
      <div className="relative h-full flex flex-col items-center justify-center px-6">
        {/* Input bar */}
        <div className="w-full max-w-3xl">
          <PromptInputBox
            placeholder="Ask Syra anything…"
            onSend={(message) => runAgent(message)}
            onVoiceStart={() => setVoiceOpen(true)}
            leading={
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpen((v) => !v)}
                  className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-full text-[12px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  {activeModel.name}
                  <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                </button>
                {open && (
                  <div
                    className="absolute left-0 bottom-10 z-30 w-64 rounded-xl border border-border bg-popover backdrop-blur-xl p-1 shadow-2xl"
                    onMouseLeave={() => setOpen(false)}
                  >
                    {models.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => { setModelId(m.id); setOpen(false); }}
                        className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-left hover:bg-accent hover:text-accent-foreground transition-colors"
                      >
                        <div className="min-w-0">
                          <div className="text-[13px] text-popover-foreground truncate">{m.name}</div>
                          <div className="text-[11px] text-muted-foreground">{m.provider}</div>
                        </div>
                        {m.id === modelId && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            }
          />


          {/* Quick actions */}
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {quickActions.map((a) => (
              <button
                key={a.label}
                onClick={() => runAgent(a.label === "Draft Email" ? "Draft up an agreement" : a.label)}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3.5 py-1.5 text-[12.5px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <a.icon className="h-3.5 w-3.5" /> {a.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {agentPrompt && (
        <SyraAgentRunSheet prompt={agentPrompt} isDark={isDark} onClose={() => setAgentPrompt(null)} />
      )}


      {voiceOpen && <LiveVoiceOverlay isDark={isDark} onClose={() => setVoiceOpen(false)} />}
    </div>
  );
}

// Hardcoded live-voice experience. Uses the browser SpeechRecognition + speechSynthesis
// APIs where available so it feels real; falls back to a scripted demo otherwise.
type VoicePhase = "connecting" | "listening" | "thinking" | "speaking";

const DEMO_REPLIES: string[] = [
  "Got it. I'll draft a reply to the Hartley Trust and hold it for your review before it goes out.",
  "Pulling the latest rebalance figures now. I'll drop a one-pager into sales-pipeline in about a minute.",
  "Your two-o'clock with Marlow Capital is confirmed. I'll prep talking points and share them an hour before.",
  "Inbox triage done — three urgent replies drafted, four newsletters archived, and one calendar hold pending your approval.",
];

function LiveVoiceOverlay({ isDark, onClose }: { isDark: boolean; onClose: () => void }) {
  const [phase, setPhase] = useState<VoicePhase>("connecting");
  const [transcript, setTranscript] = useState("");
  const [reply, setReply] = useState("");
  const [level, setLevel] = useState(0);
  const recogRef = useRef<any>(null);
  const rafRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    let cancelled = false;

    const start = async () => {
      // Request mic for the live meter — non-fatal if denied.
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const AC = window.AudioContext || (window as any).webkitAudioContext;
        const ctx: AudioContext = new AC();
        audioCtxRef.current = ctx;
        const src = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        src.connect(analyser);
        const buf = new Uint8Array(analyser.frequencyBinCount);
        const tick = () => {
          analyser.getByteTimeDomainData(buf);
          let sum = 0;
          for (let i = 0; i < buf.length; i++) {
            const v = (buf[i] - 128) / 128;
            sum += v * v;
          }
          const rms = Math.sqrt(sum / buf.length);
          setLevel((prev) => prev * 0.7 + Math.min(1, rms * 3.2) * 0.3);
          rafRef.current = requestAnimationFrame(tick);
        };
        tick();
      } catch {
        // No mic — keep an ambient shimmer.
        const tick = () => {
          setLevel((prev) => prev * 0.9 + (0.15 + Math.random() * 0.1) * 0.1);
          rafRef.current = requestAnimationFrame(tick);
        };
        tick();
      }

      setPhase("listening");

      // Best-effort real speech recognition; scripted fallback otherwise.
      const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SR) {
        const recog = new SR();
        recog.lang = "en-US";
        recog.interimResults = true;
        recog.continuous = false;
        recog.onresult = (ev: any) => {
          let text = "";
          for (let i = ev.resultIndex; i < ev.results.length; i++) {
            text += ev.results[i][0].transcript;
          }
          setTranscript(text.trim());
        };
        recog.onend = () => finishTurn();
        recog.onerror = () => finishTurn();
        recogRef.current = recog;
        try {
          recog.start();
        } catch {
          // already started or blocked — fall back
          setTimeout(finishTurn, 3200);
        }
      } else {
        // Scripted transcript for browsers without SpeechRecognition
        const scripted = "Give me a quick briefing.";
        for (let i = 1; i <= scripted.length; i++) {
          if (cancelled) return;
          await new Promise((r) => setTimeout(r, 42));
          setTranscript(scripted.slice(0, i));
        }
        setTimeout(finishTurn, 500);
      }
    };

    const finishTurn = () => {
      if (cancelled) return;
      setPhase("thinking");
      const pick = DEMO_REPLIES[Math.floor(Math.random() * DEMO_REPLIES.length)];
      setTimeout(() => {
        if (cancelled) return;
        setReply(pick);
        setPhase("speaking");
        try {
          const u = new SpeechSynthesisUtterance(pick);
          u.rate = 1.02;
          u.pitch = 1.0;
          const voices = window.speechSynthesis.getVoices();
          const preferred =
            voices.find((v) => /Samantha|Serena|Victoria|Google UK English Female|Jenny/i.test(v.name)) ||
            voices.find((v) => /female/i.test(v.name)) ||
            voices[0];
          if (preferred) u.voice = preferred;
          u.onend = () => {
            if (!cancelled) setPhase("listening");
          };
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(u);
        } catch {
          setTimeout(() => !cancelled && setPhase("listening"), 2500);
        }
      }, 900);
    };

    start();

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      try { recogRef.current?.stop(); } catch {}
      try { window.speechSynthesis.cancel(); } catch {}
      streamRef.current?.getTracks().forEach((t) => t.stop());
      audioCtxRef.current?.close().catch(() => {});
    };
  }, []);

  const status =
    phase === "connecting" ? "Connecting…" :
    phase === "listening" ? "Listening" :
    phase === "thinking" ? "Thinking…" :
    "Speaking";

  const orbSize = 220 + level * 90;

  return (
    <div
      className="absolute inset-0 z-40 flex flex-col items-center justify-center px-6"
      style={{
        background: isDark
          ? "radial-gradient(120% 80% at 50% 40%, rgba(52,48,43,0.72), rgba(30,28,25,0.92))"
          : "radial-gradient(120% 80% at 50% 40%, rgba(240,235,228,0.85), rgba(220,212,202,0.95))",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
      }}
    >
      <button
        onClick={onClose}
        className="absolute top-5 right-5 grid h-9 w-9 place-items-center rounded-full border border-border bg-card/70 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-6">
        {status}
      </div>

      {/* Orb */}
      <div className="relative grid place-items-center" style={{ height: 320, width: 320 }}>
        <div
          className="absolute rounded-full transition-[width,height] duration-150 ease-out"
          style={{
            width: orbSize,
            height: orbSize,
            background: isDark
              ? "radial-gradient(circle at 30% 30%, rgba(170,164,152,0.55), rgba(74,66,56,0.35) 55%, rgba(34,32,29,0) 75%)"
              : "radial-gradient(circle at 30% 30%, rgba(232,224,214,0.9), rgba(180,172,162,0.55) 55%, rgba(255,255,255,0) 75%)",
            filter: "blur(0.5px)",
            boxShadow: isDark
              ? "0 0 80px rgba(142,136,124,0.35), inset 0 0 60px rgba(255,255,255,0.05)"
              : "0 0 60px rgba(190,182,172,0.35), inset 0 0 40px rgba(255,255,255,0.6)",
          }}
        />
        <div
          className="absolute rounded-full border"
          style={{
            width: 260 + level * 40,
            height: 260 + level * 40,
            borderColor: isDark ? "rgba(180,172,160,0.15)" : "rgba(120,114,106,0.18)",
            transition: "width 200ms ease-out, height 200ms ease-out",
          }}
        />
        <div
          className="absolute rounded-full border"
          style={{
            width: 300 + level * 20,
            height: 300 + level * 20,
            borderColor: isDark ? "rgba(180,172,160,0.08)" : "rgba(120,114,106,0.1)",
            transition: "width 260ms ease-out, height 260ms ease-out",
          }}
        />
        <div className="font-radley text-[42px] text-foreground relative">Syra</div>
      </div>

      {/* Transcript / reply */}
      <div className="mt-10 w-full max-w-xl text-center min-h-[72px]">
        {transcript && (
          <div className="text-[13px] uppercase tracking-[0.18em] text-muted-foreground mb-2">
            You
          </div>
        )}
        {transcript && (
          <div className="text-foreground text-[15px] leading-relaxed">{transcript}</div>
        )}
        {reply && (
          <>
            <div className="mt-5 text-[13px] uppercase tracking-[0.18em] text-muted-foreground mb-2">
              Syra
            </div>
            <div className="text-foreground text-[15px] leading-relaxed">{reply}</div>
          </>
        )}
      </div>

      <button
        onClick={onClose}
        className="mt-10 inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-2 text-[12.5px] text-muted-foreground hover:text-foreground transition-colors"
      >
        End conversation
      </button>
    </div>
  );
}
