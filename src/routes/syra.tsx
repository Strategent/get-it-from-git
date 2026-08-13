import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  FileText,
  Inbox,
  Calendar,
  ChevronDown,
  Check,
} from "lucide-react";
import { PromptInputBox } from "@/components/ui/ai-prompt-box";
import { useTheme } from "@/components/theme-provider";
import { SyraAgentRunSheet } from "@/components/syra/agent-run-sheet";
import { NeatBackground } from "@/components/syra/neat-background";
import { SyraChatThread, type SyraMessage } from "@/components/syra/chat-thread";
import { classifyIntent } from "@/lib/syra-knowledge";
import { syraChat } from "@/lib/syra.functions";
import { useServerFn } from "@tanstack/react-start";
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
  const [agentPrompt, setAgentPrompt] = useState<string | null>(null);
  const [messages, setMessages] = useState<SyraMessage[]>([]);
  const [thinking, setThinking] = useState(false);
  const askSyra = useServerFn(syraChat);

  /** Agent-style requests open the run sheet; everything else is a grounded chat reply. */
  const handleSend = async (text: string) => {
    const t = text.trim();
    if (!t || thinking) return;
    setInput("");

    if (classifyIntent(t) === "agent") {
      setAgentPrompt(t);
      return;
    }

    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    setMessages((prev) => [...prev, { role: "user", content: t }]);
    setThinking(true);
    try {
      const reply = await askSyra({ data: { message: t, history } });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: reply.text, sources: reply.sources },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I couldn't reach the model just now. Try again in a moment.",
        },
      ]);
    } finally {
      setThinking(false);
    }
  };

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

      <NeatBackground />

      {/* Content — composer only, hidden when an agent sheet is open. */}
      <div
        className={`relative h-full flex flex-col items-center justify-center gap-4 px-6 transition-opacity duration-300 ${
          agentPrompt ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        {(messages.length > 0 || thinking) && (
          <SyraChatThread messages={messages} thinking={thinking} />
        )}

        {/* Input bar */}
        <div className="w-full max-w-3xl">
          <PromptInputBox
            placeholder="Ask Syra anything…"
            onSend={(message) => void handleSend(message)}
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
                  className="z-[60] w-56 max-h-[188px] overflow-y-auto overscroll-contain rounded-xl border-border bg-popover/95 backdrop-blur-xl p-1 shadow-2xl"
                >
                  {models.map((m) => (
                    <DropdownMenuItem
                      key={m.id}
                      onSelect={() => setModelId(m.id)}
                      className="flex items-center justify-between gap-3 px-2.5 py-1.5 rounded-lg cursor-pointer"
                    >
                      <div className="min-w-0">
                        <div className="text-[12.5px] leading-tight text-popover-foreground truncate">{m.name}</div>
                        <div className="text-[10.5px] leading-tight text-muted-foreground">{m.provider}</div>
                      </div>
                      {m.id === modelId && <Check className="h-3 w-3 text-primary shrink-0" />}
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
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-[12.5px] text-muted-foreground shadow-md hover:bg-muted hover:text-foreground transition-colors"
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

    </div>
  );
}
