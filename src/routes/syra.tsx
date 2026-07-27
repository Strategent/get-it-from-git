import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Paperclip,
  FileText,
  Inbox,
  Calendar,
  ChevronDown,
  Check,
  Mic,
  X,
} from "lucide-react";
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";
import { useTheme } from "@/components/theme-provider";

export const Route = createFileRoute("/syra")({
  component: SyraPage,
  head: () => ({ meta: [{ title: "Syra — Harwick & Sterne" }] }),
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
  const activeModel = models.find((m) => m.id === modelId) ?? models[0];

  const bgStart = isDark ? "rgb(10, 10, 14)" : "rgb(250, 249, 252)";
  const bgEnd = isDark ? "rgb(20, 18, 28)" : "rgb(245, 244, 248)";
  // Light mode: extremely desaturated, subtle gray-lavender blobs so the
  // animation is visible but never overwhelms the near-white background.
  const c1 = isDark ? "120, 110, 150" : "225, 223, 230";
  const c2 = isDark ? "90, 85, 115"   : "215, 213, 222";
  const c3 = isDark ? "140, 130, 170" : "230, 228, 235";
  const c4 = isDark ? "70, 65, 95"    : "210, 208, 218";
  const c5 = isDark ? "105, 95, 135"  : "220, 218, 228";
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

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center px-6">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-6">
          YOUR OPERATIONS AGENT
        </div>
        <h1 className="font-radley text-5xl md:text-6xl font-normal tracking-tight text-foreground text-center">
          Syra
        </h1>
        <p className="mt-4 text-muted-foreground text-center max-w-xl text-[15px]">
          Draft, analyze, automate. Syra moves work forward.
        </p>

        {/* Input bar */}
        <div className="mt-10 w-full max-w-3xl">
          <div className="relative rounded-2xl border border-border bg-card/60 backdrop-blur-xl shadow-xl">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Syra anything…"
              className="w-full bg-transparent px-5 pt-5 pb-16 text-[15px] text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <div className="absolute left-3 bottom-3 flex items-center gap-1.5">
              <button
                aria-label="Attach"
                className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <Paperclip className="h-4 w-4" />
              </button>
              {/* Perplexity-style model switch */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpen((v) => !v)}
                  className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-[12.5px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  {activeModel.name}
                  <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                </button>
                {open && (
                  <div
                    className="absolute left-0 bottom-11 z-30 w-64 rounded-xl border border-border bg-popover backdrop-blur-xl p-1 shadow-2xl"
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
            </div>
            <div className="absolute right-3 bottom-3 flex items-center gap-1.5">
              <button
                aria-label="Talk to Syra"
                onClick={() => setVoiceOpen(true)}
                className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <Mic className="h-4 w-4" />
              </button>
              <button
                aria-label="Send"
                className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-[12.5px] font-medium hover:bg-primary/90 transition-colors"
              >
                Send
              </button>
            </div>
          </div>

          {/* Quick actions */}
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {quickActions.map((a) => (
              <button
                key={a.label}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3.5 py-1.5 text-[12.5px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <a.icon className="h-3.5 w-3.5" /> {a.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
