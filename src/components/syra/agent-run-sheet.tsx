import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUp, Maximize2, RotateCcw, X } from "lucide-react";

type Step = { verb: string; object: string };
type Script = {
  title: string;
  steps: Step[];
  question: string;
  options: string[];
  defaultOption: number;
};

const SCRIPTS: Script[] = [
  {
    title: "Agreement agent",
    steps: [
      { verb: "Read", object: "Engagement letter template.docx" },
      { verb: "Read", object: "Vault / Hartley Family Trust" },
      { verb: "Reviewed", object: "Prior countersigned agreements" },
    ],
    question: "Which agreement should Syra draft?",
    options: ["Advisory engagement letter", "IPS amendment", "NDA for prospect"],
    defaultOption: 0,
  },
  {
    title: "Inbox agent",
    steps: [
      { verb: "Read", object: "Inbox / 42 unread" },
      { verb: "Read", object: "Client priority rules" },
      { verb: "Reviewed", object: "Past reply tone" },
    ],
    question: "How should Syra handle replies?",
    options: ["Draft and hold for review", "Send routine replies", "Summarize only"],
    defaultOption: 0,
  },
  {
    title: "Scheduling agent",
    steps: [
      { verb: "Read", object: "Calendar / this week" },
      { verb: "Read", object: "Advisor availability rules" },
      { verb: "Reviewed", object: "Client time preferences" },
    ],
    question: "Which windows should Syra offer?",
    options: ["Mornings only", "Afternoons only", "Any open slot"],
    defaultOption: 2,
  },
];

function pickScript(prompt: string): Script {
  const p = prompt.toLowerCase();
  if (/(inbox|email|triage|reply)/.test(p)) return SCRIPTS[1];
  if (/(schedule|meeting|calendar|book)/.test(p)) return SCRIPTS[2];
  return SCRIPTS[0];
}

export function SyraAgentRunSheet({
  prompt,
  onClose,
}: {
  prompt: string;
  onClose: () => void;
}) {
  const script = useMemo(() => pickScript(prompt), [prompt]);
  const [runKey, setRunKey] = useState(0);
  const [revealed, setRevealed] = useState(0);
  const [showQuestion, setShowQuestion] = useState(false);
  const [selected, setSelected] = useState(script.defaultOption);
  const [done, setDone] = useState<string | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    setRevealed(0);
    setShowQuestion(false);
    setDone(null);
    setSelected(script.defaultOption);
    timers.current.forEach(clearTimeout);
    timers.current = [];
    script.steps.forEach((_, i) => {
      timers.current.push(setTimeout(() => setRevealed(i + 1), 650 + i * 700));
    });
    timers.current.push(
      setTimeout(() => setShowQuestion(true), 650 + script.steps.length * 700),
    );
    return () => timers.current.forEach(clearTimeout);
  }, [script, runKey]);

  const confirm = () => setDone(script.options[selected]);

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center px-4">
      {/* muted lavender ambient glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 70% at 50% 100%, rgba(158,142,196,0.38) 0%, rgba(120,108,160,0.16) 38%, rgba(0,0,0,0) 70%), var(--agent-scrim)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
        }}
        onClick={onClose}
      />

      <div className="relative w-full max-w-md">
        <div
          className="mb-2 pl-1 text-[11px] uppercase tracking-[0.22em] text-muted-foreground"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Syra
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card/95 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] backdrop-blur-xl">
          {/* header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="text-[15px] font-medium text-foreground">{script.title}</div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <button aria-label="Expand" className="grid h-8 w-8 place-items-center rounded-lg hover:bg-muted hover:text-foreground">
                <Maximize2 className="h-4 w-4" />
              </button>
              <button aria-label="Close" onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-muted hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="max-h-[62dvh] overflow-y-auto px-4 py-4">
            {/* user prompt */}
            <div className="flex justify-end">
              <div className="max-w-[85%] rounded-2xl bg-muted px-4 py-2.5 text-[14px] leading-snug text-foreground">
                {prompt}
              </div>
            </div>

            {/* steps */}
            <div className="mt-4 space-y-2">
              {script.steps.slice(0, revealed).map((s) => (
                <div key={s.object} className="animate-in fade-in slide-in-from-bottom-1 text-[14px] duration-300">
                  <span className="font-medium text-foreground">{s.verb}</span>{" "}
                  <span className="text-muted-foreground">{s.object}</span>
                </div>
              ))}
              {revealed < script.steps.length && (
                <div className="text-[14px] text-muted-foreground/70">Working…</div>
              )}
            </div>

            {/* question card */}
            {showQuestion && !done && (
              <div className="mt-4 animate-in fade-in slide-in-from-bottom-2 rounded-xl bg-muted/50 p-4 duration-300">
                <div className="text-[12.5px] text-muted-foreground">Questions</div>
                <div className="mt-1.5 text-[16px] font-medium leading-snug text-foreground">
                  {script.question}
                </div>
                <div className="mt-3 space-y-1">
                  {script.options.map((o, i) => (
                    <button
                      key={o}
                      onClick={() => setSelected(i)}
                      className={`flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors ${
                        selected === i ? "bg-foreground/10" : "hover:bg-foreground/5"
                      }`}
                    >
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-foreground/5 text-[11px] text-muted-foreground">
                        {i + 1}
                      </span>
                      <span className="text-[14.5px] text-foreground">{o}</span>
                    </button>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-end gap-2">
                  <button
                    onClick={confirm}
                    className="px-3 py-2 text-[14px] text-muted-foreground hover:text-foreground"
                  >
                    Skip
                  </button>
                  <button
                    onClick={confirm}
                    className="rounded-lg bg-foreground px-4 py-2 text-[14px] font-medium text-background"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {done && (
              <div className="mt-4 space-y-2 animate-in fade-in duration-300">
                <div className="text-[14px]">
                  <span className="font-medium text-foreground">Drafted</span>{" "}
                  <span className="text-muted-foreground">{done} — held for your review</span>
                </div>
                <div className="text-[14px]">
                  <span className="font-medium text-foreground">Attached</span>{" "}
                  <span className="text-muted-foreground">Client record + prior terms</span>
                </div>
                <div className="text-[14px]">
                  <span className="font-medium text-foreground">Queued</span>{" "}
                  <span className="text-muted-foreground">Signature routing via DocuSign</span>
                </div>
              </div>
            )}
          </div>

          {/* follow-up */}
          <div className="px-4 pb-4">
            <div className="relative rounded-xl bg-muted/60">
              <input
                placeholder="Ask a follow-up…"
                className="w-full bg-transparent py-4 pl-4 pr-14 text-[15px] text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <button
                aria-label="Send"
                className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-foreground text-background"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-3 flex justify-end">
          <button
            onClick={() => setRunKey((k) => k + 1)}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-2 text-[13px] text-muted-foreground backdrop-blur-md hover:text-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Replay
          </button>
        </div>
      </div>
    </div>
  );
}
