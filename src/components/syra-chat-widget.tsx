import { useState } from "react";
import { Send, X, Bot } from "lucide-react";
import { SyraMark } from "@/components/syra-mark";
import { SyraAgentRunSheet } from "@/components/syra/agent-run-sheet";
import { useTheme } from "@/components/theme-provider";
import { useIsMobile } from "@/hooks/use-mobile";

type Msg = { role: "syra" | "user"; text: string };

const seed: Msg[] = [
  {
    role: "syra",
    text: "Hey John - three drafts are waiting in the inbox, and the Hartley Trust review is your top priority today.",
  },
];

/** Requests that should run the multi-step agent execution sheet. */
const AGENT_RE = /(agreement|contract|engagement letter|\bips\b|\bnda\b)/i;

export function SyraChatWidget({ inboxSummary }: { inboxSummary?: string }) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>(seed);
  const [agentPrompt, setAgentPrompt] = useState<string | null>(null);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (isMobile) return null;

  const send = () => {
    const t = input.trim();
    if (!t) return;
    if (AGENT_RE.test(t)) {
      setAgentPrompt(t);
      setInput("");
      return;
    }
    const lower = t.toLowerCase();
    const reply = lower.includes("summarize")
      ? `Inbox summary: ${inboxSummary ?? "3 priority drafts, 2 unread notes, and 1 renewal follow-up waiting."}`
      : lower.includes("draft")
        ? "I drafted the strongest reply in the composer and kept the tone concise, commercial, and ready for sign-off."
        : lower.includes("brief")
          ? "Today's brief: Sarah's proposal tweak is the highest-leverage reply, Northwind needs security answers, and Helios renewal should be touched before noon."
          : "On it - I'll draft that and surface it for your sign-off.";
    setMsgs((m) => [...m, { role: "user", text: t }, { role: "syra", text: reply }]);
    setInput("");
  };


  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      {open && (
        <div
          className="w-[360px] max-w-[calc(100vw-2.5rem)] h-[480px] rounded-[26px] bg-card/95 backdrop-blur-2xl border border-border flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200"
          style={{
            boxShadow:
              "0 1px 0 0 color-mix(in oklab, white 30%, transparent) inset, 0 30px 60px -20px rgba(15,20,40,0.35), 0 12px 30px -12px color-mix(in oklab, var(--primary) 30%, transparent)",
          }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
            <div className="flex items-center gap-2.5">
              <SyraMark size={32} />
              <div className="leading-tight">
                <div className="text-[13px] font-semibold tracking-tight">Syra</div>
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Active
                </div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="h-7 w-7 grid place-items-center rounded-full text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-auto px-4 py-4 space-y-3">
            {msgs.map((m, i) => (
              <div
                key={i}
                className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.role === "syra" && <SyraMark size={28} className="shrink-0" />}
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-2xl text-[13px] leading-snug ${
                    m.role === "user"
                      ? "text-white rounded-br-md"
                      : "bg-foreground/[0.05] text-foreground rounded-bl-md border border-border/60"
                  }`}
                  style={m.role === "user" ? { background: "var(--gradient-primary)" } : undefined}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          <div className="px-3 pb-2 flex gap-1.5 flex-wrap">
            {["Draft Hartley Trust agreement", "Summarize inbox", "Today's brief"].map((s) => (
              <button
                key={s}
                onClick={() => setInput(s)}
                className="h-6 px-2.5 rounded-full text-[10.5px] font-medium border border-border bg-foreground/[0.03] text-muted-foreground hover:text-foreground hover:bg-foreground/[0.06] transition-colors"
              >
                {s}
              </button>
            ))}
          </div>

          <div className="px-3 pb-3 pt-1">
            <div className="flex items-center gap-2 h-11 px-3 rounded-full bg-foreground/[0.04] border border-border">
              <Bot className="h-3.5 w-3.5 text-muted-foreground" />
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Ask Syra anything..."
                className="flex-1 bg-transparent text-[13px] placeholder:text-muted-foreground focus:outline-none"
              />
              <button
                onClick={send}
                aria-label="Send"
                className="h-7 w-7 grid place-items-center rounded-full text-white"
                style={{ background: "var(--gradient-primary)" }}
              >
                <Send className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {agentPrompt && (
        <div className="fixed inset-0 z-50">
          <SyraAgentRunSheet
            prompt={agentPrompt}
            isDark={isDark}
            onClose={() => setAgentPrompt(null)}
          />
        </div>
      )}



      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Open Syra"
        className="group transition-transform hover:scale-105 active:scale-95"
      >
        <SyraMark size={56} />
      </button>
    </div>
  );
}
