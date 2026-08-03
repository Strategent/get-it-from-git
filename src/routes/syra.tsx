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
import { PromptInputBox } from "@/components/ui/ai-prompt-box";
import { useTheme } from "@/components/theme-provider";
import { SyraAgentRunSheet } from "@/components/syra/agent-run-sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


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
  { id: "openai/gpt-5.6-sol", name: "GPT-5.6 Sol", provider: "OpenAI" },
  { id: "openai/gpt-5.5", name: "GPT-5.5", provider: "OpenAI" },
  { id: "google/gemini-3.6-flash", name: "Gemini 3.6 Flash", provider: "Google" },
  { id: "google/gemini-3.1-pro-preview", name: "Gemini 3.1 Pro", provider: "Google" },
  { id: "claude-opus-5", name: "Claude Opus 5", provider: "Anthropic" },
  { id: "claude-sonnet-5", name: "Claude Sonnet 5", provider: "Anthropic" },
  { id: "fable-5", name: "Fable 5", provider: "Fable" },
  { id: "grok", name: "Grok", provider: "xAI" },
];

function SyraPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [input, setInput] = useState("");
  const [modelId, setModelId] = useState(models[0].id);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [agentPrompt, setAgentPrompt] = useState<string | null>(null);

  const runAgent = (text: string) => {
    const t = text.trim();
    if (!t) return;
    setAgentPrompt(t);
    setInput("");
  };
  const activeModel = models.find((m) => m.id === modelId) ?? models[0];

  return (
    <div className="relative w-full overflow-hidden" style={{ height: "calc(100dvh - 53px)" }}>
      <style>{`
        .font-radley { font-family: 'Radley', Georgia, serif; }
        @keyframes syraRibbon {
          0%   { transform: translate3d(-12%, 0, 0) scaleY(1) rotate(-1.2deg); }
          50%  { transform: translate3d(12%, 3%, 0) scaleY(1.25) rotate(1.4deg); }
          100% { transform: translate3d(-12%, 0, 0) scaleY(1) rotate(-1.2deg); }
        }
        @keyframes syraRibbonAlt {
          0%   { transform: translate3d(10%, 2%, 0) scaleY(1.15) rotate(1deg); }
          50%  { transform: translate3d(-14%, -3%, 0) scaleY(0.9) rotate(-1.6deg); }
          100% { transform: translate3d(10%, 2%, 0) scaleY(1.15) rotate(1deg); }
        }
        @keyframes syraFlow {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes syraBreathe {
          0%, 100% { opacity: 0.55; }
          50%      { opacity: 0.95; }
        }
        @keyframes syraSheen {
          0%   { transform: translate3d(-40%, 0, 0) skewX(-10deg); opacity: 0; }
          12%  { opacity: 1; }
          88%  { opacity: 1; }
          100% { transform: translate3d(180%, 0, 0) skewX(-10deg); opacity: 0; }
        }
        @keyframes syraHue {
          0%, 100% { filter: saturate(1.3) hue-rotate(0deg); }
          50%      { filter: saturate(1.5) hue-rotate(12deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .syra-layer, .syra-stage { animation: none !important; }
        }
      `}</style>

      {/* Aurora field: horizontal fluid ribbons of moss, lavender and teal. */}
      <div className="syra-stage absolute inset-0 pointer-events-none isolate" style={{ animation: "syraHue 40s ease-in-out infinite" }}>
        {/* Base vertical gradient — dark valley floor to misty sky. */}
        <div
          className="absolute inset-0"
          style={{
            background: isDark
              ? "linear-gradient(180deg, rgb(9,12,17) 0%, rgb(13,17,23) 14%, rgb(17,22,30) 28%, rgb(21,28,36) 42%, rgb(26,34,43) 56%, rgb(31,40,50) 70%, rgb(38,48,60) 85%, rgb(46,57,71) 100%)"
              : "linear-gradient(180deg, rgb(236,240,245) 0%, rgb(230,235,241) 16%, rgb(223,229,236) 32%, rgb(215,222,231) 48%, rgb(207,215,225) 64%, rgb(199,208,219) 80%, rgb(192,202,214) 100%)",
          }}
        />

        {/* Ribbon 1 — moss, low and wide. */}
        <div
          className="syra-layer absolute"
          style={{
            inset: "-30% -25%",
            top: "22%",
            background: isDark
              ? "linear-gradient(96deg, rgba(46,86,68,0) 0%, rgba(62,116,86,0.55) 22%, rgba(84,146,108,0.62) 40%, rgba(50,90,72,0.25) 58%, rgba(74,132,98,0.55) 78%, rgba(46,86,68,0) 100%)"
              : "linear-gradient(96deg, rgba(96,132,104,0) 0%, rgba(104,146,114,0.34) 24%, rgba(120,162,128,0.38) 42%, rgba(96,132,104,0.14) 60%, rgba(112,152,120,0.32) 80%, rgba(96,132,104,0) 100%)",
            backgroundSize: "220% 100%",
            mixBlendMode: isDark ? "screen" : "multiply",
            filter: "blur(90px)",
            animation: "syraRibbon 26s ease-in-out infinite, syraFlow 38s ease-in-out infinite",
          }}
        />

        {/* Ribbon 2 — lavender, counter-motion through the middle. */}
        <div
          className="syra-layer absolute"
          style={{
            inset: "-30% -25%",
            bottom: "24%",
            background: isDark
              ? "linear-gradient(84deg, rgba(96,80,144,0) 0%, rgba(128,102,182,0.55) 20%, rgba(100,84,150,0.22) 42%, rgba(150,118,200,0.6) 64%, rgba(112,92,164,0.3) 84%, rgba(96,80,144,0) 100%)"
              : "linear-gradient(84deg, rgba(120,104,164,0) 0%, rgba(136,116,184,0.32) 22%, rgba(120,104,164,0.12) 46%, rgba(146,124,196,0.34) 68%, rgba(120,104,164,0) 100%)",
            backgroundSize: "240% 100%",
            mixBlendMode: isDark ? "screen" : "multiply",
            filter: "blur(100px)",
            animation: "syraRibbonAlt 34s ease-in-out infinite, syraFlow 52s ease-in-out infinite reverse",
          }}
        />

        {/* Ribbon 3 — teal undertow, slowest. */}
        <div
          className="syra-layer absolute"
          style={{
            inset: "-35% -30%",
            background: isDark
              ? "linear-gradient(90deg, rgba(38,90,98,0) 0%, rgba(48,110,116,0.42) 28%, rgba(66,138,140,0.18) 56%, rgba(48,110,116,0.4) 80%, rgba(38,90,98,0) 100%)"
              : "linear-gradient(90deg, rgba(90,138,142,0) 0%, rgba(96,148,152,0.22) 30%, rgba(90,138,142,0.08) 58%, rgba(96,148,152,0.2) 82%, rgba(90,138,142,0) 100%)",
            backgroundSize: "280% 100%",
            mixBlendMode: isDark ? "screen" : "multiply",
            filter: "blur(120px)",
            animation: "syraRibbon 58s ease-in-out infinite reverse, syraBreathe 30s ease-in-out infinite",
          }}
        />

        {/* Ribbon 4 — pale moss highlight riding the top third. */}
        <div
          className="syra-layer absolute"
          style={{
            inset: "-20% -20%",
            bottom: "56%",
            background: isDark
              ? "linear-gradient(102deg, rgba(120,164,132,0) 0%, rgba(140,182,150,0.3) 30%, rgba(120,164,132,0.08) 56%, rgba(158,150,196,0.28) 78%, rgba(120,164,132,0) 100%)"
              : "linear-gradient(102deg, rgba(150,178,156,0) 0%, rgba(150,178,156,0.2) 32%, rgba(160,150,190,0.18) 74%, rgba(150,178,156,0) 100%)",
            backgroundSize: "260% 100%",
            mixBlendMode: isDark ? "screen" : "multiply",
            filter: "blur(80px)",
            animation: "syraRibbonAlt 44s ease-in-out infinite, syraFlow 64s ease-in-out infinite",
          }}
        />

        {/* Specular sheen sweeping horizontally. */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="syra-layer absolute -inset-y-1/2 w-2/5"
            style={{
              background: isDark
                ? "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(214,228,255,0.08) 50%, rgba(255,255,255,0) 100%)"
                : "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%)",
              filter: "blur(60px)",
              animation: "syraSheen 22s cubic-bezier(0.4,0,0.6,1) infinite",
            }}
          />
        </div>

        {/* Horizon glow at the vanishing line. */}
        <div
          className="syra-layer absolute inset-0"
          style={{
            background: isDark
              ? "radial-gradient(150% 48% at 50% 74%, rgba(104,120,146,0.42) 0%, rgba(92,106,130,0.18) 36%, rgba(80,92,108,0) 74%)"
              : "radial-gradient(150% 48% at 50% 74%, rgba(188,198,208,0.5) 0%, rgba(184,194,204,0.2) 38%, rgba(180,190,200,0) 72%)",
            opacity: 0.34,
            animation: "syraBreathe 24s ease-in-out infinite",
          }}
        />

        {/* Vignette to keep the composer legible. */}
        <div
          className="absolute inset-0"
          style={{
            background: isDark
              ? "radial-gradient(90% 70% at 50% 50%, rgba(0,0,0,0) 40%, rgba(6,8,12,0.55) 100%)"
              : "radial-gradient(90% 70% at 50% 50%, rgba(255,255,255,0) 45%, rgba(210,216,224,0.45) 100%)",
          }}
        />

        {/* Coarse dither — breaks up wide flat washes. */}
        <div
          className="absolute inset-0"
          style={{
            opacity: isDark ? 0.16 : 0.1,
            mixBlendMode: "overlay",
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E\")",
            backgroundSize: "200px 200px",
          }}
        />

        {/* Fine per-pixel dither — kills residual 8-bit banding steps. */}
        <div
          className="absolute inset-0"
          style={{
            opacity: isDark ? 0.1 : 0.06,
            mixBlendMode: "soft-light",
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='f'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.4' numOctaves='1' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23f)'/%3E%3C/svg%3E\")",
            backgroundSize: "120px 120px",
          }}
        />
      </div>

      {/* Content — composer only, no copy outside the chat box. */}
      <div className="relative h-full flex flex-col items-center justify-center px-6">
        {/* Input bar */}
        <div className="w-full max-w-3xl">
          <PromptInputBox
            placeholder="Ask Syra anything…"
            onSend={(message) => runAgent(message)}
            onVoiceStart={() => setVoiceOpen(true)}
            leading={
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-full text-[12px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors outline-none"
                  >
                    {activeModel.name}
                    <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  align="start"
                  sideOffset={8}
                  collisionPadding={12}
                  avoidCollisions
                  className="z-[60] w-64 max-h-[min(60vh,420px)] overflow-y-auto rounded-xl border-border bg-popover/95 backdrop-blur-xl p-1 shadow-2xl"
                >
                  {models.map((m) => (
                    <DropdownMenuItem
                      key={m.id}
                      onSelect={() => setModelId(m.id)}
                      className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg cursor-pointer"
                    >
                      <div className="min-w-0">
                        <div className="text-[13px] text-popover-foreground truncate">{m.name}</div>
                        <div className="text-[11px] text-muted-foreground">{m.provider}</div>
                      </div>
                      {m.id === modelId && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            }
          />

          {/* Quick actions — tinted moss and lavender to match the wash. */}
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {quickActions.map((a) => (
              <button
                key={a.label}
                onClick={() => runAgent(a.label === "Draft Email" ? "Draft up an agreement" : a.label)}
                className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/30 px-3.5 py-1.5 text-[12.5px] text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
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
